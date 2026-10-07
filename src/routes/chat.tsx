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
import { DeepScreenAiFaq } from "@/components/ds/DeepScreenAiFaq";
import { AI_CHAT_FAQS } from "@/lib/seo/ai-chat-faq";
import {
  buildBreadcrumbSchema,
  buildFAQSchema,
  buildGraph,
  buildOrganizationSchema,
  buildWebApplicationSchema,
  buildWebPageSchema,
  buildWebSiteSchema,
  jsonLd,
} from "@/lib/seo/json-ld";

const STORAGE_KEY = "deepscreen-chat-v1";
const transport = new DefaultChatTransport({ api: "/api/chat" });
const canonical = "https://deepscreen.online/chat";
const title = "DeepScreen AI Chatbot: Stock Research & Finance Q&A | DeepScreen";
const description =
  "Ask DeepScreen AI about 13,000+ stocks across NSE, BSE, NYSE, Nasdaq and LSE, fundamental ratios, ETFs, REITs, options and personal finance. Explore chatbot FAQs.";

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
    <section className="mx-auto flex h-[calc(100svh-132px)] min-h-[620px] max-w-5xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-4 flex items-start justify-between gap-4 border-b border-border pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-md border border-primary/30 text-primary" aria-hidden="true">
              <Activity className="size-5" />
            </span>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-foreground">DeepScreen AI Chatbot</h1>
              <p className="text-sm text-muted-foreground">Finance Q&amp;A, 13,000+ stocks and latest available market context</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a href="#chatbot-faq" className="text-xs font-medium text-primary hover:underline">
              FAQ
            </a>
            <Button type="button" variant="ghost" size="icon" onClick={reset} aria-label="New conversation" title="New conversation">
              <RefreshCw className="size-4" />
            </Button>
          </div>
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
  );
}

function DeepScreenChat() {
  const hydrated = useHydrated();

  return (
    <Shell>
      {hydrated ? (
        <DeepScreenChatSession initialMessages={readSavedMessages()} />
      ) : (
        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            DeepScreen AI chatbot for stock research and finance questions
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
            Ask about supported NSE, BSE, NYSE, Nasdaq and LSE stocks, ratios,
            company comparisons, investing basics and personal finance.
            The interactive chat loads in your browser; the public answers below
            are available without starting a conversation.
          </p>
        </section>
      )}
      <DeepScreenAiFaq />
    </Shell>
  );
}

export const Route = createFileRoute("/chat")({
  // The public FAQ and product explanations are SSR indexable. Individual
  // conversations remain browser-local UI state and never enter page metadata.
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      {
        name: "keywords",
        content:
          "DeepScreen AI chatbot, AI stock screener assistant, finance AI questions, stock analysis chatbot, fundamental analysis Q&A, DeepScreen AI FAQ",
      },
      { name: "robots", content: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: canonical },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "DeepScreen" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [
      { rel: "canonical", href: canonical },
      { rel: "describedby", href: "https://deepscreen.online/llms.txt" },
      { rel: "alternate", type: "text/plain", href: "https://deepscreen.online/faq-index.txt" },
      { rel: "help", href: "https://deepscreen.online/answers" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLd(
          buildGraph(
            buildOrganizationSchema(),
            buildWebSiteSchema(),
            {
              ...buildWebPageSchema({ name: title, description, url: canonical }),
              "@id": canonical + "#webpage",
              inLanguage: "en",
              about: { "@id": canonical + "#application" },
            },
            buildWebApplicationSchema({
              name: "DeepScreen AI Finance Assistant",
              url: canonical,
              description,
              featureList: [
                "Stock lookup across the five DeepScreen exchanges",
                "Latest available provider-backed quotes and ratios for supported companies",
                "Documented 13-factor stock analysis with risk context",
                "Education about funds, ETFs, REITs, options and personal finance",
                "Browser-stored chat with a new-conversation reset",
              ],
            }),
            buildBreadcrumbSchema([
              { name: "DeepScreen", url: "https://deepscreen.online/" },
              { name: "DeepScreen AI chatbot", url: canonical },
            ]),
            buildFAQSchema(
              AI_CHAT_FAQS.map(({ question, answer }) => ({ question, answer })),
            ),
          ),
        ),
      },
    ],
  }),
  component: DeepScreenChat,
});
