import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Access your API key as an environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: NextRequest) {
  const { content } = await req.json();

  if (!content) {
    return NextResponse.json({ error: 'Content is required in the request body.' }, { status: 400 });
  }

  try {
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(content);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ generatedText: text }, { status: 200 });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return NextResponse.json({ error: 'Failed to call Gemini API' }, { status: 500 });
  }
}