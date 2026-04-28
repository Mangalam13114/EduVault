import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import StudentDashboard from './components/Dashboard/StudentDashboard';
import TeacherDashboard from './components/Dashboard/TeacherDashboard';
import CourseView from './components/Course/CourseView';
import AssignmentReview from './components/Assignment/AssignmentReview';
import ProfilePage from './components/Profile/ProfilePage';
import SettingsPage from './components/Profile/SettingsPage';
import ProtectedRoute from './components/Common/ProtectedRoute';
import './App.css';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loader">
        <div className="loader-orbit">
          <div className="loader-orbit-dot" />
          <div className="loader-orbit-dot" />
          <div className="loader-orbit-dot" />
        </div>
        <p>Loading EduVault...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />
      <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" />} />
      <Route path="/reset-password/:token" element={!user ? <ResetPassword /> : <Navigate to="/dashboard" />} />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          {user?.role === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />}
        </ProtectedRoute>
      } />

      <Route path="/course/:courseId" element={
        <ProtectedRoute><CourseView /></ProtectedRoute>
      } />

      <Route path="/review/:assignmentId" element={
        <ProtectedRoute roles={['teacher']}><AssignmentReview /></ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute><ProfilePage /></ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute><SettingsPage /></ProtectedRoute>
      } />

      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <AppRoutes />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
            theme="dark"
            toastStyle={{
              background: 'rgba(30, 36, 51, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
              color: '#e4e8f1',
              fontSize: '13px'
            }}
          />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;