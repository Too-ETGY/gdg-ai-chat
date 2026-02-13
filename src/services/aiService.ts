import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("GEMINI_API_KEY is not defined in environment variables");

const ai = new GoogleGenAI({ apiKey });
const model = "gemini-3.0-flash-preview";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type MessageInput = {
  senderRole: 'USER' | 'AGENT';
  content: string;
};

export type SummarizeResult = {
  summary: string;
  suggestedResponses: [string, string, string];
};

export type ResolutionAnalysis = {
  classification: string;
  summary: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/**
 * Format messages into a readable transcript string for AI prompts
 */
function formatTranscript(messages: MessageInput[]): string {
  return messages
    .map(m => `[${m.senderRole}]: ${m.content}`)
    .join('\n');
}

/**
 * Safely parse a JSON block from AI response text.
 * Strips markdown code fences if present.
 */
function parseJson<T>(text: string): T {
  const cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();
  return JSON.parse(cleaned) as T;
}

/**
 * Unwrap the text from a GenerateContentResponse, throwing if empty.
 */
function extractText(text: string | undefined, fnName: string): string {
  if (!text) throw new Error(`[AI] ${fnName}: empty response from model`);
  return text;
}

// ─────────────────────────────────────────────
// AI Functions
// ─────────────────────────────────────────────

/**
 * 1. Summarize one or more messages and suggest agent responses.
 *    Used in: POST /chat/:complaintId/summarize
 *
 *    When a single message is passed, the summary focuses on what the user
 *    is specifically asking in that message. When multiple messages are passed,
 *    the summary covers the broader conversation context.
 *
 * @param messages - One or more messages selected by the agent
 * @param category - The complaint category for context
 */
export async function summarizeMessages(
  messages: MessageInput[],
  category: string | null
): Promise<SummarizeResult> {
  const isSingle = messages.length === 1;
  const transcript = formatTranscript(messages);

  const prompt = `
You are a customer support AI assistant. An agent has selected ${isSingle ? 'a specific message from a user' : 'a set of messages from a conversation'} and needs help crafting a response.

Complaint category: ${category ?? 'UNKNOWN'}

${isSingle ? 'Selected message:' : 'Selected messages:'}
${transcript}

Analyze this and return ONLY a valid JSON object with this exact shape (no markdown, no explanation):
{
  "summary": "${isSingle
    ? 'a concise one-sentence summary of what the user is asking or reporting in this message'
    : 'a concise summary of what the customer issue is and what has been discussed across these messages'
  }",
  "suggestedResponses": [
    "<response option 1: direct and solution-focused>",
    "<response option 2: empathetic and reassuring tone>",
    "<response option 3: asks a clarifying question to gather more information>"
  ]
}
`.trim();

  const result = await ai.models.generateContent({ model, contents: prompt });
  const text = extractText(result.text, 'summarizeMessages');

  return parseJson<SummarizeResult>(text);
}

/**
 * 2. Analyze a resolved complaint — produce classification, summary, and sentiment.
 *    Used in: PATCH /complaints/:id/resolve  AND  autoResolveOldComplaints()
 *
 * @param messages - All messages in the complaint
 * @param category - The complaint category
 * @param resolvedBy - 'USER' for user-initiated resolve, 'SYSTEM' for auto-resolve
 */
export async function analyzeResolution(
  messages: MessageInput[],
  category: string | null,
  resolvedBy: 'USER' | 'SYSTEM'
): Promise<ResolutionAnalysis> {
  const transcript = messages.length > 0
    ? formatTranscript(messages)
    : '(No messages in this complaint)';

  const prompt = `
You are a customer support quality analyst. A complaint has been ${resolvedBy === 'USER' ? 'resolved by the user' : 'auto-resolved by the system after 24 hours of inactivity'}.

Complaint category: ${category ?? 'UNKNOWN'}

Conversation transcript:
${transcript}

Analyze this and return ONLY a valid JSON object with this exact shape (no markdown, no explanation):
{
  "summary": "<a full narrative summary of the entire conversation in chronological order. Write it as a flowing paragraph, covering every meaningful point that was discussed — what the user complained about, what the agent asked or did, any back-and-forth, and how it concluded. Write in third person, past tense. Example style: 'User complained they had paid but had not received their item. Agent asked for details. User clarified it was a payment for item X and had waited over an hour. Agent said he would escalate to the payment team and advised the user to wait. User later confirmed the issue was resolved and thanked the agent.'>",
  "classification": "<a single sentence that states the complaint category and describes the specific issue. Format: '[CATEGORY] issue, [what actually happened]'. Examples: 'A PAYMENT issue, user did not receive the item they had already paid for.', 'Not an ACCOUNT issue, the user real number is different in the data due to a BUG issue.', 'An OTHER issue, user could not find the profile menu.'>",
  "sentiment": "<one of: POSITIVE, NEUTRAL, NEGATIVE — reflecting the overall customer experience>"
}

For sentiment:
- POSITIVE: customer's issue was resolved satisfactorily or they expressed satisfaction
- NEUTRAL: complaint was closed without a clearly positive or negative outcome
- NEGATIVE: issue was not resolved, customer was unhappy, or complaint timed out with no engagement
`.trim();

  const result = await ai.models.generateContent({ model, contents: prompt });
  const text = extractText(result.text, 'analyzeResolution');

  return parseJson<ResolutionAnalysis>(text);
}