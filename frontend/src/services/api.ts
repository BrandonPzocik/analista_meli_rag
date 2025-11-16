// src/services/api.ts

import type { ChatResponse } from "../types/types";

const API_BASE = "http://localhost:8000";

export const askQuestion = async (
  query: string,
  sessionId: string
): Promise<ChatResponse> => {
  const response = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, session_id: sessionId }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
  }

  return response.json();
};
