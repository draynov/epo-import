/**
 * EPO API Sync Route: Teaching Methods
 * Endpoint: /api/epo-sync-teaching-methods
 * Syncs teaching methods text to EPO API
 */

import { NextRequest, NextResponse } from 'next/server';
import { EPO_API_CONFIG, EpoApiResponse } from '@/lib/api/epo-api-types';

interface RequestBody {
  epoPortfolioId: string;
  epoUserId: string;
  teachingmethods: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { epoPortfolioId, epoUserId, teachingmethods } = body;

    console.log('📚 [EPO Sync Teaching Methods] Starting sync...');
    console.log('📚 Portfolio ID:', epoPortfolioId);
    console.log('📚 User ID:', epoUserId);
    console.log('📚 Teaching Methods length:', teachingmethods?.length || 0);

    if (!epoPortfolioId || !epoUserId) {
      return NextResponse.json(
        { error: 'Missing EPO Portfolio ID or User ID' },
        { status: 400 }
      );
    }

    // Build payload
    const payload = new URLSearchParams({
      portfolio: epoPortfolioId,
      users: epoUserId,
      cmd: 'teachingmethods',
      token: EPO_API_CONFIG.TOKEN,
      teachingmethods: teachingmethods || '',
    });

    console.log('📚 Sending to EPO API...');

    const response = await fetch(EPO_API_CONFIG.BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload.toString(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: EpoApiResponse = await response.json();

    console.log('📚 EPO API response:', data);

    // Check for EPO API error
    if ('Error' in data) {
      console.error('📚 EPO API error:', data.Error);
      return NextResponse.json({
        success: false,
        error: data.Error,
      });
    }

    console.log('📚 [EPO Sync Teaching Methods] Success!');

    return NextResponse.json({
      success: true,
      message: data.Message,
    });
  } catch (error) {
    console.error('📚 [EPO Sync Teaching Methods] Fatal error:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync teaching methods',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
