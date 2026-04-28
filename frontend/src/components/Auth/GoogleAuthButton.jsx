import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const GOOGLE_SCRIPT_ID = 'google-identity-services';

const loadGoogleScript = () => new Promise((resolve, reject) => {
  if (window.google?.accounts?.id) {
    resolve();
    return;
  }

  const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);
  if (existingScript) {
    existingScript.addEventListener('load', resolve, { once: true });
    existingScript.addEventListener('error', reject, { once: true });
    return;
  }

  const script = document.createElement('script');
  script.id = GOOGLE_SCRIPT_ID;
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  script.onload = () => resolve();
  script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
  document.head.appendChild(script);
});

const GoogleAuthButton = ({ mode = 'login', role, onSuccess }) => {
  const { googleAuth } = useAuth();
  const buttonRef = useRef(null);
  const [ready, setReady] = useState(false);
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  const label = useMemo(() => (mode === 'signup' ? 'Continue with Google' : 'Sign in with Google'), [mode]);

  useEffect(() => {
    let active = true;

    loadGoogleScript()
      .then(() => {
        if (active) setReady(true);
      })
      .catch((error) => {
        if (active) {
          console.error(error);
          toast.error('Google sign-in could not be loaded');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!ready || !clientId || !buttonRef.current || !window.google?.accounts?.id) return;

    buttonRef.current.innerHTML = '';
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        try {
          const user = await googleAuth(response.credential, { mode, role });
          if (onSuccess) onSuccess(user);
        } catch (error) {
          const message = error.response?.data?.message || 'Google sign-in failed';
          toast.error(message);
        }
      }
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      text: mode === 'signup' ? 'signup_with' : 'signin_with',
      width: 360,
      logo_alignment: 'left'
    });
  }, [ready, clientId, googleAuth, mode, role, onSuccess]);

  if (!clientId) {
    return (
      <div className="google-auth-fallback">
        <div className="google-auth-button disabled">{label}</div>
        <p className="google-auth-note">
          Add REACT_APP_GOOGLE_CLIENT_ID in frontend/.env to enable Google OAuth.
        </p>
      </div>
    );
  }

  return (
    <div className="google-auth-fallback">
      <div ref={buttonRef} className="google-auth-button" />
    </div>
  );
};

export default GoogleAuthButton;