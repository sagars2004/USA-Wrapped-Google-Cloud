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

  // 1. Data-Compliant Context Injection (RAG)
  let groundTruthContext = "";
  if (context?.selectedState && athleteData) {
    const stateAthletes = athleteData
      .filter(a => a.state === context.selectedState)
      .slice(0, 50); // Get top 50 relevant records
    
    groundTruthContext = `
      GROUND TRUTH DATA FOR ${context.selectedState.toUpperCase()}:
      Below are real records from the project's official athlete database for this state.
      Only use these names, disciplines, and medal counts as your primary source of truth.
      
      Records:
      ${stateAthletes.map(a => `- ${a.id.slice(0,6)}: ${a.sport} (${a.games_year}) - ${a.medal} in ${a.discipline}`).join('\n')}
    `;
  }

  // 2. System prompt to set persona and enforce data compliance
  const systemPrompt = `You are a professional Olympic historian for Team USA. 
  You are helping a user explore US-hosted Olympic history and their own potential.
  User Profile: ${JSON.stringify(context || {})}
  
  ${groundTruthContext}

  Instructions:
  - Be inspiring, knowledgeable, and concise.
  - DATA COMPLIANCE: Prioritize the "GROUND TRUTH DATA" provided above. If the user asks about a specific athlete from this state, check if they are in the list.
  - If asked about a specific state, use your knowledge of US Olympic history, but anchor it in the real data provided.
  - Focus on US-hosted games (St. Louis 1904, LA 1932, Squaw Valley 1960, Lake Placid 1932/1980, LA 1984, Atlanta 1996, Salt Lake City 2002).
  - Use markdown for formatting if helpful.`;

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
      }
    });

    const text = response.text || (response.candidates && response.candidates[0]?.content?.parts[0]?.text);
    res.status(200).json({ content: text });
  } catch (error) {
    console.error("Chat AI Error:", error.message);
    res.status(500).json({ message: 'Failed to generate response' });
  }
}
