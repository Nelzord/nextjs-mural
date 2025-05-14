import { NextResponse } from 'next/server';
import { MURAL_PAY_CONFIG } from '@/app/config/mural-pay';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const headers = {
      'Authorization': MURAL_PAY_CONFIG.headers.Authorization,
      'on-behalf-of': MURAL_PAY_CONFIG.headers['on-behalf-of'] || '',
      'Content-Type': 'application/json',
    };

    const response = await fetch(`${MURAL_PAY_CONFIG.baseUrl}${MURAL_PAY_CONFIG.endpoints.payouts.create}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create payout' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Payout ID is required' }, { status: 400 });
    }

    const headers = {
      'Authorization': MURAL_PAY_CONFIG.headers.Authorization,
      'on-behalf-of': MURAL_PAY_CONFIG.headers['on-behalf-of'] || '',
      'Content-Type': 'application/json',
    };

    const response = await fetch(`${MURAL_PAY_CONFIG.baseUrl}${MURAL_PAY_CONFIG.endpoints.payouts.create}/${id}`, {
      headers,
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch payout' }, { status: 500 });
  }
} 