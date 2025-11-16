// src/types/types.ts
export interface Source {
  score: number;
  text: string;
  page: number;
}

export interface ChatResponse {
  answer: string;
  sources: Source[];
}
