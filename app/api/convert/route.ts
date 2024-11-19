import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { Document, Packer, Paragraph, ImageRun } from 'docx';
import libre from 'libreoffice-convert';
import { promisify } from 'util';

const libreConvert = promisify(libre.convert);

export async function POST(req: Request) {
  try {
    const { imageSrc, selectedFormat } = await req.json();

    const base64Image = imageSrc.split(';base64,').pop();
    const imageBuffer = Buffer.from(base64Image!, 'base64');

    const pngBuffer = await sharp(imageBuffer).png().toBuffer();

    let finalBuffer: Buffer;
    let mimeType: string;

    if (selectedFormat.toLowerCase() === 'docx') {
      finalBuffer = await createDocx(pngBuffer);
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (selectedFormat.toLowerCase() === 'doc') {
      const docxBuffer = await createDocx(pngBuffer);
      try {
        finalBuffer = await libreConvert(docxBuffer, `.${selectedFormat}`, undefined);
        mimeType = 'application/msword';
      } catch (error) {
        console.error("LibreOffice conversion failed:", error);
        return NextResponse.json({ error: 'Document conversion error' }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
    }

    const base64Result = finalBuffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Result}`;

    return NextResponse.json({ convertedImage: dataUrl });

  } catch (error) {
    console.error("Conversion error:", error);
    return NextResponse.json({ error: 'Conversion failed' }, { status: 500 });
  }
}

async function createDocx(imageBuffer: Buffer): Promise<Buffer> {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [
            new ImageRun({
              data: imageBuffer,
              transformation: { width: 600, height: 400 },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any),
          ],
        }),
      ],
    }],
  });

  return await Packer.toBuffer(doc);
}
