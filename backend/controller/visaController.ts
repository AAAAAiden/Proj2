import { Request, Response } from 'express';
import VisaStatus from '../model/Visa.js';

// GET visa status for a user
export const getVisaStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const visa = await VisaStatus.findOne({ userId: req.params.userId });

    if (!visa) {
      res.status(404).json({ message: 'No visa record found' });
      return;
    }

    res.json(visa);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching visa status', error });
  }
};

// POST submit OPT Receipt (employee)
export const uploadOPTReceipt = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.body;
  const filePath = req.file?.path;

  if (!filePath) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }

  try {
    const existing = await VisaStatus.findOne({ userId });

    if (existing) {
      existing.optReceipt = { path: filePath, status: 'Pending', feedback: '' };
      await existing.save();
    } else {
      await VisaStatus.create({
        userId,
        optReceipt: { path: filePath, status: 'Pending', feedback: '' },
      });
    }

    res.status(201).json({ message: 'OPT Receipt submitted' });
  } catch (error) {
    res.status(500).json({ message: 'Submission failed', error });
  }
};

// POST upload OPT EAD (employee)
export const uploadOPTEAD = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.body;
  const filePath = req.file?.path;

  if (!filePath) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }

  try {
    const visa = await VisaStatus.findOne({ userId });
    if (!visa || visa.optReceipt?.status !== 'Approved') {
      res.status(400).json({ message: 'OPT Receipt not yet approved' });
      return;
    }

    visa.optEAD = { path: filePath, status: 'Pending', feedback: '' };
    await visa.save();

    res.status(201).json({ message: 'OPT EAD submitted' });
  } catch (error) {
    res.status(500).json({ message: 'Submission failed', error });
  }
};

// POST upload I-983 (employee)
export const uploadI983 = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.body;
  const filePath = req.file?.path;

  if (!filePath) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }

  try {
    const visa = await VisaStatus.findOne({ userId });
    if (!visa || visa.optEAD?.status !== 'Approved') {
      res.status(400).json({ message: 'OPT EAD not yet approved' });
      return;
    }

    visa.i983 = { path: filePath, status: 'Pending', feedback: '' };
    await visa.save();

    res.status(201).json({ message: 'I-983 submitted' });
  } catch (error) {
    res.status(500).json({ message: 'Submission failed', error });
  }
};

// POST upload I-20 (employee)
export const uploadI20 = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.body;
  const filePath = req.file?.path;

  if (!filePath) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }

  try {
    const visa = await VisaStatus.findOne({ userId });
    if (!visa || visa.i983?.status !== 'Approved') {
      res.status(400).json({ message: 'I-983 not yet approved' });
      return;
    }

    visa.i20 = { path: filePath, status: 'Pending', feedback: '' };
    await visa.save();

    res.status(201).json({ message: 'I-20 submitted' });
  } catch (error) {
    res.status(500).json({ message: 'Submission failed', error });
  }
};

// PUT HR approve/reject a document
export const reviewDocument = async (req: Request, res: Response): Promise<void> => {
  const { userId, docType, action, feedback } = req.body;

  try {
    const visa = await VisaStatus.findOne({ userId });

    if (!visa || !['optReceipt', 'optEAD', 'i983', 'i20'].includes(docType)) {
      res.status(404).json({ message: 'Document or visa record not found' });
      return;
    }

    const doc = visa[docType as 'optReceipt' | 'optEAD' | 'i983' | 'i20'];

    if (!doc) {
      res.status(404).json({ message: 'No file uploaded for this document' });
      return;
    }

    doc.status = action === 'approve' ? 'Approved' : 'Rejected';
    doc.feedback = action === 'approve' ? '' : feedback || 'No reason provided';

    await visa.save();

    res.json({ message: `${docType} ${action}d successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Review failed', error });
  }
};
