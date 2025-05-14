import { NextResponse } from 'next/server';
import { MURAL_PAY_CONFIG } from '@/app/config/mural-pay';

const ORG_ID = '646d35c3-39fa-4192-9492-4e5f3395b57e';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Payout ID is required' },
        { status: 400 }
      );
    }

    console.log('Executing payout with ID:', id);

    const response = await fetch(`${MURAL_PAY_CONFIG.baseUrl}/api/payouts/payout/${id}/execute`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'authorization': MURAL_PAY_CONFIG.headers.Authorization,
        'on-behalf-of': ORG_ID,
        'transfer-api-key': process.env.MURAL_PAY_TRANSFER_KEY || 'ffd0c57fb3fffe7d03be6326:be02240bbf776093e7f0b51d361a2ca9eb22fa61196c79e6017bd7d2697f23c1e372e646:659371249cca70b35cc020b293982533.1749571d3f54bd4801eaa06de6327179de1ca789e5d1760c2be760aa4bed3c84'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Payout execution failed:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      
      return NextResponse.json(
        { 
          error: 'Failed to execute payout',
          details: errorData || response.statusText
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Execute payout response:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error executing payout:', error);
    return NextResponse.json(
      { 
        error: 'Failed to execute payout',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 