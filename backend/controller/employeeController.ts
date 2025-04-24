import { Request, Response } from 'express';
import Employee from '../model/Employee.js';
import { DocumentModel } from '../model/Document.js';

// GET employee profile
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }
    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ message: 'Failed to fetch employee', error });
  }
};

export const getAllEmployees = async (req: Request, res: Response): Promise<void> => {
  try {
    const employees = await Employee.find({}, {
      _id: 1,
      'name.firstName': 1,
      'name.lastName': 1,
      'name.preferredName': 1,
      'name.email': 1,
      ssn: 1,
      'contactInfo.cellPhone': 1,
      'contactInfo.workPhone': 1,
      'workAuth.visaType': 1,
    });

    const mapped = employees.map(emp => ({
      _id: emp._id,
      name: {
        firstName: emp.name.firstName,
        lastName: emp.name.lastName,
        preferredName: emp.name.preferredName,
      },
      contact: {
        cell: emp.contactInfo?.cellPhone || '',
        work: emp.contactInfo?.workPhone || '',
      },
      employment: {
        visaType: emp.workAuth?.visaType || '',
      },
      email: emp.name.email || '',
      ssn: emp.ssn || '',
    }));

    res.json(mapped);
  } catch (error) {
    console.error('Error fetching employee list:', error);
    res.status(500).json({ message: 'Failed to fetch employees', error });
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

    employee.emergencyContacts = req.body; 
    await employee.save();

    res.status(201).json({ message: 'Emergency contact updated', contact: employee.emergencyContacts });
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
