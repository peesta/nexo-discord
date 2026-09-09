'use client';
import { useEffect } from 'react';
import { api } from './chat';
type Tool = {
  name: string;
  title: string;
  description: string;
  inputSchema: object;
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
  execute: (input: any) => Promise<unknown>;
};
export function WorkspaceTools({ refresh }: { refresh: () => Promise<void> }) {
  useEffect(() => {
    const context = (
      document as Document & {
        modelContext?: {
          registerTool: (
            t: Tool,
            o: { signal: AbortSignal },
          ) => void | Promise<void>;
        };
      }
    ).modelContext;
    if (!context?.registerTool) return;
    const controller = new AbortController();
    const tools: Tool[] = [
      {
        name: 'read_nexo_workspace',
        title: 'Прочитать кабинет NEXO',
        description:
          'Read saved bot settings, feature proposals and actual integration status. Does not change anything.',
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true, untrustedContentHint: true },
        execute: async (input) => {
          if (input && Object.keys(input).length)
            throw new Error('No arguments expected');
          const data = await api('workspace');
          return {
            settings: data.settings,
            features: data.features,
            integrations: data.integrations,
          };
        },
      },
      {
        name: 'save_nexo_personality',
        title: 'Сохранить характер NEXO',
        description:
          'Save the system prompt in the NEXO workspace. This does not apply it to Discord; bot synchronization is a separate action.',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: { type: 'string', minLength: 1, maxLength: 8000 },
          },
          required: ['prompt'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: async (input) => {
          if (
            !input ||
            Object.keys(input).some((k) => k !== 'prompt') ||
            typeof input.prompt !== 'string' ||
            !input.prompt.trim() ||
            input.prompt.length > 8000
          )
            throw new Error(
              'Expected a non-empty prompt up to 8000 characters',
            );
          await api('settings', { prompt: input.prompt });
          await refresh();
          return { saved: true, appliedToDiscord: false };
        },
      },
    ];
    for (const tool of tools) {
      try {
        Promise.resolve(
          context.registerTool(tool, { signal: controller.signal }),
        ).catch(() => {});
      } catch {
        /* Optional browser capability. */
      }
    }
    return () => controller.abort();
  }, [refresh]);
  return null;
}
