/**
 * EPO API Sync Route: Authorship
 * Endpoint: /api/epo-sync-authorship
 * Syncs authorship (авторство) records to EPO API
 */

import { NextRequest, NextResponse } from 'next/server';
import { EPO_API_CONFIG, EpoApiResponse } from '@/lib/api/epo-api-types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { epoPortfolioId, epoUserId, authorship } = body;

    console.log('📚 [EPO Sync Authorship] Starting sync...');
    console.log('📚 Portfolio ID:', epoPortfolioId);
    console.log('📚 User ID:', epoUserId);
    console.log('📚 Authorship count:', authorship?.length || 0);

    if (!epoPortfolioId || !epoUserId) {
      return NextResponse.json(
        { error: 'Missing EPO Portfolio ID or User ID' },
        { status: 400 }
      );
    }

    if (!Array.isArray(authorship) || authorship.length === 0) {
      return NextResponse.json(
        { error: 'No authorship records to sync' },
        { status: 400 }
      );
    }

    // Sync each authorship record
    const syncResults: Array<{ success: boolean; message?: string; error?: string }> = [];

    for (const record of authorship) {
      try {
        console.log('📚 Sending authorship record:', record);

        // Build EPO API payload
        const payload: Record<string, string | number> = {
          token: EPO_API_CONFIG.TOKEN,
          portfolio: epoPortfolioId,
          users: epoUserId,
          cmd: 'authorship',
          type: Number(record.type),
          role: Number(record.role),
          name: String(record.name),
        };

        // Add content if provided
        if (record.content) {
          payload.content = String(record.content);
        }

        console.log('📚 Payload:', payload);

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

        console.log('📚 Authorship response:', data);

        if ('Message' in data) {
          syncResults.push({ success: true, message: data.Message });
        } else if ('Error' in data) {
          syncResults.push({ success: false, error: data.Error });
        } else {
          syncResults.push({ success: false, error: 'Unknown response format' });
        }
      } catch (error) {
        console.error('📚 Error syncing authorship:', error);
        syncResults.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Calculate summary
    const successCount = syncResults.filter((r) => r.success).length;
    const errorCount = syncResults.filter((r) => !r.success).length;

    console.log('📚 Sync complete:', { total: authorship.length, success: successCount, errors: errorCount });

    return NextResponse.json({
      success: errorCount === 0,
      message: `Successfully synced ${successCount} of ${authorship.length} authorship records`,
      results: syncResults,
    });
  } catch (error) {
    console.error('📚 Error in authorship sync:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
