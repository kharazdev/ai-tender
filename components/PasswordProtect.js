// src/components/PasswordProtect.js
'use client'; // This is a client component

import React, { useState, useEffect } from 'react';

// The hardcoded password
const CORRECT_PASSWORD = '1999';

export default function PasswordProtect({ children }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Check sessionStorage when the component mounts
  useEffect(() => {
    const unlocked = sessionStorage.getItem('isUnlocked');
    if (unlocked === 'true') {
      setIsUnlocked(true);
    }
  }, []);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      // If correct, set flag in session storage and update state
      sessionStorage.setItem('isUnlocked', 'true');
      setIsUnlocked(true);
      setError('');
    } else {
      // If incorrect, show an error
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  // If the app is unlocked, render the children (your actual app)
  if (isUnlocked) {
    return <>{children}</>;
  }

  // If the app is locked, render the password form
  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2>Unlock Application</h2>
        <p>Please enter the password to continue.</p>
        <form onSubmit={handlePasswordSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
             
          />
          <button type="submit" style={styles.button}>
            Unlock
          </button>
        </form>
        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
}

// Basic styles to make it look decent
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f2f5',
  },
  formContainer: {
    padding: '40px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    textAlign: 'center',
    width: '350px',
  },
  input: {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    boxSizing: 'border-box',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  button: {
    width: '100%',
    padding: '10px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    marginTop: '10px',
  },
};