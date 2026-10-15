import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

const chapters = [
  { path: '/', label: 'Prologue', short: '00' },
  { path: '/begin', label: '01 · Starting Point', short: '01' },
  { path: '/field-guide', label: '02 · The Choices', short: '02' },
  { path: '/workbench', label: '03 · The Draft', short: '03' },
  { path: '/weather-room', label: '04 · The Weather', short: '04' },
  { path: '/journal', label: '05 · The Journal', short: '05' },
];

export default function Masthead() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);

  function handleLogout() {
    logout();
    navigate('/');
    setOpen(false);
  }

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{ background: 'var(--canvas)', borderBottom: '1px solid var(--rule)' }}
    >
      <div className="max-w-content mx-auto px-6 h-14 flex items-center justify-between gap-4">
        {/* Wordmark */}
        <Link
          to="/"
          className="flex-shrink-0 flex items-center gap-2"
          aria-label="Waymark — home"
        >
          <WaymarkMark />
          <span
            className="text-base font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-editorial)', color: 'var(--ink)' }}
          >
            waymark
          </span>
        </Link>

        {/* Chapter nav — desktop */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Chapters">
          {chapters.map((ch) => {
            const active = location.pathname === ch.path;
            return (
              <Link
                key={ch.path}
                to={ch.path}
                className="px-3 py-1.5 rounded-md text-sm transition-colors"
                style={{
                  color: active ? 'var(--forest)' : 'var(--muted-ink)',
                  fontWeight: active ? 600 : 400,
                  background: active ? 'var(--forest-wash)' : 'transparent',
                  fontFamily: 'var(--font-ui)',
                }}
                aria-current={active ? 'page' : undefined}
              >
                {ch.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <>
              {/* Logged-in user */}
              <span
                className="hidden sm:flex items-center gap-1.5 text-sm"
                style={{ color: 'var(--muted-ink)', fontFamily: 'var(--font-ui)' }}
              >
                <User size={14} />
                {currentUser}
              </span>
              <Link
                to="/journal"
                className="hidden sm:inline-flex px-3 py-1.5 rounded-md text-sm font-medium"
                style={{ background: 'var(--forest)', color: 'var(--paper)', fontFamily: 'var(--font-ui)' }}
              >
                My plan
              </Link>
              <button
                onClick={handleLogout}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm"
                style={{
                  border: '1px solid var(--rule)',
                  color: 'var(--muted-ink)',
                  background: 'transparent',
                  fontFamily: 'var(--font-ui)',
                }}
                type="button"
                aria-label="Sign out"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </>
          ) : (
            <>
              {/* Guest */}
              <Link
                to="/login"
                className="hidden sm:inline-flex px-3 py-1.5 rounded-md text-sm"
                style={{
                  border: '1px solid var(--rule)',
                  color: 'var(--muted-ink)',
                  background: 'transparent',
                  fontFamily: 'var(--font-ui)',
                }}
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="hidden sm:inline-flex px-3 py-1.5 rounded-md text-sm font-medium"
                style={{ background: 'var(--forest)', color: 'var(--paper)', fontFamily: 'var(--font-ui)' }}
              >
                Sign up
              </Link>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-md"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label="Open navigation menu"
            style={{ color: 'var(--ink)' }}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div
          className="md:hidden border-t"
          style={{ background: 'var(--paper)', borderColor: 'var(--rule)' }}
        >
          <nav className="px-4 py-3 flex flex-col gap-1" aria-label="Mobile chapters">
            {chapters.map((ch) => {
              const active = location.pathname === ch.path;
              return (
                <Link
                  key={ch.path}
                  to={ch.path}
                  onClick={() => setOpen(false)}
                  className="px-3 py-2.5 rounded-md text-sm"
                  style={{
                    color: active ? 'var(--forest)' : 'var(--ink)',
                    background: active ? 'var(--forest-wash)' : 'transparent',
                    fontWeight: active ? 600 : 400,
                  }}
                  aria-current={active ? 'page' : undefined}
                >
                  {ch.label}
                </Link>
              );
            })}

            <div style={{ borderTop: '1px solid var(--rule)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
              {currentUser ? (
                <>
                  <p className="px-3 py-1.5 text-xs" style={{ color: 'var(--muted-ink)' }}>
                    Signed in as <strong>{currentUser}</strong>
                  </p>
                  <Link
                    to="/journal"
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2.5 rounded-md text-sm font-medium text-center mt-1"
                    style={{ background: 'var(--forest)', color: 'var(--paper)' }}
                  >
                    My plan
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full mt-2 px-3 py-2.5 rounded-md text-sm text-center"
                    style={{ border: '1px solid var(--rule)', color: 'var(--muted-ink)' }}
                    type="button"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2.5 rounded-md text-sm text-center"
                    style={{ border: '1px solid var(--rule)', color: 'var(--ink)', marginBottom: '0.5rem' }}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2.5 rounded-md text-sm font-medium text-center"
                    style={{ background: 'var(--forest)', color: 'var(--paper)' }}
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function WaymarkMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="3" fill="var(--forest)" />
      <circle cx="10" cy="10" r="6" stroke="var(--forest)" strokeWidth="1.2" fill="none" />
      <line x1="10" y1="1" x2="10" y2="4" stroke="var(--forest)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
