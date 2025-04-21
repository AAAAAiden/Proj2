import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './pages/SignIn';
import Register from './pages/Register';
import Oops from './pages/Oops';
import GenerateToken from './pages/HR/GenerateToken';
import RequireHR from './components/RequireHR';
import OnboardingPage from './pages/OnboardingPage';

const App = () => (
  <Router>
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/register" element={<Register />} />
      <Route path="/hr/token" element={<RequireHR><GenerateToken /></RequireHR>} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="*" element={<Oops />} />
    </Routes>
  </Router>
);

export default App;
