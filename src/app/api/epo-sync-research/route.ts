import { NextRequest, NextResponse } from 'next/server';
import { EPO_API_CONFIG, type EpoApiResponse } from '@/lib/api/epo-api-types';

export async function POST(request: NextRequest) {
  try {
    const { epoPortfolioId, epoUserId, research } = await request.json();

    console.log('🔬 API: Starting research sync...');
    console.log('🔬 API: Portfolio ID:', epoPortfolioId);
    console.log('🔬 API: User ID:', epoUserId);
    console.log('🔬 API: Research data:', research);

    // Validate required fields
    if (!epoPortfolioId || !epoUserId) {
      return NextResponse.json(
        { success: false, error: 'Липсва Portfolio ID или User ID' },
        { status: 400 }
      );
    }

    if (!research || !Array.isArray(research)) {
      return NextResponse.json(
        { success: false, error: 'Невалидни данни за научно-изследователска дейност' },
        { status: 400 }
      );
    }

    // Build the payload
    const formData = new URLSearchParams();
    formData.append('portfolio', epoPortfolioId.toString());
    formData.append('users', epoUserId.toString());
    formData.append('cmd', 'research');

    // Add research data
    const dataArray: Array<{
      mesec_from: number;
      godina_from: number;
      mesec_to: number;
      godina_to: number;
      now_to: number;
      name: string;
      position: string;
      organization: string;
      content?: string;
    }> = research.map((item: Record<string, unknown>) => ({
      mesec_from: item.mesec_from ? Number(item.mesec_from) : 0,
      godina_from: item.godina_from ? Number(item.godina_from) : 0,
      mesec_to: item.mesec_to ? Number(item.mesec_to) : 0,
      godina_to: item.godina_to ? Number(item.godina_to) : 0,
      now_to: item.now_to ? Number(item.now_to) : 0,
      name: String(item.name || ''),
      position: String(item.position || ''),
      organization: String(item.organization || ''),
      content: item.content ? String(item.content) : undefined,
    }));

    formData.append('data', JSON.stringify(dataArray));

    console.log('🔬 API: Sending payload to EPO:', {
      portfolio: epoPortfolioId,
      users: epoUserId,
      cmd: 'research',
      dataCount: dataArray.length,
    });

    // Send to EPO API
    const response = await fetch(EPO_API_CONFIG.BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${EPO_API_CONFIG.TOKEN}`,
      },
      body: formData.toString(),
    });

    console.log('🔬 API: EPO response status:', response.status);

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `HTTP error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json() as EpoApiResponse;
    console.log('🔬 API: EPO response data:', data);

    if ('Message' in data) {
      return NextResponse.json({
        success: true,
        message: data.Message,
      });
    } else if ('Error' in data) {
      return NextResponse.json({
        success: false,
        error: data.Error,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Невалиден формат на отговора',
      });
    }
  } catch (error) {
    console.error('🔬 API: Research sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестна грешка',
      },
      { status: 500 }
    );
  }
}
