import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import JobList from './components/JobList';
import CandidateList from './components/CandidateList';
import ApplicationDetail from './components/ApplicationDetail';
import InterviewManager from './components/InterviewManager';
import OfferApprovals from './components/OfferApprovals';
import OnboardingTracker from './components/OnboardingTracker';
import FlowsEditor from './components/FlowsEditor';
import WorkspaceHub from './components/WorkspaceHub';

import { 
  JobOpening, 
  Candidate, 
  JobApplication, 
  Interview, 
  Offer, 
  Onboarding, 
  WorkflowRule, 
  UserRole, 
  DashboardMetrics, 
  ChatMessage 
} from './types';

import { 
  Briefcase, 
  Users, 
  Brain, 
  ClipboardCheck, 
  CheckCircle,
  FileCheck2,
  Calendar,
  Cpu,
  Sparkles,
  Send,
  MessageSquare,
  ChevronRight,
  AlertCircle,
  Clock,
  X,
  Plus,
  Cloud
} from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('Recruiter');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Domain state
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [applications, setApplications] = useState<(JobApplication & { candidate: any; job: any })[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [onboardings, setOnboardings] = useState<Onboarding[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowRule[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalJobOpenings: 0,
    activeJobOpenings: 0,
    totalApplications: 0,
    applicationsByStage: {},
    averageAiScore: 0,
    pendingApprovals: 0,
    hiredThisMonth: 0
  });

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'agent',
      text: "Hello! I am your Agentforce Recruitment Advisor. I have synchronized with our live AIRCMS recruitment data. Ask me about Sarah Jenkins' matching credentials, outstanding offer approvals, active pipeline channels, or ask me to draft an official email offer letter!",
      timestamp: new Date().toISOString()
    }
  ]);
  const [userMsgInput, setUserMsgInput] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // Synchronize all CRM datasets
  const fetchAllData = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const [
        metricsRes,
        jobsRes,
        candidatesRes,
        appsRes,
        intRes,
        offersRes,
        onboardingRes,
        flowsRes
      ] = await Promise.all([
        fetch('/api/dashboard/metrics').then(r => r.json()),
        fetch('/api/jobs').then(r => r.json()),
        fetch('/api/candidates').then(r => r.json()),
        fetch('/api/applications').then(r => r.json()),
        fetch('/api/interviews').then(r => r.json()),
        fetch('/api/offers').then(r => r.json()),
        fetch('/api/onboarding').then(r => r.json()),
        fetch('/api/workflows').then(r => r.json())
      ]);

      setMetrics(metricsRes);
      setJobs(jobsRes);
      setCandidates(candidatesRes);
      setApplications(appsRes);
      setInterviews(intRes);
      setOffers(offersRes);
      setOnboardings(onboardingRes);
      setWorkflows(flowsRes);
    } catch (error: any) {
      console.error('Fetch CRM error:', error);
      setErrorMsg('Failed to fetch recruitment database records. Please make sure the node server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Action: Create Job Opening
  const handleCreateJob = async (jobData: any) => {
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create job opening');
      }
      await fetchAllData();
    } catch (err: any) {
      throw err;
    }
  };

  // Action: Modify Job Status
  const handleUpdateJobStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update job status');
      await fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Action: Register Candidate
  const handleRegisterCandidate = async (candData: any) => {
    try {
      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candData)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to register candidate');
      }
      await fetchAllData();
    } catch (err: any) {
      throw err;
    }
  };

  // Action: Candidate Apply for Job Opening
  const handleApplyForJob = async (candidateId: string, jobId: string) => {
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId, jobOpeningId: jobId })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Application already registered');
      }
      await fetchAllData();
    } catch (err: any) {
      throw err;
    }
  };

  // Action: Update Application stage
  const handleUpdateStage = async (id: string, stage: string, notes?: string) => {
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage, notes })
      });
      if (!res.ok) throw new Error('Failed to transition stage');
      await fetchAllData();
    } catch (err: any) {
      throw err;
    }
  };

  // Action: Screen Application using Agentforce AI
  const handleTriggerAiEvaluate = async (id: string) => {
    try {
      const res = await fetch(`/api/applications/${id}/ai-evaluate`, {
        method: 'POST'
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'AI assessment failed');
      }
      const outcome = await res.json();
      await fetchAllData();
      return outcome;
    } catch (err: any) {
      throw err;
    }
  };

  // Action: Schedule Interview Loop
  const handleScheduleInterview = async (interviewData: any) => {
    try {
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interviewData)
      });
      if (!res.ok) throw new Error('Failed to schedule interview loop');
      await fetchAllData();
    } catch (err: any) {
      throw err;
    }
  };

  // Action: Submit Feedback Panel scorecard
  const handleUpdateFeedback = async (id: string, status: string, feedback: string, rating: number) => {
    try {
      const res = await fetch(`/api/interviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, feedback, rating })
      });
      if (!res.ok) throw new Error('Failed to submit scorecard feedback');
      await fetchAllData();
    } catch (err: any) {
      throw err;
    }
  };

  // Action: Create Offer Package Salary Proposal
  const handleCreateOffer = async (offerData: any) => {
    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerData)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Salary package creation failed');
      }
      await fetchAllData();
    } catch (err: any) {
      throw err;
    }
  };

  // Action: Approve Offer salary proposals (HM)
  const handleApproveOffer = async (id: string, status: 'Approved' | 'Rejected', approvedBy: string) => {
    try {
      const res = await fetch(`/api/offers/${id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalStatus: status, approvedBy })
      });
      if (!res.ok) throw new Error('Offer approval failed');
      await fetchAllData();
    } catch (err: any) {
      throw err;
    }
  };

  // Action: Update Onboarding status / checkoff checklist
  const handleUpdateOnboarding = async (id: string, onboardingData: Partial<Onboarding>) => {
    try {
      const res = await fetch(`/api/onboarding/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(onboardingData)
      });
      if (!res.ok) throw new Error('Failed to save onboarding checklist status');
      await fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Action: Toggle Workflow rules (Declarative Flow)
  const handleToggleWorkflow = async (id: string) => {
    try {
      const res = await fetch(`/api/workflows/${id}/toggle`, {
        method: 'PUT'
      });
      if (!res.ok) throw new Error('Failed to toggle workflow status');
      await fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Action: Create Workflow trigger Rule
  const handleCreateWorkflow = async (flowData: any) => {
    try {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flowData)
      });
      if (!res.ok) throw new Error('Workflow creation failed');
      await fetchAllData();
    } catch (err: any) {
      throw err;
    }
  };

  // Action: Chat Send Messages to Advisor LLM
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userMsgInput.trim()) return;

    const newUserMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: userMsgInput,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, newUserMsg]);
    setUserMsgInput('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/agentforce/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...chatMessages, newUserMsg] })
      });

      if (!res.ok) throw new Error('Agentforce experienced an error');
      const data = await res.json();

      const newAgentMsg: ChatMessage = {
        id: `msg-${Date.now()}-agent`,
        sender: 'agent',
        text: data.text,
        timestamp: new Date().toISOString()
      };

      setChatMessages(prev => [...prev, newAgentMsg]);
    } catch (error: any) {
      setChatMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}-err`,
          sender: 'agent',
          text: "I apologize, my cognitive link experienced a brief timeout. Please check that your Gemini API credentials are set or try again.",
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const getActiveTabComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            metrics={metrics} 
            onRefresh={fetchAllData} 
            isLoading={isLoading}
            onTabChange={(tab) => setActiveTab(tab)}
          />
        );
      case 'jobs':
        return (
          <JobList 
            jobs={jobs} 
            onCreateJob={handleCreateJob} 
            onUpdateJobStatus={handleUpdateJobStatus} 
            currentRole={currentRole} 
          />
        );
      case 'candidates':
        return (
          <CandidateList 
            candidates={candidates} 
            onRegisterCandidate={handleRegisterCandidate} 
            currentRole={currentRole}
            onApplyForJob={handleApplyForJob}
            jobs={jobs.map(j => ({ id: j.id, title: j.title }))}
          />
        );
      case 'applications':
        return (
          <ApplicationDetail 
            applications={applications} 
            currentRole={currentRole} 
            onUpdateStage={handleUpdateStage}
            onTriggerAiEvaluate={handleTriggerAiEvaluate}
          />
        );
      case 'interviews':
        return (
          <InterviewManager 
            interviews={interviews} 
            applications={applications}
            candidates={candidates}
            currentRole={currentRole} 
            onScheduleInterview={handleScheduleInterview} 
            onUpdateFeedback={handleUpdateFeedback} 
          />
        );
      case 'offers':
        return (
          <OfferApprovals 
            offers={offers} 
            applications={applications}
            candidates={candidates}
            currentRole={currentRole} 
            onApproveOffer={handleApproveOffer} 
            onCreateOffer={handleCreateOffer}
          />
        );
      case 'onboarding':
        return (
          <OnboardingTracker 
            onboardings={onboardings} 
            applications={applications}
            candidates={candidates}
            currentRole={currentRole} 
            onUpdateOnboarding={handleUpdateOnboarding} 
          />
        );
      case 'workflows':
        return (
          <FlowsEditor 
            workflows={workflows} 
            currentRole={currentRole} 
            onToggleWorkflow={handleToggleWorkflow} 
            onCreateWorkflow={handleCreateWorkflow} 
          />
        );
      case 'workspace':
        return (
          <WorkspaceHub 
            candidates={candidates} 
            applications={applications}
            interviews={interviews}
            onboardings={onboardings}
            currentRole={currentRole}
          />
        );
      default:
        return <div>Tab not found</div>;
    }
  };

  // Nav items list for sidebar
  const navItems = [
    { id: 'dashboard', label: 'Dashboard Intelligence', icon: Brain, count: null },
    { id: 'jobs', label: 'Job Requisitions', icon: Briefcase, count: jobs.length },
    { id: 'candidates', label: 'Candidates Registry', icon: Users, count: candidates.length },
    { id: 'applications', label: 'Pipeline Stages', icon: FileCheck2, count: applications.length },
    { id: 'interviews', label: 'Interview Panels', icon: Calendar, count: interviews.filter(i => i.status === 'Scheduled').length },
    { id: 'offers', label: 'Salary Approvals', icon: ClipboardCheck, count: offers.filter(o => o.approvalStatus === 'Pending').length },
    { id: 'onboarding', label: 'Onboarding Paths', icon: CheckCircle, count: onboardings.filter(o => !o.completed).length },
    { id: 'workflows', label: 'Salesforce Flows', icon: Cpu, count: workflows.length },
    { id: 'workspace', label: 'Google Workspace', icon: Cloud, count: null }
  ];

  return (
    <div className="min-h-screen bg-slate-100/50 flex flex-col font-sans antialiased text-gray-800">
      {/* Salesforce Header Component */}
      <Header 
        currentRole={currentRole} 
        onRoleChange={setCurrentRole} 
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
      />

      {errorMsg && (
        <div className="m-4 p-3 bg-red-100 border border-red-200 rounded text-xs text-red-800 font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main CRM split frame */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left sidebar directory list */}
        <aside className="w-full lg:w-64 bg-white text-slate-700 lg:min-h-[calc(100vh-88px)] p-4 flex flex-col justify-between border-r border-slate-200 shrink-0">
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2">CRM Navigation Rail</span>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-md transition-all ${
                      isActive 
                        ? 'bg-indigo-50 text-indigo-600 border-l-2 border-indigo-600 rounded-l-none' 
                        : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== null && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6 text-[10px] text-slate-400 space-y-1.5 px-2">
            <p className="font-bold flex items-center text-slate-600"><Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Agentforce Enabled</p>
            <p className="text-slate-500">Sync status: <strong className="text-emerald-600 font-bold">CRM Connection Secure</strong></p>
          </div>
        </aside>

        {/* Center application workspace */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-w-6xl mx-auto w-full">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Clock className="w-10 h-10 text-blue-600 animate-spin" />
              <p className="text-xs font-semibold text-gray-500">Retrieving live Salesforce record catalogs...</p>
            </div>
          )}

          <div className={isLoading ? 'hidden' : 'block animate-fade-in'}>
            {getActiveTabComponent()}
          </div>
        </main>

        {/* Right Floating / Docked Agentforce AI Advisor Chat Panel */}
        {isChatOpen && (
          <aside className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 shadow-xl flex flex-col h-[520px] lg:h-[calc(100vh-88px)] sticky bottom-0 lg:top-22 right-0 z-30">
            {/* Advisor header */}
            <div className="bg-slate-900 text-white px-4 py-3 flex justify-between items-center flex-shrink-0 shadow-xs">
              <div className="flex items-center space-x-2">
                <Brain className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
                <div>
                  <h3 className="font-bold text-xs tracking-wide">Agentforce AI CRM Advisor</h3>
                  <p className="text-[10px] text-slate-400">Live Cognitive database context</p>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="hover:bg-slate-800 p-1 rounded-lg text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat message listing */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50 text-xs">
              {chatMessages.map((msg) => {
                const isAgent = msg.sender === 'agent';
                return (
                  <div 
                    key={msg.id}
                    className={`flex items-start space-x-2 ${isAgent ? '' : 'flex-row-reverse space-x-reverse'}`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9px] flex-shrink-0 ${
                      isAgent ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {isAgent ? 'AF' : 'TA'}
                    </div>
                    <div className={`p-3 rounded-xl max-w-[85%] shadow-xs border ${
                      isAgent 
                        ? 'bg-white border-slate-200 text-slate-800 leading-relaxed' 
                        : 'bg-indigo-600 border-indigo-700 text-white leading-relaxed shadow-sm'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <span className={`block text-[8px] text-right mt-1.5 ${isAgent ? 'text-slate-400' : 'text-indigo-200'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isChatLoading && (
                <div className="flex items-center space-x-2 text-slate-400 pl-8">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce delay-200"></span>
                  <span className="text-[10px] font-semibold italic text-slate-500">Agentforce is analyzing CRM schemas...</span>
                </div>
              )}
            </div>

            {/* Input message form */}
            <form onSubmit={handleSendChat} className="p-3 border-t border-slate-100 bg-white flex items-center space-x-2 flex-shrink-0">
              <input
                type="text"
                value={userMsgInput}
                onChange={(e) => setUserMsgInput(e.target.value)}
                placeholder="Ask Agentforce (e.g. Find matching React resumes)"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
              />
              <button
                type="submit"
                disabled={isChatLoading || !userMsgInput.trim()}
                className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition disabled:opacity-50 flex items-center justify-center shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </aside>
        )}
      </div>
    </div>
  );
}
