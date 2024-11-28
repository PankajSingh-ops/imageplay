import { NextResponse } from 'next/server';
import { mkdir, rm } from 'fs/promises';
import { join } from 'path';
import os from 'os';
import sharp from 'sharp';
import AdmZip from 'adm-zip';
import { existsSync } from 'fs';

export async function POST(req: Request) {
  const tempDir = join(os.tmpdir(), 'webp-converter-' + Date.now());
  
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const extractDir = join(tempDir, 'extracted');
    const webpDir = join(tempDir, 'webp');

    // Ensure temp directories exist
    await mkdir(tempDir, { recursive: true });
    await mkdir(extractDir, { recursive: true });
    await mkdir(webpDir, { recursive: true });

    // Save uploaded zip
    const zipBuffer = Buffer.from(await file.arrayBuffer());
    const inputZip = new AdmZip(zipBuffer);

    // Extract all entries
    inputZip.extractAllTo(extractDir, true);

    // Convert images to WebP
    const entries = inputZip.getEntries();
    const outputZip = new AdmZip();

    for (const entry of entries) {
      if (!entry.isDirectory) {
        const ext = entry.entryName.toLowerCase();
        if (ext.endsWith('.jpg') || ext.endsWith('.jpeg') || ext.endsWith('.png')) {
          const imagePath = join(extractDir, entry.entryName);
          const webpPath = join(
            webpDir, 
            entry.entryName.replace(/\.(jpg|jpeg|png)$/i, '.webp')
          );

          // Ensure the directory exists for the webp file
          const webpFileDir = join(webpDir, entry.entryName.split('/').slice(0, -1).join('/'));
          await mkdir(webpFileDir, { recursive: true });

          // Convert to WebP using sharp
          await sharp(imagePath)
            .webp({ quality: 85 })
            .toFile(webpPath);

          // Add converted file to new zip, preserving original directory structure
          outputZip.addLocalFile(webpPath, entry.entryName.split('/').slice(0, -1).join('/'));
        }
      }
    }

    // Generate output zip buffer
    const outputZipBuffer = outputZip.toBuffer();

    return new NextResponse(outputZipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename=converted_images.zip'
      }
    });
  } catch (error) {
    console.error('Conversion error:', error);
    return NextResponse.json(
      { error: 'Error processing images' },
      { status: 500 }
    );
  } finally {
    // Ensure cleanup happens even if there's an error
    if (existsSync(tempDir)) {
      await rm(tempDir, { recursive: true }).catch(console.error);
    }
  }
}