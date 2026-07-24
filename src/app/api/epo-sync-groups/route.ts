/**
 * EPO API Sync Route: Groups
 * Endpoint: /api/epo-sync-groups
 * Syncs groups (детски групи) records to EPO API
 */

import { NextRequest, NextResponse } from 'next/server';
import { EPO_API_CONFIG, EpoApiResponse } from '@/lib/api/epo-api-types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { epoPortfolioId, epoUserId, groups } = body;

    console.log('👶 [EPO Sync Groups] Starting sync...');
    console.log('👶 Portfolio ID:', epoPortfolioId);
    console.log('👶 User ID:', epoUserId);
    console.log('👶 Groups count:', groups?.length || 0);

    if (!epoPortfolioId || !epoUserId) {
      return NextResponse.json(
        { error: 'Missing EPO Portfolio ID or User ID' },
        { status: 400 }
      );
    }

    if (!Array.isArray(groups) || groups.length === 0) {
      return NextResponse.json(
        { error: 'No groups records to sync' },
        { status: 400 }
      );
    }

    // Sync each groups record
    const results: Array<{ success: boolean; message?: string; error?: string }> = [];

    for (const record of groups) {
      try {
        console.log('👶 Sending group record:', record);

        // Build EPO API payload
        const payload: Record<string, string | number> = {
          token: EPO_API_CONFIG.TOKEN,
          portfolio: epoPortfolioId,
          users: epoUserId,
          cmd: 'groups',
          group: Number(record.group),
          name: String(record.name),
        };

        // Handle multigroup (if group = 6 "Повече от една група")
        if (record.group === '6' || record.group === 6) {
          if (record.multigroup && Array.isArray(record.multigroup)) {
            // Convert array to comma-separated string of numbers
            payload.multigroup = record.multigroup.map((g: string | number) => Number(g)).join(',');
          } else if (typeof record.multigroup === 'string') {
            // Already a string, just pass it through
            payload.multigroup = record.multigroup;
          }
        }

        console.log('👶 Payload:', payload);
        console.log('👶 Years array:', record.years);

        // Send to EPO API
        const formData = new URLSearchParams();
        Object.entries(payload).forEach(([key, value]) => {
          formData.append(key, String(value));
        });

        // Append years as array with years[multiple] format
        if (record.years) {
          if (Array.isArray(record.years)) {
            record.years.forEach((year: string) => {
              formData.append('years[multiple]', year);
            });
          } else {
            // Single year as string
            formData.append('years[multiple]', String(record.years));
          }
        }

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

        console.log('👶 Group response:', data);

        if ('Message' in data) {
          results.push({ success: true, message: data.Message });
        } else if ('Error' in data) {
          results.push({ success: false, error: data.Error });
        } else {
          results.push({ success: false, error: 'Unknown response format' });
        }
      } catch (error) {
        console.error('👶 Error syncing group:', error);
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Calculate summary
    const successCount = results.filter((r) => r.success).length;
    const errorCount = results.filter((r) => !r.success).length;

    console.log('👶 Sync complete:', { total: groups.length, success: successCount, errors: errorCount });

    return NextResponse.json({
      success: errorCount === 0,
      message: errorCount === 0
        ? `Успешно синхронизирани ${successCount} записа за групи`
        : `Синхронизирани ${successCount} от ${groups.length} записа. ${errorCount} грешки.`,
      results,
    });
  } catch (error) {
    console.error('👶 [EPO Sync Groups] Fatal error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
