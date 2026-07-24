/**
 * EPO API Sync Route: Classes
 * Endpoint: /api/epo-sync-classes
 * Syncs classes (учебни предмети и класове) records to EPO API
 */

import { NextRequest, NextResponse } from 'next/server';
import { EPO_API_CONFIG, EpoApiResponse } from '@/lib/api/epo-api-types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { epoPortfolioId, epoUserId, classes } = body;

    console.log('🎓 [EPO Sync Classes] Starting sync...');
    console.log('🎓 Portfolio ID:', epoPortfolioId);
    console.log('🎓 User ID:', epoUserId);
    console.log('🎓 Classes count:', classes?.length || 0);

    if (!epoPortfolioId || !epoUserId) {
      return NextResponse.json(
        { error: 'Missing EPO Portfolio ID or User ID' },
        { status: 400 }
      );
    }

    if (!Array.isArray(classes) || classes.length === 0) {
      return NextResponse.json(
        { error: 'No classes records to sync' },
        { status: 400 }
      );
    }

    // Sync each classes record
    const results: Array<{ success: boolean; message?: string; error?: string }> = [];

    for (const record of classes) {
      try {
        console.log('🎓 Sending class record:', record);

        // Build EPO API payload
        const payload: Record<string, string | number> = {
          token: EPO_API_CONFIG.TOKEN,
          portfolio: epoPortfolioId,
          users: epoUserId,
          cmd: 'classes',
          name: String(record.name),
          class: Number(record.class),
        };

        // Handle multiclass (if class = 20 "Повече от един клас")
        if (record.class === '20' || record.class === 20) {
          if (record.multiclass && Array.isArray(record.multiclass)) {
            // Convert array to comma-separated string of numbers
            payload.multiclass = record.multiclass.map((c: string | number) => Number(c)).join(',');
          } else if (typeof record.multiclass === 'string') {
            // Already a string, just pass it through
            payload.multiclass = record.multiclass;
          }
        }

        // Handle years (multiple academic years)
        if (record.years) {
          if (Array.isArray(record.years)) {
            // Convert array to comma-separated string
            payload.years = record.years.join(',');
          } else {
            // Already a string, just pass it through
            payload.years = String(record.years);
          }
        }

        console.log('🎓 Payload:', payload);

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

        console.log('🎓 Class response:', data);

        if ('Message' in data) {
          results.push({ success: true, message: data.Message });
        } else if ('Error' in data) {
          results.push({ success: false, error: data.Error });
        } else {
          results.push({ success: false, error: 'Unknown response format' });
        }
      } catch (error) {
        console.error('🎓 Error syncing class:', error);
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Calculate summary
    const successCount = results.filter((r) => r.success).length;
    const errorCount = results.filter((r) => !r.success).length;

    console.log('🎓 Sync complete:', { total: classes.length, success: successCount, errors: errorCount });

    return NextResponse.json({
      success: errorCount === 0,
      message: errorCount === 0
        ? `Успешно синхронизирани ${successCount} записа за учебни предмети и класове`
        : `Синхронизирани ${successCount} от ${classes.length} записа. ${errorCount} грешки.`,
      results,
    });
  } catch (error) {
    console.error('🎓 [EPO Sync Classes] Fatal error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
