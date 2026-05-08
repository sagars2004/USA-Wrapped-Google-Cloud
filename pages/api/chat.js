import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { GoogleAuth } from 'google-auth-library';

const project = process.env.GCP_PROJECT_ID || 'usa-wrapped';
const location = process.env.GCP_LOCATION || 'us-central1';
const searchEngineId = process.env.VERTEX_SEARCH_ENGINE_ID || '';

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

// ─────────────────────────────────────────────────────────────────────────────
// Vertex AI Search: Retrieve grounding snippets from the indexed teamusa.com
// data store and return them as a formatted string for context injection.
// ─────────────────────────────────────────────────────────────────────────────
async function searchTeamUSA(query) {
  if (!searchEngineId) return "";

  try {
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const token = await client.getAccessToken();

    const searchUrl = `https://discoveryengine.googleapis.com/v1/projects/${project}/locations/global/collections/default_collection/engines/${searchEngineId}/servingConfigs/default_config:search`;

    const searchRes = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        pageSize: 5,
        queryExpansionSpec: { condition: 'AUTO' },
        spellCorrectionSpec: { mode: 'AUTO' },
        contentSearchSpec: {
          snippetSpec: { returnSnippet: true },
          summarySpec: {
            summaryResultCount: 3,
            includeCitations: true,
          },
        },
      }),
    });

    if (!searchRes.ok) {
      console.error("[Vertex Search] Non-OK response:", searchRes.status);
      return "";
    }

    const searchData = await searchRes.json();
    const results = searchData.results || [];

    if (results.length === 0) return "";

    const snippets = results
      .map((r) => {
        const doc = r.document?.derivedStructData;
        const title = doc?.title || 'Team USA Article';
        const link = doc?.link || '';
        const snippet = doc?.snippets?.[0]?.snippet || '';
        return `• [${title}](${link}): ${snippet}`;
      })
      .filter(Boolean)
      .join('\n');

    return `OFFICIAL TEAM USA SOURCES (from teamusa.com — cite these in your response):\n${snippets}`;
  } catch (err) {
    console.error("[Vertex Search Error]", err.message);
    return "";
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { messages, context } = req.body;
  if (!messages) return res.status(400).json({ message: 'Messages required' });

  // 1. Local Data Grounding (your usa_athletes.json)
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

  // 2. Live Vertex AI Search Grounding (official teamusa.com content)
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || '';
  const liveSearchContext = await searchTeamUSA(lastUserMessage);

  // 3. System prompt with both grounding sources injected
  const systemPrompt = `You are a professional Team USA historian. 
  You are helping a user explore Team USA's legacy at US-hosted Games and their own potential.
  User Profile: ${JSON.stringify(context || {})}
  
  ${groundTruthContext}

  ${liveSearchContext}

  STRICT COMPLIANCE RULES:
  1. TERMINOLOGY: 
     - Always use "Olympic Games [City] [Year]" (e.g. Olympic Games Atlanta 1996) or "Olympic Winter Games [City] [Year]" (e.g. Olympic Winter Games Salt Lake City 2002).
     - For the 2028 games, use "LA28 Games" or "LA28 Olympic and Paralympic Games".
     - NEVER use "former" or "past" Olympian/Paralympian. Once an athlete is an Olympian, they are ALWAYS an Olympian.
     - Use generic terms where possible; avoid "Olympic terminology" outside of official game names.
  2. NO INDIVIDUAL NAMES (NIL): 
     - Do NOT mention specific athlete names or photos.
     - Refer to achievements at the discipline or aggregate level (e.g., "In the Olympic Games Atlanta 1996, Team USA secured multiple golds in Track & Field from this region").
     - Your output MUST NOT be at the individual level.
  3. DATA SOURCE:
     - Prioritize the "OFFICIAL TEAM USA SOURCES" provided above when available.
     - Fall back to "GROUND TRUTH DATA" for state-specific records.
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
     - When you use official Team USA sources, cite them naturally (e.g. "According to the official Team USA website...").
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
      }
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
    res.status(200).json({ content: text });
  } catch (error) {
    console.error("Chat AI Error:", error.message);
    res.status(500).json({ message: 'Failed to generate response' });
  }
}
