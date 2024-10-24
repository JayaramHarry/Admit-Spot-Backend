import multer from 'multer';
import csvParser from 'csv-parser';
import fs from 'fs';

const upload = multer({ dest: 'uploads/' });

export const parseCSV = (filePath: string) => {
  const results: any[] = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
};
