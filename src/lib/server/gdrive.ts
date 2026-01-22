'use server';

import { google } from 'googleapis';
import { Readable } from 'stream';
import sharp from 'sharp';

// NOTE: Ensure environment variables (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN) 
// are available in the running environment (checked at startup by app.config.ts / dotenv).

// Image MIME types that can be compressed
const COMPRESSIBLE_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/bmp',
    'image/tiff',
];

/**
 * Compress an image using Sharp
 * Converts to WebP format with 80% quality and resizes to max 1920px width
 */
async function compressImage(
    buffer: Buffer,
    mimeType: string
): Promise<{ buffer: Uint8Array; mimeType: string }> {
    try {
        const image = sharp(buffer);
        const metadata = await image.metadata();

        // Resize if width is larger than 1920px, maintaining aspect ratio
        let processedImage = image;
        if (metadata.width && metadata.width > 1920) {
            processedImage = image.resize(1920, undefined, {
                withoutEnlargement: true,
                fit: 'inside',
            });
        }

        // Convert to WebP with 80% quality
        const compressedBuffer = await processedImage
            .webp({ quality: 80 })
            .toBuffer();

        return {
            buffer: compressedBuffer,
            mimeType: 'image/webp',
        };
    } catch (error) {
        console.warn('⚠️ Image compression failed, using original:', error);
        return {
            buffer,
            mimeType,
        };
    }
}

/**
 * Helper to get authenticated OAuth2 client
 */
export function getAuthClient() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
        throw new Error('Missing Google OAuth2 credentials');
    }

    const oAuth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        'https://developers.google.com/oauthplayground'
    );

    oAuth2Client.setCredentials({
        refresh_token: refreshToken
    });

    return oAuth2Client;
}

/**
 * Upload a file to Google Drive and return the public link
 */
export async function uploadToGoogleDrive(
    fileBuffer: ArrayBuffer,
    fileName: string,
    mimeType: string,
    folderId?: string
): Promise<{ success: boolean; link?: string; error?: string }> {
    console.log(`📤 Uploading file to Google Drive: ${fileName}`);

    try {
        // Validate environment variables - implicit in getAuthClient

        const auth = getAuthClient();
        const drive = google.drive({ version: 'v3', auth });

        let buffer = Buffer.from(fileBuffer);
        let finalMimeType = mimeType;
        let finalFileName = fileName;

        // Compress image if it's a compressible type
        if (COMPRESSIBLE_IMAGE_TYPES.includes(mimeType)) {
            console.log(`🖼️ Compressing image: ${fileName}`);
            const compressed = await compressImage(buffer, mimeType);
            buffer = Buffer.from(compressed.buffer);
            finalMimeType = compressed.mimeType;

            // Update filename extension to .webp
            const lastDotIndex = fileName.lastIndexOf('.');
            if (lastDotIndex > 0) {
                finalFileName = fileName.substring(0, lastDotIndex) + '.webp';
            } else {
                finalFileName = fileName + '.webp';
            }
        }

        const stream = Readable.from(buffer);

        const fileMetadata: { name: string; parents?: string[] } = {
            name: finalFileName,
        };

        if (folderId || process.env.GOOGLE_DRIVE_FOLDER_ID) {
            fileMetadata.parents = [folderId || process.env.GOOGLE_DRIVE_FOLDER_ID!];
        }

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: {
                mimeType: finalMimeType,
                body: stream,
            },
            fields: 'id, webViewLink, webContentLink',
            supportsAllDrives: true,
        });

        const fileId = response.data.id;
        console.log(`✅ File uploaded with ID: ${fileId}`);

        await drive.permissions.create({
            fileId: fileId!,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
            supportsAllDrives: true,
        });

        const fileData = await drive.files.get({
            fileId: fileId!,
            fields: 'webViewLink, webContentLink',
            supportsAllDrives: true,
        });

        const link = fileData.data.webViewLink || fileData.data.webContentLink ||
            `https://drive.google.com/file/d/${fileId}/view`;

        return { success: true, link };

    } catch (error) {
        console.error('❌ Error uploading to Google Drive:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to upload file to Google Drive'
        };
    }
}
