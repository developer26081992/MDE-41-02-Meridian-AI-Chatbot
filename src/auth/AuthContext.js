import React, { createContext, useContext, useEffect, useState } from 'react';
import { saveToken, getToken, clearToken } from './session';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [restoring, setRestoring] = useState(true);
  const [restoreError, setRestoreError] = useState(false);

  useEffect(() => {
    getToken().then(setSession).catch(() => setRestoreError(true)).finally(() => setRestoring(false));
  }, []);

  async function signIn(email, password) {
    const user = email.trim().toLowerCase();
    if (!/^[^@\s]+@meridian\.com$/.test(user) || !password.trim()) {
      throw new Error('Use your @meridian.com email and enter a password.');
    }
    // The supplied project uses a local demonstration session.
    const next = { token: 'demo-' + Date.now(), user };
    await saveToken(next);
    setSession(next);
  }

  async function signOut() {
    await clearToken();
    setSession(null);
  }

  return (
    <AuthContext.Provider value={{ session, restoring, restoreError, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
