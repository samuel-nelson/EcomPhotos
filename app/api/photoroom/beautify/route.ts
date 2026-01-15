import { NextRequest, NextResponse } from 'next/server';
import { getPhotoRoomClient } from '@/lib/photoroom/client';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image_file') as File | null;
    const imageUrl = formData.get('image_url') as string | null;
    const format = formData.get('format') as string | null;

    if (!imageFile && !imageUrl) {
      return NextResponse.json(
        { error: 'Either image_file or image_url is required' },
        { status: 400 }
      );
    }

    const client = getPhotoRoomClient();
    const result = await client.beautifyProduct({
      image_file: imageFile || undefined,
      image_url: imageUrl || undefined,
      format: (format as 'png' | 'jpg') || 'png',
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('PhotoRoom Product Beautifier error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to beautify product' },
      { status: error.status || 500 }
    );
  }
}
