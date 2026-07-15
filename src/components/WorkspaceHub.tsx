import React, { useState, useEffect } from 'react';
import { 
  googleSignIn, 
  logout, 
  getAccessToken,
  createGoogleSheet,
  createCalendarEvent,
  createGoogleTask,
  sendGmail
} from '../lib/workspace';
import { 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  Mail, 
  Table, 
  Calendar as CalendarIcon, 
  CheckSquare, 
  CheckCircle2, 
  RefreshCw, 
  LogOut, 
  ExternalLink, 
  Send,
  AlertTriangle,
  Sparkles,
  UserCheck,
  Check
} from 'lucide-react';
import { Candidate, Interview, Onboarding, JobApplication } from '../types';

interface WorkspaceHubProps {
  candidates: Candidate[];
  applications: (JobApplication & { candidate: any; job: any })[];
  interviews: Interview[];
  onboardings: Onboarding[];
  currentRole: string;
}

export default function WorkspaceHub({
  candidates,
  applications,
  interviews,
  onboardings,
  currentRole
}: WorkspaceHubProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  // Sheet Export states
  const [isExportingSheet, setIsExportingSheet] = useState(false);
  const [generatedSheetUrl, setGeneratedSheetUrl] = useState<string | null>(null);

  // Calendar event schedule states
  const [selectedInterviewId, setSelectedInterviewId] = useState<string>('');
  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);
  const [syncedEvents, setSyncedEvents] = useState<Record<string, string>>({}); // interviewId -> eventUrl

  // Tasks sync states
  const [isSyncingTasks, setIsSyncingTasks] = useState(false);
  const [syncedTasksCount, setSyncedTasksCount] = useState<number | null>(null);

  // Gmail test state
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Listen for Google authentication state
  useEffect(() => {
    getAccessToken().then(tok => {
      setToken(tok);
    });
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setStatusMsg(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setStatusMsg({ type: 'success', text: 'Connected to Google Workspace successfully! All 4 API channels activated.' });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMsg({ type: 'error', text: err.message || 'Failed to authenticate with Google.' });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    setStatusMsg(null);
    try {
      await logout();
      setUser(null);
      setToken(null);
      setGeneratedSheetUrl(null);
      setSyncedTasksCount(null);
      setStatusMsg({ type: 'info', text: 'Disconnected from Google Workspace services.' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Error signing out.' });
    }
  };

  // Google Sheets integration: Export candidate pipeline
  const handleExportToSheets = async () => {
    if (!token) return;
    setIsExportingSheet(true);
    setStatusMsg(null);
    try {
      const headers = ['Candidate Name', 'Email', 'Phone', 'Role Appling For', 'Pipeline Stage', 'AI Recommendation Score', 'AI Priority Rating'];
      const rows = applications.map(app => [
        app.candidate?.name || 'N/A',
        app.candidate?.email || 'N/A',
        app.candidate?.phone || 'N/A',
        app.job?.title || 'N/A',
        app.stage,
        app.aiScore !== null ? `${app.aiScore}%` : 'N/A',
        app.aiPriority || 'N/A'
      ]);

      const result = await createGoogleSheet(
        `Salesforce CRM Candidate Pipeline - ${new Date().toLocaleDateString()}`,
        headers,
        rows
      );

      setGeneratedSheetUrl(result.spreadsheetUrl);
      setStatusMsg({ 
        type: 'success', 
        text: 'Successfully generated and populated recruitment pipeline in Google Sheets!' 
      });
    } catch (err: any) {
      console.error(err);
      setStatusMsg({ type: 'error', text: err.message || 'Sheets Export Failed.' });
    } finally {
      setIsExportingSheet(false);
    }
  };

  // Google Calendar integration: Create calendar invite
  const handleSyncInterviewToCalendar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedInterviewId) return;
    
    setIsSyncingCalendar(true);
    setStatusMsg(null);

    try {
      const interview = interviews.find(i => i.id === selectedInterviewId);
      if (!interview) throw new Error('Interview not found.');

      const appDetails = applications.find(a => a.id === interview.applicationId);
      const candName = appDetails?.candidate?.name || 'Candidate';
      const jobTitle = appDetails?.job?.title || 'Job Opening';
      
      const summary = `Panel Interview: ${candName} for ${jobTitle}`;
      const description = `
        Salesforce ATS Automation triggered interview details:
        - Candidate: ${candName} (${appDetails?.candidate?.email || ''})
        - Job opening: ${jobTitle}
        - Interview Panel details: Type ${interview.type}
        - Interview status: ${interview.status}
        - Focus notes: ${interview.feedback || 'Please complete feedback rubric after completion.'}
      `.trim();

      const startTime = new Date(interview.scheduledAt);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hr default

      const attendees = [appDetails?.candidate?.email].filter(Boolean) as string[];

      // Request confirmation for calendar creation (least privilege + compliance)
      const confirmed = window.confirm(`Authorize applet to add this event to Google Calendar primary calendar for: ${startTime.toLocaleString()}?`);
      if (!confirmed) {
        setIsSyncingCalendar(false);
        return;
      }

      const result = await createCalendarEvent(
        summary,
        description,
        startTime.toISOString(),
        endTime.toISOString(),
        attendees
      );

      setSyncedEvents(prev => ({
        ...prev,
        [selectedInterviewId]: result.htmlLink || 'https://calendar.google.com'
      }));
      setStatusMsg({ type: 'success', text: `Event scheduled in Google Calendar! Sent invites to attendees.` });
    } catch (err: any) {
      console.error(err);
      setStatusMsg({ type: 'error', text: err.message || 'Calendar event creation failed.' });
    } finally {
      setIsSyncingCalendar(false);
    }
  };

  // Google Tasks integration: Sync Onboarding paths to Google Tasks
  const handleSyncOnboardingTasks = async () => {
    if (!token) return;
    setIsSyncingTasks(true);
    setStatusMsg(null);

    try {
      // Find incomplete onboarding tracker tasks
      const activeTasks: { title: string; dueDate: string }[] = [];
      onboardings.forEach(onb => {
        const appDetails = applications.find(a => a.id === onb.applicationId);
        const candName = appDetails?.candidate?.name || 'Candidate';
        onb.tasks.forEach(task => {
          if (!task.completed) {
            activeTasks.push({
              title: `[Onboarding: ${candName}] ${task.title}`,
              dueDate: task.dueDate
            });
          }
        });
      });

      if (activeTasks.length === 0) {
        setStatusMsg({ type: 'info', text: 'All onboarding tasks are already completed! Nothing to sync.' });
        setIsSyncingTasks(false);
        return;
      }

      const confirmed = window.confirm(`Authorize applet to populate ${activeTasks.length} onboarding task(s) into your default Google Tasks list?`);
      if (!confirmed) {
        setIsSyncingTasks(false);
        return;
      }

      let count = 0;
      for (const t of activeTasks) {
        await createGoogleTask(t.title, t.dueDate);
        count++;
      }

      setSyncedTasksCount(count);
      setStatusMsg({ type: 'success', text: `Successfully synchronized ${count} onboarding milestone checklist items to your Google Tasks!` });
    } catch (err: any) {
      console.error(err);
      setStatusMsg({ type: 'error', text: err.message || 'Failed to sync Google Tasks.' });
    } finally {
      setIsSyncingTasks(false);
    }
  };

  // Gmail integration: send custom candidate email
  const handleSendGmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !emailTo || !emailSubject || !emailBody) return;

    setIsSendingEmail(true);
    setStatusMsg(null);

    try {
      const confirmed = window.confirm(`Confirm: Send this email to ${emailTo} using your authenticated Gmail mailbox?`);
      if (!confirmed) {
        setIsSendingEmail(false);
        return;
      }

      const htmlFormatted = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background-color: #4f46e5; padding: 15px; color: #fff; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 18px;">AIRCMS Salesforce Automation Hub</h2>
          </div>
          <div style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
            ${emailBody.replace(/\n/g, '<br/>')}
            <hr style="border: 0; border-top: 1px solid #eee; margin-top: 20px;"/>
            <p style="font-size: 11px; color: #999; margin: 0;">This email was sent dynamically from your Google Workspace integrated Salesforce ATS panel.</p>
          </div>
        </div>
      `;

      await sendGmail(emailTo, emailSubject, htmlFormatted);
      setStatusMsg({ type: 'success', text: `Email sent to ${emailTo} successfully using official Gmail API!` });
      setEmailSubject('');
      setEmailBody('');
    } catch (err: any) {
      console.error(err);
      setStatusMsg({ type: 'error', text: err.message || 'Failed to dispatch Gmail.' });
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Pre-fill email body for test helper
  const prefillEmail = (type: 'invite' | 'onboarding' | 'offer') => {
    if (applications.length === 0) return;
    const firstApp = applications[0];
    const candidateName = firstApp.candidate?.name || 'Sarah Jenkins';
    const candidateEmail = firstApp.candidate?.email || 'sarah.j@example.com';
    const jobTitle = firstApp.job?.title || 'Senior React & Tailwind Developer';

    setEmailTo(candidateEmail);

    if (type === 'invite') {
      setEmailSubject(`Interview Panel Confirmation: ${jobTitle}`);
      setEmailBody(`Hi ${candidateName},\n\nWe are pleased to invite you to our panel interview loop for the ${jobTitle} position.\n\nOur interviewers are scheduling this panel shortly, and a calendar invite will be dispatched to this mailbox.\n\nBest regards,\nRecruitment Advisor`);
    } else if (type === 'offer') {
      setEmailSubject(`Official Salary Offer Package: ${jobTitle}`);
      setEmailBody(`Dear ${candidateName},\n\nWe are absolutely thrilled to present you with an official offer to join our engineering organization as a ${jobTitle}!\n\nOur HR Admin and compensation squad have approved the following compensation structure. Please review the details in our onboarding workspace.\n\nWarmly,\nTalent Acquisition Specialist`);
    } else {
      setEmailSubject(`Employee Onboarding Logistics Guide: ${jobTitle}`);
      setEmailBody(`Hi ${candidateName},\n\nWelcome to the family! Your background checks are passing, and we are ordering your logistics workstation. Your onboarding duties have been created.\n\nPlease complete the contracts and documentation signature packages as soon as possible.\n\nExcited to start!`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span>Google Workspace Integration Control Center</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Secure, real-time client-side auth mapping your recruiting pipelines to Gmail, Sheets, Calendar, and Tasks.</p>
        </div>
        {token && (
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-1 px-3 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Disconnect Workspace</span>
          </button>
        )}
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-xl border flex items-start space-x-2.5 text-xs font-semibold ${
          statusMsg.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : statusMsg.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-indigo-50 border-indigo-200 text-indigo-800'
        }`}>
          <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${
            statusMsg.type === 'success' ? 'text-emerald-600' : statusMsg.type === 'error' ? 'text-rose-600' : 'text-indigo-600'
          }`} />
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Authentication view */}
      {!token ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-8 text-center max-w-2xl mx-auto space-y-6 my-4">
          <div className="mx-auto w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">Authorize Google Workspace Integration</h3>
            <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
              Connect your Google Workspace credentials to activate declarative CRM automated flows. By signing in, this application gains permission from you to sync data directly to your Workspace products.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-left py-2">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-start space-x-2.5">
              <Mail className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-bold text-slate-800 text-[11px]">Gmail Mailbox</h4>
                <p className="text-[10px] text-slate-400">Compose and dispatch offer letters and scheduling confirmations with permission.</p>
              </div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-start space-x-2.5">
              <Table className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-bold text-slate-800 text-[11px]">Google Sheets</h4>
                <p className="text-[10px] text-slate-400">Generate real-time synchronized ATS candidate pipelines and export structures.</p>
              </div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-start space-x-2.5">
              <CalendarIcon className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-bold text-slate-800 text-[11px]">Google Calendar</h4>
                <p className="text-[10px] text-slate-400">Book interview panel slots with automatic attendee invitation grids.</p>
              </div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-start space-x-2.5">
              <CheckSquare className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-bold text-slate-800 text-[11px]">Google Tasks</h4>
                <p className="text-[10px] text-slate-400">Sync employee onboarding checklist milestones straight into your Task List.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button 
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-55 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Connecting Secure Tunnel...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Connect Google Workspace APIs</span>
                </>
              )}
            </button>
          </div>
          <div className="text-[10px] text-slate-400">
            Secure client-side OAuth credential mapping. Private token caching is stored only in memory.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main workspace widgets */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Connected status bar */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-extrabold text-sm">
                    {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'G'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{user?.displayName || 'Active Google Session'}</h3>
                    <p className="text-xs text-slate-400">{user?.email || 'Authenticated Account'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Active Workspace</span>
                </div>
              </div>

              {/* Status channels indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center space-y-1">
                  <Mail className="w-4 h-4 text-indigo-600 mx-auto" />
                  <div className="font-bold text-[11px] text-slate-800">Gmail API</div>
                  <div className="text-[9px] text-emerald-600 font-semibold flex items-center justify-center space-x-0.5">
                    <Check className="w-3 h-3" /> <span>Connected</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center space-y-1">
                  <Table className="w-4 h-4 text-emerald-600 mx-auto" />
                  <div className="font-bold text-[11px] text-slate-800">Sheets API</div>
                  <div className="text-[9px] text-emerald-600 font-semibold flex items-center justify-center space-x-0.5">
                    <Check className="w-3 h-3" /> <span>Connected</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center space-y-1">
                  <CalendarIcon className="w-4 h-4 text-blue-600 mx-auto" />
                  <div className="font-bold text-[11px] text-slate-800">Calendar API</div>
                  <div className="text-[9px] text-emerald-600 font-semibold flex items-center justify-center space-x-0.5">
                    <Check className="w-3 h-3" /> <span>Connected</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center space-y-1">
                  <CheckSquare className="w-4 h-4 text-amber-600 mx-auto" />
                  <div className="font-bold text-[11px] text-slate-800">Tasks API</div>
                  <div className="text-[9px] text-emerald-600 font-semibold flex items-center justify-center space-x-0.5">
                    <Check className="w-3 h-3" /> <span>Connected</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Sheets Trigger widget */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                <Table className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-slate-900 text-sm">Google Sheets Live Exports</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Compile and export your entire Salesforce ATS applicant pipeline registry directly to a newly generated spreadsheet. This builds a dynamic document with candidates details, interview records, scoring indexes, and priority tags.
              </p>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <button
                  onClick={handleExportToSheets}
                  disabled={isExportingSheet || applications.length === 0}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-55 text-white font-bold text-xs rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  {isExportingSheet ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating Live Spreadsheet...</span>
                    </>
                  ) : (
                    <>
                      <Table className="w-3.5 h-3.5" />
                      <span>Export ATS Pipeline to Google Sheets</span>
                    </>
                  )}
                </button>

                {generatedSheetUrl && (
                  <a
                    href={generatedSheetUrl}
                    target="_blank"
                    rel="noreferrer referrer"
                    className="px-4 py-2 border border-slate-200 text-indigo-600 hover:bg-indigo-50 font-bold text-xs rounded-lg transition flex items-center space-x-1"
                  >
                    <span>Open Exported Sheet</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <p className="text-[10px] font-mono text-slate-400">
                Data count: {applications.length} pipelines, {candidates.length} candidates records loaded.
              </p>
            </div>

            {/* Google Calendar trigger scheduling */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                <CalendarIcon className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-slate-900 text-sm">Google Calendar Direct Invites Dispatcher</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Connect and sync CRM interview panel bookings straight into Google Calendar. This will create calendar events with designated dates, panel guidelines, and automatically invite the candidate as an attendee.
              </p>

              <form onSubmit={handleSyncInterviewToCalendar} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Select Scheduled CRM Interview to Sync *</label>
                  <select
                    required
                    value={selectedInterviewId}
                    onChange={(e) => setSelectedInterviewId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                  >
                    <option value="">-- Choose active interview --</option>
                    {interviews.map(i => {
                      const appDetails = applications.find(a => a.id === i.applicationId);
                      const candName = appDetails?.candidate?.name || 'N/A';
                      const jobTitle = appDetails?.job?.title || 'N/A';
                      return (
                        <option key={i.id} value={i.id}>
                          {candName} - {jobTitle} ({i.type} Panel, Status: {i.status}, Date: {new Date(i.scheduledAt).toLocaleDateString()})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSyncingCalendar || !selectedInterviewId}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-55 text-white font-bold text-xs rounded-lg transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    {isSyncingCalendar ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Synchronizing Event...</span>
                      </>
                    ) : (
                      <>
                        <CalendarIcon className="w-3.5 h-3.5" />
                        <span>Book Google Calendar Event & Invite</span>
                      </>
                    )}
                  </button>

                  {selectedInterviewId && syncedEvents[selectedInterviewId] && (
                    <a
                      href={syncedEvents[selectedInterviewId]}
                      target="_blank"
                      rel="noreferrer referrer"
                      className="px-4 py-2 border border-slate-200 text-indigo-600 hover:bg-indigo-50 font-bold text-xs rounded-lg transition flex items-center space-x-1"
                    >
                      <span>Open Calendar Event</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </form>
            </div>

            {/* Google Tasks sync onboarding tracker */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                <CheckSquare className="w-4 h-4 text-amber-600" />
                <h4 className="font-bold text-slate-900 text-sm">Google Tasks Milestone Sync</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Bulk synchronize outstanding onboarding milestone guidelines (workstations orderings, backgrounds screenings, and contracts filings) directly into your personal Gmail Google Task list. This aggregates duties so you never drop the ball on employee day-ones.
              </p>

              <div className="flex items-center space-x-4">
                <button
                  onClick={handleSyncOnboardingTasks}
                  disabled={isSyncingTasks || onboardings.length === 0}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-55 text-white font-bold text-xs rounded-lg transition flex items-center space-x-1.5 cursor-pointer"
                >
                  {isSyncingTasks ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Syncing Checklist Milestones...</span>
                    </>
                  ) : (
                    <>
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Sync Onboarding to Google Tasks</span>
                    </>
                  )}
                </button>
                {syncedTasksCount !== null && (
                  <span className="text-xs text-slate-500 font-semibold bg-slate-50 border border-slate-150 px-2.5 py-1 rounded-full">
                    ✓ Synced {syncedTasksCount} tasks
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Sidebar: Gmail Quick Dispatcher */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                <Mail className="w-4 h-4 text-indigo-600" />
                <h4 className="font-bold text-slate-900 text-sm">Gmail Candidate Messenger</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Dispatch official recruitment correspondence straight from your Gmail mailbox. Connect and choose a template layout, or customize a draft below:
              </p>

              {/* Template shortcuts */}
              <div className="flex flex-wrap gap-1.5">
                <button 
                  onClick={() => prefillEmail('invite')}
                  className="text-[10px] font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded px-2 py-1 text-slate-600"
                >
                  Invite Panel Temp
                </button>
                <button 
                  onClick={() => prefillEmail('offer')}
                  className="text-[10px] font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded px-2 py-1 text-slate-600"
                >
                  Offer Temp
                </button>
                <button 
                  onClick={() => prefillEmail('onboarding')}
                  className="text-[10px] font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded px-2 py-1 text-slate-600"
                >
                  Onboarding Temp
                </button>
              </div>

              <form onSubmit={handleSendGmail} className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Candidate Email Address *</label>
                  <input
                    type="email"
                    required
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    placeholder="sarah.j@example.com"
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Subject *</label>
                  <input
                    type="text"
                    required
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="e.g. Dynamic Panel invitation - Sarah Jenkins"
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Email Body Message *</label>
                  <textarea
                    required
                    rows={6}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Draft employee invitation or compensations package here..."
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSendingEmail || !emailTo || !emailSubject || !emailBody}
                  className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-55 text-white font-bold text-xs rounded-lg transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  {isSendingEmail ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Email via Gmail...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Official Gmail Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
