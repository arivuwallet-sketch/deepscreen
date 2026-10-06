import { useChat } from "@ai-sdk/react";
import { createFileRoute, useHydrated } from "@tanstack/react-router";
import {
  DefaultChatTransport,
  getToolName,
  isToolUIPart,
  type UIMessage,
} from "ai";
import { Activity, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "@/components/ai-elements/tool";
import { Button } from "@/components/ui/button";
import { Shell } from "@/components/ds/Shell";

const STORAGE_KEY = "deepscreen-chat-v1";
const transport = new DefaultChatTransport({ api: "/api/chat" });
const title = "DeepScreen AI Finance Assistant";
const description = "Ask DeepScreen about stocks, funds, ETFs, REITs, personal finance, trading, options, IPOs, ratios, crypto and commodities.";

function readSavedMessages(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]") as unknown;
    return Array.isArray(parsed) ? (parsed as UIMessage[]) : [];
  } catch {
    return [];
  }
}

function DeepScreenChatSession({ initialMessages }: { initialMessages: UIMessage[] }) {
  const [draft, setDraft] = useState("");
  const draftRef = useRef("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { messages, setMessages, sendMessage, status, stop, error, clearError } = useChat({
    id: "deepscreen-browser-conversation",
    messages: initialMessages,
    transport,
    onError: (chatError) => toast.error(chatError.message || "DeepScreen could not answer that request."),
  });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (!busy) inputRef.current?.focus();
  }, [busy]);

  const suggestions = useMemo(
    () => [
      "Compare three steel growth stocks",
      "Explain ROCE versus ROE",
      "How should I build an emergency fund?",
    ],
    [],
  );

  const submit = async ({ text }: { text: string }) => {
    const value = text.trim() || draftRef.current.trim();
    if (!value || busy) return;
    clearError();
    setDraft("");
    try {
      await sendMessage({ text: value });
    } catch (sendError) {
      const message = sendError instanceof Error ? sendError.message : "DeepScreen could not send that question.";
      toast.error(message);
      throw sendError;
    }
  };

  const reset = () => {
    void stop();
    setMessages([]);
    setDraft("");
    draftRef.current = "";
    if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <Shell>
      <section className="mx-auto flex h-[calc(100svh-132px)] min-h-[620px] max-w-5xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-4 flex items-start justify-between gap-4 border-b border-border pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-md border border-primary/30 text-primary" aria-hidden="true">
              <Activity className="size-5" />
            </span>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-foreground">DeepScreen AI</h1>
              <p className="text-sm text-muted-foreground">Finance research with current DeepScreen market context</p>
            </div>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={reset} aria-label="New conversation" title="New conversation">
            <RefreshCw className="size-4" />
          </Button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border bg-panel/40">
          <Conversation className="min-h-0">
            <ConversationContent className="mx-auto w-full max-w-3xl gap-6 px-4 py-6 sm:px-6">
              {messages.length === 0 ? (
                <ConversationEmptyState
                  icon={<img src="/favicon.svg?v=20261002" alt="" className="size-12" />}
                  title="Ask DeepScreen"
                  description="Research an investment, compare peers, or understand any finance topic."
                >
                  <div className="mt-5 grid w-full max-w-xl gap-2 sm:grid-cols-3">
                    {suggestions.map((suggestion) => (
                      <Button key={suggestion} type="button" variant="outline" className="h-auto min-h-16 whitespace-normal px-3 py-3 text-left text-xs" onClick={() => void submit({ text: suggestion })}>
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </ConversationEmptyState>
              ) : (
                messages.map((message) => (
                  <Message key={message.id} from={message.role}>
                    <MessageContent>
                      {message.parts.map((part, index) => {
                        if (part.type === "text") {
                          return <MessageResponse key={`${message.id}-text-${index}`}>{part.text}</MessageResponse>;
                        }
                        if (part.type === "reasoning") {
                          return part.text ? (
                            <details key={`${message.id}-reasoning-${index}`} className="text-xs text-muted-foreground">
                              <summary className="cursor-pointer">Analysis</summary>
                              <p className="mt-2 whitespace-pre-wrap">{part.text}</p>
                            </details>
                          ) : null;
                        }
                        if (isToolUIPart(part)) {
                          const name = getToolName(part);
                          const output = part.state === "output-available" ? part.output : undefined;
                          const errorText = part.state === "output-error" ? part.errorText : undefined;
                          return (
                            <Tool key={part.toolCallId} defaultOpen={false}>
                              {part.type === "dynamic-tool" ? (
                                <ToolHeader type={part.type} toolName={name} state={part.state} title={name === "searchStocks" ? "Searching listed companies" : "Checking stock research"} />
                              ) : (
                                <ToolHeader type={part.type} state={part.state} title={name === "searchStocks" ? "Searching listed companies" : "Checking stock research"} />
                              )}
                              <ToolContent>
                                <ToolInput input={part.input} />
                                {part.state === "output-available" ? <ToolOutput output={output} errorText={undefined} /> : null}
                                {part.state === "output-error" ? <ToolOutput output={undefined} errorText={errorText} /> : null}
                              </ToolContent>
                            </Tool>
                          );
                        }
                        return null;
                      })}
                    </MessageContent>
                  </Message>
                ))
              )}
              {status === "submitted" ? <Shimmer className="text-sm">Reviewing your question…</Shimmer> : null}
              {error ? <p className="text-sm text-destructive">{error.message}</p> : null}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <div className="border-t border-border bg-background/70 p-3 sm:p-4">
            <PromptInput onSubmit={submit} className="mx-auto max-w-3xl bg-panel">
              <PromptInputTextarea ref={inputRef} value={draft} onChange={(event) => { draftRef.current = event.target.value; setDraft(event.target.value); }} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void submit({ text: draftRef.current }); } }} disabled={busy} autoFocus placeholder="Ask about a company, market, ratio, strategy, or personal-finance decision…" className="min-h-20" />
              <PromptInputFooter className="justify-between">
                <span className="text-[11px] text-muted-foreground">Research support, not personal investment advice.</span>
                <PromptInputSubmit status={status} onStop={() => void stop()} onClick={(event) => { if (!busy) { event.preventDefault(); void submit({ text: draftRef.current }); } }} />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>
      </section>
    </Shell>
  );
}

function DeepScreenChat() {
  const hydrated = useHydrated();
  if (!hydrated) return null;
  return <DeepScreenChatSession initialMessages={readSavedMessages()} />;
}

export const Route = createFileRoute("/chat")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DeepScreenChat,
});