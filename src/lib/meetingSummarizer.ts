import type { MeetingSummary, ActionItem } from '@/types';

interface ParsedLine {
  text: string;
  lower: string;
}

function splitSentences(notes: string): string[] {
  return notes
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function detectActionItem(line: string): ActionItem | null {
  const lower = line.toLowerCase();
  const actionWords = [
    'action item',
    'action:',
    'to do',
    'todo',
    'follow up',
    'will ',
    'to send',
    'to prepare',
    'to review',
    'to schedule',
    'to complete',
    'to finalize',
    'to draft',
    'to share',
    'to update',
    'needs to',
    'assigned to',
    'responsible:',
    'owner:',
  ];

  const isAction = actionWords.some((w) => lower.includes(w));
  if (!isAction) return null;

  let task = line
    .replace(/^[-*•\d.)\s]+/, '')
    .replace(/^(action item|action|to do|todo|follow up)[:\s]*/i, '')
    .replace(/^(will|needs to|to|assigned to|responsible|owner)[:\s]*/i, '')
    .trim();

  if (!task) return null;

  let responsible = 'Not specified';
  const byMatch = line.match(/\bby\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
  if (byMatch) {
    responsible = byMatch[1];
  }
  const assignMatch = line.match(/(?:assigned to|responsible:|owner:)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
  if (assignMatch) {
    responsible = assignMatch[1];
  }

  let deadline = 'Not specified';
  const deadlineMatch = line.match(/\b(by|before|due|deadline:?)\s+([A-Za-z]+ \d{1,2}(?:st|nd|rd|th)?(?:,? \d{4})?|[A-Za-z]+ \d{1,2}(?:st|nd|rd|th)?)/i);
  if (deadlineMatch) {
    deadline = deadlineMatch[2];
  }

  return { task, responsible, deadline };
}

function detectDeadline(line: string): string | null {
  const lower = line.toLowerCase();
  if (
    !lower.includes('deadline') &&
    !lower.includes('due ') &&
    !lower.includes('due:') &&
    !lower.includes('by ') &&
    !lower.includes('before ')
  ) {
    return null;
  }
  const match = line.match(
    /\b([A-Za-z]+ \d{1,2}(?:st|nd|rd|th)?(?:,? \d{4})?|[A-Za-z]+ \d{1,2}(?:st|nd|rd|th)?)\b/
  );
  return match ? match[1] : null;
}

function detectDecision(line: string): string | null {
  const lower = line.toLowerCase();
  const decisionMarkers = [
    'decided',
    'agreed',
    'we will',
    'approved',
    'concluded',
    'resolution',
    'finalized',
    'consensus',
  ];
  if (!decisionMarkers.some((m) => lower.includes(m))) return null;
  return line.replace(/^[-*•\d.)\s]+/, '').trim();
}

function detectKeyPoint(line: string): string | null {
  const lower = line.toLowerCase();
  if (
    lower.includes('action item') ||
    lower.startsWith('action:') ||
    lower.includes('decided') ||
    lower.includes('agreed that') ||
    lower.includes('approved') ||
    lower.includes('deadline')
  ) {
    return null;
  }
  return line.replace(/^[-*•\d.)\s]+/, '').trim();
}

export function summarizeMeeting(notes: string): MeetingSummary {
  const sentences = splitSentences(notes);
  const lines: ParsedLine[] = sentences.map((t) => ({ text: t, lower: t.toLowerCase() }));

  const actionItems: ActionItem[] = [];
  const decisions: string[] = [];
  const keyPoints: string[] = [];
  const deadlines: string[] = [];

  for (const line of lines) {
    const action = detectActionItem(line.text);
    if (action) {
      actionItems.push(action);
      continue;
    }
    const decision = detectDecision(line.text);
    if (decision) {
      decisions.push(decision);
      continue;
    }
    const deadline = detectDeadline(line.text);
    if (deadline) {
      deadlines.push(deadline);
    }
    const point = detectKeyPoint(line.text);
    if (point && point.length > 10) {
      keyPoints.push(point);
    }
  }

  const summary =
    sentences.length > 0
      ? `This meeting covered ${keyPoints.length} main topic${keyPoints.length !== 1 ? 's' : ''}, resulted in ${decisions.length} decision${decisions.length !== 1 ? 's' : ''}, and identified ${actionItems.length} action item${actionItems.length !== 1 ? 's' : ''} for follow-up.`
      : 'No meeting notes were provided.';

  return {
    summary,
    keyPoints: keyPoints.length > 0 ? keyPoints : ['Not specified.'],
    decisions: decisions.length > 0 ? decisions : ['Not specified.'],
    actionItems: actionItems.length > 0 ? actionItems : [],
    deadlines: deadlines.length > 0 ? [...new Set(deadlines)] : ['Not specified.'],
  };
}
