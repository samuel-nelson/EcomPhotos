import { NextRequest, NextResponse } from 'next/server';
import { getPhotoRoomClient } from '@/lib/photoroom/client';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image_file') as File | null;
    const imageUrl = formData.get('image_url') as string | null;
    const format = formData.get('format') as string | null;
    const crop = formData.get('crop') === 'true';
    const cropMargin = formData.get('crop_margin') ? Number(formData.get('crop_margin')) : undefined;
    const scale = formData.get('scale') as string | null;
    const position = formData.get('position') as string | null;

    if (!imageFile && !imageUrl) {
      return NextResponse.json(
        { error: 'Either image_file or image_url is required' },
        { status: 400 }
      );
    }

    const client = getPhotoRoomClient();
    const result = await client.removeBackground({
      image_file: imageFile || undefined,
      image_url: imageUrl || undefined,
      format: (format as 'png' | 'jpg') || 'png',
      crop,
      crop_margin: cropMargin,
      scale: scale || undefined,
      position: position || undefined,
    });

    console.log('PhotoRoom result:', {
      hasResultUrl: !!result.result_url,
      hasResultB64: !!result.result_b64,
      hasJobId: !!result.job_id,
      status: result.status,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('PhotoRoom background removal error:', {
      message: error.message,
      status: error.status,
      error: error,
    });
    return NextResponse.json(
      { 
        error: error.message || 'Failed to remove background',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: error.status || 500 }
    );
  }
}
