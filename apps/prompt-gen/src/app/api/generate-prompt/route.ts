import { NextRequest, NextResponse } from 'next/server';
import { openAIService } from '../../../services/aiService';

console.log('API route file loaded');

export async function GET() {
  console.log('GET request received');
  return NextResponse.json({ message: 'API is working' });
}

export async function POST(req: NextRequest) {
  console.log('POST request received');
  try {
    const body = await req.json();
    console.log('Request body:', body);

    const { topic } = body;

    if (!topic) {
      console.log('Topic is required');
      return NextResponse.json({ message: 'Topic is required' }, { status: 400 });
    }

    console.log('Generating prompt for topic:', topic);
    const generatedPrompt = await openAIService.generatePrompt(topic);
    console.log('Generated prompt:', generatedPrompt);
    return NextResponse.json({ prompt: generatedPrompt });
  } catch (error) {
    console.error('Error generating prompt:', error);
    return NextResponse.json({ message: 'Failed to generate prompt. Please try again.' }, { status: 500 });
  }
}