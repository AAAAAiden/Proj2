import { Request, Response } from 'express';
import OnboardingApp from '../model/Onboarding.js';
import User from '../model/User.js';
import Token from '../model/Token.js';
import { v4 as uuidv4 } from 'uuid';
import { sendRegistrationEmail } from '../util/emailService.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { IUserDocument } from '../model/User.js';
import Employee from '../model/Employee.js';

// Employee: Submit onboarding application
export const submitOnboarding = async (req: Request, res: Response): Promise<any> => {
  const { userId, formData } = req.body;

  try {
    const existing = await OnboardingApp.findOne({ userId });

    if (existing) {
      return res.status(400).json({ message: 'Application already exists. Please update it if rejected.' });
    }

    const newApp = await OnboardingApp.create({
      userId,
      formData,
      status: 'Pending',
      feedback: '',
    });

    res.status(201).json({ message: 'Application submitted', application: newApp });
  } catch (error) {
    console.error("Submit error:", error);
    res.status(500).json({ message: 'Failed to submit application', error });
  }
};

// Employee: Update application if previously rejected
export const updateOnboarding = async (req: Request, res: Response): Promise<any> => {
  const { userId, formData } = req.body;

  try {
    const updated = await OnboardingApp.findOneAndUpdate(
      { userId, status: 'Rejected' },
      { formData, status: 'Pending', feedback: '' },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'No rejected application to update' });
    }

    res.json({ message: 'Application updated and resubmitted', application: updated });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update application', error });
  }
};

// GET: View current application status (employee or HR)
export const getOnboardingStatus = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    const app = await OnboardingApp.findOne({ userId });

    if (!app) {
      return res.json({ status: 'never submitted', data: null });
    }
        
    res.json({ status: app.status.toLowerCase(), data: app.formData, feedback: app.feedback, });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: 'Error fetching onboarding status', error: err.message });
    } else {
      res.status(500).json({ message: 'Unknown error' });
    }
  }
};

// HR: Approve onboarding
export const approveOnboarding = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.body;

  try {
    const app = await OnboardingApp.findOneAndUpdate(
      { userId, status: 'Pending' },
      { status: 'Approved' },
      { new: true }
    );

    if (!app) {
      res.status(404).json({ message: 'No pending application found' });
      return;
    }

    const form = app.formData;
    if (!form || !form.name || !form.address || !form.contact) {
      res.status(400).json({ message: 'Incomplete form data' });
      return;
    }

    // Map documents with safe defaults
    const documents = Array.isArray(form.documents)
      ? form.documents
          .filter((doc: any) => doc?.name && doc?.url)
          .map((doc: any) => ({
            type: doc.type,
            filename: doc.name,
            path: doc.url, // Use url as path for now
          }))
      : [];

    // Create Employee document
    const newEmployee = new Employee({
      userId: app.userId,
      name: {
        firstName: form.name.firstName || '',
        lastName: form.name.lastName || '',
        middleName: form.name.middleName || '',
        preferredName: form.name.preferredName || '',
        email: form.name.email || ''
      },
      profilePicture: form.name.profilePicUrl || '',
      contactInfo: {
        cellPhone: form.contact.cell || '',
        workPhone: form.contact.work || '',
      },
      address: {
        building: form.address.building || '',
        street: form.address.street || '',
        city: form.address.city || '',
        state: form.address.state || '',
        zip: form.address.zip || '',
      },
      ssn: form.name.ssn || '',
      dateOfBirth: form.name.dob || '',
      gender: form.name.gender || 'prefer_not_to_say',
      workAuth: {
        citizenshipStatus: form.immigration?.isUSResident ? 'Citizen' : 'Visa',
        visaTitle: form.employment?.visaTitle || '',
        visaType: form.immigration?.workAuthType || '',
        otherTitle: form.immigration?.otherVisaTitle || '',
        startDate: form.immigration?.authStartDate || '',
        endDate: form.immigration?.authEndDate || '',
        optReceiptPath: form.immigration?.optReceiptUrl || '',
      },
      reference: form.references,
      emergencyContacts: [form.emergency],
      documents,
    });

    await newEmployee.save();

    res.status(201).json({
      message: 'Application approved and employee created',
      application: app,
      employee: newEmployee,
    });
  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({ message: 'Failed to approve and create employee', error });
  }
};

// HR: Reject onboarding with feedback
export const rejectOnboarding = async (req: Request, res: Response): Promise<any> => {
  const { userId, feedback } = req.body;

  try {
    const app = await OnboardingApp.findOneAndUpdate(
      { userId, status: 'Pending' },
      { status: 'Rejected', feedback },
      { new: true }
    );

    if (!app) {
      return res.status(404).json({ message: 'No pending application found' });
    }

    res.json({ message: 'Application rejected', application: app });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject application', error });
  }
};

// HR: List applications by status (pending, rejected, approved)
export const listApplicationsByStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    // Capitalize the first letter to match DB schema values: 'Pending', 'Approved', 'Rejected'
    const rawStatus = req.params.status;
    const status = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

    const apps = await OnboardingApp.find({ status })
      .populate<{ userId: IUserDocument }>('userId', 'username email');

    const formatted = apps.map(app => ({
      userId: app.userId._id,
      fullName: app.userId.username, // fallback since your schema doesn't have fullName
      email: app.userId.email,
      status: app.status,
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching onboarding applications:', error);
    res.status(500).json({ message: 'Error fetching applications', error });
  }
};

// HR: View single application
export const viewApplication = async (req: Request, res: Response): Promise<any> => {
  try {
    const app = await OnboardingApp.findOne({ userId: req.params.userId });

    if (!app) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json(app);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching application', error });
  }
};


// HR: Generate registration token and send email
export const generateRegistrationToken = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000); // 3 hours

    await Token.create({ name, email, token, expiresAt, used: false });
    await sendRegistrationEmail(email, token);
    res.status(201).json({ message: 'Registration token sent', token });
  } catch (error: any) {
    console.error('Error generating token:', error.message);
    res.status(500).json({ message: 'Failed to send token', error: error.message });
  }
};

export const listRegistrationTokens = async (req: Request, res: Response): Promise<void> => {
  try {
    const tokens = await Token.find()
      .sort({ createdAt: -1 }) 
      .lean();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    const formatted = tokens.map((tokenDoc) => ({
      name: tokenDoc.name,
      email: tokenDoc.email,
      token: tokenDoc.token,
      status: tokenDoc.used ? 'used' : 'unused',
      createdAt: tokenDoc.createdAt.toISOString(),
      registrationLink: `${clientUrl}/register?token=${tokenDoc.token}`,
    }));

    res.json(formatted);
  } catch (error: any) {
    console.error('Error fetching registration tokens:', error.message);
    res.status(500).json({ message: 'Failed to fetch token history' });
  }
};