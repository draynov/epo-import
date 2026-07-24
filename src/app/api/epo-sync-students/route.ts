import { NextRequest, NextResponse } from 'next/server';

const EPO_API_CONFIG = {
  baseUrl: process.env.EPO_API_URL || 'https://portfolio.uchilishta.bg',
  syncEndpoint: '/api/sync',
};

interface EpoApiResponse {
  success?: boolean;
  message?: string;
  error?: string;
  results?: Array<{
    success: boolean;
    message?: string;
    error?: string;
  }>;
}

interface StudentRecord {
  id?: string;
  name: string;
  content?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, portfolio, users, students } = body;

    // Validate required fields
    if (!token || !portfolio || !users) {
      return NextResponse.json(
        { error: 'Липсват задължителни полета: token, portfolio, users' },
        { status: 400 }
      );
    }

    if (!students || !Array.isArray(students)) {
      return NextResponse.json(
        { error: 'Липсва масив с постижения на ученици' },
        { status: 400 }
      );
    }

    if (students.length === 0) {
      return NextResponse.json(
        { error: 'Няма постижения на ученици за синхронизация' },
        { status: 400 }
      );
    }

    console.log(`[EPO Sync Students] Syncing ${students.length} student achievement(s)`);

    // Process all records and collect results
    const results: Array<{ success: boolean; message?: string; error?: string }> = [];

    for (const record of students) {
      try {
        // Validate record fields
        if (!record.name || typeof record.name !== 'string') {
          results.push({
            success: false,
            error: `Невалидно име на постижение`,
          });
          continue;
        }

        // Build payload for EPO API
        const payload = {
          token,
          portfolio,
          users,
          cmd: 'students',
          name: String(record.name),
          content: record.content ? String(record.content) : '',
        };

        console.log('[EPO Sync Students] Sending payload:', payload);

        // Call EPO API
        const response = await fetch(`${EPO_API_CONFIG.baseUrl}${EPO_API_CONFIG.syncEndpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams(payload as Record<string, string>),
        });

        const responseText = await response.text();
        console.log('[EPO Sync Students] Response:', responseText);

        let result: EpoApiResponse;
        try {
          result = JSON.parse(responseText);
        } catch {
          result = { success: false, error: 'Невалиден JSON отговор от API' };
        }

        if (result.success) {
          results.push({
            success: true,
            message: `"${record.name}" - синхронизирано успешно`,
          });
        } else {
          results.push({
            success: false,
            error: `"${record.name}" - ${result.error || result.message || 'неизвестна грешка'}`,
          });
        }
      } catch (error) {
        console.error('[EPO Sync Students] Error processing record:', error);
        results.push({
          success: false,
          error: `"${record.name}" - ${error instanceof Error ? error.message : 'неизвестна грешка'}`,
        });
      }
    }

    // Count successes and failures
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`[EPO Sync Students] Completed: ${successCount} успешни, ${failureCount} грешки`);

    return NextResponse.json({
      success: failureCount === 0,
      message: `Синхронизирани ${successCount} от ${students.length} постижения на ученици`,
      results,
      summary: {
        total: students.length,
        success: successCount,
        failed: failureCount,
      },
    });
  } catch (error) {
    console.error('[EPO Sync Students] Error:', error);
    return NextResponse.json(
      {
        error: 'Грешка при синхронизация на постижения на ученици',
        details: error instanceof Error ? error.message : 'Неизвестна грешка',
      },
      { status: 500 }
    );
  }
}
