// Método da AWS desativado por conta do Download Direto Deixei aqui caso seja importante no futuro
// Helpers/FileDownloader.js

const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const axios = require('axios');

class FileDownloader {
  constructor(downloadDir) {
    this.downloadsDir = downloadDir;
  }

  async downloadCustomerFile(customerFiles) {
    if (!customerFiles || customerFiles.length === 0) {
      console.log('No customer files found to download.');
      return;
    }

    const fileToDownload = customerFiles[0]; // Assuming we want to download the first file
    const fileUrl = fileToDownload.url;
    const fileDescription = fileToDownload.file_description;

    try {
      await fsp.mkdir(this.downloadsDir, { recursive: true });
      const response = await axios({
        method: 'GET',
        url: fileUrl,
        responseType: 'stream'
      });

      const fileName = `${fileDescription}_${Date.now()}.docx`; // Adjust the file extension if needed
      const filePath = path.join(this.downloadsDir, fileName);

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      console.log(`File downloaded successfully: ${filePath}`);
      return filePath;
    } catch (error) {
      console.error('Error downloading file:', error.message);
      return null;
    }
  }
}


module.exports = FileDownloader;