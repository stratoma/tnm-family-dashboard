export type VercelRequest = {
  method?: string;
  query: Record<string, string | string[] | undefined>;
  body?: unknown;
};

export type VercelResponse = {
  status(code: number): VercelResponse;
  json(body: unknown): void;
  redirect(url: string): void;
  setHeader(name: string, value: string): void;
};
