import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { MURAL_PAY_CONFIG } from '@/app/config/mural-pay';

const ORG_ID = '646d35c3-39fa-4192-9492-4e5f3395b57e';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  try {
    const { question } = await request.json();

    // Fetch payout history using the same logic as the payouts page
    const response = await fetch(`${MURAL_PAY_CONFIG.baseUrl}/api/payouts/search`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'authorization': MURAL_PAY_CONFIG.headers.Authorization,
        'on-behalf-of': ORG_ID,
        'content-type': 'application/json'
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payout data');
    }

    const payoutData = await response.json();
    console.log('Fetched payout data:', payoutData);

    // Create a system message that includes the payout data
    const messages = [
      {
        role: 'system' as const,
        content: `You are a helpful AI assistant analyzing payout data. Here is the current payout data: ${JSON.stringify(payoutData)}. 
        Provide clear, concise answers based on this data. If the data doesn't contain the information needed to answer the question, 
        say so politely. Format numbers and dates in a readable way.`
      },
      {
        role: 'user' as const,
        content: question
      }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages,
      temperature: 0.7,
      max_tokens: 500
    });

    const answer = completion.choices[0]?.message?.content || 'Sorry, I could not generate an answer.';

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Error in AI analysis:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process AI analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 