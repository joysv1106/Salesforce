import { integer, pgTable, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const jobs = pgTable('jobs', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  department: text('department').notNull(),
  requiredSkills: jsonb('required_skills').$type<string[]>().notNull(),
  experienceYears: integer('experience_years').notNull(),
  description: text('description').notNull(),
  minSalary: integer('min_salary').notNull(),
  maxSalary: integer('max_salary').notNull(),
  vacancies: integer('vacancies').notNull(),
  status: text('status').notNull(),
  createdAt: text('created_at').notNull(),
});

export const candidates = pgTable('candidates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  education: text('education').notNull(),
  skills: jsonb('skills').$type<string[]>().notNull(),
  experienceYears: integer('experience_years').notNull(),
  resumeText: text('resume_text').notNull(),
  summary: text('summary').notNull(),
  createdAt: text('created_at').notNull(),
});

export const applications = pgTable('applications', {
  id: text('id').primaryKey(),
  candidateId: text('candidate_id').references(() => candidates.id).notNull(),
  jobOpeningId: text('job_opening_id').references(() => jobs.id).notNull(),
  stage: text('stage').notNull(),
  appliedDate: text('applied_date').notNull(),
  aiScore: integer('ai_score'),
  aiPriority: text('ai_priority'),
  aiSummary: text('ai_summary'),
  aiFitAnalysis: text('ai_fit_analysis'),
  aiRisks: text('ai_risks'),
  notes: text('notes').notNull(),
});

export const interviews = pgTable('interviews', {
  id: text('id').primaryKey(),
  applicationId: text('application_id').references(() => applications.id).notNull(),
  type: text('type').notNull(),
  scheduledAt: text('scheduled_at').notNull(),
  interviewers: jsonb('interviewers').$type<string[]>().notNull(),
  status: text('status').notNull(),
  feedback: text('feedback').notNull(),
  rating: integer('rating'),
});

export const offers = pgTable('offers', {
  id: text('id').primaryKey(),
  applicationId: text('application_id').references(() => applications.id).notNull(),
  baseSalary: integer('base_salary').notNull(),
  equity: text('equity').notNull(),
  bonus: integer('bonus').notNull(),
  startDate: text('start_date').notNull(),
  approvalStatus: text('approval_status').notNull(),
  approvedBy: text('approved_by'),
  approvalDate: text('approval_date'),
  offerLetterGenerated: boolean('offer_letter_generated').notNull().default(false),
  notes: text('notes').notNull(),
});

export const onboardings = pgTable('onboardings', {
  id: text('id').primaryKey(),
  applicationId: text('application_id').references(() => applications.id).notNull(),
  backgroundCheck: text('background_check').notNull(),
  documentStatus: text('document_status').notNull(),
  equipmentStatus: text('equipment_status').notNull(),
  orientationScheduled: boolean('orientation_scheduled').notNull().default(false),
  completed: boolean('completed').notNull().default(false),
  tasks: jsonb('tasks').notNull(), // holds OnboardingTask[]
});

export const workflows = pgTable('workflows', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  triggerEvent: text('trigger_event').notNull(),
  condition: text('condition').notNull(),
  action: text('action').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  description: text('description').notNull(),
});
