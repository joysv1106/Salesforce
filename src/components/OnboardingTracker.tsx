import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Truck, 
  FileText, 
  SearchCode, 
  UserCheck, 
  TrendingUp, 
  RefreshCw,
  Award
} from 'lucide-react';
import { Onboarding, UserRole, OnboardingTask } from '../types';

interface OnboardingTrackerProps {
  onboardings: Onboarding[];
  applications: any[];
  candidates: any[];
  currentRole: UserRole;
  onUpdateOnboarding: (id: string, onboardingData: Partial<Onboarding>) => Promise<void>;
}

export default function OnboardingTracker({ 
  onboardings, 
  applications, 
  candidates, 
  currentRole, 
  onUpdateOnboarding 
}: OnboardingTrackerProps) {

  const getCandidateName = (appId: string) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return 'Unknown applicant';
    const cand = candidates.find(c => c.id === app.candidateId);
    return cand ? cand.name : 'Unknown';
  };

  const getJobTitle = (appId: string) => {
    const app = applications.find(a => a.id === appId);
    return app ? app.job?.title : 'Unknown Requisition';
  };

  const handleToggleTask = async (onb: Onboarding, taskId: string) => {
    const updatedTasks = onb.tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    
    await onUpdateOnboarding(onb.id, { tasks: updatedTasks });
  };

  const handleStatusChange = async (onb: Onboarding, field: 'backgroundCheck' | 'documentStatus' | 'equipmentStatus', value: string) => {
    await onUpdateOnboarding(onb.id, { [field]: value });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Signed':
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-150';
      case 'Pending':
      case 'Sent':
      case 'Shipped':
      case 'Ordered':
        return 'bg-indigo-50 text-indigo-750 border-indigo-150';
      case 'Failed':
      case 'Incomplete':
        return 'bg-rose-50 text-rose-700 border-rose-150';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-150';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            <span>Onboarding Lifecycles & Checklist Tracker</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage backgrounds, signing packages, and workspace logistics to coordinate successful first days</p>
        </div>
      </div>

      {/* Google Workspace Info Banner */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 flex items-center space-x-2.5 text-xs text-amber-900 font-semibold shadow-xs">
        <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />
        <span>Manage onboarding smoothly: Automatically synchronize all checklist milestones and logistics duties straight to your <strong>Google Tasks</strong> list from our <strong>Google Workspace Integration</strong> center!</span>
      </div>

      {/* Onboarding grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {onboardings.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-xs font-semibold shadow-xs">
              No candidates are currently undergoing onboarding pipelines. Approve an offer package to initialize onboarding.
            </div>
          ) : (
            onboardings.map((onb) => {
              const candidate = getCandidateName(onb.applicationId);
              const jobTitle = getJobTitle(onb.applicationId);
              const isCompleted = onb.completed;

              return (
                <div 
                  key={onb.id}
                  className={`bg-white border rounded-xl shadow-xs p-5 space-y-5 transition ${
                    isCompleted ? 'border-emerald-300 bg-emerald-50/10' : 'border-slate-200'
                  }`}
                >
                  {/* Candidate header */}
                  <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                    <div>
                      <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">Hired Pipeline</span>
                      <h4 className="font-extrabold text-gray-900 text-base mt-1">{candidate}</h4>
                      <p className="text-xs text-gray-500 font-semibold">{jobTitle}</p>
                    </div>
                    <span className={`text-[10px] font-bold border px-2.5 py-0.5 rounded-full ${
                      isCompleted 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                        : 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse'
                    }`}>
                      {isCompleted ? 'Orientation Ready / Hired' : 'Active Onboarding'}
                    </span>
                  </div>

                  {/* 3 Core Onboarding Channels */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Background */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                      <div className="flex items-center space-x-1 text-slate-700 font-bold text-[10px] uppercase tracking-wider">
                        <SearchCode className="w-4 h-4 text-slate-400" />
                        <span>Background Check</span>
                      </div>
                      <select
                        value={onb.backgroundCheck}
                        disabled={currentRole === 'Interviewer'}
                        onChange={(e) => handleStatusChange(onb, 'backgroundCheck', e.target.value)}
                        className={`w-full font-bold text-xs py-1.5 px-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 ${getStatusBadgeClass(onb.backgroundCheck)}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed / Passed</option>
                        <option value="Failed">Failed / Flagged</option>
                      </select>
                    </div>

                    {/* Signings */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                      <div className="flex items-center space-x-1 text-slate-700 font-bold text-[10px] uppercase tracking-wider">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span>Contracts & Docs</span>
                      </div>
                      <select
                        value={onb.documentStatus}
                        disabled={currentRole === 'Interviewer'}
                        onChange={(e) => handleStatusChange(onb, 'documentStatus', e.target.value)}
                        className={`w-full font-bold text-xs py-1.5 px-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 ${getStatusBadgeClass(onb.documentStatus)}`}
                      >
                        <option value="Incomplete">Incomplete</option>
                        <option value="Sent">Sent to Candidate</option>
                        <option value="Signed">Signed & Received</option>
                      </select>
                    </div>

                    {/* Logistics Equipment */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                      <div className="flex items-center space-x-1 text-slate-700 font-bold text-[10px] uppercase tracking-wider">
                        <Truck className="w-4 h-4 text-slate-400" />
                        <span>Logistics Workstation</span>
                      </div>
                      <select
                        value={onb.equipmentStatus}
                        disabled={currentRole === 'Interviewer'}
                        onChange={(e) => handleStatusChange(onb, 'equipmentStatus', e.target.value)}
                        className={`w-full font-bold text-xs py-1.5 px-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 ${getStatusBadgeClass(onb.equipmentStatus)}`}
                      >
                        <option value="Ordered">Ordered</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered & Set up</option>
                      </select>
                    </div>
                  </div>

                  {/* Task Checklist Items */}
                  <div className="space-y-3 pt-1">
                    <h5 className="font-bold text-[10px] uppercase text-slate-400 tracking-wider">Milestone Progress Task Checklist</h5>
                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                      {onb.tasks.map((task) => (
                        <div 
                          key={task.id}
                          className="flex items-center justify-between p-3 hover:bg-slate-50/50 transition text-xs"
                        >
                          <div className="flex items-center space-x-2.5">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              disabled={currentRole === 'Interviewer'}
                              onChange={() => handleToggleTask(onb, task.id)}
                              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <span className={`font-semibold ${task.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                              {task.title}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">Due: {task.dueDate}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Guidelines sidebar */}
        <div className="space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Salesforce Automated Workflows Info</h3>
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center space-x-2 text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Autopilot Workflows</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our simulated Salesforce Flows monitor onboarding records in real-time.
            </p>
            <div className="p-3.5 bg-indigo-50/50 rounded-lg border border-indigo-100 text-xs text-indigo-900 space-y-2">
              <p className="font-bold flex items-center">
                <CheckCircle className="w-4 h-4 text-indigo-600 mr-1.5 flex-shrink-0" />
                Trigger: Onboarding Closure
              </p>
              <p className="text-[11px] leading-relaxed">
                When <strong>Background Check is Completed</strong>, <strong>Contracts are Signed</strong>, <strong>Logistics are Delivered</strong>, and <strong>All Tasks are ticked</strong>, Salesforce:
              </p>
              <ol className="list-decimal pl-4 text-[11px] space-y-1 font-semibold">
                <li>Locks the onboarding file.</li>
                <li>Updates Candidate state to 'Hired'.</li>
                <li>Generates corporate email credentials.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
