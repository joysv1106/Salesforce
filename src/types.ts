/**
 * AI-Powered Job Recruitment & Candidate Management System (AIRCMS)
 * Shared TypeScript Types & Interfaces
 */

export interface JobOpening {
  id: string;
  title: string;
  department: string;
  requiredSkills: string[];
  experienceYears: number;
  description: string;
  minSalary: number;
  maxSalary: number;
  vacancies: number;
  status: 'Draft' | 'Active' | 'On Hold' | 'Closed';
  createdAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  education: string;
  skills: string[];
  experienceYears: number;
  resumeText: string;
  summary: string;
  createdAt: string;
}

export interface JobApplication {
  id: string;
  candidateId: string;
  jobOpeningId: string;
  stage: 'Applied' | 'Screening' | 'Shortlisted' | 'Interview' | 'Selected' | 'Offer' | 'Hired' | 'Onboarding';
  appliedDate: string;
  aiScore: number | null; // 0-100
  aiPriority: 'High' | 'Medium' | 'Low' | null;
  aiSummary: string | null;
  aiFitAnalysis: string | null;
  aiRisks: string | null;
  notes: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  type: 'Technical' | 'Cultural' | 'Managerial' | 'HR';
  scheduledAt: string;
  interviewers: string[];
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  feedback: string;
  rating: number | null; // 1-5 stars
}

export interface Offer {
  id: string;
  applicationId: string;
  baseSalary: number;
  equity: string;
  bonus: number;
  startDate: string;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  approvedBy: string | null;
  approvalDate: string | null;
  offerLetterGenerated: boolean;
  notes: string;
}

export interface OnboardingTask {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string;
}

export interface Onboarding {
  id: string;
  applicationId: string;
  backgroundCheck: 'Pending' | 'Completed' | 'Failed';
  documentStatus: 'Sent' | 'Signed' | 'Incomplete';
  equipmentStatus: 'Ordered' | 'Shipped' | 'Delivered';
  orientationScheduled: boolean;
  completed: boolean;
  tasks: OnboardingTask[];
}

export interface WorkflowRule {
  id: string;
  name: string;
  triggerEvent: 'OnApplicationSubmit' | 'OnInterviewComplete' | 'OnOfferApprove';
  condition: string;
  action: string;
  isActive: boolean;
  description: string;
}

export type UserRole = 'Recruiter' | 'Hiring Manager' | 'Interviewer' | 'HR Admin';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}

export interface DashboardMetrics {
  totalJobOpenings: number;
  activeJobOpenings: number;
  totalApplications: number;
  applicationsByStage: Record<string, number>;
  averageAiScore: number;
  pendingApprovals: number;
  hiredThisMonth: number;
}
