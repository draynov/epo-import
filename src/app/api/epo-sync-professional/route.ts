/**
 * EPO API Professional Qualifications Sync Route Handler
 * Syncs professional qualifications records to EPO API
 */

import { NextRequest, NextResponse } from 'next/server';
import { EPO_API_CONFIG, EpoApiResponse } from '@/lib/api/epo-api-types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { epoPortfolioId, epoUserId, professional } = body;

    console.log('🟠 SERVER: Received professional qualifications sync request');
    console.log('🟠 SERVER: epoPortfolioId:', epoPortfolioId);
    console.log('🟠 SERVER: epoUserId:', epoUserId);
    console.log('🟠 SERVER: professional count:', professional?.length);

    // Validate input
    if (!epoPortfolioId || !epoUserId) {
      return NextResponse.json(
        { error: 'Missing required fields: epoPortfolioId, epoUserId' },
        { status: 400 }
      );
    }

    if (!Array.isArray(professional) || professional.length === 0) {
      return NextResponse.json(
        { error: 'No professional qualifications data provided' },
        { status: 400 }
      );
    }

    // Send each professional qualification record to EPO API
    const results: Array<{ success: boolean; message?: string; error?: string }> = [];

    for (const record of professional) {
      try {
        console.log('🟠 SERVER: Sending professional qualification record:', record);

        // Build EPO API payload
        const payload: Record<string, string | number> = {
          token: EPO_API_CONFIG.TOKEN,
          portfolio: epoPortfolioId,
          users: epoUserId,
          cmd: 'professional',
          mesec_from: Number(record.mesec_from) || 0,
          godina_from: Number(record.godina_from),
          mesec_to: Number(record.mesec_to) || 0,
          godina_to: Number(record.godina_to) || 0,
          now_to: record.now_to ? 1 : 0,
          name: String(record.name || ''),
          specialty: String(record.specialty || ''),
          pks: Number(record.pks) || 0,
          hours: String(record.hours || ''),
          institution: String(record.institution || ''),
        };

        console.log('🟠 SERVER: Payload:', payload);

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

        console.log('🟠 SERVER: Professional qualification response:', data);

        if (data.Error) {
          results.push({ success: false, error: data.Error });
        } else {
          results.push({ success: true, message: data.Message });
        }
      } catch (error) {
        console.error('🟠 SERVER: Error sending professional qualification record:', error);
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Check if all succeeded
    const allSucceeded = results.every((r) => r.success);
    const successCount = results.filter((r) => r.success).length;

    if (allSucceeded) {
      return NextResponse.json({
        success: true,
        message: `Синхронизирани ${successCount} професионални квалификации`,
      });
    } else {
      const errorMessages = results
        .filter((r) => !r.success)
        .map((r) => r.error)
        .join(', ');
      return NextResponse.json({
        success: false,
        error: `Успешни: ${successCount}, Грешки: ${results.length - successCount}. ${errorMessages}`,
      });
    }
  } catch (error) {
    console.error('🟠 SERVER: Professional qualifications sync error:', error);
    return NextResponse.json(
      { error: 'Грешка при синхронизация на професионални квалификации' },
      { status: 500 }
    );
  }
}
