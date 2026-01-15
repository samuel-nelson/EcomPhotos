import { NextRequest, NextResponse } from 'next/server';
import { getPhotoRoomClient } from '@/lib/photoroom/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;
    const client = getPhotoRoomClient();
    const result = await client.checkJobStatus(jobId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('PhotoRoom job status error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check job status' },
      { status: error.status || 500 }
    );
  }
}
