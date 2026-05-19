export interface StreamEventShape {
  content?: string;
  error?: string;
  event?: string;
  type?: string;
  payload?: Record<string, unknown>;
}

export function resolveEventType(
  transportEvent: string | undefined,
  parsed: StreamEventShape,
): string {
  if (!transportEvent || transportEvent === "message") {
    if (typeof parsed.event === "string" && parsed.event.trim()) {
      return parsed.event;
    }
    if (typeof parsed.type === "string" && parsed.type.trim()) {
      return parsed.type;
    }
    const payloadEvent = parsed.payload?.event;
    if (typeof payloadEvent === "string" && payloadEvent.trim()) {
      return payloadEvent;
    }
    const payloadType = parsed.payload?.type;
    if (typeof payloadType === "string" && payloadType.trim()) {
      return payloadType;
    }
    return "message";
  }

  return transportEvent;
}

export function extractContent(parsed: StreamEventShape): string {
  if (typeof parsed.content === "string") {
    return parsed.content;
  }

  const payload = parsed.payload;
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const payloadText = payload.text;
  if (typeof payloadText === "string") {
    return payloadText;
  }

  const payloadContent = payload.content;
  if (typeof payloadContent === "string") {
    return payloadContent;
  }

  return "";
}

export function extractError(parsed: StreamEventShape): string | undefined {
  if (typeof parsed.error === "string" && parsed.error.trim()) {
    return parsed.error;
  }

  const payloadError = parsed.payload?.error;
  if (typeof payloadError === "string" && payloadError.trim()) {
    return payloadError;
  }

  return undefined;
}
