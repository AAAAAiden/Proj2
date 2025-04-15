import { Request, Response } from 'express';
import OnboardingApp from '../model/Onboarding.js';
import User from '../model/User.js';
import Token from '../model/Token.js';
import { v4 as uuidv4 } from 'uuid';
import { sendRegistrationEmail } from '../util/emailService.js';

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
export const getOnboardingStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const app = await OnboardingApp.findOne({ userId: req.params.userId });

    if (!app) {
      return res.status(404).json({ message: 'No application found' });
    }

    res.json(app);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching application', error });
  }
};

// HR: Approve onboarding
export const approveOnboarding = async (req: Request, res: Response): Promise<any> => {
  const { userId } = req.body;

  try {
    const app = await OnboardingApp.findOneAndUpdate(
      { userId, status: 'Pending' },
      { status: 'Approved' },
      { new: true }
    );

    if (!app) {
      return res.status(404).json({ message: 'No pending application found' });
    }

    res.json({ message: 'Application approved', application: app });
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve application', error });
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
    const apps = await OnboardingApp.find({ status: req.params.status });
    res.json(apps);
  } catch (error) {
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
export const generateRegistrationToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
  
      const token = uuidv4();
      const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000); // 3 hours
  
      await Token.create({ email, token, expiresAt, used: false });
      await sendRegistrationEmail(email, token);
  
      res.status(201).json({ message: 'Registration token sent', token });
    } catch (error) {
      res.status(500).json({ message: 'Failed to send token', error });
    }
  };