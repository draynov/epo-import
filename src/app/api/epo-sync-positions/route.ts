/**
 * EPO API Positions Sync Route Handler
 * Syncs position history to EPO API
 */

import { NextRequest, NextResponse } from 'next/server';
import { EPO_API_CONFIG, EpoApiResponse } from '@/lib/api/epo-api-types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { epoPortfolioId, epoUserId, positions } = body;

    console.log('🟡 SERVER: Received positions sync request');
    console.log('🟡 SERVER: epoPortfolioId:', epoPortfolioId);
    console.log('🟡 SERVER: epoUserId:', epoUserId);
    console.log('🟡 SERVER: positions count:', positions?.length);

    // Validate input
    if (!epoPortfolioId || !epoUserId) {
      return NextResponse.json(
        { error: 'Missing required fields: epoPortfolioId, epoUserId' },
        { status: 400 }
      );
    }

    if (!Array.isArray(positions) || positions.length === 0) {
      return NextResponse.json(
        { error: 'No positions data provided' },
        { status: 400 }
      );
    }

    // Send each position to EPO API
    const results: Array<{ success: boolean; message?: string; error?: string }> = [];

    for (const position of positions) {
      try {
        console.log('🟡 SERVER: Sending position:', position);

        // Build EPO API payload
        const payload: Record<string, string | number> = {
          token: EPO_API_CONFIG.TOKEN,
          portfolio: epoPortfolioId,
          users: epoUserId,
          cmd: 'positions',
          mesec_from: Number(position.mesec_from) || 0,
          godina_from: Number(position.godina_from),
          mesec_to: Number(position.mesec_to) || 0,
          godina_to: Number(position.godina_to) || 0,
          now_to: position.now_to ? 1 : 0,
          institution: String(position.institution),
          position: String(position.position),
        };

        console.log('🟡 SERVER: Payload:', payload);

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

        console.log('🟡 SERVER: Position response:', data);

        if ('Message' in data) {
          results.push({ success: true, message: data.Message });
        } else if ('Error' in data) {
          results.push({ success: false, error: data.Error });
        }
      } catch (error) {
        console.error('🟡 SERVER: Position sync error:', error);
        results.push({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    // Check if all succeeded
    const allSuccess = results.every(r => r.success);
    const successCount = results.filter(r => r.success).length;

    if (allSuccess) {
      return NextResponse.json({ 
        success: true, 
        message: `Успешно синхронизирани ${successCount} позиции` 
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: `Синхронизирани ${successCount} от ${results.length} позиции. Има грешки.`,
          details: results
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('❌ SERVER: Positions sync error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
