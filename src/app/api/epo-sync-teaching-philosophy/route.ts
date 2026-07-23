/**
 * EPO API Sync Route: Teaching Philosophy
 * Endpoint: /api/epo-sync-teaching-philosophy
 * Syncs teaching philosophy text to EPO API
 */

import { NextRequest, NextResponse } from 'next/server';
import { EPO_API_CONFIG, EpoApiResponse } from '@/lib/api/epo-api-types';

interface RequestBody {
  epoPortfolioId: string;
  epoUserId: string;
  teachingphilosophy: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { epoPortfolioId, epoUserId, teachingphilosophy } = body;

    console.log('💭 [EPO Sync Teaching Philosophy] Starting sync...');
    console.log('💭 Portfolio ID:', epoPortfolioId);
    console.log('💭 User ID:', epoUserId);
    console.log('💭 Teaching Philosophy length:', teachingphilosophy?.length || 0);

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
      cmd: 'teachingphilosophy',
      token: EPO_API_CONFIG.TOKEN,
      teachingphilosophy: teachingphilosophy || '',
    });

    console.log('💭 Sending to EPO API...');

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

    console.log('💭 EPO API response:', data);

    // Check for EPO API error
    if ('Error' in data) {
      console.error('💭 EPO API error:', data.Error);
      return NextResponse.json({
        success: false,
        error: data.Error,
      });
    }

    console.log('💭 [EPO Sync Teaching Philosophy] Success!');

    return NextResponse.json({
      success: true,
      message: data.Message,
    });
  } catch (error) {
    console.error('💭 [EPO Sync Teaching Philosophy] Fatal error:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync teaching philosophy',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
