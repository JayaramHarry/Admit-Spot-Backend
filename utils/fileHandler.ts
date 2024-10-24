// import multer from 'multer';
// import csvParser from 'csv-parser';
// import fs from 'fs';

// const upload = multer({ dest: 'uploads/' });

// export const parseCSV = (filePath: string) => {
//   const results: any[] = [];
//   return new Promise((resolve, reject) => {
//     fs.createReadStream(filePath)
//       .pipe(csvParser())
//       .on('data', (data) => results.push(data))
//       .on('end', () => resolve(results))
//       .on('error', (err) => reject(err));
//   });
// };

import fs from 'fs';
import path from 'path';

const fileHandler = {
  saveFile: (filePath: string, data: Buffer) => {
    fs.writeFileSync(path.resolve(filePath), data);
  },
  deleteFile: (filePath: string) => {
    fs.unlinkSync(path.resolve(filePath));
  },
};

export default fileHandler;
