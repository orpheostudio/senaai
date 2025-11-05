/**
 * 🌙 Yume Chatbot - Main Frontend Application
 * 
 * Modern React app with:
 * - Kawaii design system
 * - Accessibility features
 * - Real-time chat
 * - Voice interaction
 * - Responsive layout
 * - State management with Zustand
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Pages
import ChatPage from '@/pages/ChatPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import AdminPage from '@/pages/AdminPage';
import SettingsPage from '@/pages/SettingsPage';
import NotFoundPage from '@/pages/NotFoundPage';

// Components
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { PWAPrompt } from '@/components/ui/PWAPrompt';
import { NetworkStatus } from '@/components/ui/NetworkStatus';

// Hooks
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useSocketStore } from '@/store/socketStore';

// Utils
import { initializeApp } from '@/utils/init';

function App() {
  const { isLoading, isAuthenticated, user } = useAuthStore();
  const { theme, initializeTheme } = useThemeStore();
  const { connect } = useSocketStore();

  useEffect(() => {
    // Initialize app
    const init = async () => {
      try {
        await initializeApp();
        initializeTheme();
        
        // Connect to WebSocket if authenticated
        if (isAuthenticated) {
          connect();
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    init();
  }, [isAuthenticated, initializeTheme, connect]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider defaultTheme={theme}>
      <AuthProvider>
        <Router>
          <div className="app-container min-h-screen bg-gradient-kawaii">
            {/* Network status indicator */}
            <NetworkStatus />
            
            {/* PWA install prompt */}
            <PWAPrompt />

            {/* Main content */}
            <AnimatePresence mode="wait">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Protected routes */}
                <Route path="/" element={<ChatPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/chat/:conversationId" element={<ChatPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                
                {/* Admin routes */}
                {user?.role === 'ADMIN' && (
                  <Route path="/admin" element={<AdminPage />} />
                )}
                
                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </AnimatePresence>

            {/* Global toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                className: 'kawaii-toast',
                style: {
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px -8px rgba(177, 156, 217, 0.3)',
                }
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;