import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import EditorialShell from '../components/shell/EditorialShell';
import { ChapterEyebrow, FineRule } from '../components/editorial/EditorialComponents';
import { useAuthStore } from '../store/useAuthStore';

export default function SignupPage() {
  const navigate = useNavigate();
  const signup = useAuthStore((s) => s.signup);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = signup(username, password);
      setLoading(false);
      if (result.ok) {
        navigate('/');
      } else {
        setError(result.error ?? 'Sign up failed.');
      }
    }, 300);
  }

  return (
    <EditorialShell>
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-8">
          <div>
            <ChapterEyebrow chapter="WAYMARK" />
            <h1
              className="mt-3 text-3xl"
              style={{
                fontFamily: 'var(--font-editorial)',
                color: 'var(--ink)',
                fontWeight: 400,
                fontStyle: 'italic',
              }}
            >
              Create your account.
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--muted-ink)' }}>
              Your plan lives on this device. No email required.
            </p>
          </div>

          <FineRule />

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <label
                htmlFor="signup-username"
                className="block text-sm font-medium"
                style={{ color: 'var(--ink)' }}
              >
                Username
              </label>
              <input
                id="signup-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-md text-base"
                style={{
                  border: `1px solid ${error ? 'var(--clay)' : 'var(--rule)'}`,
                  background: 'var(--paper)',
                  color: 'var(--ink)',
                  fontFamily: 'var(--font-ui)',
                  outline: 'none',
                }}
                placeholder="choose a username"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="signup-password"
                className="block text-sm font-medium"
                style={{ color: 'var(--ink)' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 rounded-md text-base"
                  style={{
                    border: `1px solid ${error ? 'var(--clay)' : 'var(--rule)'}`,
                    background: 'var(--paper)',
                    color: 'var(--ink)',
                    fontFamily: 'var(--font-ui)',
                    outline: 'none',
                  }}
                  placeholder="at least 4 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: 'var(--muted-ink)' }}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="signup-confirm"
                className="block text-sm font-medium"
                style={{ color: 'var(--ink)' }}
              >
                Confirm password
              </label>
              <input
                id="signup-confirm"
                type={showPw ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-md text-base"
                style={{
                  border: `1px solid ${error && error.includes('match') ? 'var(--clay)' : 'var(--rule)'}`,
                  background: 'var(--paper)',
                  color: 'var(--ink)',
                  fontFamily: 'var(--font-ui)',
                  outline: 'none',
                }}
                placeholder="repeat password"
              />
            </div>

            {error && (
              <p
                className="text-sm px-3 py-2 rounded-md"
                style={{ background: 'var(--clay-wash)', color: 'var(--clay)', border: '1px solid var(--clay)' }}
                role="alert"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !username || !password || !confirm}
              className="w-full py-3 rounded-md text-base font-medium transition-opacity"
              style={{
                background: 'var(--forest)',
                color: 'var(--paper)',
                fontFamily: 'var(--font-ui)',
                opacity: loading || !username || !password || !confirm ? 0.6 : 1,
                cursor: loading || !username || !password || !confirm ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <FineRule />

          <p className="text-sm text-center" style={{ color: 'var(--muted-ink)' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium underline"
              style={{ color: 'var(--forest)' }}
            >
              Sign in
            </Link>
          </p>

          <p className="text-xs text-center" style={{ color: 'var(--muted-ink)' }}>
            Mock authentication — credentials stored on this device only.
            No real account or server involved.
          </p>
        </div>
      </div>
    </EditorialShell>
  );
}
