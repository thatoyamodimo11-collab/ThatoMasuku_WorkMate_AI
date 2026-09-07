import type { EmailFormInput, EmailResult, RecipientType, ToneType, LengthType } from '@/types';

const greetingMap: Record<RecipientType, string> = {
  Client: 'Dear [Recipient Name],',
  Manager: 'Dear [Manager Name],',
  Colleague: 'Hi [Colleague Name],',
  Team: 'Hi team,',
  Other: 'Hello,',
};

const closingMap: Record<ToneType, string> = {
  Formal: 'Respectfully,\n[Your Name]',
  Professional: 'Best regards,\n[Your Name]',
  Friendly: 'Best,\n[Your Name]',
  Persuasive: 'Looking forward to your response.\n\nBest regards,\n[Your Name]',
  Apologetic: 'Sincerely,\n[Your Name]',
};

const toneIntro: Record<ToneType, (purpose: string) => string> = {
  Formal: (p) => `I am writing to you regarding ${p.toLowerCase()}.`,
  Professional: (p) => `I am reaching out regarding ${p.toLowerCase()}.`,
  Friendly: (p) => `I wanted to touch base with you about ${p.toLowerCase()}.`,
  Persuasive: (p) => `I wanted to share some thoughts with you regarding ${p.toLowerCase()}, and I believe this is worth your attention.`,
  Apologetic: (p) => `I am writing to you regarding ${p.toLowerCase()}, and I want to begin by acknowledging that there have been some challenges that I take responsibility for.`,
};

function buildBody(input: EmailFormInput): string {
  const { purpose, context, tone, recipient, length } = input;
  const paragraphs: string[] = [];

  paragraphs.push(toneIntro[tone](purpose));

  if (context.trim()) {
    paragraphs.push(context.trim());
  }

  if (tone === 'Apologetic') {
    paragraphs.push(
      'I understand the impact this may have caused, and I want to assure you that I am taking the necessary steps to address the situation and prevent it from happening again.'
    );
  }

  if (tone === 'Persuasive') {
    paragraphs.push(
      'I believe moving forward with this would bring clear value, and I would be happy to discuss the details at your convenience.'
    );
  }

  if (recipient === 'Client') {
    paragraphs.push('Please let me know if you have any questions or need further clarification. I am happy to provide additional details.');
  } else if (recipient === 'Manager') {
    paragraphs.push('I would appreciate your guidance on this matter. Please let me know if you would like to discuss further.');
  } else if (recipient === 'Colleague' || recipient === 'Team') {
    paragraphs.push('Let me know your thoughts or if there is anything you would like to adjust.');
  } else {
    paragraphs.push('Please feel free to reach out if you have any questions.');
  }

  if (length === 'Short') {
    return paragraphs.slice(0, 2).join('\n\n');
  }
  if (length === 'Medium') {
    return paragraphs.slice(0, 3).join('\n\n');
  }
  return paragraphs.join('\n\n');
}

function buildSubject(input: EmailFormInput): string {
  const { purpose, tone } = input;
  const purposeClean = purpose.trim().replace(/[.!?]+$/, '');
  if (tone === 'Apologetic') return `Regarding ${purposeClean} — An Update`;
  if (tone === 'Persuasive') return `Proposal: ${purposeClean}`;
  return purposeClean;
}

export function generateEmail(input: EmailFormInput): EmailResult {
  const subject = buildSubject(input);
  const greeting = greetingMap[input.recipient];
  const body = buildBody(input);
  const closing = closingMap[input.tone];
  const full = `${greeting}\n\n${body}\n\n${closing}`;
  return { subject, greeting, body, closing, full };
}
