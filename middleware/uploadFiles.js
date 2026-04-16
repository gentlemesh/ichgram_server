import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const uploadSingleFile = fieldname => upload.single(fieldname);