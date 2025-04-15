import { Request, Response } from 'express';
import Employee from '../model/Employee.js';
import { DocumentModel } from '../model/Document.js';

// GET employee profile
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const employee = await Employee.findById(req.params.id).select('-__v');
    if (!employee) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving profile', error });
  }
};

// PUT update profile section
export const updateProfileSection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { section, data } = req.body;

    const updateFields: Record<string, any> = {};
    updateFields[section] = data;

    const updated = await Employee.findByIdAndUpdate(req.params.id, { $set: updateFields }, { new: true });

    if (!updated) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }

    res.json({ message: `${section} updated`, employee: updated });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error });
  }
};

// POST add emergency contact
export const addEmergencyContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }

    employee.emergencyContacts.push(req.body);
    await employee.save();

    res.status(201).json({ message: 'Emergency contact added', contacts: employee.emergencyContacts });
  } catch (error) {
    res.status(500).json({ message: 'Error adding contact', error });
  }
};

// GET uploaded documents summary
export const getDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const documents = await DocumentModel.find({ userId: req.params.id });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching documents', error });
  }
};
