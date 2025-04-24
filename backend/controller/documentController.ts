import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { DocumentModel } from '../model/Document.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.resolve(__dirname, '..', 'uploads', 'documents');

// ─────────────────────────────────────────────
// POST /api/documents/upload
export const uploadDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file || !req.body.userId || !req.body.type) {
      res.status(400).json({ message: 'Missing file or metadata' });
      return;
    }

    const saved = await DocumentModel.create({
      userId: req.body.userId,
      type: req.body.type,
      originalName: req.file.originalname,
      filePath: req.file.filename,
    });
    console.log("Saved document:", saved);

    res.status(201).json({
      message: 'File uploaded successfully',
      document: {
        id: saved._id,
        name: saved.originalName,
        url: `http://localhost:5001/api/documents/preview/${saved._id}`,
        type: saved.type,
      },
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Failed to upload document' });
  }
};

// ─────────────────────────────────────────────
// GET /api/documents/list/:userId
export const listDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;
    const docs = await DocumentModel.find({ userId });

    const enriched = docs.map(doc => ({
      id: doc._id,
      name: doc.originalName,
      url: `/api/documents/preview/${doc._id}`,
    }));

    res.json(enriched);
  } catch (err) {
    console.error('List error:', err);
    res.status(500).json({ message: 'Failed to list documents' });
  }
};

// ─────────────────────────────────────────────
// GET /api/documents/preview/:id
export const previewDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const doc = await DocumentModel.findById(req.params.id);
    if (!doc) {
      res.status(404).json({ message: 'Document not found' });
      return;
    }

    const fullPath = path.join(UPLOAD_DIR, doc.filePath);
    res.sendFile(fullPath);
  } catch (err) {
    console.error('Preview error:', err);
    res.status(500).json({ message: 'Failed to preview document' });
  }
};

// ─────────────────────────────────────────────
// GET /api/documents/download/:id
export const downloadDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const doc = await DocumentModel.findById(req.params.id);
    if (!doc) {
      res.status(404).json({ message: 'Document not found' });
      return;
    }

    const fullPath = path.join(UPLOAD_DIR, doc.filePath);
    res.download(fullPath, doc.originalName);
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ message: 'Failed to download document' });
  }
};

// DELETE /api/documents/:id
export const deleteDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const doc = await DocumentModel.findById(id);
    if (!doc) {
      res.status(404).json({ message: 'Document not found' });
      return;
    }

    // Delete the file from disk
    const filePath = path.join(UPLOAD_DIR, doc.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from DB
    await DocumentModel.findByIdAndDelete(id);
    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Failed to delete document' });
  }
};