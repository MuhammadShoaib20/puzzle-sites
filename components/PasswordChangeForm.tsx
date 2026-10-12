'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { changeAdminPassword, invalidateAllSessions } from '@/lib/actions/security';

type ActionResult = { success?: boolean; error?: string };

type Props = {
  adminPath: string;
};

export default function PasswordChangeForm({ adminPath }: Props) {
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [strengthText, setStrengthText] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [changeError, setChangeError] = useState('');
  const [logoutError, setLogoutError] = useState('');

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 12) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;

    setPasswordStrength(strength);

    if (strength === 0) setStrengthText('');
    else if (strength <= 2) setStrengthText('Weak');
    else if (strength <= 3) setStrengthText('Fair');
    else if (strength <= 4) setStrengthText('Good');
    else setStrengthText('Strong');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError('');
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const result = await changeAdminPassword(formData);
    
    if (result.success) {
      window.location.href = `/${adminPath}/login?message=password_changed`;
    } else if (result.error) {
      setChangeError(result.error);
    }
  };

  const handleLogoutAll = async () => {
    setLogoutError('');
    const result = await invalidateAllSessions();
    
    if (result.success) {
      window.location.href = `/${adminPath}/login?message=sessions_invalidated`;
    } else if (result.error) {
      setLogoutError(result.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Password Change Form */}
      <div className="card p-6">
        <h2 className="text-lg font-bold border-b pb-3 mb-4">Change Password</h2>
        
        {changeError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
            <p className="text-sm text-red-600 dark:text-red-400">{changeError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium mb-1">
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              name="current_password"
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label htmlFor="new-password" className="block text-sm font-medium mb-1">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              name="new_password"
              required
              minLength={12}
              onChange={(e) => {
                checkPasswordStrength(e.target.value);
                const confirm = (document.getElementById('confirm-password') as HTMLInputElement).value;
                setPasswordMatch(e.target.value === confirm);
              }}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            {passwordStrength > 0 && (
              <div className="mt-2">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${(passwordStrength / 5) * 100}%`,
                      backgroundColor: passwordStrength <= 2 ? '#EF4444' : passwordStrength <= 3 ? '#F59E0B' : passwordStrength <= 4 ? '#10B981' : '#059669',
                    }}
                  />
                </div>
                <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                  Password strength: <span className="font-medium">{strengthText}</span>
                </p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium mb-1">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type="password"
              name="confirm_password"
              required
              minLength={12}
              onChange={(e) => {
                const newPass = (document.getElementById('new-password') as HTMLInputElement).value;
                setPasswordMatch(e.target.value === newPass);
              }}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            {!passwordMatch && (
              <p className="text-xs mt-1 text-red-600 dark:text-red-400">Passwords do not match</p>
            )}
          </div>

          <div className="text-xs text-gray-600 dark:text-gray-400">
            Requirements: At least 12 characters with uppercase, lowercase, number, and special character. Cannot reuse last 3 passwords.
          </div>

          <PasswordSubmitButton />
        </form>
      </div>

      {/* Logout from All Devices */}
      <div className="card p-6">
        <h2 className="text-lg font-bold border-b pb-3 mb-4">Logout from All Devices</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          This will log you out from all devices and invalidate all active sessions. You will need to login again.
        </p>

        {logoutError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
            <p className="text-sm text-red-600 dark:text-red-400">{logoutError}</p>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleLogoutAll(); }}>
          <LogoutAllButton />
        </form>
      </div>
    </div>
  );
}

function PasswordSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-primary"
    >
      {pending ? 'Changing...' : 'Change Password'}
    </button>
  );
}

function LogoutAllButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-secondary"
    >
      {pending ? 'Invalidating...' : 'Logout from All Devices'}
    </button>
  );
}
