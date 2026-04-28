// ═══════════════════════════════════════════════════════
// File Parser Utility - Extract text from PDF, DOCX, TXT
// ═══════════════════════════════════════════════════════
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extract text content from uploaded files
 * @param {string} filePath - Path to the uploaded file
 * @returns {string} - Extracted text content
 */
const extractTextFromFile = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const absolutePath = path.resolve(filePath);

  try {
    switch (ext) {
      case '.pdf': {
        try {
          const dataBuffer = fs.readFileSync(absolutePath);
          const pdfData = await pdfParse(dataBuffer);
          return pdfData.text;
        } catch (err) {
          // Return a special string to indicate parsing failure
          return '__PDF_PARSE_ERROR__';
        }
      }

      case '.docx': {
        const result = await mammoth.extractRawText({ path: absolutePath });
        return result.value;
      }

      case '.doc': {
        // .doc files handled similarly - mammoth has limited support
        const result = await mammoth.extractRawText({ path: absolutePath });
        return result.value;
      }

      case '.txt': {
        return fs.readFileSync(absolutePath, 'utf-8');
      }

      default:
        throw new Error(`Unsupported file type: ${ext}`);
    }
  } catch (error) {
    console.error('File parsing error:', error.message);
    // Return a special string to indicate parsing failure
    return '__FILE_PARSE_ERROR__';
  }
};

module.exports = { extractTextFromFile };