import React from 'react';

export default function DemoAccountNotice({ showLoginLink = false }) {
  return (
    <div className="demo-account-notice">
      <p>No account? No problem. Use this demo account:</p>
      <p className="demo-account-credential">
        <strong>Username:</strong> test@gmail.com
      </p>
      <p className="demo-account-credential">
        <strong>Password:</strong> 1234
      </p>
      {showLoginLink && (
        <p className="demo-account-login-link">
          <a href="/login">Use demo account and log in</a>
        </p>
      )}
    </div>
  );
}
