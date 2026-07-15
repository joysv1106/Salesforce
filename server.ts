import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = typeof import.meta !== 'undefined' && import.meta.url
  ? fileURLToPath(import.meta.url)
  : '';
const __dirname = __filename ? path.dirname(__filename) : '';

const app = express();
const PORT = 3000;

app.use(express.json());

// -------------------------------------------------------------
// AI CLIENT INITIALIZATION
// -------------------------------------------------------------
function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'MY_GEMINI_API_KEY') {
    console.warn('WARNING: GEMINI_API_KEY environment variable is not set. AI evaluation and chat helper will run in mock fallback mode.');
    return null;
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// -------------------------------------------------------------
// DATABASE SETUP & SEEDING (Local JSON File Storage)
// -------------------------------------------------------------
const DB_FILE = path.join(process.cwd(), 'data', 'recruitment_db.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
}

// Helper structures matching types.ts
import { 
  JobOpening, 
  Candidate, 
  JobApplication, 
  Interview, 
  Offer, 
  Onboarding, 
  WorkflowRule,
  DashboardMetrics
} from './src/types.js';

interface DatabaseSchema {
  jobs: JobOpening[];
  candidates: Candidate[];
  applications: JobApplication[];
  interviews: Interview[];
  offers: Offer[];
  onboarding: Onboarding[];
  workflows: WorkflowRule[];
}

const DEFAULT_JOBS: JobOpening[] = [
  {
    id: 'job-1',
    title: 'Senior React & Tailwind Developer',
    department: 'Engineering',
    requiredSkills: ['React', 'Tailwind CSS', 'TypeScript', 'State Management', 'Vite'],
    experienceYears: 5,
    description: 'We are seeking a senior frontend developer specializing in highly visual, modular React architectures styled with utility-first Tailwind CSS. Experience designing crisp layouts, custom animations, and complex client side dashboards is crucial.',
    minSalary: 120000,
    maxSalary: 155000,
    vacancies: 2,
    status: 'Active',
    createdAt: '2026-07-01T08:00:00Z'
  },
  {
    id: 'job-2',
    title: 'Lead Salesforce Solutions Architect',
    department: 'Information Technology',
    requiredSkills: ['Apex', 'Lightning Web Components', 'Salesforce Flows', 'Apex Triggers', 'Integration'],
    experienceYears: 8,
    description: 'Looking for a Lead Architect to direct our Salesforce Lightning Cloud migration. Responsibilities include designing automated enterprise-wide workflows (Flows), custom LWCs, integrations, and security controls.',
    minSalary: 160000,
    maxSalary: 195000,
    vacancies: 1,
    status: 'Active',
    createdAt: '2026-07-02T09:30:00Z'
  },
  {
    id: 'job-3',
    title: 'AI Technical Product Manager',
    department: 'Product Management',
    requiredSkills: ['AI/ML', 'Generative AI', 'Product Strategy', 'LLM Prompting', 'Agile Methodology'],
    experienceYears: 4,
    description: 'Drive the product lifecycle of our next-gen agentic systems. Work closely with Engineering and design teams to implement Agentforce AI tools that streamline workflow automation and decision-making intelligence.',
    minSalary: 135000,
    maxSalary: 170000,
    vacancies: 1,
    status: 'Active',
    createdAt: '2026-07-04T10:15:00Z'
  },
  {
    id: 'job-4',
    title: 'Talent Acquisition & HR Specialist',
    department: 'Human Resources',
    requiredSkills: ['Technical Recruiting', 'ATS Management', 'Sourcing', 'Interviewing', 'Onboarding'],
    experienceYears: 3,
    description: 'We need an energetic Tech Recruiter to manage full-cycle recruiting. You will source candidates, run screens, coordinate interviews, generate salary offers, and direct our employee onboarding processes.',
    minSalary: 75000,
    maxSalary: 95000,
    vacancies: 1,
    status: 'Active',
    createdAt: '2026-07-05T14:20:00Z'
  }
];

const DEFAULT_CANDIDATES: Candidate[] = [
  {
    id: 'cand-1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    phone: '+1 (555) 345-6789',
    education: 'BS in Computer Science, Georgia Tech',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Redux', 'Node.js', 'Vite', 'HTML5/CSS3'],
    experienceYears: 6,
    resumeText: 'Professional Summary:\nDedicated Senior Frontend Engineer with 6 years of expertise building highly responsive and modern single page applications. Proficient in React, TypeScript, and crafting utility-first styles with Tailwind CSS. Led three developer squads to ship bento-style user consoles.\n\nWork Experience:\n- Lead React Developer at WebFlow Solutions (2023 - Present): Managed responsive layout transitions using framer-motion and streamlined web assets.\n- Frontend Developer at TechVibe Corp (2020 - 2023): Refactored legacy CSS into modular Tailwind, improving performance by 40%.\n\nSkills:\nReact, Tailwind CSS, TypeScript, Vite, Webpack, Responsive Design, State Management.',
    summary: 'Senior Frontend Engineer with strong expertise in React, Tailwind, and dashboard architectures. Proven track record of team leadership.',
    createdAt: '2026-07-10T10:00:00Z'
  },
  {
    id: 'cand-2',
    name: 'Marcus Chen',
    email: 'marcus.chen@example.com',
    phone: '+1 (555) 987-6543',
    education: 'MS in Information Systems, Stanford University',
    skills: ['Apex', 'Lightning Web Components', 'Salesforce Flows', 'Salesforce Admin', 'Integration', 'Apex Triggers'],
    experienceYears: 9,
    resumeText: 'Professional Summary:\nCertified Salesforce System and Application Architect with 9 years of hands-on experience in enterprise CRM development. Expert in developing robust Apex, custom LWC components, and complex Salesforce Flows. Highly skilled in secure database integration and design governance.\n\nCertifications:\n- Salesforce Certified System Architect\n- Salesforce Certified Application Architect\n- Certified Platform Developer II\n\nExperience:\n- Enterprise Salesforce Lead at CloudGiant Inc (2021 - Present): Designed workflow solutions serving 15,000 corporate agents, replacing custom code with native Salesforce Flows.\n- Senior Apex/LWC Developer at CRM Experts (2017 - 2021): Configured complex custom triggers and REST endpoints.',
    summary: 'Elite Salesforce Architect holding dual System & Application certifications. Deep expertise in LWC, Apex, and Declarative Salesforce Flows.',
    createdAt: '2026-07-11T11:20:00Z'
  },
  {
    id: 'cand-3',
    name: 'Elena Rostova',
    email: 'elena.r@example.com',
    phone: '+1 (555) 456-1122',
    education: 'MBA & BS in Computer Science, Carnegie Mellon',
    skills: ['AI/ML', 'Generative AI', 'Product Strategy', 'LLM Prompting', 'Agile Methodology', 'Product Management'],
    experienceYears: 5,
    resumeText: 'Summary:\nTechnical Product Manager with 5 years experience launching intelligence products. Expert in translating LLM capabilities into enterprise tools. Led cross-functional teams using Agile scrum methodologies.\n\nExperience:\n- AI Product Lead at Cortex Labs (2023 - Present): Formulated product spec for Agent-based automated customer service assistants using LLM integrations.\n- PM at BrainWave AI (2021 - 2023): Designed customizable semantic search queries and analytics dashboard.',
    summary: 'High-caliber technical AI Product Manager with dual CS & Business backgrounds. Highly skilled in LLMs, Prompt Engineering, and Agile delivery.',
    createdAt: '2026-07-12T09:15:00Z'
  },
  {
    id: 'cand-4',
    name: 'David Kim',
    email: 'david.kim@example.com',
    phone: '+1 (555) 789-3344',
    education: 'Fullstack Software Bootcamp Graduate',
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Node.js', 'Git'],
    experienceYears: 1,
    resumeText: 'Summary:\nEnthusiastic and motivated Software Developer looking to kickstart a frontend career. Graduate of an intensive 24-week fullstack engineering coding program. Experienced with React basics, Javascript, HTML, and basic stylesheets.\n\nProjects:\n- MyRecipeApp: Simple responsive recipe search using React and custom state.\n- TodoList: Local storage todo tracking with dark/light theme options.',
    summary: 'Junior level frontend developer. bootcamp graduate with great enthusiasm but lacking professional, commercial experience with large codebases.',
    createdAt: '2026-07-13T15:00:00Z'
  },
  {
    id: 'cand-5',
    name: 'Rachel Green',
    email: 'rachel.g@example.com',
    phone: '+1 (555) 888-9999',
    education: 'BS in Human Resources, Cornell University',
    skills: ['Technical Recruiting', 'ATS Management', 'Sourcing', 'Interviewing', 'Onboarding', 'HR Compliance'],
    experienceYears: 4,
    resumeText: 'Professional Summary:\nTech recruiter with 4 years of comprehensive experience filling specialized roles. Experienced in ATS tools (Workday, Greenhouse), employer branding, sourcing campaigns, and directing employee onboarding checklists.\n\nExperience:\n- Technical Recruiter at TalentFlow Partners (2022 - Present): Successfully sourced and filled 45+ software and product roles.\n- HR Associate at Apex Retail (2020 - 2022): Coordinated onboarding and benefit enrollments.',
    summary: 'Experienced Full-Cycle Tech Recruiter with deep HR credentials and experience in high-volume sourcing and structured onboarding.',
    createdAt: '2026-07-09T14:00:00Z'
  }
];

const DEFAULT_APPLICATIONS: JobApplication[] = [
  {
    id: 'app-1',
    candidateId: 'cand-1',
    jobOpeningId: 'job-1',
    stage: 'Interview',
    appliedDate: '2026-07-10T10:15:00Z',
    aiScore: 92,
    aiPriority: 'High',
    aiSummary: 'Sarah Jenkins is an exceptional fit for the Senior React role. Her 6 years of experience, combined with deep technical capability in React and Tailwind CSS, aligns perfectly with the job specifications. Her resume highlights substantial team leadership and UI redesign success.',
    aiFitAnalysis: 'Skills Matching: React (100%), Tailwind CSS (100%), TypeScript (100%), Vite (100%), State Management (100%). Years of experience (6) exceeds minimum requirement (5). Highly relevant background.',
    aiRisks: 'Low risk. No major gaps identified. Has primarily focused on client-side engineering, might need minor orientation if backend support is requested.',
    notes: 'Recruiter review complete. Scheduled Technical Panel interview.'
  },
  {
    id: 'app-2',
    candidateId: 'cand-2',
    jobOpeningId: 'job-2',
    stage: 'Offer',
    appliedDate: '2026-07-11T12:00:00Z',
    aiScore: 97,
    aiPriority: 'High',
    aiSummary: 'Marcus Chen is an outstanding candidate for Lead Salesforce Solutions Architect. He holds dual Salesforce Architect certifications and has extensive experience replacing heavy custom Apex code with modern native Salesforce Flows, which is our core migration objective.',
    aiFitAnalysis: 'Skills matching is exceptional. Demonstrates solid alignment in Apex, LWCs, secure databases, integrations, and CRM governance. Experience is 9 years (requirement: 8).',
    aiRisks: 'Extremely high matching candidate, likely has other competing offers. Speed of negotiation is highly critical.',
    notes: 'Both technical and manager interview results were flawless. Offer generation initiated.'
  },
  {
    id: 'app-3',
    candidateId: 'cand-3',
    jobOpeningId: 'job-3',
    stage: 'Screening',
    appliedDate: '2026-07-12T10:00:00Z',
    aiScore: 88,
    aiPriority: 'High',
    aiSummary: 'Elena Rostova offers solid product credentials, having launched LLM agents at tech startups. Her combination of an MBA and Computer Science degree is highly suitable for directing technical AI product lifecycles.',
    aiFitAnalysis: 'Strong skills in AI/ML, LLM Prompting, Product Strategy, and Agile delivery. Meets experience minimum (5 years versus 4 years required).',
    aiRisks: 'Candidate might have spent short durations in early startups; suggest reviewing employment stability in the verbal screen.',
    notes: 'Moved to screening. AI evaluation complete.'
  },
  {
    id: 'app-4',
    candidateId: 'cand-4',
    jobOpeningId: 'job-1',
    stage: 'Applied',
    appliedDate: '2026-07-13T15:30:00Z',
    aiScore: 42,
    aiPriority: 'Low',
    aiSummary: 'David Kim lacks the professional experience requested for this senior role. He has 1 year of personal/bootcamp project experience compared to the 5 years required.',
    aiFitAnalysis: 'Knows React and basic CSS, but has no commercial exposure. Tailwind CSS is not explicitly detailed in work experience.',
    aiRisks: 'Highly risky for a Senior role due to limited experience. Better suited for junior level entry or associate positions.',
    notes: 'Applied through external career site.'
  },
  {
    id: 'app-5',
    candidateId: 'cand-5',
    jobOpeningId: 'job-4',
    stage: 'Onboarding',
    appliedDate: '2026-07-09T14:30:00Z',
    aiScore: 90,
    aiPriority: 'High',
    aiSummary: 'Rachel Green is a perfect fit for the Tech Recruiter role. Her 4 years of experience and specialized background in sourcing tech talent aligns cleanly with our HR roadmap.',
    aiFitAnalysis: 'Excellent fit in Technical Recruiting, ATS Management, and Interview scheduling. Meets educational background (BS in Human Resources).',
    aiRisks: 'None significant. Ready for rapid onboarding.',
    notes: 'Offer approved and accepted. Moved candidate to Onboarding status.'
  }
];

const DEFAULT_INTERVIEWS: Interview[] = [
  {
    id: 'int-1',
    applicationId: 'app-1',
    type: 'Technical',
    scheduledAt: '2026-07-18T14:00:00Z',
    interviewers: ['John Davis (Lead UI Tech)', 'Linus Torvalds (Fellow)'],
    status: 'Scheduled',
    feedback: '',
    rating: null
  },
  {
    id: 'int-2',
    applicationId: 'app-2',
    type: 'Technical',
    scheduledAt: '2026-07-13T10:00:00Z',
    interviewers: ['Marc Benioff (SVP Eng)', 'Sarah Admin (Salesforce Lead)'],
    status: 'Completed',
    feedback: 'Marcus displayed flawless competence in CRM patterns, enterprise Flow overrides, and Apex optimization. He explained LWC event propagation flawlessly.',
    rating: 5
  },
  {
    id: 'int-3',
    applicationId: 'app-2',
    type: 'Managerial',
    scheduledAt: '2026-07-14T11:00:00Z',
    interviewers: ['Sundar Pichai (Hiring Manager)'],
    status: 'Completed',
    feedback: 'Incredible system vision. Very strong alignment on core metrics, architecture standardizations, and automation security. Highly recommended to hire.',
    rating: 5
  }
];

const DEFAULT_OFFERS: Offer[] = [
  {
    id: 'off-1',
    applicationId: 'app-2',
    baseSalary: 175000,
    equity: '15,000 RSUs (4-yr vest)',
    bonus: 20000,
    startDate: '2026-09-01',
    approvalStatus: 'Pending',
    approvedBy: null,
    approvalDate: null,
    offerLetterGenerated: true,
    notes: 'Offered high-end range due to strong interview outcome and architectural certification requirements.'
  }
];

const DEFAULT_ONBOARDINGS: Onboarding[] = [
  {
    id: 'onb-1',
    applicationId: 'app-5',
    backgroundCheck: 'Completed',
    documentStatus: 'Signed',
    equipmentStatus: 'Shipped',
    orientationScheduled: true,
    completed: false,
    tasks: [
      { id: 'task-1', title: 'Submit signed employment agreement', completed: true, dueDate: '2026-07-12' },
      { id: 'task-2', title: 'Fill out federal and state tax withholding (W-4 / I-9)', completed: true, dueDate: '2026-07-14' },
      { id: 'task-3', title: 'Complete compliance and security code course', completed: false, dueDate: '2026-07-20' },
      { id: 'task-4', title: 'Setup work laptop and enterprise single-sign-on credentials', completed: false, dueDate: '2026-07-16' }
    ]
  }
];

const DEFAULT_WORKFLOWS: WorkflowRule[] = [
  {
    id: 'flow-1',
    name: 'Auto-Screen Candidates on Submit',
    triggerEvent: 'OnApplicationSubmit',
    condition: 'Skills match >= 1',
    action: 'Move to Screening Stage',
    isActive: true,
    description: 'When an application is submitted, if the candidate shares any skills with the job opening, automatically advance them to the Screening stage.'
  },
  {
    id: 'flow-2',
    name: 'Auto-Promote High AI Scores',
    triggerEvent: 'OnApplicationSubmit',
    condition: 'AI Fit Score >= 85',
    action: 'Promote to Shortlisted',
    isActive: true,
    description: 'When an AI evaluation completes with a score of 85 or above, automatically promote the candidate application stage to Shortlisted.'
  },
  {
    id: 'flow-3',
    name: 'Onboarding Checklist Blueprint',
    triggerEvent: 'OnOfferApprove',
    condition: 'Stage set to Hired',
    action: 'Generate Onboarding Checklist',
    isActive: true,
    description: 'Once an offer is accepted and candidate stage is set to Hired or Onboarding, automatically provision a custom Onboarding record.'
  }
];

function readDB(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to read database, resetting with seeds', error);
  }
  
  // Seed database
  const defaultDB: DatabaseSchema = {
    jobs: DEFAULT_JOBS,
    candidates: DEFAULT_CANDIDATES,
    applications: DEFAULT_APPLICATIONS,
    interviews: DEFAULT_INTERVIEWS,
    offers: DEFAULT_OFFERS,
    onboarding: DEFAULT_ONBOARDINGS,
    workflows: DEFAULT_WORKFLOWS,
  };
  writeDB(defaultDB);
  return defaultDB;
}

function writeDB(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write database file', error);
  }
}

// Ensure database is initialized
let database = readDB();

// -------------------------------------------------------------
// WORKFLOW SIMULATOR (Salesforce Flows representation)
// -------------------------------------------------------------
function executeFlows(trigger: 'OnApplicationSubmit' | 'OnInterviewComplete' | 'OnOfferApprove', contextId: string) {
  const db = readDB();
  let updated = false;

  const activeFlows = db.workflows.filter(w => w.isActive && w.triggerEvent === trigger);
  console.log(`Executing ${activeFlows.length} active Salesforce Flows for trigger: ${trigger}`);

  for (const flow of activeFlows) {
    if (trigger === 'OnApplicationSubmit') {
      const appIndex = db.applications.findIndex(a => a.id === contextId);
      if (appIndex !== -1) {
        const app = db.applications[appIndex];
        const job = db.jobs.find(j => j.id === app.jobOpeningId);
        const candidate = db.candidates.find(c => c.id === app.candidateId);

        if (job && candidate) {
          if (flow.id === 'flow-1' && app.stage === 'Applied') {
            // Check if skills overlap
            const overlapping = candidate.skills.filter(s => job.requiredSkills.includes(s));
            if (overlapping.length >= 1) {
              app.stage = 'Screening';
              app.notes = `[Salesforce Flow Triggered: ${flow.name}] Automatically promoted candidate to Screening because skills match (overlapping: ${overlapping.join(', ')}). \n` + app.notes;
              updated = true;
            }
          }
          
          if (flow.id === 'flow-2' && app.aiScore && app.aiScore >= 85 && app.stage === 'Screening') {
            app.stage = 'Shortlisted';
            app.notes = `[Salesforce Flow Triggered: ${flow.name}] Automatically shortlisted candidate because Agentforce AI score is ${app.aiScore} (threshold >= 85). \n` + app.notes;
            updated = true;
          }
        }
      }
    } else if (trigger === 'OnOfferApprove') {
      // contextId is the Application ID
      if (flow.id === 'flow-3') {
        const app = db.applications.find(a => a.id === contextId);
        if (app && (app.stage === 'Onboarding' || app.stage === 'Hired')) {
          // Check if onboarding already exists
          const exists = db.onboarding.some(onb => onb.applicationId === contextId);
          if (!exists) {
            const newOnboarding: Onboarding = {
              id: `onb-${Date.now()}`,
              applicationId: contextId,
              backgroundCheck: 'Pending',
              documentStatus: 'Sent',
              equipmentStatus: 'Ordered',
              orientationScheduled: false,
              completed: false,
              tasks: [
                { id: `task-${Date.now()}-1`, title: 'Sign comprehensive employment agreement', completed: false, dueDate: '2026-08-01' },
                { id: `task-${Date.now()}-2`, title: 'Setup workspace and single-sign-on corporate credentials', completed: false, dueDate: '2026-08-03' },
                { id: `task-${Date.now()}-3`, title: 'Complete federal and state tax documents', completed: false, dueDate: '2026-08-05' },
                { id: `task-${Date.now()}-4`, title: 'Review corporate handbook and security directives', completed: false, dueDate: '2026-08-10' }
              ]
            };
            db.onboarding.push(newOnboarding);
            app.notes = `[Salesforce Flow Triggered: ${flow.name}] Automatically generated Onboarding record and scheduled tasks. \n` + app.notes;
            updated = true;
          }
        }
      }
    }
  }

  if (updated) {
    writeDB(db);
    // Reload internal reference
    database = db;
  }
}

// -------------------------------------------------------------
// API ENDPOINTS
// -------------------------------------------------------------

// --- Dashboard & Metrics ---
app.get('/api/dashboard/metrics', (req, res) => {
  const db = readDB();
  const activeJobOpenings = db.jobs.filter(j => j.status === 'Active').length;
  
  const applicationsByStage: Record<string, number> = {
    Applied: 0, Screening: 0, Shortlisted: 0, Interview: 0, Selected: 0, Offer: 0, Hired: 0, Onboarding: 0
  };
  
  let totalScoreSum = 0;
  let scoreCount = 0;
  
  db.applications.forEach(app => {
    applicationsByStage[app.stage] = (applicationsByStage[app.stage] || 0) + 1;
    if (app.aiScore !== null) {
      totalScoreSum += app.aiScore;
      scoreCount++;
    }
  });

  const averageAiScore = scoreCount > 0 ? Math.round(totalScoreSum / scoreCount) : 0;
  const pendingApprovals = db.offers.filter(o => o.approvalStatus === 'Pending').length;
  const hiredThisMonth = db.applications.filter(a => a.stage === 'Hired' || a.stage === 'Onboarding').length;

  res.json({
    totalJobOpenings: db.jobs.length,
    activeJobOpenings,
    totalApplications: db.applications.length,
    applicationsByStage,
    averageAiScore,
    pendingApprovals,
    hiredThisMonth
  });
});

// --- Job Openings ---
app.get('/api/jobs', (req, res) => {
  const db = readDB();
  res.json(db.jobs);
});

app.post('/api/jobs', (req, res) => {
  const db = readDB();
  const { title, department, requiredSkills, experienceYears, description, minSalary, maxSalary, vacancies } = req.body;
  
  if (!title || !department) {
    return res.status(400).json({ error: 'Title and Department are required fields.' });
  }

  const newJob: JobOpening = {
    id: `job-${Date.now()}`,
    title,
    department,
    requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : requiredSkills.split(',').map((s: string) => s.trim()).filter(Boolean),
    experienceYears: Number(experienceYears) || 0,
    description: description || '',
    minSalary: Number(minSalary) || 0,
    maxSalary: Number(maxSalary) || 0,
    vacancies: Number(vacancies) || 1,
    status: 'Active',
    createdAt: new Date().toISOString()
  };

  db.jobs.push(newJob);
  writeDB(db);
  res.status(201).json(newJob);
});

app.put('/api/jobs/:id', (req, res) => {
  const db = readDB();
  const jobIndex = db.jobs.findIndex(j => j.id === req.params.id);
  if (jobIndex === -1) {
    return res.status(404).json({ error: 'Job opening not found' });
  }

  const job = db.jobs[jobIndex];
  const { status, title, department, requiredSkills, minSalary, maxSalary, vacancies } = req.body;

  if (status) job.status = status;
  if (title) job.title = title;
  if (department) job.department = department;
  if (minSalary !== undefined) job.minSalary = Number(minSalary);
  if (maxSalary !== undefined) job.maxSalary = Number(maxSalary);
  if (vacancies !== undefined) job.vacancies = Number(vacancies);
  if (requiredSkills) {
    job.requiredSkills = Array.isArray(requiredSkills) ? requiredSkills : requiredSkills.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  writeDB(db);
  res.json(job);
});

// --- Candidates ---
app.get('/api/candidates', (req, res) => {
  const db = readDB();
  res.json(db.candidates);
});

app.post('/api/candidates', (req, res) => {
  const db = readDB();
  const { name, email, phone, education, skills, experienceYears, resumeText, summary } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and Email are required fields.' });
  }

  const newCandidate: Candidate = {
    id: `cand-${Date.now()}`,
    name,
    email,
    phone: phone || '',
    education: education || '',
    skills: Array.isArray(skills) ? skills : skills.split(',').map((s: string) => s.trim()).filter(Boolean),
    experienceYears: Number(experienceYears) || 0,
    resumeText: resumeText || '',
    summary: summary || '',
    createdAt: new Date().toISOString()
  };

  db.candidates.push(newCandidate);
  writeDB(db);
  res.status(201).json(newCandidate);
});

// --- Applications ---
app.get('/api/applications', (req, res) => {
  const db = readDB();
  // Return applications joined with full job details and candidate details
  const joined = db.applications.map(app => {
    const candidate = db.candidates.find(c => c.id === app.candidateId);
    const job = db.jobs.find(j => j.id === app.jobOpeningId);
    return {
      ...app,
      candidate,
      job
    };
  });
  res.json(joined);
});

app.post('/api/applications', (req, res) => {
  const db = readDB();
  const { candidateId, jobOpeningId, notes } = req.body;

  if (!candidateId || !jobOpeningId) {
    return res.status(400).json({ error: 'Candidate ID and Job Opening ID are required.' });
  }

  // Check if already applied
  const existing = db.applications.find(a => a.candidateId === candidateId && a.jobOpeningId === jobOpeningId);
  if (existing) {
    return res.status(400).json({ error: 'Candidate has already applied for this job opening.' });
  }

  const newApp: JobApplication = {
    id: `app-${Date.now()}`,
    candidateId,
    jobOpeningId,
    stage: 'Applied',
    appliedDate: new Date().toISOString(),
    aiScore: null,
    aiPriority: null,
    aiSummary: null,
    aiFitAnalysis: null,
    aiRisks: null,
    notes: notes || 'Application submitted.'
  };

  db.applications.push(newApp);
  writeDB(db);

  // Execute OnApplicationSubmit flows
  executeFlows('OnApplicationSubmit', newApp.id);

  const finalApp = readDB().applications.find(a => a.id === newApp.id);
  res.status(201).json(finalApp);
});

app.put('/api/applications/:id', (req, res) => {
  const db = readDB();
  const appIndex = db.applications.findIndex(a => a.id === req.params.id);
  if (appIndex === -1) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const app = db.applications[appIndex];
  const oldStage = app.stage;
  const { stage, notes } = req.body;

  if (stage) app.stage = stage;
  if (notes) app.notes = notes + '\n' + app.notes;

  writeDB(db);

  // If stage changed to Hired, trigger onboarding workflow
  if (stage === 'Hired' && oldStage !== 'Hired') {
    executeFlows('OnOfferApprove', app.id);
  }

  const finalApp = readDB().applications.find(a => a.id === app.id);
  res.json(finalApp);
});

// --- Agentforce AI Evaluator ---
app.post('/api/applications/:id/ai-evaluate', async (req, res) => {
  const db = readDB();
  const appIndex = db.applications.findIndex(a => a.id === req.params.id);
  if (appIndex === -1) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const application = db.applications[appIndex];
  const candidate = db.candidates.find(c => c.id === application.candidateId);
  const job = db.jobs.find(j => j.id === application.jobOpeningId);

  if (!candidate || !job) {
    return res.status(400).json({ error: 'Associated candidate or job opening details are missing.' });
  }

  const ai = getGeminiClient();

  if (!ai) {
    // Elegant mock AI fallback in case of missing API key, so user gets pristine experience:
    console.log('Using mock AI fallback due to missing key');
    const overlap = candidate.skills.filter(s => job.requiredSkills.includes(s));
    const skillRatio = overlap.length / Math.max(1, job.requiredSkills.length);
    let mockScore = Math.round(50 + (skillRatio * 40) + (candidate.experienceYears >= job.experienceYears ? 10 : 0));
    mockScore = Math.min(100, Math.max(10, mockScore));
    
    let mockPriority: 'High' | 'Medium' | 'Low' = 'Medium';
    if (mockScore >= 80) mockPriority = 'High';
    else if (mockScore < 55) mockPriority = 'Low';

    application.aiScore = mockScore;
    application.aiPriority = mockPriority;
    application.aiSummary = `Agentforce Evaluation (Fallback Mode): ${candidate.name} is a ${mockPriority}-priority fit for ${job.title} with a scored match of ${mockScore}%. This evaluation is based on key skill matching and experience comparison.`;
    application.aiFitAnalysis = `Matches ${overlap.length} core requirements: ${overlap.join(', ')}. Candidate has ${candidate.experienceYears} years of experience vs required ${job.experienceYears} years.`;
    application.aiRisks = candidate.experienceYears < job.experienceYears 
      ? `Candidate holds ${candidate.experienceYears} years of experience, slightly lower than the requested ${job.experienceYears} years.`
      : 'No major experience deficiencies. Ensure deep dive in technical loops.';
    
    writeDB(db);
    // Execute Submit flow (which can auto-promote if score is high)
    executeFlows('OnApplicationSubmit', application.id);
    const finalApp = readDB().applications.find(a => a.id === application.id);
    return res.json({ success: true, isMock: true, application: finalApp });
  }

  try {
    const prompt = `
      Please evaluate candidate ${candidate.name} for the position: "${job.title}" in the "${job.department}" department.

      Job Requirements:
      - Required Skills: ${job.requiredSkills.join(', ')}
      - Experience Level: ${job.experienceYears}+ years
      - Description: ${job.description}

      Candidate Details:
      - Qualifications: ${candidate.education}
      - Core Skills: ${candidate.skills.join(', ')}
      - Experience: ${candidate.experienceYears} years
      - Detailed Resume / Background: ${candidate.resumeText || 'No detailed resume available.'}

      Based on this data, provide a structured candidate evaluation in JSON format matching the following schema. Return only JSON:
      {
        "aiScore": <Integer 0-100 indicating fit score>,
        "aiPriority": "<"High" | "Medium" | "Low">",
        "aiSummary": "<A crisp 2-3 sentence overview summarising their overall fit>",
        "aiFitAnalysis": "<A bulleted matching analysis of candidate skills, qualifications, and strengths>",
        "aiRisks": "<Any identified areas of mismatch, gaps, or risks, or 'None' if perfectly clean>"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        systemInstruction: 'You are Agentforce AI, an elite recruiting and CRM intelligence engine. Return strict JSON. Do not wrap in markdown codeblocks.',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            aiScore: { type: Type.INTEGER, description: 'Evaluation score 0 to 100.' },
            aiPriority: { type: Type.STRING, description: 'High, Medium, or Low.' },
            aiSummary: { type: Type.STRING, description: 'Brief executive summary.' },
            aiFitAnalysis: { type: Type.STRING, description: 'Analysis of qualifications and skill matching.' },
            aiRisks: { type: Type.STRING, description: 'Identified gaps, missing skills, or red flags.' }
          },
          required: ['aiScore', 'aiPriority', 'aiSummary', 'aiFitAnalysis', 'aiRisks']
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    
    application.aiScore = Number(result.aiScore) || 50;
    application.aiPriority = result.aiPriority === 'High' || result.aiPriority === 'Medium' || result.aiPriority === 'Low' ? result.aiPriority : 'Medium';
    application.aiSummary = result.aiSummary || 'AI evaluation completed successfully.';
    application.aiFitAnalysis = result.aiFitAnalysis || 'Candidate skills match the vacancy.';
    application.aiRisks = result.aiRisks || 'None identified.';

    writeDB(db);

    // Trigger flows on application change (e.g., auto-promoting to Shortlisted on high AI score)
    executeFlows('OnApplicationSubmit', application.id);

    const finalApp = readDB().applications.find(a => a.id === application.id);
    res.json({ success: true, isMock: false, application: finalApp });

  } catch (error: any) {
    console.error('Agentforce AI Evaluation Error:', error);
    res.status(500).json({ error: 'Agentforce failed to process evaluation: ' + error.message });
  }
});

// --- Interviews ---
app.get('/api/interviews', (req, res) => {
  const db = readDB();
  res.json(db.interviews);
});

app.post('/api/interviews', (req, res) => {
  const db = readDB();
  const { applicationId, type, scheduledAt, interviewers } = req.body;

  if (!applicationId || !type || !scheduledAt) {
    return res.status(400).json({ error: 'Application ID, Type, and Scheduled Date are required.' });
  }

  const newInterview: Interview = {
    id: `int-${Date.now()}`,
    applicationId,
    type,
    scheduledAt,
    interviewers: Array.isArray(interviewers) ? interviewers : interviewers.split(',').map((i: string) => i.trim()).filter(Boolean),
    status: 'Scheduled',
    feedback: '',
    rating: null
  };

  db.interviews.push(newInterview);
  writeDB(db);
  res.status(201).json(newInterview);
});

app.put('/api/interviews/:id', (req, res) => {
  const db = readDB();
  const interviewIndex = db.interviews.findIndex(i => i.id === req.params.id);
  if (interviewIndex === -1) {
    return res.status(404).json({ error: 'Interview not found' });
  }

  const interview = db.interviews[interviewIndex];
  const { status, feedback, rating } = req.body;

  if (status) interview.status = status;
  if (feedback !== undefined) interview.feedback = feedback;
  if (rating !== undefined) interview.rating = rating !== null ? Number(rating) : null;

  writeDB(db);

  // If completed with high feedback, update application stage
  if (status === 'Completed' && rating && rating >= 4) {
    const appIndex = db.applications.findIndex(a => a.id === interview.applicationId);
    if (appIndex !== -1) {
      db.applications[appIndex].stage = 'Selected';
      db.applications[appIndex].notes = `[Salesforce Automation] Moved to Selected stage due to high technical interview score (${rating}/5). \n` + db.applications[appIndex].notes;
      writeDB(db);
    }
  }

  res.json(interview);
});

// --- Offers ---
app.get('/api/offers', (req, res) => {
  const db = readDB();
  res.json(db.offers);
});

app.post('/api/offers', (req, res) => {
  const db = readDB();
  const { applicationId, baseSalary, equity, bonus, startDate, notes } = req.body;

  if (!applicationId || !baseSalary || !startDate) {
    return res.status(400).json({ error: 'Application ID, Base Salary, and Start Date are required.' });
  }

  // Check if offer already exists
  const existing = db.offers.find(o => o.applicationId === applicationId);
  if (existing) {
    return res.status(400).json({ error: 'An offer already exists for this application.' });
  }

  const newOffer: Offer = {
    id: `off-${Date.now()}`,
    applicationId,
    baseSalary: Number(baseSalary),
    equity: equity || 'None',
    bonus: Number(bonus) || 0,
    startDate,
    approvalStatus: 'Pending',
    approvedBy: null,
    approvalDate: null,
    offerLetterGenerated: true,
    notes: notes || ''
  };

  db.offers.push(newOffer);
  writeDB(db);

  // Move application to Offer stage
  const appIndex = db.applications.findIndex(a => a.id === applicationId);
  if (appIndex !== -1) {
    db.applications[appIndex].stage = 'Offer';
    db.applications[appIndex].notes = `Offer generated with base salary $${Number(baseSalary).toLocaleString()}. Approval pending. \n` + db.applications[appIndex].notes;
    writeDB(db);
  }

  res.status(201).json(newOffer);
});

app.put('/api/offers/:id/approve', (req, res) => {
  const db = readDB();
  const offerIndex = db.offers.findIndex(o => o.id === req.params.id);
  if (offerIndex === -1) {
    return res.status(404).json({ error: 'Offer not found' });
  }

  const offer = db.offers[offerIndex];
  const { approvalStatus, approvedBy } = req.body; // Approved / Rejected

  if (!approvalStatus || (approvalStatus !== 'Approved' && approvalStatus !== 'Rejected')) {
    return res.status(400).json({ error: 'Valid approvalStatus is required (Approved or Rejected).' });
  }

  offer.approvalStatus = approvalStatus;
  offer.approvedBy = approvedBy || 'Hiring Manager';
  offer.approvalDate = new Date().toISOString();

  // If approved, move candidate application to Hired
  const appIndex = db.applications.findIndex(a => a.id === offer.applicationId);
  if (appIndex !== -1) {
    const app = db.applications[appIndex];
    if (approvalStatus === 'Approved') {
      app.stage = 'Onboarding';
      app.notes = `[Salesforce Approval Process] Offer has been fully APPROVED by ${offer.approvedBy}. Candidate moved to Onboarding. \n` + app.notes;
      writeDB(db);
      
      // Trigger onboarding workflow flow (create tasks)
      executeFlows('OnOfferApprove', app.id);
    } else {
      app.notes = `[Salesforce Approval Process] Offer was REJECTED by ${offer.approvedBy}. Check negotiation details. \n` + app.notes;
      writeDB(db);
    }
  }

  res.json(offer);
});

// --- Onboarding ---
app.get('/api/onboarding', (req, res) => {
  const db = readDB();
  res.json(db.onboarding);
});

app.put('/api/onboarding/:id', (req, res) => {
  const db = readDB();
  const onbIndex = db.onboarding.findIndex(o => o.id === req.params.id);
  if (onbIndex === -1) {
    return res.status(404).json({ error: 'Onboarding record not found' });
  }

  const onboarding = db.onboarding[onbIndex];
  const { backgroundCheck, documentStatus, equipmentStatus, orientationScheduled, tasks, completed } = req.body;

  if (backgroundCheck) onboarding.backgroundCheck = backgroundCheck;
  if (documentStatus) onboarding.documentStatus = documentStatus;
  if (equipmentStatus) onboarding.equipmentStatus = equipmentStatus;
  if (orientationScheduled !== undefined) onboarding.orientationScheduled = orientationScheduled;
  if (tasks) onboarding.tasks = tasks;
  if (completed !== undefined) onboarding.completed = completed;

  // Check if all onboarding activities are completed
  const allTasksCompleted = onboarding.tasks.every(t => t.completed);
  if (allTasksCompleted && onboarding.backgroundCheck === 'Completed' && onboarding.documentStatus === 'Signed' && onboarding.equipmentStatus === 'Delivered') {
    onboarding.completed = true;
    
    // Auto update application to Hired!
    const appIndex = db.applications.findIndex(a => a.id === onboarding.applicationId);
    if (appIndex !== -1 && db.applications[appIndex].stage !== 'Hired') {
      db.applications[appIndex].stage = 'Hired';
      db.applications[appIndex].notes = `[Onboarding Flow] All onboarding requirements completed successfully. Welcome to the company! \n` + db.applications[appIndex].notes;
    }
  }

  writeDB(db);
  res.json(onboarding);
});

// --- Workflows / Flows Editor ---
app.get('/api/workflows', (req, res) => {
  const db = readDB();
  res.json(db.workflows);
});

app.put('/api/workflows/:id/toggle', (req, res) => {
  const db = readDB();
  const flowIndex = db.workflows.findIndex(w => w.id === req.params.id);
  if (flowIndex === -1) {
    return res.status(404).json({ error: 'Workflow rule not found' });
  }

  db.workflows[flowIndex].isActive = !db.workflows[flowIndex].isActive;
  writeDB(db);
  res.json(db.workflows[flowIndex]);
});

app.post('/api/workflows', (req, res) => {
  const db = readDB();
  const { name, triggerEvent, condition, action, description } = req.body;

  if (!name || !triggerEvent || !action) {
    return res.status(400).json({ error: 'Name, triggerEvent, and action are required.' });
  }

  const newRule: WorkflowRule = {
    id: `flow-${Date.now()}`,
    name,
    triggerEvent,
    condition: condition || 'None',
    action,
    isActive: true,
    description: description || 'Custom configured trigger.'
  };

  db.workflows.push(newRule);
  writeDB(db);
  res.status(201).json(newRule);
});


// --- Agentforce AI Advisory Chat (Advisor Assistant) ---
app.post('/api/agentforce/chat', async (req, res) => {
  const { messages } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages are required and must be an array.' });
  }

  const db = readDB();
  const ai = getGeminiClient();

  // Create context for Agentforce so it actually acts on our real CRM data!
  const recruitmentContext = `
    Active Jobs inside Salesforce AIRCMS:
    ${JSON.stringify(db.jobs.map(j => ({ id: j.id, title: j.title, department: j.department, skills: j.requiredSkills, vacancies: j.vacancies, status: j.status })))}

    Registered Candidates:
    ${JSON.stringify(db.candidates.map(c => ({ id: c.id, name: c.name, skills: c.skills, experience: c.experienceYears, summary: c.summary })))}

    Current Active Applications with their Stages:
    ${JSON.stringify(db.applications.map(a => {
      const c = db.candidates.find(cand => cand.id === a.candidateId);
      const j = db.jobs.find(job => job.id === a.jobOpeningId);
      return {
        id: a.id,
        candidateName: c?.name || 'Unknown',
        jobTitle: j?.title || 'Unknown',
        stage: a.stage,
        aiScore: a.aiScore,
        aiPriority: a.aiPriority,
        notes: a.notes
      };
    }))}
    
    Pending Salary & Offer Approvals:
    ${JSON.stringify(db.offers.filter(o => o.approvalStatus === 'Pending').map(o => {
      const app = db.applications.find(a => a.id === o.applicationId);
      const c = db.candidates.find(cand => cand.id === app?.candidateId);
      return {
        id: o.id,
        candidateName: c?.name || 'Unknown',
        salary: o.baseSalary,
        bonus: o.bonus,
        equity: o.equity,
        status: o.approvalStatus
      };
    }))}
  `;

  if (!ai) {
    // Provide a neat mock chat response so everything is fully working in fallback
    const lastMsg = messages[messages.length - 1].text.toLowerCase();
    let reply = "Hello! I am your Agentforce Recruitment Advisor. I can help you screening candidates, check pipeline status, draft contracts or review salaries. Let me know which vacancy or applicant you would like to explore.";
    
    if (lastMsg.includes('react') || lastMsg.includes('jenkins') || lastMsg.includes('frontend')) {
      reply = "Our top candidate for the Senior React Developer position is Sarah Jenkins. Her Agentforce AI match score is 92/100, which qualifies as a High priority. She has 6 years of expertise in React, TypeScript, and modern Tailwind CSS configurations.";
    } else if (lastMsg.includes('salesforce') || lastMsg.includes('marcus') || lastMsg.includes('architect')) {
      reply = "Marcus Chen is our prime applicant for the Lead Salesforce Architect opening, scoring 97/100. He currently has a salary offer of $175,000 pending your approval. Let me know if you would like me to approve this now!";
    } else if (lastMsg.includes('draft') || lastMsg.includes('offer letter')) {
      reply = "Certainly! Here is a draft of the offer letter:\n\nDear candidate,\n\nWe are pleased to offer you the position. We are thrilled to welcome you to the company!\n\nDetails:\n- Base Salary: $150,000\n- Equity Options: Standard tier\n- Start Date: September 1, 2026\n\nSincerely,\nHuman Resources Department";
    } else if (lastMsg.includes('pipeline') || lastMsg.includes('metric') || lastMsg.includes('applications')) {
      reply = `Here is our active hiring funnel statistics:
      - Total applications: ${db.applications.length}
      - In Interview loop: ${db.applications.filter(a => a.stage === 'Interview').length} candidate
      - Pending Offer review: ${db.applications.filter(a => a.stage === 'Offer').length} candidate
      - Ready for Onboarding: ${db.applications.filter(a => a.stage === 'Onboarding').length} candidate`;
    }

    return res.json({ text: reply, isMock: true });
  }

  try {
    const formattedMessages = messages.map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    // Inject our Salesforce context as a system instruction or prime the conversation
    const systemPrompt = `You are Agentforce Recruitment Advisor, an elite intelligent virtual recruiter built into Salesforce CRM (AIRCMS).
    You have direct secure access to the Salesforce recruitment database. Here is the current system context for you to answer user queries truthfully and dynamically:
    
    ${recruitmentContext}

    Guidelines:
    1. Be concise, professional, and helpful. Style your response beautifully using markdown lists and sections where appropriate.
    2. Refer to actual candidates, salaries, and job openings currently available in the system context.
    3. You can assist drafting recruitment documents (offer letters, rejection notes, interview scorecard questions) or running candidate match analysis.
    4. Maintain role alignment, addressing the recruiter or hiring manager with deep respect.
    `;

    // Initialize chat with system instruction
    const chatResponse = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood. I am Agentforce, your virtual Salesforce Recruitment CRM assistant. I am fully loaded with our live recruitment state and ready to assist you. How can I support your hiring workflows today?' }] },
        ...formattedMessages
      ],
      config: {
        temperature: 0.7,
      }
    });

    res.json({ text: chatResponse.text || 'I apologize, I was unable to generate a response.', isMock: false });

  } catch (error: any) {
    console.error('Agentforce Advisor Chat Error:', error);
    res.status(500).json({ error: 'Agentforce Advisor chat error: ' + error.message });
  }
});

// -------------------------------------------------------------
// VITE DEV SERVER & PRODUCTION HANDLING
// -------------------------------------------------------------
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AIRCMS Backend Server listening at http://0.0.0.0:${PORT}`);
  });
}

start();
