import React from 'react';
import { 
  Cloud, 
  Search, 
  Bell, 
  HelpCircle, 
  Settings, 
  User, 
  ShieldAlert,
  Menu
} from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
}

export default function Header({ 
  currentRole, 
  onRoleChange, 
  onToggleChat,
  isChatOpen 
}: HeaderProps) {
  
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'Recruiter': return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'Hiring Manager': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Interviewer': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'HR Admin': return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case 'Recruiter': return 'Create jobs, register candidates, manage applications, and schedule interviews.';
      case 'Hiring Manager': return 'Review top shortlisted candidates, see Agentforce AI insights, and approve salary offers.';
      case 'Interviewer': return 'Provide ratings, evaluate assigned candidate interviews, and submit technical/cultural feedback.';
      case 'HR Admin': return 'Configure and manage Salesforce Flows automation rules, monitor system logs, and oversee compliance.';
    }
  };

  return (
    <header className="bg-white text-slate-900 shadow-sm border-b border-slate-200 sticky top-0 z-40">
      {/* Top utility row */}
      <div className="flex items-center justify-between px-6 py-2 h-14">
        {/* Left branding */}
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 text-white p-1.5 rounded-lg shadow-sm flex items-center justify-center">
            <Cloud className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-sans text-[9px] tracking-wider font-bold uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                Salesforce Lightning
              </span>
            </div>
            <h1 className="text-sm md:text-md font-bold tracking-tight text-slate-900">
              AIRCMS Recruitment Workspace
            </h1>
          </div>
        </div>

        {/* Center Search */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search Salesforce candidate, job, or application records..."
              className="w-full bg-slate-100 border-none text-slate-900 placeholder-slate-400 text-xs pl-10 pr-4 py-1.5 rounded-full focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all border border-transparent"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-2" />
          </div>
        </div>

        {/* Right utility items */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <button className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition relative" title="Notifications">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white"></span>
          </button>

          {/* Help */}
          <button className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition hidden sm:block" title="Help">
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Setup / Settings */}
          <button className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition hidden sm:block" title="CRM Setup">
            <Settings className="w-4 h-4" />
          </button>

          {/* Role selector interface */}
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg shadow-xs">
            <div className="text-right hidden lg:block">
              <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider leading-none">
                Active Persona
              </div>
              <div className="text-[11px] font-semibold leading-tight text-slate-700 mt-0.5">
                {currentRole}
              </div>
            </div>
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-slate-800 text-xs font-semibold py-1 focus:outline-none cursor-pointer hover:text-indigo-600 border-none pr-1"
            >
              <option value="Recruiter">Recruiter (Admin)</option>
              <option value="Hiring Manager">Hiring Manager</option>
              <option value="Interviewer">Interviewer Panel</option>
              <option value="HR Admin">Salesforce Admin</option>
            </select>
          </div>

          {/* Profile Circle */}
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-xs shadow-xs hover:bg-indigo-100 cursor-pointer transition" title="User Profile">
            TA
          </div>
        </div>
      </div>

      {/* Persona Context Banner */}
      <div className="bg-slate-50 text-slate-600 px-6 py-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1.5 sm:space-y-0 text-xs">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
          <span className="font-medium text-slate-700">
            Role Scope: <strong className="text-indigo-700 bg-indigo-50 border border-indigo-100/80 px-2 py-0.5 rounded text-[11px] font-semibold">{currentRole}</strong>
          </span>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="text-slate-500 italic text-[11px]">
            {getRoleDescription(currentRole)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={onToggleChat}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center space-x-1 border ${
              isChatOpen 
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm' 
                : 'bg-white text-indigo-600 border-slate-200 hover:bg-indigo-50'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block mr-1"></span>
            <span>Agentforce AI Chat</span>
          </button>
        </div>
      </div>
    </header>
  );
}
