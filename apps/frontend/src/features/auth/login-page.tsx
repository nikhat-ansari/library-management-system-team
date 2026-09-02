import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-context';
import { getDashboardPath } from '../../routes/role-redirect';
import { AuthError } from '../../types/auth';

type FieldErrors = Partial<Record<'email' | 'password', string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!email) errors.email = 'Email is required.';
  else if (!emailPattern.test(email)) errors.email = 'Enter a valid email address.';
  if (!password) errors.password = 'Password is required.';
  return errors;
}

function authErrorMessage(error: unknown): string {
  if (error instanceof AuthError) {
    if (error.code === 'INVALID_CREDENTIALS') return 'The email or password is incorrect.';
    if (error.code === 'NETWORK_ERROR') return 'We could not reach the service. Please check your connection and try again.';
    if (error.code === 'SERVER_ERROR') return 'The sign-in service is temporarily unavailable. Please try again shortly.';
  }
  return 'We could not sign you in. Please try again.';
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const normalizedEmail = email.trim().toLowerCase();
    const validationErrors = validate(normalizedEmail, password);
    setErrors(validationErrors);
    setAuthError(null);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const response = await login({ email: normalizedEmail, password });
      navigate(getDashboardPath(response.user.role), { replace: true });
    } catch (error) {
      setAuthError(authErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-shell">
      <div className="auth-layout">
        <aside className="auth-brand-panel" aria-labelledby="system-title">
          <div className="auth-brand-content">
            <div className="auth-wordmark">Library Management System</div>
            <div className="auth-brand-intro">
              <p className="auth-eyebrow">Secure library operations</p>
              <h1 id="system-title">One workspace for your library.</h1>
              <p>Secure role-based access for administrators, librarian staff, and members.</p>
            </div>
            <ul className="auth-scope-list" aria-label="Library Management System capabilities">
              <li>Book &amp; Copy Management</li>
              <li>Member Management</li>
              <li>Issue, Return &amp; Renewal</li>
              <li>Reservations &amp; Fine Management</li>
              <li>Shelf &amp; Seat Booking</li>
              <li>Reports &amp; Library Operations</li>
            </ul>
          </div>
          <p className="auth-brand-footer">Use your assigned account to access the appropriate library workspace.</p>
        </aside>

        <section className="auth-login-panel" aria-labelledby="login-title">
          <div className="auth-login-content">
            <div className="auth-mobile-wordmark">Library Management System</div>
            <div className="auth-login-heading">
              <p className="auth-eyebrow">Account sign in</p>
              <h2 id="login-title">Welcome back</h2>
              <p>Enter your details to continue to your library workspace.</p>
            </div>

            <div className="auth-feedback" aria-live="polite">
              {authError && <div role="alert" className="auth-alert">{authError}</div>}
            </div>

            <form noValidate onSubmit={onSubmit} className="auth-form">
              <div>
                <label htmlFor="email" className="form-label">Email address</label>
                <input id="email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} className="form-input" />
                {errors.email && <p id="email-error" className="field-error">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="password" className="form-label">Password</label>
                <div className="relative">
                  <input id="password" name="password" type={isPasswordVisible ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'password-error' : undefined} className="form-input pr-22" />
                  <button type="button" onClick={() => setIsPasswordVisible((visible) => !visible)} className="password-toggle" aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}>{isPasswordVisible ? 'Hide' : 'Show'}</button>
                </div>
                {errors.password && <p id="password-error" className="field-error">{errors.password}</p>}
              </div>
              <button type="submit" disabled={isSubmitting} className="auth-submit">{isSubmitting ? 'Signing in…' : 'Sign in'}</button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
