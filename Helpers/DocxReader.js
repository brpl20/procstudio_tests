// Helpers/DocxReader.js
const fs = require('fs');
const mammoth = require('mammoth');

class DocxReader {
  async readDocxFile(filePath) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      console.log('Extracted text:', result.value);
      return result.value;
    } catch (error) {
      console.error('Error reading .docx file:', error);
      return null;
    }
  }
}

module.exports = DocxReader;