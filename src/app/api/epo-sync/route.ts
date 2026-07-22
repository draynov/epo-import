/**
 * EPO API Sync Route Handler
 * Proxies requests to EPO API to avoid CORS issues
 */

import { NextRequest, NextResponse } from 'next/server';
import { EPO_API_CONFIG, EpoApiResponse } from '@/lib/api/epo-api-types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { epoPortfolioId, epoUserId, portfolioData } = body;

    console.log('🔵 SERVER: Received sync request');
    console.log('🔵 SERVER: epoPortfolioId:', epoPortfolioId);
    console.log('🔵 SERVER: epoUserId:', epoUserId);
    console.log('🔵 SERVER: portfolioData:', portfolioData);

    // Validate input
    if (!epoPortfolioId || !epoUserId) {
      return NextResponse.json(
        { error: 'Missing required fields: epoPortfolioId, epoUserId' },
        { status: 400 }
      );
    }

    // Build EPO API payload
    const payload: Record<string, string | number> = {
      token: EPO_API_CONFIG.TOKEN,
      portfolio: epoPortfolioId,
      users: epoUserId,
      cmd: 'portfolio',
    };

    // Add portfolio data fields (filter out undefined/null)
    if (portfolioData) {
      Object.entries(portfolioData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          payload[key] = value as string | number;
        }
      });
    }

    console.log('🔵 SERVER: Sending to EPO API:', payload);

    // Send to EPO API
    const formData = new URLSearchParams();
    Object.entries(payload).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    const response = await fetch(EPO_API_CONFIG.BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as EpoApiResponse;

    console.log('✅ SERVER: EPO API Response:', data);

    if ('Message' in data) {
      return NextResponse.json({ success: true, message: data.Message });
    } else if ('Error' in data) {
      return NextResponse.json(
        { success: false, error: data.Error },
        { status: 400 }
      );
    }

    throw new Error('Invalid response from EPO API');
  } catch (error) {
    console.error('❌ SERVER: EPO sync error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
