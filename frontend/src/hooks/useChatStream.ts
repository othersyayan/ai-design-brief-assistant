import { useMutation } from '@tanstack/react-query';
import { useChatStore } from '../store/useChatStore';

interface SendMessagePayload {
  projectId: string;
  prompt: string;
  token: string;
}

export const useChatStream = () => {
  const {
    addMessage,
    setStreaming,
    appendStreamingContent,
    clearStreamingContent,
  } = useChatStore();

  return useMutation({
    mutationFn: async ({ projectId, prompt, token }: SendMessagePayload) => {
      addMessage({
        id: crypto.randomUUID(),
        role: 'user',
        content: prompt,
        timestamp: new Date(),
      });

      setStreaming(true);
      clearStreamingContent();

      const response = await fetch(
        `/api/v1/projects-ai/${projectId}/chat?message=${encodeURIComponent(prompt)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok || !response.body) {
        throw new Error('Gagal terhubung ke service streaming AI');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      let pending = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        pending += chunk;
        const lines = pending.split('\n');
        pending = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace(/^data:\s*/, '').trim();
            if (dataStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(dataStr);
              const textChunk =
                parsed.chunk || parsed.text || parsed.token || '';
              accumulatedText += textChunk;
              appendStreamingContent(textChunk);
            } catch {
              accumulatedText += dataStr;
              appendStreamingContent(dataStr);
            }
          }
        }
      }

      if (pending.startsWith('data: ')) {
        const data = pending.slice(6).trim();
        if (data && data !== '[DONE]') {
          try {
            const parsed = JSON.parse(data);
            const textChunk = parsed.chunk || parsed.text || '';
            accumulatedText += textChunk;
            appendStreamingContent(textChunk);
          } catch {
            /* incomplete SSE frame */
          }
        }
      }

      addMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: accumulatedText,
        timestamp: new Date(),
      });

      clearStreamingContent();
      setStreaming(false);
    },
    onError: (error: Error) => {
      setStreaming(false);
      clearStreamingContent();
      console.error('SSE Stream Error:', error);
    },
  });
};
