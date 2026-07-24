/**
 * EPO API Sync Route: Programs
 * Endpoint: /api/epo-sync-programs
 * Syncs programs (участие в програми) records to EPO API
 */

import { NextRequest, NextResponse } from 'next/server';
import { EPO_API_CONFIG, EpoApiResponse } from '@/lib/api/epo-api-types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { epoPortfolioId, epoUserId, programs } = body;

    console.log('📋 [EPO Sync Programs] Starting sync...');
    console.log('📋 Portfolio ID:', epoPortfolioId);
    console.log('📋 User ID:', epoUserId);
    console.log('📋 Programs count:', programs?.length || 0);

    if (!epoPortfolioId || !epoUserId) {
      return NextResponse.json(
        { error: 'Missing EPO Portfolio ID or User ID' },
        { status: 400 }
      );
    }

    if (!Array.isArray(programs) || programs.length === 0) {
      return NextResponse.json(
        { error: 'No programs records to sync' },
        { status: 400 }
      );
    }

    // Sync each programs record
    const syncResults: Array<{ success: boolean; message?: string; error?: string }> = [];

    for (const record of programs) {
      try {
        console.log('📋 Sending program record:', record);

        // Build EPO API payload
        const payload: Record<string, string | number> = {
          token: EPO_API_CONFIG.TOKEN,
          portfolio: epoPortfolioId,
          users: epoUserId,
          cmd: 'programs',
          mesec_from: Number(record.mesec_from || 0),
          godina_from: Number(record.godina_from),
          mesec_to: Number(record.mesec_to || 0),
          godina_to: Number(record.godina_to || 0),
          now_to: record.now_to ? 1 : 0,
          name: String(record.name),
          position: String(record.position),
          organization: String(record.organization),
        };

        // Add content if provided
        if (record.content) {
          payload.content = String(record.content);
        }

        console.log('📋 Payload:', payload);

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

        console.log('📋 Program response:', data);

        if ('Message' in data) {
          syncResults.push({ success: true, message: data.Message });
        } else if ('Error' in data) {
          syncResults.push({ success: false, error: data.Error });
        } else {
          syncResults.push({ success: false, error: 'Unknown response format' });
        }
      } catch (error) {
        console.error('📋 Error syncing program:', error);
        syncResults.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Calculate summary
    const successCount = syncResults.filter((r) => r.success).length;
    const errorCount = syncResults.filter((r) => !r.success).length;

    console.log('📋 Sync complete:', { total: programs.length, success: successCount, errors: errorCount });

    return NextResponse.json({
      success: errorCount === 0,
      message: `Successfully synced ${successCount} of ${programs.length} programs`,
      results: syncResults,
    });
  } catch (error) {
    console.error('📋 Error in programs sync:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
