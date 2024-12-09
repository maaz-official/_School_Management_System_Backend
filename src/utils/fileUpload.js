import fs from 'fs/promises';
import path from 'path';
import { AppError } from './appError.js';

const UPLOAD_DIR = 'uploads';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const uploadFile = async (file) => {
  try {
    if (file.size > MAX_FILE_SIZE) {
      throw new AppError('File size exceeds limit', 400);
    }

    const filename = `${Date.now()}-${file.originalname}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(filepath, await fs.readFile(file.path));
    await fs.unlink(file.path); // Clean up temp file

    return {
      filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: filepath
    };
  } catch (error) {
    throw new AppError('File upload failed', 500);
  }
};