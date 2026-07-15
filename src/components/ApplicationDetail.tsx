import React, { useState } from 'react';
import { 
  Briefcase, 
  User, 
  Sparkles, 
  Brain, 
  Calendar, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  UserCheck2,
  ChevronRight,
  ShieldCheck,
  Award
} from 'lucide-react';
import { JobApplication, UserRole } from '../types';

interface ApplicationDetailProps {
  applications: (JobApplication & { candidate: any; job: any })[];
  currentRole: UserRole;
  onUpdateStage: (id: string, stage: string, notes?: string) => Promise<void>;
  onTriggerAiEvaluate: (id: string) => Promise<any>;
}

export default function ApplicationDetail({ 
  applications, 
  currentRole, 
  onUpdateStage,
  onTriggerAiEvaluate 
}: ApplicationDetailProps) {
  const [selectedAppId, setSelectedAppId] = useState<string>(applications[0]?.id || '');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [stageNotes, setStageNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const selectedApp = applications.find(a => a.id === selectedAppId);

  const STAGES = [
    'Applied', 
    'Screening', 
    'Shortlisted', 
    'Interview', 
    'Selected', 
    'Offer', 
    'Onboarding',
    'Hired'
  ];

  const handleStageClick = async (stage: string) => {
    if (!selectedApp) return;
    try {
      setErrorMsg('');
      setSuccessMsg('');
      await onUpdateStage(selectedApp.id, stage, `Stage updated manually to ${stage}.`);
      setSuccessMsg(`Stage advanced to "${stage}"! Associated Salesforce Flows executed successfully.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update stage');
    }
  };

  const handleAiEvaluation = async () => {
    if (!selectedApp) return;
    setIsAiLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await onTriggerAiEvaluate(selectedApp.id);
      setSuccessMsg(res.isMock 
        ? 'Agentforce screening completed successfully (Fallback Simulation Mode)!'
        : 'Agentforce real-time AI evaluation completed successfully!'
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Agentforce AI evaluation failed');
    } finally {
      setIsAiLoading(false);
    }
  };

  const getPriorityBadgeStyle = (p: string | null) => {
    switch (p) {
      case 'High': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Medium': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Low': return 'bg-rose-100 text-[#a21f1f] border-rose-300';
      default: return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <span>Job Application Stages Console</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Evaluate candidates across CRM phases with Agentforce AI cognitive audits</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications Left Menu */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[580px]">
          <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500">
            Active Application Registry ({applications.length})
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {applications.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">No active applications currently registered.</div>
            ) : (
              applications.map((app) => (
                <div
                  key={app.id}
                  onClick={() => {
                    setSelectedAppId(app.id);
                    setSuccessMsg('');
                    setErrorMsg('');
                  }}
                  className={`p-4 cursor-pointer hover:bg-slate-50 transition text-xs space-y-2 ${
                    selectedAppId === app.id ? 'bg-indigo-50/50 border-l-4 border-indigo-600' : 'border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-sm text-gray-900">{app.candidate?.name || 'Loading candidate...'}</span>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
                      {app.stage}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-600 font-semibold truncate flex items-center">
                      <Briefcase className="w-3.5 h-3.5 mr-1 text-gray-400" />
                      {app.job?.title || 'Loading job Opening...'}
                    </p>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-gray-400">
                    <span>Applied: {new Date(app.appliedDate).toLocaleDateString()}</span>
                    {app.aiScore !== null && (
                      <span className="font-bold text-emerald-600 flex items-center">
                        <Sparkles className="w-3 h-3 mr-0.5" /> Score: {app.aiScore}%
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Application workspace */}
        <div className="lg:col-span-2 space-y-6">
          {selectedApp ? (
            <div className="space-y-6">
              {/* Feedback banners */}
              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-semibold flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 font-semibold flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Salesforce Chevron Stage Tracker */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-bold uppercase text-[9px] text-slate-400">Salesforce Path Pipeline Tracker</span>
                  <span className="font-bold text-slate-900">Stage: <strong className="text-indigo-600">{selectedApp.stage}</strong></span>
                </div>

                <div className="flex items-center w-full overflow-x-auto py-1 scrollbar-none">
                  {STAGES.map((stage, idx) => {
                    const isCompleted = STAGES.indexOf(selectedApp.stage) >= idx;
                    const isActive = selectedApp.stage === stage;
                    return (
                      <button
                        key={stage}
                        disabled={currentRole === 'Interviewer'}
                        onClick={() => handleStageClick(stage)}
                        className={`flex items-center justify-center text-[11px] font-bold px-3 py-1.5 mr-1.5 rounded-lg transition-all shadow-xs border whitespace-nowrap focus:outline-none cursor-pointer ${
                          isActive 
                            ? 'bg-indigo-600 text-white border-indigo-700 scale-105' 
                            : isCompleted 
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' 
                              : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {isCompleted && !isActive && <CheckCircle className="w-3 h-3 mr-1 inline" />}
                        <span>{stage}</span>
                        {idx < STAGES.length - 1 && <ChevronRight className="w-3.5 h-3.5 ml-1.5 text-gray-300" />}
                      </button>
                    );
                  })}
                </div>
                {currentRole === 'Interviewer' && (
                  <p className="text-[10px] text-amber-600 font-medium italic">Interviewers are restricted from manual stage promotion.</p>
                )}
              </div>

              {/* Layout splits into profile overview and Agentforce AI screening */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Profile details */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">Candidate Profile Context</h3>
                  <div className="space-y-3.5 text-xs">
                    <div className="flex items-start space-x-3">
                      <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600 mt-0.5"><User className="w-4 h-4" /></div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Applicant</p>
                        <p className="font-extrabold text-slate-900">{selectedApp.candidate?.name}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{selectedApp.candidate?.email} | {selectedApp.candidate?.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600 mt-0.5"><Briefcase className="w-4 h-4" /></div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Target Job Requisition</p>
                        <p className="font-bold text-indigo-600 hover:underline cursor-pointer">{selectedApp.job?.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Department: {selectedApp.job?.department} | Required Exp: {selectedApp.job?.experienceYears}+ years</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600 mt-0.5"><FileText className="w-4 h-4" /></div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Academic Qualifications</p>
                        <p className="font-semibold text-slate-700 leading-normal">{selectedApp.candidate?.education || 'No degrees listed'}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Registered Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedApp.candidate?.skills.map((skill: string) => (
                          <span key={skill} className="text-[9px] font-bold bg-slate-100 text-slate-800 border border-slate-200 px-1.5 py-0.5 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Agentforce AI intelligence */}
                <div className="bg-gradient-to-br from-[#121c35] to-[#1a2c53] text-white p-5 rounded-xl border border-blue-900 shadow-md space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="text-sky-300 w-5 h-5 animate-pulse" />
                      <h3 className="font-extrabold text-sm tracking-tight text-white flex items-center space-x-1.5">
                        <span>Agentforce AI Hub</span>
                      </h3>
                    </div>
                    {selectedApp.aiPriority && (
                      <span className={`text-[9px] font-extrabold border px-2 py-0.5 rounded-full ${getPriorityBadgeStyle(selectedApp.aiPriority)}`}>
                        {selectedApp.aiPriority} Match
                      </span>
                    )}
                  </div>

                  {selectedApp.aiScore !== null ? (
                    <div className="space-y-4 text-xs">
                      {/* Score circle layout */}
                      <div className="flex items-center space-x-4">
                        <div className="relative w-16 h-16 rounded-full border-4 border-slate-700 flex items-center justify-center">
                          <span className="font-mono text-xl font-black text-sky-300">{selectedApp.aiScore}</span>
                          <span className="text-[8px] absolute bottom-1 text-slate-400 font-bold">% match</span>
                        </div>
                        <div>
                          <p className="text-[10px] text-sky-200 font-bold uppercase tracking-wider flex items-center">
                            <Brain className="w-3 h-3 mr-1" /> LLM Fit Indicator
                          </p>
                          <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                            Evaluated against {selectedApp.job?.requiredSkills.length} core requirements.
                          </p>
                        </div>
                      </div>

                      {/* Brief executive summary */}
                      <div className="bg-slate-800/60 p-3 rounded border border-slate-700 text-[11px] text-slate-100 leading-relaxed">
                        <span className="font-bold block text-sky-200 text-[9px] uppercase tracking-wider mb-0.5">Cognitive Assessment</span>
                        {selectedApp.aiSummary}
                      </div>

                      {/* Skill analysis bullets */}
                      <div className="space-y-1">
                        <span className="font-bold text-sky-200 text-[9px] uppercase tracking-wider">Strengths & Skill Fit</span>
                        <div className="text-[10px] text-slate-300 pl-3 border-l border-sky-600/40 space-y-0.5 italic">
                          {selectedApp.aiFitAnalysis}
                        </div>
                      </div>

                      {/* Identified Risks Gaps */}
                      {selectedApp.aiRisks && (
                        <div className="space-y-1">
                          <span className="font-bold text-rose-300 text-[9px] uppercase tracking-wider flex items-center">
                            <AlertTriangle className="w-3 h-3 mr-1 text-rose-400" /> Potential Hiring Risks / Gaps
                          </span>
                          <p className="text-[10px] text-slate-300 leading-normal pl-3 border-l border-rose-500/40">
                            {selectedApp.aiRisks}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4 py-3 text-center flex flex-col items-center justify-center">
                      <Brain className="w-10 h-10 text-sky-300 animate-pulse" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-100">No AI Assessment Available</p>
                        <p className="text-[10px] text-slate-300 max-w-xs mx-auto">Trigger Agentforce cognitive analytics to screen qualifications, calculate fit percentage, and highlight risks.</p>
                      </div>
                    </div>
                  )}

                  {/* AI trigger Button */}
                  <button
                    onClick={handleAiEvaluation}
                    disabled={isAiLoading || (currentRole !== 'Recruiter' && currentRole !== 'HR Admin')}
                    className="w-full mt-2 py-2 bg-sky-500 hover:bg-sky-600 text-slate-900 font-extrabold text-xs rounded shadow-sm transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-slate-900" />
                    <span>{isAiLoading ? 'Evaluating Applicant Resume...' : 'Screen with Agentforce AI'}</span>
                  </button>
                </div>
              </div>

              {/* Activity Logs & History */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3.5">
                <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2 flex items-center space-x-1.5">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>Salesforce Activity History & Status Notes</span>
                </h3>
                <div className="text-[11px] text-slate-600 bg-slate-50 border border-slate-200 p-3 rounded-lg font-mono overflow-y-auto max-h-[140px] whitespace-pre-wrap leading-relaxed">
                  {selectedApp.notes || 'No activity log notes logged yet.'}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-400 flex flex-col items-center justify-center space-y-3 h-[400px]">
              <Activity className="w-10 h-10 text-slate-300 animate-pulse" />
              <p className="text-sm font-semibold">Select any candidate linkage from the left list to review stage details, manual overrides, and Agentforce AI evaluations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
