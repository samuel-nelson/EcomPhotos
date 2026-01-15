import { NextRequest, NextResponse } from 'next/server';
import { GoogleDriveClient } from '@/lib/google-drive/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accessToken = searchParams.get('access_token');

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 401 }
      );
    }

    const client = new GoogleDriveClient(accessToken);
    const folders = await client.listFolders();

    return NextResponse.json({ folders });
  } catch (error: any) {
    console.error('Google Drive folders error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list folders' },
      { status: 500 }
    );
  }
}
