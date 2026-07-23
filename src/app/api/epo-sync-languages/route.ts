/**
 * EPO API Sync Route: Languages
 * Endpoint: /api/epo-sync-languages
 * Syncs foreign language skills data to EPO API
 */

import { NextRequest, NextResponse } from 'next/server';

interface LanguageRecord {
  language: number;
  level: number;
}

interface RequestBody {
  epoPortfolioId: string;
  epoUserId: string;
  records: LanguageRecord[];
}

interface EpoApiSuccessResponse {
  Message: string;
}

interface EpoApiErrorResponse {
  Error: string;
}

type EpoApiResponse = EpoApiSuccessResponse | EpoApiErrorResponse;

const EPO_API_CONFIG = {
  baseUrl: 'https://epo.bg/api2/',
  token: process.env.EPO_API_TOKEN || '',
};

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { epoPortfolioId, epoUserId, records } = body;

    console.log('🌐 [EPO Sync Languages] Starting sync...');
    console.log('🌐 Portfolio ID:', epoPortfolioId);
    console.log('🌐 User ID:', epoUserId);
    console.log('🌐 Records count:', records.length);

    if (!epoPortfolioId || !epoUserId) {
      return NextResponse.json(
        { error: 'Missing EPO Portfolio ID or User ID' },
        { status: 400 }
      );
    }

    if (!records || records.length === 0) {
      return NextResponse.json(
        { error: 'No languages to sync' },
        { status: 400 }
      );
    }

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Process each record
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      console.log(`🌐 [Record ${i + 1}/${records.length}]`, {
        language: record.language,
        level: record.level,
      });

      // Build payload
      const payload = new URLSearchParams({
        portfolio: epoPortfolioId,
        users: epoUserId,
        cmd: 'languages',
        token: EPO_API_CONFIG.token,
        language: String(record.language),
        level: String(record.level),
      });

      try {
        const response = await fetch(EPO_API_CONFIG.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: payload.toString(),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: EpoApiResponse = await response.json();

        // Check for EPO API error
        if ('Error' in data) {
          console.error(`🌐 ❌ EPO API Error for record ${i + 1}:`, data.Error);
          errorCount++;
          results.push({
            index: i,
            success: false,
            error: data.Error,
            record,
          });
        } else {
          console.log(`🌐 ✅ Success for record ${i + 1}:`, data.Message);
          successCount++;
          results.push({
            index: i,
            success: true,
            message: data.Message,
            record,
          });
        }
      } catch (error) {
        console.error(`🌐 ❌ Request failed for record ${i + 1}:`, error);
        errorCount++;
        results.push({
          index: i,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          record,
        });
      }
    }

    console.log('🌐 [EPO Sync Languages] Complete!');
    console.log(`🌐 Success: ${successCount}, Errors: ${errorCount}`);

    return NextResponse.json({
      success: errorCount === 0,
      successCount,
      errorCount,
      results,
    });
  } catch (error) {
    console.error('🌐 [EPO Sync Languages] Fatal error:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync languages',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
