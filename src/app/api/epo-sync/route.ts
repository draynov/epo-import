/**
 * EPO API Sync Route Handler
 * Proxies requests to EPO API to avoid CORS issues
 */

import { NextRequest, NextResponse } from 'next/server';
import { epoApiClient, isEpoApiSuccess } from '@/lib/api/epo-api-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { portfolioId, epoPortfolioId, epoUserId } = body;

    console.log('🔄 EPO Sync Request:', { portfolioId, epoPortfolioId, epoUserId });

    // Validate input
    if (!portfolioId || !epoPortfolioId || !epoUserId) {
      return NextResponse.json(
        { error: 'Missing required fields: portfolioId, epoPortfolioId, epoUserId' },
        { status: 400 }
      );
    }

    // Call EPO API
    const response = await epoApiClient.syncPortfolioData(
      portfolioId,
      epoPortfolioId,
      epoUserId
    );

    console.log('✅ EPO API Response:', response);

    if (isEpoApiSuccess(response)) {
      return NextResponse.json({ success: true, message: response.Message });
    } else {
      return NextResponse.json(
        { success: false, error: response.Error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('❌ EPO sync error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
