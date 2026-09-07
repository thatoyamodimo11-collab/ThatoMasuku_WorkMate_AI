import type { EmailFormInput, TaskInput } from '@/types';

export const demoEmail: EmailFormInput = {
  recipient: 'Client',
  purpose: 'Project timeline update for Q3 redesign',
  context:
    'The design phase is complete and we are moving into development next week. The first milestone deliverable will be the homepage wireframes, due Friday. I wanted to keep you informed of our progress and next steps.',
  tone: 'Professional',
  length: 'Medium',
};

export const demoMeetingNotes = `Meeting: Product Launch Planning
Date: September 3, 2026
Attendees: Sarah, Mike, Jennifer, David

Sarah opened the meeting by reviewing the current project status. The team discussed the launch timeline and agreed that the beta release should happen before the end of September.

Mike presented the marketing strategy. The team discussed targeting and agreed that social media campaigns will start two weeks before launch.

Jennifer raised concerns about the testing schedule. It was decided that QA testing will begin September 20 and must be completed by September 27.

David will prepare the launch checklist by September 10.
Sarah will send the updated project timeline to the client by September 5.
Mike to schedule a social media strategy review meeting for next week.
Jennifer assigned to coordinate with the QA team for testing resources.

Deadline: Beta release by September 28.
Deadline: Final launch presentation due October 5.`;

export const demoTasks: TaskInput[] = [
  { id: '1', name: 'Finalize Q3 budget report', deadline: '2026-09-08', duration: '02:00', priority: 'High', notes: 'Needs approval from CFO before submission' },
  { id: '2', name: 'Review team pull requests', deadline: '2026-09-07', duration: '01:00', priority: 'Medium', notes: 'Three PRs pending review' },
  { id: '3', name: 'Prepare client presentation slides', deadline: '2026-09-10', duration: '03:00', priority: 'High', notes: 'Quarterly review meeting' },
  { id: '4', name: 'Update internal documentation', deadline: '', duration: '01:30', priority: 'Low', notes: '' },
  { id: '5', name: 'Schedule onboarding for new hire', deadline: '2026-09-09', duration: '00:30', priority: 'Medium', notes: 'Coordinate with HR' },
];
