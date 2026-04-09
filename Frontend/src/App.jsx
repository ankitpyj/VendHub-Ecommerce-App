import React, { useState } from 'react';
import WelcomePage from './components/WelcomePage';
import AuthPage from './components/AuthPage';
import FarmerDashboard from './components/FarmerDashboard';
import VendorDashboard from './components/VendorDashboard';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

const App = () => {
  // Main application state
  const [currentPage, setCurrentPage] = useState('welcome');
  const [authMode, setAuthMode] = useState('login');
  const [selectedRole, setSelectedRole] = useState('');
  const [user, setUser] = useState(null);

  // Main render logic - decides which component to show
  if (user) {
    switch (user.role) {
      case 'farmer':
        return <FarmerDashboard user={user} setUser={setUser} />;
      case 'vendor':
        return <VendorDashboard user={user} setUser={setUser} />;
      case 'admin':
        return <AdminDashboard user={user} setUser={setUser} />;
      default:
        return <WelcomePage setCurrentPage={setCurrentPage} />;
    }
  }

  if (currentPage === 'welcome') {
    return <WelcomePage setCurrentPage={setCurrentPage} />;
  }

  if (currentPage === 'auth') {
    return (
      <AuthPage 
        authMode={authMode}
        setAuthMode={setAuthMode}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        setUser={setUser}
      />
    );
  }

  return <WelcomePage setCurrentPage={setCurrentPage} />;
};

export default App;