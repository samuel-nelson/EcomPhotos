import { NextRequest, NextResponse } from 'next/server';
import { GoogleDriveClient } from '@/lib/google-drive/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accessToken = searchParams.get('access_token');
    const folderId = searchParams.get('folder_id');

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 401 }
      );
    }

    const client = new GoogleDriveClient(accessToken);
    const files = await client.listFiles(folderId || undefined);

    return NextResponse.json({ files });
  } catch (error: any) {
    console.error('Google Drive files error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list files' },
      { status: 500 }
    );
  }
}
