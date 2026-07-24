import { NextRequest, NextResponse } from 'next/server';
import { EPO_API_CONFIG, type EpoApiResponse } from '@/lib/api/epo-api-types';

export async function POST(request: NextRequest) {
  try {
    const { epoPortfolioId, epoUserId, research } = await request.json();

    console.log('🔬 API: Starting research sync...');
    console.log('🔬 API: Portfolio ID:', epoPortfolioId);
    console.log('🔬 API: User ID:', epoUserId);
    console.log('🔬 API: Research data:', research);

    if (!epoPortfolioId || !epoUserId) {
      return NextResponse.json(
        { error: 'Missing EPO Portfolio ID or User ID' },
        { status: 400 }
      );
    }

    if (!Array.isArray(research) || research.length === 0) {
      return NextResponse.json(
        { error: 'No research records to sync' },
        { status: 400 }
      );
    }

    // Sync each research record
    const syncResults: Array<{ success: boolean; message?: string; error?: string }> = [];

    for (const record of research) {
      try {
        console.log('🔬 Sending research record:', record);

        // Build EPO API payload
        const payload: Record<string, string | number> = {
          token: EPO_API_CONFIG.TOKEN,
          portfolio: epoPortfolioId,
          users: epoUserId,
          cmd: 'research',
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

        console.log('🔬 Payload:', payload);

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

        console.log('🔬 Research response:', data);

        if ('Message' in data) {
          syncResults.push({ success: true, message: data.Message });
        } else if ('Error' in data) {
          syncResults.push({ success: false, error: data.Error });
        } else {
          syncResults.push({ success: false, error: 'Unknown response format' });
        }
      } catch (error) {
        console.error('🔬 Error syncing research:', error);
        syncResults.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Calculate summary
    const successCount = syncResults.filter((r) => r.success).length;
    const errorCount = syncResults.filter((r) => !r.success).length;

    console.log('🔬 Sync complete:', { total: research.length, success: successCount, errors: errorCount });

    return NextResponse.json({
      success: errorCount === 0,
      message: `Successfully synced ${successCount} of ${research.length} research records`,
      results: syncResults,
    });
  } catch (error) {
    console.error('🔬 Research sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
