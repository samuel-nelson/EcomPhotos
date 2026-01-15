import { NextRequest, NextResponse } from 'next/server';
import { GoogleDriveClient } from '@/lib/google-drive/client';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const accessToken = formData.get('access_token') as string;
    const file = formData.get('file') as File;
    const fileName = formData.get('file_name') as string;
    const folderId = formData.get('folder_id') as string | null;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 401 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const client = new GoogleDriveClient(accessToken);
    const uploadedFile = await client.uploadFile(
      buffer,
      fileName || file.name,
      file.type,
      folderId || undefined
    );

    return NextResponse.json({ file: uploadedFile });
  } catch (error: any) {
    console.error('Google Drive upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}
