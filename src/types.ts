export type RecipientType = 'Client' | 'Manager' | 'Colleague' | 'Team' | 'Other';
export type ToneType = 'Formal' | 'Professional' | 'Friendly' | 'Persuasive' | 'Apologetic';
export type LengthType = 'Short' | 'Medium' | 'Detailed';
export type Priority = 'High' | 'Medium' | 'Low';

export interface EmailFormInput {
  recipient: RecipientType;
  purpose: string;
  context: string;
  tone: ToneType;
  length: LengthType;
}

export interface EmailResult {
  subject: string;
  greeting: string;
  body: string;
  closing: string;
  full: string;
}

export interface ActionItem {
  task: string;
  responsible: string;
  deadline: string;
}

export interface MeetingSummary {
  summary: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: ActionItem[];
  deadlines: string[];
}

export interface TaskInput {
  id: string;
  name: string;
  deadline: string;
  duration: string;
  priority: Priority;
  notes: string;
}

export interface ScheduledItem {
  name: string;
  time: string;
  reason: string;
}

export interface TaskPlan {
  highPriority: string[];
  mediumPriority: string[];
  lowPriority: string[];
  schedule: ScheduledItem[];
  suggestions: string[];
}

export type ClientStatus = 'pending' | 'in_progress' | 'on_hold' | 'done';

export interface Client {
  id: string;
  name: string;
  service: string;
  status: ClientStatus;
  notes: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export type View = 'dashboard' | 'email' | 'meeting' | 'tasks' | 'queue';
