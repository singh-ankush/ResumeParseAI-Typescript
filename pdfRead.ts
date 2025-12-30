import fs from 'fs'; 
import { pdfToText } from 'pdf-ts';

export async function extractTextFromFile(filePath: string): Promise<string> {
    const pdfData = await fs.promises.readFile(filePath);
    return extractTextFromBuffer(pdfData);
}

export function extractTextFromBuffer(pdfData: Buffer): Promise<string> {
    try {
        const text = pdfToText(pdfData); 
        return text;
    } catch (err: any) {
        throw new Error(`Failed to extract text: ${err?.message ?? err}`);
    }
}