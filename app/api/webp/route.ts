import { NextResponse } from 'next/server';
import { mkdir, rm } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';
import AdmZip from 'adm-zip';
import { existsSync } from 'fs';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Create temporary directories
    const tempDir = join(process.cwd(), 'temp');
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

          // Convert to WebP using sharp
          await sharp(imagePath)
            .webp({ quality: 85 })
            .toFile(webpPath);

          // Add converted file to new zip
          outputZip.addLocalFile(webpPath);
        }
      }
    }

    // Generate output zip buffer
    const outputZipBuffer = outputZip.toBuffer();

    // Cleanup temp directories
    if (existsSync(tempDir)) {
      await rm(tempDir, { recursive: true });
    }

    // Return the converted zip file
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
  }
}