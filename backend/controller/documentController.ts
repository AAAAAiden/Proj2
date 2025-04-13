import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DocumentModel } from '../model/Document.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload single document
export const uploadDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const document = await DocumentModel.create({
      userId: req.body.userId,
      type: req.body.type,
      originalName: req.file.originalname,
      filePath: req.file.path,
    });

    res.status(201).json({ message: 'File uploaded successfully', document });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading file', error });
  }
};

// List documents for a user
export const listDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;
    const docs = await DocumentModel.find({ userId });

    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving documents', error });
  }
};

// Download a document
export const downloadDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const doc = await DocumentModel.findById(req.params.id);
    if (!doc) {
      res.status(404).json({ message: 'Document not found' });
      return;
    }

    res.download(path.resolve(doc.filePath), doc.originalName);
  } catch (error) {
    res.status(500).json({ message: 'Download error', error });
  }
};

// Preview a document in browser
export const previewDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const doc = await DocumentModel.findById(req.params.id);
    if (!doc) {
      res.status(404).json({ message: 'Document not found' });
      return;
    }

    res.sendFile(path.resolve(doc.filePath));
  } catch (error) {
    res.status(500).json({ message: 'Preview error', error });
  }
};
