import { GoogleGenAI } from '@google/genai';

// Initialize the new, non-deprecated Google Gen AI SDK for Vertex AI
const project = process.env.GCP_PROJECT_ID || 'usa-wrapped';
const location = process.env.GCP_LOCATION || 'us-central1';

const ai = new GoogleGenAI({ 
  vertexai: true, 
  project, 
  location 
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { stats, userName, userLocation, metrics } = req.body;
    
    if (!stats) {
      return res.status(400).json({ error: 'Missing stats in request body.' });
    }

    // Prepare the prompt for Gemini
    const prompt = `You are a professional Team USA historian.
I am providing summary statistics about Team USA's legacy and a user's Bio-Metric profile.

User Name: ${userName}
User Location: ${userLocation}
User Bio-Metrics: ${JSON.stringify(metrics || {})} (Height/Wingspan are in Inches, Weight is in Pounds)

Team USA Legacy Stats:
- Total Records: ${stats.totalRecords}
- Top Disciplines: ${stats.topSports?.map(s => `${s.sport} (${s.count})`).join(', ')}
- Tallest Athlete (Historical): ${stats.tallestRecord?.height_cm}cm
- Shortest Athlete (Historical): ${stats.shortestRecord?.height_cm}cm

Determine the user's "Team USA Archetype" based on their physical profile.
STRICT COMPLIANCE RULES:
1. TERMINOLOGY: 
   - Use "Olympic Games [City] [Year]" or "Olympic Winter Games [City] [Year]".
   - For 2028, use "LA28 Games".
   - NEVER use "former" or "past" Olympian.
2. NO INDIVIDUAL NAMES: Do NOT mention specific athlete names.
3. OUTPUT:
   - Write exactly ONE sentence which is a bold, premium title for their identity (3-5 words long).
   - E.g. "The Wingspan Wonder" or "The Agility Specialist". 
   - Do NOT use "You are the" as a prefix.
   - Do NOT write a second sentence.
   - Keep it punchy, professional, and Apple-inspired. Do NOT use markdown formatting (no asterisks or bolding).`;

    // Generate content using the new SDK and Gemini 2.5 Pro (Gemini 1.5 is retired in 2026)
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        maxOutputTokens: 100,
        temperature: 0.7,
      }
    });

    // Robustly extract the text from the new SDK response structure
    // Accessing response.text directly can throw if the response is blocked by safety filters
    const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
    let archetypeText = rawText.replace(/\*\*/g, '').trim();

    // Ensure we only take the first sentence/title (strip anything after first period)
    if (archetypeText.includes('.')) {
      archetypeText = archetypeText.split('.')[0].trim();
    }

    // BUG FIX: Ensure we don't return just "The" or an empty/short string
    if (archetypeText.length < 10 || archetypeText.toLowerCase() === 'the') {
      archetypeText = "The Versatile Competitor";
    }

    res.status(200).json({ archetype: archetypeText });
  } catch (error) {
    console.error('[USA Wrapped] AI generation failed with error:', error.message);
    // Bulletproof fallback so the UI never breaks
    res.status(200).json({ 
      archetype: "Olympic Legend. Your dedication to the games and physical potential is unmatched!" 
    });
  }
}
