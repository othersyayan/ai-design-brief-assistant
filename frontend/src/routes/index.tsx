import { Link, useNavigate, createRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  ArrowRight,
  FolderPlus,
  LoaderCircle,
  LockKeyhole,
} from 'lucide-react';
import { apiRequest } from '../lib/utils';
import type { Project, User } from '../lib/utils';
import { Route as rootRoute } from './__root';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const [projects, setProjects] = useState<Project[]>([]);
  const [email, setEmail] = useState('test@lmesh.eu');
  const [password, setPassword] = useState('password');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token)
      apiRequest<Project[]>('/api/v1/projects', {}, token)
        .then(setProjects)
        .catch(() => setError('Sesi tidak valid. Silakan login kembali.'));
  }, [token]);

  const login = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await apiRequest<{ accessToken: string; user: User }>(
        '/api/v1/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password }) }
      );
      localStorage.setItem('access_token', result.accessToken);
      localStorage.setItem('auth_user', JSON.stringify(result.user));
      window.location.reload();
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : 'Login gagal.'
      );
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !token) return;
    setLoading(true);
    setError('');
    try {
      const project = await apiRequest<Project>(
        '/api/v1/projects',
        { method: 'POST', body: JSON.stringify({ title, description }) },
        token
      );
      navigate({
        to: '/projects/$projectId',
        params: { projectId: project.id },
      });
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : 'Project gagal dibuat.'
      );
      setLoading(false);
    }
  };

  if (!token)
    return (
      <div className="mx-auto grid min-h-[70vh] max-w-5xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <section>
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.25em] text-[#b26d42]">
            CMF intelligence / 01
          </p>
          <h1 className="max-w-xl text-5xl font-semibold leading-[0.98] tracking-[-0.04em] text-[#183f35] md:text-7xl">
            Give the concept a material language.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-[#64716a]">
            A focused workspace for automotive designers to shape direction,
            colour, material, and finish decisions with an AI design partner.
          </p>
        </section>
        <form
          onSubmit={login}
          className="border border-[#d9ddd6] bg-[#fbfbf7] p-7 shadow-[8px_8px_0_#dfe5d9]"
        >
          <div className="mb-8 flex items-center gap-2 text-sm font-semibold text-[#183f35]">
            <LockKeyhole size={16} /> Sign in to your workspace
          </div>
          <label className="mb-4 block text-xs font-semibold uppercase tracking-wider text-[#64716a]">
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              className="mt-2 w-full border border-[#cbd4cb] bg-white px-3 py-3 text-sm outline-none focus:border-[#183f35]"
            />
          </label>
          <label className="mb-5 block text-xs font-semibold uppercase tracking-wider text-[#64716a]">
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
              className="mt-2 w-full border border-[#cbd4cb] bg-white px-3 py-3 text-sm outline-none focus:border-[#183f35]"
            />
          </label>
          {error && <p className="mb-4 text-sm text-[#b04d36]">{error}</p>}
          <button
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 bg-[#183f35] px-4 py-3 text-sm font-semibold text-white hover:bg-[#26594a] disabled:opacity-60"
          >
            {loading ? (
              <LoaderCircle className="animate-spin" size={16} />
            ) : (
              'Open workspace'
            )}{' '}
            <ArrowRight size={16} />
          </button>
          <p className="mt-4 text-xs text-[#879188]">
            Demo access: test@lmesh.eu / password
          </p>
        </form>
      </div>
    );

  return (
    <div>
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-[#b26d42]">
            Your studio
          </p>
          <h1 className="text-4xl font-semibold tracking-[-0.03em] text-[#183f35]">
            Design projects
          </h1>
        </div>
        <span className="text-sm text-[#738078]">
          {projects.length} active{' '}
          {projects.length === 1 ? 'project' : 'projects'}
        </span>
      </div>
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <form
          onSubmit={createProject}
          className="border border-[#d9ddd6] bg-[#e7eedf] p-6"
        >
          <div className="mb-7 flex items-center gap-2 text-sm font-semibold text-[#183f35]">
            <FolderPlus size={17} /> New design project
          </div>
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Project title"
            className="mb-3 w-full border-0 bg-white px-4 py-3 text-sm outline-none"
          />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Design context (optional)"
            rows={5}
            className="mb-4 w-full resize-none border-0 bg-white px-4 py-3 text-sm outline-none"
          />
          {error && <p className="mb-3 text-sm text-[#b04d36]">{error}</p>}
          <button
            disabled={loading}
            className="bg-[#b26d42] px-4 py-3 text-sm font-semibold text-white hover:bg-[#965a37] disabled:opacity-60"
          >
            Create project
          </button>
        </form>
        <div className="grid gap-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              to="/projects/$projectId"
              params={{ projectId: project.id }}
              className="group border border-[#d9ddd6] bg-[#fbfbf7] p-5 transition-colors hover:border-[#183f35]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#183f35]">
                    {project.title}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#738078]">
                    {project.description || 'No design context added yet.'}
                  </p>
                </div>
                <ArrowRight
                  className="mt-1 text-[#b26d42] transition-transform group-hover:translate-x-1"
                  size={18}
                />
              </div>
              <div className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-[#a0aaa1]">
                {project._count?.messages || 0} conversation messages
              </div>
            </Link>
          ))}
          {projects.length === 0 && (
            <div className="border border-dashed border-[#cbd4cb] p-10 text-center text-sm text-[#738078]">
              Create your first project to start exploring a design direction.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
