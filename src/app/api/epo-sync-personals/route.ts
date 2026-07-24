/**
 * EPO API Sync Route: Personal Achievements
 * Endpoint: /api/epo-sync-personals
 * Syncs personal-achievements records to EPO API
 */

import { NextRequest, NextResponse } from 'next/server';
import { EPO_API_CONFIG, EpoApiResponse } from '@/lib/api/epo-api-types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { epoPortfolioId, epoUserId, personals } = body;

    console.log('🏆 [EPO Sync Personals] Starting sync...');
    console.log('🏆 Portfolio ID:', epoPortfolioId);
    console.log('🏆 User ID:', epoUserId);
    console.log('🏆 Personals count:', personals?.length || 0);

    if (!epoPortfolioId || !epoUserId) {
      return NextResponse.json(
        { error: 'Missing EPO Portfolio ID or User ID' },
        { status: 400 }
      );
    }

    if (!Array.isArray(personals) || personals.length === 0) {
      return NextResponse.json(
        { error: 'No personal achievements records to sync' },
        { status: 400 }
      );
    }

    // Sync each personals record
    const results: Array<{ success: boolean; message?: string; error?: string }> = [];

    for (const record of personals) {
      try {
        console.log('🏆 Sending personal achievement record:', record);

        // Build EPO API payload
        const payload: Record<string, string | number> = {
          token: EPO_API_CONFIG.TOKEN,
          portfolio: epoPortfolioId,
          users: epoUserId,
          cmd: 'personals',
          name: String(record.name),
        };

        // Add content if provided
        if (record.content) {
          payload.content = String(record.content);
        }

        console.log('🏆 Payload:', payload);

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

        console.log('🏆 Personal achievement response:', data);

        if ('Message' in data) {
          results.push({ success: true, message: data.Message });
        } else if ('Error' in data) {
          results.push({ success: false, error: data.Error });
        } else {
          results.push({ success: false, error: 'Unknown response format' });
        }
      } catch (error) {
        console.error('🏆 Error syncing personal achievement:', error);
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Calculate summary
    const successCount = results.filter((r) => r.success).length;
    const errorCount = results.filter((r) => !r.success).length;

    console.log('🏆 Sync complete:', { total: personals.length, success: successCount, errors: errorCount });

    return NextResponse.json({
      success: errorCount === 0,
      message: `Successfully synced ${successCount} of ${personals.length} personal achievements`,
      results,
    });
  } catch (error) {
    console.error('🏆 Error in personal achievements sync:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
