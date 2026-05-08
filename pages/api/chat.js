import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

const project = process.env.GCP_PROJECT_ID || 'usa-wrapped';
const location = process.env.GCP_LOCATION || 'us-central1';

// Cache the athlete data in memory for performance
const DATA_PATH = path.join(process.cwd(), 'data', 'usa_athletes.json');
let athleteData = null;

try {
  const fileContents = fs.readFileSync(DATA_PATH, 'utf8');
  athleteData = JSON.parse(fileContents).athletes;
  console.log(`[AI Cache] Loaded ${athleteData.length} records for context injection.`);
} catch (err) {
  console.error("[AI Cache Error] Failed to load athlete data:", err.message);
}

const ai = new GoogleGenAI({ 
  vertexai: true, 
  project, 
  location 
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { messages, context } = req.body;
  if (!messages) return res.status(400).json({ message: 'Messages required' });

  // 1. Local Data Grounding (usa_athletes.json)
  let groundTruthContext = "";
  if (context?.selectedState && athleteData) {
    const stateAthletes = athleteData
      .filter(a => a.state === context.selectedState)
      .slice(0, 50);
    
    groundTruthContext = `
      GROUND TRUTH DATA FOR ${context.selectedState.toUpperCase()}:
      Below are real records from the project's official athlete database for this state.
      Only use these names, disciplines, and medal counts as your primary source of truth.
      
      Records:
      ${stateAthletes.map(a => `- ${a.id.slice(0,6)}: ${a.sport} (${a.games_year}) - ${a.medal} in ${a.discipline}`).join('\n')}
    `;
  }

  // 2. System prompt — Gemini uses google_search tool to ground in teamusa.com live content
  const systemPrompt = `You are a professional Team USA historian. 
  You are helping a user explore Team USA's legacy at US-hosted Games and their own potential.
  User Profile: ${JSON.stringify(context || {})}
  
  ${groundTruthContext}

  STRICT COMPLIANCE RULES:
  1. TERMINOLOGY: 
     - Always use "Olympic Games [City] [Year]" (e.g. Olympic Games Atlanta 1996) or "Olympic Winter Games [City] [Year]" (e.g. Olympic Winter Games Salt Lake City 2002).
     - For the 2028 games, use "LA28 Games" or "LA28 Olympic and Paralympic Games".
     - NEVER use "former" or "past" Olympian/Paralympian. Once an athlete is an Olympian, they are ALWAYS an Olympian.
  2. NO INDIVIDUAL NAMES (NIL): 
     - Do NOT mention specific athlete names.
     - Refer to achievements at the discipline or aggregate level.
     - Your output MUST NOT be at the individual level.
  3. DATA SOURCE:
     - Use your Google Search tool to find and cite official information from teamusa.com when relevant.
     - Prioritize "GROUND TRUTH DATA" above for state-specific medal records.
     - Focus exclusively on US-hosted Games: 
       * Olympic Games St. Louis 1904
       * Olympic Winter Games Lake Placid 1932
       * Olympic Games Los Angeles 1932
       * Olympic Winter Games Squaw Valley 1960
       * Olympic Winter Games Lake Placid 1980
       * Olympic Games Los Angeles 1984
       * Olympic Games Atlanta 1996
       * Olympic Winter Games Salt Lake City 2002
  4. STYLE:
     - Be inspiring, knowledgeable, and concise.
     - When citing official sources, say "According to the official Team USA website...".
     - Use markdown for formatting.`;

  try {
    const formattedContents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      ...messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }))
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: formattedContents,
      config: {
        maxOutputTokens: 2048,
        temperature: 0.7,
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
    res.status(200).json({ content: text });
  } catch (error) {
    console.error("Chat AI Error:", error.message);
    res.status(500).json({ message: 'Failed to generate response' });
  }
}
