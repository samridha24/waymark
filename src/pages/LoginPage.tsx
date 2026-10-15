import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import EditorialShell from '../components/shell/EditorialShell';
import { ChapterEyebrow, FineRule } from '../components/editorial/EditorialComponents';
import { useAuthStore } from '../store/useAuthStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    // small artificial delay for feel
    setTimeout(() => {
      const result = login(username, password);
      setLoading(false);
      if (result.ok) {
        navigate('/');
      } else {
        setError(result.error ?? 'Login failed.');
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
              Welcome back.
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--muted-ink)' }}>
              Sign in to continue your plan.
            </p>
          </div>

          <FineRule />

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <label
                htmlFor="login-username"
                className="block text-sm font-medium"
                style={{ color: 'var(--ink)' }}
              >
                Username
              </label>
              <input
                id="login-username"
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
                placeholder="your username"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="login-password"
                className="block text-sm font-medium"
                style={{ color: 'var(--ink)' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
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
                  placeholder="••••••••"
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
              disabled={loading || !username || !password}
              className="w-full py-3 rounded-md text-base font-medium transition-opacity"
              style={{
                background: 'var(--forest)',
                color: 'var(--paper)',
                fontFamily: 'var(--font-ui)',
                opacity: loading || !username || !password ? 0.6 : 1,
                cursor: loading || !username || !password ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <FineRule />

          <p className="text-sm text-center" style={{ color: 'var(--muted-ink)' }}>
            No account?{' '}
            <Link
              to="/signup"
              className="font-medium underline"
              style={{ color: 'var(--forest)' }}
            >
              Create one
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
