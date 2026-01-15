import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromCode } from '@/lib/google-drive/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/?error=missing_code', request.url)
      );
    }

    const tokens = await getTokensFromCode(code);
    
    // In a production app, you'd store these tokens securely (e.g., in a database)
    // For now, we'll return them to the client to store in session/localStorage
    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('access_token', tokens.access_token || '');
    redirectUrl.searchParams.set('refresh_token', tokens.refresh_token || '');

    return NextResponse.redirect(redirectUrl);
  } catch (error: any) {
    console.error('Google Drive callback error:', error);
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(error.message)}`, request.url)
    );
  }
}
