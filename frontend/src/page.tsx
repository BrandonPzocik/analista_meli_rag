"use client";

import type React from "react";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Source } from "./types/types";
import { askQuestion } from "./services/api";

interface Message {
  query?: string;
  answer?: string;
  sources?: Source[];
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() =>
    Math.random().toString(36).substring(2, 9)
  );
  const [expandedSources, setExpandedSources] = useState<{
    [messageIndex: number]: { [page: number]: boolean };
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { query: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const data = await askQuestion(input, sessionId);
      setMessages((prev) => [...prev, data]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          answer:
            "Hubo un error al conectar con el backend. Asegúrate de que el servidor esté corriendo.",
          sources: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setInput("");
    setExpandedSources({});
  };

  const groupSourcesByPage = (sources: Source[]) => {
    const grouped: { [page: number]: Source[] } = {};
    sources.forEach((source) => {
      if (!grouped[source.page]) {
        grouped[source.page] = [];
      }
      grouped[source.page].push(source);
    });
    return grouped;
  };

  const toggleSource = (messageIndex: number, page: number) => {
    setExpandedSources((prev) => ({
      ...prev,
      [messageIndex]: {
        ...prev[messageIndex],
        [page]: !prev[messageIndex]?.[page],
      },
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-yellow-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-[#FFE600] shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="bg-white px-3 py-2 rounded-md shadow-sm">
                  <span className="text-2xl font-black text-[#333]">
                    Mercado
                  </span>
                  <span className="text-2xl font-black text-[#333]">Libre</span>
                </div>
              </div>
              <div className="h-8 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Analyst Assistant
                </h1>
                <p className="text-xs text-gray-700">
                  Asistente RAG para reportes financieros
                </p>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white/60 rounded-md transition-colors"
            >
              Nueva conversación
            </button>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px] flex flex-col">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-[#3483FA]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  ¿Qué querés saber sobre MercadoLibre?
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Hacé preguntas sobre el reporte financiero y obtené respuestas
                  precisas
                </p>
                <div className="max-w-md mx-auto space-y-2 text-left">
                  <div className="text-xs text-gray-500 font-medium mb-1">
                    Ejemplos:
                  </div>
                  <div className="text-xs text-[#3483FA] bg-blue-50 rounded px-3 py-2">
                    💰 ¿Cuáles fueron los ingresos del segmento FinTech?
                  </div>
                  <div className="text-xs text-[#3483FA] bg-blue-50 rounded px-3 py-2">
                    📊¿Cuál fue el efectivo y equivalentes de efectivo al final
                    del período?
                  </div>
                  <div className="text-xs text-[#3483FA] bg-blue-50 rounded px-3 py-2">
                    🌎 ¿Cuáles fueron los ingresos de Argentina en el periodo de
                    2025?
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className="animate-fade-in">
                  {msg.query ? (
                    // User Message
                    <div className="flex justify-end mb-4">
                      <div className="max-w-[75%] bg-[#3483FA] text-white rounded-lg px-4 py-3 shadow-sm">
                        <p className="text-sm leading-relaxed">{msg.query}</p>
                      </div>
                    </div>
                  ) : (
                    // AI Response
                    <div className="mb-4">
                      <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200">
                          <svg
                            className="w-5 h-5 text-gray-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                            <div className="prose prose-sm max-w-none">
                              <ReactMarkdown
                                components={{
                                  table: ({ node, ...props }) => (
                                    <div className="my-5 overflow-x-auto rounded-lg shadow-sm">
                                      <table
                                        className="w-full border-collapse text-sm"
                                        {...props}
                                      />
                                    </div>
                                  ),
                                  thead: ({ node, ...props }) => (
                                    <thead
                                      className="bg-[#3483FA]"
                                      {...props}
                                    />
                                  ),
                                  th: ({ node, ...props }) => (
                                    <th
                                      className="border border-[#2968C8] px-4 py-3.5 text-left font-semibold text-white uppercase text-xs tracking-wide"
                                      {...props}
                                    />
                                  ),
                                  tbody: ({ node, ...props }) => (
                                    <tbody {...props} />
                                  ),
                                  tr: ({ node, ...props }) => (
                                    <tr
                                      className="transition-colors hover:bg-yellow-50 even:bg-gray-50"
                                      {...props}
                                    />
                                  ),
                                  td: ({ node, ...props }) => (
                                    <td
                                      className="border border-gray-200 px-4 py-3 text-gray-700"
                                      {...props}
                                    />
                                  ),
                                }}
                              >
                                {msg.answer || ""}
                              </ReactMarkdown>
                            </div>
                            {msg.sources && msg.sources.length > 0 && (
                              <div className="mt-4 pt-3 border-t border-gray-200">
                                <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                                  <svg
                                    className="w-3 h-3 text-[#3483FA]"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Fuentes consultadas:
                                </p>
                                <div className="space-y-2">
                                  {Object.entries(
                                    groupSourcesByPage(msg.sources)
                                  ).map(([pageStr, pageSources]) => {
                                    const page = Number(pageStr);
                                    const isExpanded =
                                      expandedSources[i]?.[page];
                                    const sourceCount = pageSources.length;

                                    return (
                                      <div
                                        key={page}
                                        className="border border-gray-200 rounded-lg overflow-hidden"
                                      >
                                        <button
                                          onClick={() => toggleSource(i, page)}
                                          className="w-full flex items-center justify-between px-3 py-2 bg-white hover:bg-blue-50 transition-colors text-left"
                                        >
                                          <div className="flex items-center gap-2">
                                            <svg
                                              className="w-3 h-3 text-[#3483FA]"
                                              fill="currentColor"
                                              viewBox="0 0 20 20"
                                            >
                                              <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                                              <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                                            </svg>
                                            <span className="font-medium text-gray-800 text-xs">
                                              Pág. {page}
                                            </span>
                                            {sourceCount > 1 && (
                                              <span className="text-xs text-gray-500">
                                                ({sourceCount} citas)
                                              </span>
                                            )}
                                          </div>
                                          <svg
                                            className={`w-4 h-4 text-gray-500 transition-transform ${
                                              isExpanded ? "rotate-180" : ""
                                            }`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M19 9l-7 7-7-7"
                                            />
                                          </svg>
                                        </button>
                                        {isExpanded && (
                                          <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 space-y-2">
                                            {pageSources.map((source, idx) => (
                                              <div
                                                key={idx}
                                                className="text-xs text-gray-700 italic border-l-2 border-[#3483FA] pl-2"
                                              >
                                                "{source.text}"
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            {loading && (
              <div className="mb-4 animate-fade-in">
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200">
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                      <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                    </svg>
                  </div>
                  <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="flex gap-1">
                        <div
                          className="w-2 h-2 bg-[#3483FA] rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-[#3483FA] rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-[#3483FA] rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                      <span className="text-sm">Analizando documento...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribí tu pregunta aquí..."
                disabled={loading}
                className="flex-1 px-4 py-3 bg-white border-2 border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#3483FA] disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors text-sm"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 py-3 bg-[#3483FA] hover:bg-[#2968C8] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-md transition-colors shadow-sm text-sm"
              >
                Enviar
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Presioná Enter para enviar tu pregunta
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
