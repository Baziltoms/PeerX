import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .slice(0, 30);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExts = /jpeg|jpg|png|webp|pdf|doc|docx|ppt|pptx|zip|txt|mp4|webm|mov|mkv|ogg|avi|m4v/;
  const extname = allowedExts.test(path.extname(file.originalname).toLowerCase());
  if (extname) {
    return cb(null, true);
  }
  cb(new Error('Invalid file format. Allowed formats: PDF, PPT, PPTX, DOC, DOCX, ZIP, Images, MP4, WebM, MOV, MKV, OGG videos.'));
};

export const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max for videos & documents
  fileFilter,
});
