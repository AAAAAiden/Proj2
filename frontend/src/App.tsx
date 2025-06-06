import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './pages/SignIn';
import Register from './pages/Register';
import Oops from './pages/Oops';
import GenerateToken from './pages/HR/GenerateToken';
import RequireHR from './components/RequireHR';
import OnboardingPage from './pages/OnboardingPage';
import { useAppDispatch } from './hooks';
import { setAuth, initialState } from './store/authSlice';
import OnboardingReview from './pages/HR/OnboardingReview';
import ViewApplication from './pages/HR/ViewApplication';
import SummaryProfile from './pages/HR/EmployeeProfile';
import EmployeePage from './pages/EmployeePage';
import ViewEmployeeProfilePage from './pages/HR/ViewEmployeeProfile';
import VisaReviewPage from './pages/HR/VisaStatusSummaryPage';
import VisaReviewDetailPage from './pages/HR/VisaReviewDetailPage';

const App = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      try {
        const parsed = JSON.parse(storedAuth);
        dispatch(setAuth(parsed));
      } catch (err) {
        console.error('Invalid auth in localStorage:', err);
        dispatch(setAuth({ ...initialState, authLoaded: true }));
      }
    } else {
      dispatch(setAuth({ ...initialState, authLoaded: true }));
    }
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/register" element={<Register />} />
        <Route path="/hr/token" element={<RequireHR><GenerateToken /></RequireHR>} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/employee/*" element={<EmployeePage />} />
        <Route path="/hr/review" element={<RequireHR><OnboardingReview /></RequireHR>} />
        <Route path="/hr/profiles" element={<RequireHR><SummaryProfile /></RequireHR>} />
        <Route path="/hr/visa" element={<RequireHR><VisaReviewPage /></RequireHR>} />
        <Route path="/hr/visa-review/:userId" element={ <RequireHR><VisaReviewDetailPage /></RequireHR>}/>
        <Route path="/hr/profile/:id" element={<ViewEmployeeProfilePage />} />
        <Route path="/hr/view-application/:userId" element={<RequireHR><ViewApplication /></RequireHR>} />
        <Route path="*" element={<Oops />} />
      </Routes>
    </Router>
  );
};

export default App;