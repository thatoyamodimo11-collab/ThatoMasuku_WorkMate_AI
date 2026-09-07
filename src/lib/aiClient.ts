export interface AIResponse {
  content: string;
}

export interface AIError {
  error: string;
}

export async function callAI(
  systemPrompt: string,
  userPrompt: string,
  responseFormat: "text" | "json" = "text"
): Promise<string> {
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-generate`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (anonKey) {
    headers["Authorization"] = `Bearer ${anonKey}`;
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({ systemPrompt, userPrompt, responseFormat }),
  });

  if (!response.ok) {
    let message = `AI request failed (${response.status})`;
    try {
      const body = (await response.json()) as AIError;
      if (body.error) message = body.error;
    } catch {
      // response body wasn't JSON, use generic message
    }
    throw new Error(message);
  }

  const data = (await response.json()) as AIResponse;
  if (!data.content) {
    throw new Error("AI service returned an empty response. Please try again.");
  }

  return data.content;
}
