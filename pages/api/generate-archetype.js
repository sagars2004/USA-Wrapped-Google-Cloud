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
    const prompt = `You are the narrator for 'USA Wrapped'.
I am providing summary statistics about the USA's Olympic history and a user's Bio-Metric profile.

User Name: ${userName}
User Location: ${userLocation}
User Bio-Metrics: ${JSON.stringify(metrics || {})} (Height/Wingspan are in Inches, Weight is in Pounds)

Olympic History Stats:
- Total Records: ${stats.totalRecords}
- Top Sports: ${stats.topSports?.map(s => `${s.sport} (${s.count})`).join(', ')}
- Tallest Athlete: ${stats.tallestRecord?.height_cm}cm
- Shortest Athlete: ${stats.shortestRecord?.height_cm}cm

Based on their physical profile (Inches/lbs) and the Olympic stats (cm/kg), determine their "Olympic Archetype".
Note: 1 inch = 2.54cm. 1 lb = 0.45kg.
1. Start with "You are the [Archetype Name]!" (e.g. "The Wingspan Wonder", "The Agility Ace").
2. Write a 2nd sentence explaining WHY this fits them based on their metrics vs Olympic history.
3. Keep it punchy, professional, and Apple-inspired.

Write exactly two sentences.`;

    // Generate content using the new SDK and Gemini 2.5 Pro (Gemini 1.5 is retired in 2026)
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        maxOutputTokens: 200,
        temperature: 0.7,
      }
    });

    // The new SDK returns response.text directly
    const archetypeText = response.text;

    res.status(200).json({ archetype: archetypeText.trim() });
  } catch (error) {
    console.error('[USA Wrapped] AI generation failed with error:', error.message);
    // Bulletproof fallback so the UI never breaks
    res.status(200).json({ 
      archetype: "You are the Olympic Legend. Your dedication to the games is unmatched!" 
    });
  }
}
