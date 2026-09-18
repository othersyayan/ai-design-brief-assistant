import {
  createRootRoute,
  Link,
  Outlet,
  useNavigate,
} from '@tanstack/react-router';
import { LogOut, Palette } from 'lucide-react';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const navigate = useNavigate();
  const hasSession =
    typeof window !== 'undefined' &&
    Boolean(localStorage.getItem('access_token'));

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('auth_user');
    navigate({ to: '/' });
  };

  return (
    <div className="min-h-screen bg-[#f5f4ef] text-[#1e2925]">
      <header className="border-b border-[#d9ddd6] bg-[#f8f8f4]/95 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3"
            aria-label="Design brief workspace"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-[#183f35] text-[#e6f0db]">
              <Palette size={18} />
            </span>
            <span>
              <strong className="block text-sm tracking-wide">
                FORM / FIELD
              </strong>
              <span className="block text-[11px] uppercase tracking-[0.2em] text-[#738078]">
                Design brief workspace
              </span>
            </span>
          </Link>
          {hasSession && (
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#64716a] hover:text-[#183f35]"
            >
              <LogOut size={15} /> Keluar
            </button>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8">
        <Outlet />
      </main>
    </div>
  );
}
