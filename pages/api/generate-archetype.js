import { VertexAI } from '@google-cloud/vertexai';

// Initialize Vertex AI with project and location from environment variables
const project = process.env.GCP_PROJECT_ID || 'usa-wrapped';
const location = process.env.GCP_LOCATION || 'us-central1';

const vertexAI = new VertexAI({ project, location });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { stats } = req.body;
    
    if (!stats) {
      return res.status(400).json({ error: 'Missing stats in request body.' });
    }

    // Prepare the prompt for Gemini
    const prompt = `You are the narrator for a 'Spotify Wrapped'-style application called USA Olympic Wrapped.
I am going to provide you with some summary statistics about the USA's participation in the Olympic games hosted in the US.
Based on these stats, write a fun, enthusiastic 2-sentence "Olympic Archetype" for the user reading it. Make it sound punchy, like "You are the Winter Warrior" or "You are the Summer Smasher" based on the distribution of games or top sports.

Here are the stats:
Total USA records in US-hosted games: ${stats.totalRecords}
Top Sports: ${stats.topSports?.map(s => `${s.sport} (${s.count})`).join(', ')}
Tallest Athlete: ${stats.tallestRecord?.height_cm}cm (${stats.tallestRecord?.sport})
Shortest Athlete: ${stats.shortestRecord?.height_cm}cm (${stats.shortestRecord?.sport})

Write exactly two sentences for the Olympic Archetype summary.`;

    // Initialize the model
    // Using gemini-1.5-pro as requested by the user for highest quality output
    const generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-1.5-pro-002', 
      generationConfig: {
        maxOutputTokens: 200,
        temperature: 0.7,
      },
    });

    // Generate content
    const response = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const archetypeText = response.response.candidates[0].content.parts[0].text;

    res.status(200).json({ archetype: archetypeText.trim() });
  } catch (error) {
    console.error('Error generating archetype:', error);
    res.status(500).json({ error: 'Failed to generate archetype via Gemini' });
  }
}
