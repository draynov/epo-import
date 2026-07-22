/**
 * EPO API Route: Sync Specialties
 * POST /api/epo-sync-specialties
 * 
 * Sends specialty data to EPO API with cmd='specialty'
 */

import { NextRequest, NextResponse } from 'next/server';
import { EPO_API_CONFIG } from '@/lib/api/epo-api-types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      epoPortfolioId,
      epoUserId,
      specialty,
      teacher,
      specialty2,
      teacher2,
      specialty3,
      teacher3,
      specialty4,
      teacher4,
      specialty5,
      teacher5,
    } = body;

    // Validate required fields
    if (!epoPortfolioId || !epoUserId) {
      return NextResponse.json(
        { error: 'Липсват EPO Portfolio ID или User ID' },
        { status: 400 }
      );
    }

    // Build payload with all specialty fields
    const payload = new URLSearchParams({
      portfolio: epoPortfolioId.toString(),
      users: epoUserId.toString(),
      cmd: 'specialty',
    });

    // Add specialty fields if they exist
    if (specialty) payload.append('specialty', specialty);
    if (teacher !== undefined && teacher !== null && teacher !== '') {
      payload.append('teacher', teacher.toString());
    }
    
    if (specialty2) payload.append('specialty2', specialty2);
    if (teacher2 !== undefined && teacher2 !== null && teacher2 !== '') {
      payload.append('teacher2', teacher2.toString());
    }
    
    if (specialty3) payload.append('specialty3', specialty3);
    if (teacher3 !== undefined && teacher3 !== null && teacher3 !== '') {
      payload.append('teacher3', teacher3.toString());
    }
    
    if (specialty4) payload.append('specialty4', specialty4);
    if (teacher4 !== undefined && teacher4 !== null && teacher4 !== '') {
      payload.append('teacher4', teacher4.toString());
    }
    
    if (specialty5) payload.append('specialty5', specialty5);
    if (teacher5 !== undefined && teacher5 !== null && teacher5 !== '') {
      payload.append('teacher5', teacher5.toString());
    }

    console.log('🟣 Specialties sync payload:', Object.fromEntries(payload.entries()));

    // Send to EPO API
    const response = await fetch(EPO_API_CONFIG.BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${EPO_API_CONFIG.TOKEN}`,
      },
      body: payload.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('EPO API error:', data);
      return NextResponse.json(
        { error: data.Error || 'EPO API грешка' },
        { status: response.status }
      );
    }

    if (data.Error) {
      console.error('EPO API returned error:', data.Error);
      return NextResponse.json(
        { error: data.Error },
        { status: 400 }
      );
    }

    console.log('🟣 Specialties sync success:', data.Message);
    return NextResponse.json({ success: true, message: data.Message });

  } catch (error) {
    console.error('Specialties sync error:', error);
    return NextResponse.json(
      { error: 'Грешка при синхронизация на специалности' },
      { status: 500 }
    );
  }
}
