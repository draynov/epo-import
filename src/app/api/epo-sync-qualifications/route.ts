/**
 * EPO API Sync Route: Other Qualifications
 * Endpoint: /api/epo-sync-qualifications
 * Syncs other qualifications data to EPO API
 */

import { NextRequest, NextResponse } from 'next/server';
import { EPO_API_CONFIG, EpoApiResponse } from '@/lib/api/epo-api-types';

interface QualificationRecord {
  mesec_from?: number;
  godina_from: number;
  mesec_to?: number;
  godina_to?: number;
  now_to?: boolean;
  type: number;
  name: string;
  institution: string;
}

interface RequestBody {
  epoPortfolioId: string;
  epoUserId: string;
  records: QualificationRecord[];
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { epoPortfolioId, epoUserId, records } = body;

    console.log('🟡 [EPO Sync Qualifications] Starting sync...');
    console.log('🟡 Portfolio ID:', epoPortfolioId);
    console.log('🟡 User ID:', epoUserId);
    console.log('🟡 Records count:', records.length);

    if (!epoPortfolioId || !epoUserId) {
      return NextResponse.json(
        { error: 'Missing EPO Portfolio ID or User ID' },
        { status: 400 }
      );
    }

    if (!records || records.length === 0) {
      return NextResponse.json(
        { error: 'No qualifications to sync' },
        { status: 400 }
      );
    }

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Process each record
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      console.log(`🟡 [Record ${i + 1}/${records.length}]`, {
        name: record.name,
        type: record.type,
        institution: record.institution,
        from: `${record.mesec_from || ''}/${record.godina_from}`,
        to: record.now_to ? 'now' : `${record.mesec_to || ''}/${record.godina_to || ''}`,
      });

      // Build payload
      const payload = new URLSearchParams({
        portfolio: epoPortfolioId,
        users: epoUserId,
        cmd: 'qualifications',
        token: EPO_API_CONFIG.TOKEN,
        mesec_from: String(record.mesec_from || 0),
        godina_from: String(record.godina_from),
        mesec_to: String(record.mesec_to || 0),
        godina_to: String(record.godina_to || 0),
        now_to: record.now_to ? '1' : '0',
        type: String(record.type),
        name: record.name,
        institution: record.institution,
      });

      try {
        const response = await fetch(EPO_API_CONFIG.BASE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: payload.toString(),
        });

        const responseText = await response.text();
        console.log(`🟡 [Record ${i + 1}] Raw response:`, responseText);

        let data: EpoApiResponse;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error(`🟡 [Record ${i + 1}] JSON parse error:`, parseError);
          errorCount++;
          results.push({
            record: i + 1,
            success: false,
            error: 'Invalid JSON response from EPO API',
          });
          continue;
        }

        if ('Error' in data) {
          console.error(`🟡 [Record ${i + 1}] EPO API Error:`, data.Error);
          errorCount++;
          results.push({
            record: i + 1,
            success: false,
            error: data.Error,
          });
        } else {
          console.log(`🟡 [Record ${i + 1}] Success:`, data.Message);
          successCount++;
          results.push({
            record: i + 1,
            success: true,
            message: data.Message,
          });
        }
      } catch (fetchError) {
        console.error(`🟡 [Record ${i + 1}] Fetch error:`, fetchError);
        errorCount++;
        results.push({
          record: i + 1,
          success: false,
          error: fetchError instanceof Error ? fetchError.message : 'Unknown error',
        });
      }
    }

    console.log('🟡 [EPO Sync Qualifications] Complete!');
    console.log(`🟡 Success: ${successCount}, Errors: ${errorCount}`);

    return NextResponse.json({
      success: errorCount === 0,
      successCount,
      errorCount,
      totalRecords: records.length,
      results,
    });
  } catch (error) {
    console.error('🟡 [EPO Sync Qualifications] Fatal error:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync qualifications',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
