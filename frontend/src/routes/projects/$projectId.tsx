import { Link, createRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  FileText,
  LoaderCircle,
  RefreshCcw,
  RotateCcw,
} from 'lucide-react';
import { ChatContainer } from '../../components/ChatContainer';
import { apiRequest } from '../../lib/utils';
import type { Message, Project } from '../../lib/utils';
import { useChatStore } from '../../store/useChatStore';
import { Route as rootRoute } from '../__root';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects/$projectId',
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const { projectId } = Route.useParams();
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('access_token') || ''
      : '';
  const { messages, setMessages, resetChat } = useChatStore();
  const [project, setProject] = useState<Project | null>(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    apiRequest<Project>(`/api/v1/projects/${projectId}`, {}, token)
      .then((loadedProject) => {
        setProject(loadedProject);
        setMessages(
          (loadedProject.messages || [])
            .filter((message) => message.role !== 'SYSTEM')
            .map(toChatMessage)
        );
      })
      .catch((loadError) =>
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Project tidak dapat dimuat.'
        )
      )
      .finally(() => setLoading(false));
  }, [projectId, setMessages, token]);

  const createSummary = async () => {
    setSummaryLoading(true);
    setError('');
    try {
      const result = await apiRequest<{ summary: string }>(
        `/api/v1/projects-ai/${projectId}/summarize`,
        { method: 'POST' },
        token
      );
      setSummary(result.summary);
    } catch (summaryError) {
      setError(
        summaryError instanceof Error
          ? summaryError.message
          : 'Summary tidak dapat dibuat.'
      );
    } finally {
      setSummaryLoading(false);
    }
  };

  const resetConversation = async () => {
    if (
      !window.confirm(
        'Reset conversation ini? Project dan brief tetap tersimpan.'
      )
    )
      return;
    try {
      await apiRequest(
        `/api/v1/projects-ai/${projectId}/messages`,
        { method: 'DELETE' },
        token
      );
      resetChat();
      setSummary('');
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : 'Conversation tidak dapat direset.'
      );
    }
  };

  if (!token)
    return (
      <div className="py-20 text-center">
        <p className="mb-4 text-sm text-[#b04d36]">Sesi Anda telah berakhir.</p>
        <Link to="/" className="font-semibold text-[#183f35] underline">
          Kembali ke login
        </Link>
      </div>
    );
  if (loading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-[#738078]">
        <LoaderCircle className="mr-2 animate-spin" size={18} /> Loading
        project...
      </div>
    );
  if (!project)
    return (
      <div className="py-20 text-center text-sm text-[#b04d36]">
        {error || 'Project tidak ditemukan.'}
      </div>
    );

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#738078] hover:text-[#183f35]"
        >
          <ArrowLeft size={15} /> All projects
        </Link>
        <div className="flex gap-2">
          <button
            onClick={createSummary}
            disabled={summaryLoading || messages.length === 0}
            className="inline-flex items-center gap-2 border border-[#cbd4cb] bg-[#fbfbf7] px-3 py-2 text-xs font-semibold text-[#183f35] hover:border-[#183f35] disabled:opacity-50"
          >
            <FileText size={14} />{' '}
            {summaryLoading ? 'Summarising...' : 'Summarise decisions'}
          </button>
          <button
            onClick={resetConversation}
            disabled={messages.length === 0}
            className="inline-flex items-center gap-2 border border-[#cbd4cb] bg-[#fbfbf7] px-3 py-2 text-xs font-semibold text-[#738078] hover:border-[#b04d36] hover:text-[#b04d36] disabled:opacity-50"
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>
      {error && (
        <div className="mb-5 flex items-center justify-between border border-[#e8c9bd] bg-[#fff5f0] px-4 py-3 text-sm text-[#a84e38]">
          <span>{error}</span>
          <button onClick={() => setError('')} aria-label="Dismiss error">
            <RefreshCcw size={15} />
          </button>
        </div>
      )}
      <div className="mb-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-[#b26d42]">
            Design project
          </p>
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[#183f35]">
            {project.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#64716a]">
            {project.description ||
              'No design context added yet. Use the conversation to establish a direction.'}
          </p>
        </section>
        <aside className="border-l border-[#d9ddd6] pl-5 text-xs text-[#738078]">
          <p className="mb-2 font-semibold uppercase tracking-wider text-[#a0aaa1]">
            Brief signal
          </p>
          <p>{messages.length} messages in this direction</p>
          <p className="mt-2">AI assistant / Gemini</p>
        </aside>
      </div>
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_280px]">
        <ChatContainer projectId={projectId} authToken={token} error={error} />
        <aside>
          {summary && (
            <section className="border border-[#d9ddd6] bg-[#e7eedf] p-5">
              <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#183f35]">
                <FileText size={14} /> Decision summary
              </p>
              <p className="whitespace-pre-wrap text-sm leading-6 text-[#40554b]">
                {summary}
              </p>
            </section>
          )}
          <p className="mt-4 text-xs leading-5 text-[#879188]">
            The assistant uses this project brief and the latest conversation
            history to keep recommendations grounded.
          </p>
        </aside>
      </div>
    </div>
  );
}

function toChatMessage(message: Message) {
  return {
    id: message.id,
    role: message.role === 'USER' ? ('user' as const) : ('assistant' as const),
    content: message.content,
    timestamp: new Date(message.createdAt),
  };
}
