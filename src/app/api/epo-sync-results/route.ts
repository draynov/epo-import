/**
 * EPO API Sync Route: Results
 * Endpoint: /api/epo-sync-results
 * Syncs results (постигнати резултати) records to EPO API
 */

import { NextRequest, NextResponse } from 'next/server';
import { EPO_API_CONFIG, EpoApiResponse } from '@/lib/api/epo-api-types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { epoPortfolioId, epoUserId, results } = body;

    console.log('📊 [EPO Sync Results] Starting sync...');
    console.log('📊 Portfolio ID:', epoPortfolioId);
    console.log('📊 User ID:', epoUserId);
    console.log('📊 Results count:', results?.length || 0);

    if (!epoPortfolioId || !epoUserId) {
      return NextResponse.json(
        { error: 'Missing EPO Portfolio ID or User ID' },
        { status: 400 }
      );
    }

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        { error: 'No results records to sync' },
        { status: 400 }
      );
    }

    // Sync each results record
    const syncResults: Array<{ success: boolean; message?: string; error?: string }> = [];

    for (const record of results) {
      try {
        console.log('📊 Sending result record:', record);

        // Build EPO API payload
        const payload: Record<string, string | number> = {
          token: EPO_API_CONFIG.TOKEN,
          portfolio: epoPortfolioId,
          users: epoUserId,
          cmd: 'results',
          name: String(record.name),
        };

        // Validate years (required)
        if (!record.years || (Array.isArray(record.years) && record.years.length === 0)) {
          syncResults.push({
            success: false,
            error: `"${record.name}" - липсват учебни години`,
          });
          continue;
        }

        // Add content if provided
        if (record.content) {
          payload.content = String(record.content);
        }

        console.log('📊 Payload:', payload);
        console.log('📊 Years array:', record.years);
        console.log('📊 Years count:', Array.isArray(record.years) ? record.years.length : 1);

        // Send to EPO API
        const formData = new URLSearchParams();
        Object.entries(payload).forEach(([key, value]) => {
          formData.append(key, String(value));
        });

        // Append years as array with years[] format (matches HTML: <select name="years[]">
        if (Array.isArray(record.years)) {
          console.log('📊 Adding years one by one:');
          record.years.forEach((year: string, index: number) => {
            console.log(`  [${index}] ${year}`);
            formData.append('years[]', year);
          });
        } else {
          // Single year as string
          formData.append('years[]', String(record.years));
        }

        console.log('📊 FormData toString:', formData.toString());
        console.log('📊 FormData getAll years[]:', formData.getAll('years[]'));

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

        console.log('📊 Result response:', data);

        if ('Message' in data) {
          syncResults.push({ success: true, message: data.Message });
        } else if ('Error' in data) {
          syncResults.push({ success: false, error: data.Error });
        } else {
          syncResults.push({ success: false, error: 'Unknown response format' });
        }
      } catch (error) {
        console.error('📊 Error syncing result:', error);
        syncResults.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Calculate summary
    const successCount = syncResults.filter((r) => r.success).length;
    const errorCount = syncResults.filter((r) => !r.success).length;

    console.log('📊 Sync complete:', { total: results.length, success: successCount, errors: errorCount });

    return NextResponse.json({
      success: errorCount === 0,
      message: `Successfully synced ${successCount} of ${results.length} results`,
      results: syncResults,
    });
  } catch (error) {
    console.error('📊 Error in results sync:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
