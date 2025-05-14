import { NextResponse } from 'next/server';
import { MURAL_PAY_CONFIG } from '@/app/config/mural-pay';

const ORG_ID = '646d35c3-39fa-4192-9492-4e5f3395b57e';

export async function POST(request: Request) {
  try {
    const response = await fetch(`${MURAL_PAY_CONFIG.baseUrl}/api/payouts/search`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'authorization': MURAL_PAY_CONFIG.headers.Authorization,
        'on-behalf-of': ORG_ID,
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payout history');
    }

    const data = await response.json();
    console.log('Raw API response:', data);
    
    // Return the results array from the response
    return NextResponse.json(data.results || []);
  } catch (error) {
    console.error('Error fetching payout history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payout history' },
      { status: 500 }
    );
  }
} 