import { GoogleGenAI } from '@google/genai';

// Initialize the official Google Gen AI SDK for Vertex AI
const project = process.env.GCP_PROJECT_ID || 'usa-wrapped';
const location = process.env.GCP_LOCATION || 'us-central1';

const ai = new GoogleGenAI({ 
  vertexai: true, 
  project, 
  location 
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { stateName } = req.body;
  if (!stateName) return res.status(400).json({ message: 'State name required' });

  const prompt = `Write a cinematic, 2-3 sentence narrative about the Olympic legacy of the US state of ${stateName}. 
  Mention a specific athlete or sport they are famous for. Keep it inspiring and under 50 words. 
  Focus on their contribution to Team USA.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        maxOutputTokens: 200,
        temperature: 0.8,
      }
    });

    res.status(200).json({ narrative: response.text.trim() });
  } catch (error) {
    console.error("Narrative AI Error:", error.message);
    res.status(200).json({ narrative: `The ${stateName} legacy continues to inspire generations of athletes...` });
  }
}
