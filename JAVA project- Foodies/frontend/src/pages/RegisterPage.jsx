import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    defaultAddress: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);
    try {
      await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        defaultAddress: form.defaultAddress.trim(),
      });
      navigate('/', { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Could not create your account. Please review your details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container auth-wrapper">
      <div className="auth-card">
        <h1>Create your Foodies account</h1>
        <p className="auth-subtitle">Register once for faster checkout and full order history.</p>

        {errorMessage && (
          <div className="alert-banner alert-error" role="alert">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="reg-full-name" className="form-label">
              Full name <span aria-hidden="true">*</span>
            </label>
            <input
              id="reg-full-name"
              name="fullName"
              type="text"
              className="form-input"
              autoComplete="name"
              minLength={2}
              maxLength={100}
              enterKeyHint="next"
              required
              value={form.fullName}
              onChange={handleChange('fullName')}
            />
          </div>

          <div className="form-field">
            <label htmlFor="reg-email" className="form-label">
              Email address <span aria-hidden="true">*</span>
            </label>
            <input
              id="reg-email"
              name="email"
              type="email"
              className="form-input"
              autoComplete="username"
              spellCheck={false}
              autoCapitalize="none"
              enterKeyHint="next"
              required
              value={form.email}
              onChange={handleChange('email')}
            />
          </div>

          <div className="form-field">
            <label htmlFor="reg-phone" className="form-label">
              Phone number <span aria-hidden="true">*</span>
            </label>
            <span id="reg-phone-hint" className="form-hint">
              10-digit mobile number for delivery updates.
            </span>
            <input
              id="reg-phone"
              name="phone"
              type="tel"
              className="form-input"
              autoComplete="tel"
              inputMode="tel"
              pattern="[0-9+\-\s]{10,15}"
              aria-describedby="reg-phone-hint"
              enterKeyHint="next"
              required
              value={form.phone}
              onChange={handleChange('phone')}
            />
          </div>

          <div className="form-field">
            <label htmlFor="reg-password" className="form-label">
              Password <span aria-hidden="true">*</span>
            </label>
            <span id="reg-password-hint" className="form-hint">
              Minimum 6 characters.
            </span>
            <div className="password-wrapper">
              <input
                id="reg-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                autoComplete="new-password"
                minLength={6}
                maxLength={72}
                aria-describedby="reg-password-hint"
                enterKeyHint="next"
                required
                value={form.password}
                onChange={handleChange('password')}
              />
              <button
                type="button"
                className="password-toggle"
                aria-pressed={showPassword}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="reg-address" className="form-label">
              Delivery address <span aria-hidden="true">*</span>
            </label>
            <textarea
              id="reg-address"
              name="defaultAddress"
              className="form-textarea"
              autoComplete="street-address"
              minLength={5}
              maxLength={300}
              enterKeyHint="done"
              required
              value={form.defaultAddress}
              onChange={handleChange('defaultAddress')}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch-note">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

