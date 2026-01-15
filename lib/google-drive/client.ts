import { google } from 'googleapis';
import { getOAuth2Client, setCredentials } from './auth';

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webViewLink?: string;
  size?: string;
  modifiedTime?: string;
}

export class GoogleDriveClient {
  private drive: any;

  constructor(accessToken: string) {
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });
    this.drive = google.drive({ version: 'v3', auth: oauth2Client });
  }

  async listFolders(): Promise<GoogleDriveFile[]> {
    try {
      const response = await this.drive.files.list({
        q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
        fields: 'files(id, name, mimeType, thumbnailLink, webViewLink)',
        orderBy: 'name',
      });

      return response.data.files || [];
    } catch (error: any) {
      console.error('Error listing folders:', error);
      throw new Error(`Failed to list folders: ${error.message}`);
    }
  }

  async listFiles(folderId?: string): Promise<GoogleDriveFile[]> {
    try {
      const q = folderId
        ? `'${folderId}' in parents and trashed=false and (mimeType contains 'image/')`
        : "trashed=false and (mimeType contains 'image/')";

      const response = await this.drive.files.list({
        q,
        fields: 'files(id, name, mimeType, thumbnailLink, webViewLink, size, modifiedTime)',
        orderBy: 'name',
      });

      return response.data.files || [];
    } catch (error: any) {
      console.error('Error listing files:', error);
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  async downloadFile(fileId: string): Promise<Buffer> {
    try {
      const response = await this.drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'arraybuffer' }
      );
      return Buffer.from(response.data as ArrayBuffer);
    } catch (error: any) {
      console.error('Error downloading file:', error);
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  async uploadFile(
    file: Buffer,
    fileName: string,
    mimeType: string,
    folderId?: string
  ): Promise<GoogleDriveFile> {
    try {
      const fileMetadata: any = {
        name: fileName,
      };

      if (folderId) {
        fileMetadata.parents = [folderId];
      }

      const media = {
        mimeType,
        body: file,
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id, name, mimeType, thumbnailLink, webViewLink',
      });

      return response.data as GoogleDriveFile;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async createFolder(folderName: string, parentFolderId?: string): Promise<GoogleDriveFile> {
    try {
      const fileMetadata: any = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      };

      if (parentFolderId) {
        fileMetadata.parents = [parentFolderId];
      }

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        fields: 'id, name, mimeType, webViewLink',
      });

      return response.data as GoogleDriveFile;
    } catch (error: any) {
      console.error('Error creating folder:', error);
      throw new Error(`Failed to create folder: ${error.message}`);
    }
  }
}
