/**
 * EPO API Credits Sync Route Handler
 * Syncs qualification credits records to EPO API
 */

import { NextRequest, NextResponse } from 'next/server';
import { EPO_API_CONFIG, EpoApiResponse } from '@/lib/api/epo-api-types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { epoPortfolioId, epoUserId, credits } = body;

    console.log('🔵 SERVER: Received credits sync request');
    console.log('🔵 SERVER: epoPortfolioId:', epoPortfolioId);
    console.log('🔵 SERVER: epoUserId:', epoUserId);
    console.log('🔵 SERVER: credits count:', credits?.length);

    // Validate input
    if (!epoPortfolioId || !epoUserId) {
      return NextResponse.json(
        { error: 'Missing required fields: epoPortfolioId, epoUserId' },
        { status: 400 }
      );
    }

    if (!Array.isArray(credits) || credits.length === 0) {
      return NextResponse.json(
        { error: 'No credits data provided' },
        { status: 400 }
      );
    }

    // Send each credit record to EPO API
    const results: Array<{ success: boolean; message?: string; error?: string }> = [];

    for (const record of credits) {
      try {
        console.log('🔵 SERVER: Sending credit record:', record);

        // Build EPO API payload
        const payload: Record<string, string | number> = {
          token: EPO_API_CONFIG.TOKEN,
          portfolio: epoPortfolioId,
          users: epoUserId,
          cmd: 'credits',
          mesec: Number(record.mesec) || 0,
          godina: Number(record.godina),
          duration: Number(record.duration) || 0,
          quantity: Number(record.quantity) || 0,
          institution: String(record.institution || ''),
          tema: String(record.tema || ''),
        };

        console.log('🔵 SERVER: Payload:', payload);

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

        console.log('🔵 SERVER: Credit response:', data);

        if ('Error' in data) {
          results.push({ success: false, error: data.Error });
        } else {
          results.push({ success: true, message: data.Message });
        }
      } catch (error) {
        console.error('🔵 SERVER: Error sending credit record:', error);
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Check if all succeeded
    const allSucceeded = results.every((r) => r.success);
    const successCount = results.filter((r) => r.success).length;
    const errorCount = results.length - successCount;

    return NextResponse.json({
      success: allSucceeded,
      successCount,
      errorCount,
      totalRecords: credits.length,
      message: allSucceeded ? `Синхронизирани ${successCount} квалификационни кредита` : undefined,
      results,
    });
  } catch (error) {
    console.error('🔵 SERVER: Credits sync error:', error);
    return NextResponse.json(
      { error: 'Грешка при синхронизация на квалификационни кредити' },
      { status: 500 }
    );
  }
}
