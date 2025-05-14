import { NextResponse } from 'next/server';
import { MURAL_PAY_CONFIG } from '@/app/config/mural-pay';

export async function POST(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Payout ID is required' }, { status: 400 });
    }

    const headers = {
      Authorization: MURAL_PAY_CONFIG.headers?.Authorization ?? '',
      'on-behalf-of': MURAL_PAY_CONFIG.headers?.['on-behalf-of'] ?? '',
      'x-transfer-key': process.env.MURAL_PAY_TRANSFER_KEY ?? '',
      'Content-Type': 'application/json',
    };

    const response = await fetch(
      `${MURAL_PAY_CONFIG.baseUrl}${MURAL_PAY_CONFIG.endpoints.payouts.execute(id)}`,
      {
        method: 'POST',
        headers,
      }
    );

    let data;
    try {
      data = await response.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON from Mural' }, { status: 502 });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to execute payout' }, { status: 500 });
  }
}
