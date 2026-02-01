import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY not found in environment variables');
      return res.status(500).json({ 
        error: 'API key not configured',
        text: 'عذراً، لم يتم العثور على مفتاح API. يرجى التحقق من الإعدادات.'
      });
    }

    const { message, systemInstruction, tools } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    // Initialize Gemini
    const ai = new GoogleGenAI({ apiKey });

    // Create chat with system instruction and tools
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction || '',
        tools: tools || [],
      },
    });

    // Send message (can be regular message or function response parts)
    const response = await chat.sendMessage({ message });

    // Return response in same format as frontend Chat object
    return res.status(200).json({
      text: response.text || '',
      functionCalls: response.functionCalls || null
    });

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      text: 'معلش في مشكلة بسيطة في الاتصال، ممكن تحاول تاني؟'
    });
  }
}
