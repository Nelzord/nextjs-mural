import { NextResponse } from 'next/server';
import { MURAL_PAY_CONFIG } from '@/app/config/mural-pay';

const ORG_ID = '646d35c3-39fa-4192-9492-4e5f3395b57e';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const headers = {
      'Authorization': MURAL_PAY_CONFIG.headers.Authorization,
      'on-behalf-of': ORG_ID,
      'Content-Type': 'application/json',
    };

    const response = await fetch(`${MURAL_PAY_CONFIG.baseUrl}${MURAL_PAY_CONFIG.endpoints.accounts.create}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const headers = {
      'Authorization': MURAL_PAY_CONFIG.headers.Authorization,
      'on-behalf-of': ORG_ID,
      'Content-Type': 'application/json',
    };

    const response = await fetch(`${MURAL_PAY_CONFIG.baseUrl}${MURAL_PAY_CONFIG.endpoints.accounts.list}`, {
      headers,
    });

    const data = await response.json();
    const accounts = Array.isArray(data) ? data : [];
    return NextResponse.json(accounts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
  }
}
