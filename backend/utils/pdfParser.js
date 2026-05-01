import fs from 'fs/promises';
import {PDFParse} from 'pdf-parse'

/*
* extract text from PDF 
* @param {string} filePath - Path to PDF file
* @returns {Promise<{text: String, numPages: number}>}
*/

export const extractTextFromPDF = async function (filePath) {
    try {
        const dataBuffer = await fs.readFile(filePath);
        // PDFParse except a unit8array, not a Buffer
        const parser = new PDFParse(new Uint8Array(dataBuffer));
        const data = await parser.getText();
        
        return {
            text: data.text,
            numPages: data.numPages,
            info: data.info
        }
        
    } catch (error) {
        console.error("PDF parsing error:", error);
        throw new Error("Failed to extract text from PDF");
    }
}