import { GoogleGenAI } from '@google/genai';

const project = process.env.GCP_PROJECT_ID || 'usa-wrapped';
const location = process.env.GCP_LOCATION || 'us-central1';

const ai = new GoogleGenAI({ 
  vertexai: true, 
  project, 
  location 
});

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  const prompt = `You are a professional Team USA historian. 
Generate ONE quirky, interesting, or surprising question that a user could ask you about Team USA's legacy at US-hosted Games.
STRICT COMPLIANCE RULES:
1. Always use "Olympic Games [City] [Year]" or "Olympic Winter Games [City] [Year]".
2. Do NOT mention specific athlete names (NIL).
3. Focus on disciplines, unusual facts, or aggregate achievements.
4. Keep the question under 15 words.
5. Do NOT use markdown bolding.

Write ONLY the question text.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        maxOutputTokens: 100,
        temperature: 0.9,
      }
    });

    // Accessing response.text directly can throw if the response is blocked by safety filters
    const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
    let question = rawText.trim().replace(/"/g, '');

    // FALLBACKS: High-quality, compliant questions in case AI is fragmented or blocked
    const FALLBACK_QUESTIONS = [
      "Which sport has the most Team USA gold medals in the Olympic Games Atlanta 1996?",
      "How many medals did Team USA win in the Olympic Games Los Angeles 1984?",
      "What was the top discipline for Team USA in the Olympic Winter Games Lake Placid 1980?",
      "Which US-hosted Games had the most athletes from my state?",
      "Tell me about the legacy of the Olympic Games St. Louis 1904."
    ];

    // VALIDATION: Ensure the question is complete and professional
    if (question.length < 15 || !question.endsWith('?')) {
      question = FALLBACK_QUESTIONS[Math.floor(Math.random() * FALLBACK_QUESTIONS.length)];
    }

    res.status(200).json({ question });
  } catch (error) {
    console.error("Surprise Me Error:", error.message);
    res.status(200).json({ question: "Which state has the most medals in the Olympic Games Los Angeles 1984?" });
  }
}
