import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { 
  Briefcase, 
  Users, 
  Brain, 
  ClipboardCheck, 
  CheckCircle,
  FileCheck2,
  RefreshCw
} from 'lucide-react';
import { DashboardMetrics } from '../types';

interface DashboardProps {
  metrics: DashboardMetrics;
  onRefresh: () => void;
  isLoading: boolean;
  onTabChange: (tab: string) => void;
}

export default function Dashboard({ metrics, onRefresh, isLoading, onTabChange }: DashboardProps) {
  
  // Transform applications by stage into chart format
  const stageData = [
    { name: 'Applied', value: metrics.applicationsByStage.Applied || 0, color: '#9ca3af' },
    { name: 'Screening', value: metrics.applicationsByStage.Screening || 0, color: '#fb923c' },
    { name: 'Shortlisted', value: metrics.applicationsByStage.Shortlisted || 0, color: '#60a5fa' },
    { name: 'Interview', value: metrics.applicationsByStage.Interview || 0, color: '#f59e0b' },
    { name: 'Selected', value: metrics.applicationsByStage.Selected || 0, color: '#a78bfa' },
    { name: 'Offer', value: metrics.applicationsByStage.Offer || 0, color: '#ec4899' },
    { name: 'Onboarding', value: metrics.applicationsByStage.Onboarding || 0, color: '#06b6d4' },
    { name: 'Hired', value: metrics.applicationsByStage.Hired || 0, color: '#10b981' },
  ];

  // AI Priority breakdown based on mock statistics
  const aiPriorityData = [
    { name: 'High Fit', value: 4, color: '#10b981' },
    { name: 'Medium Fit', value: 2, color: '#3b82f6' },
    { name: 'Low Fit', value: 1, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Dashboard Control Ribbon */}
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Hiring Intelligence Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time recruitment performance logs sync with Agentforce AI</p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 shadow-xs transition disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''} text-indigo-600`} />
          <span>{isLoading ? 'Syncing...' : 'Refresh CRM'}</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Active Openings */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between hover:border-indigo-300 hover:shadow-sm transition cursor-pointer" onClick={() => onTabChange('jobs')}>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Openings</p>
            <p className="text-2xl font-extrabold text-indigo-600">{metrics.activeJobOpenings} <span className="text-xs font-normal text-slate-400">/ {metrics.totalJobOpenings}</span></p>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
            <Briefcase className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Total Applications */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between hover:border-indigo-300 hover:shadow-sm transition cursor-pointer" onClick={() => onTabChange('applications')}>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hiring Pipeline</p>
            <p className="text-2xl font-extrabold text-indigo-600">{metrics.totalApplications}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
            <Users className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Avg AI Match Score */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between hover:border-emerald-300 hover:shadow-sm transition">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Agentforce IQ</p>
            <p className="text-2xl font-extrabold text-emerald-600">{metrics.averageAiScore}%</p>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
            <Brain className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Pending Offer Approvals */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between hover:border-rose-300 hover:shadow-sm transition cursor-pointer" onClick={() => onTabChange('offers')}>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Offer Approvals</p>
            <p className="text-2xl font-extrabold text-rose-600">{metrics.pendingApprovals}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600">
            <ClipboardCheck className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Successful Placements */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between hover:border-sky-300 hover:shadow-sm transition cursor-pointer" onClick={() => onTabChange('onboarding')}>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Onboarding</p>
            <p className="text-2xl font-extrabold text-sky-600">{metrics.hiredThisMonth}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-sky-50 text-sky-600">
            <CheckCircle className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnel chart (Bar Chart) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center space-x-1.5">
              <FileCheck2 className="w-4 h-4 text-indigo-600" />
              <span>Job Candidates Distribution by Recruitment Stage</span>
            </h3>
            <p className="text-[11px] text-slate-500">Pipeline progression tracked from Applied to Hired status</p>
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '11px' }} 
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="value" name="Candidates">
                  {stageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Priority Breakdown (Pie Chart) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center space-x-1.5">
              <Brain className="w-4 h-4 text-indigo-600" />
              <span>Agentforce AI Match Assessment</span>
            </h3>
            <p className="text-[11px] text-slate-500">Calculated priority match levels based on LLM screening</p>
          </div>

          <div className="h-[220px] w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={aiPriorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {aiPriorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px', border: '1px solid #e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <p className="text-[9px] text-slate-400 font-bold uppercase leading-none">Global Average</p>
              <p className="text-3xl font-extrabold text-slate-800 mt-1">{metrics.averageAiScore}%</p>
              <p className="text-[10px] text-emerald-600 font-bold mt-0.5">High Performance</p>
            </div>
          </div>

          <div className="flex justify-center space-x-4 text-xs font-semibold">
            {aiPriorityData.map((entry, idx) => (
              <div key={idx} className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: entry.color }}></span>
                <span className="text-slate-600">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Recent Actions Panel */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 tracking-tight mb-3">Workspace Recommendations & Action Items</h3>
        <div className="space-y-3">
          {metrics.pendingApprovals > 0 ? (
            <div className="flex items-start space-x-3 p-3 bg-rose-50/50 border border-rose-100 rounded-lg">
              <span className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-rose-500"></span>
              <div className="flex-1">
                <p className="text-xs font-bold text-rose-900">Pending Salary Approvals Exist</p>
                <p className="text-xs text-rose-700 mt-0.5">There is 1 offer salary proposal requiring Hiring Manager approval. Review certification compliance before sign-off.</p>
              </div>
              <button 
                onClick={() => onTabChange('offers')}
                className="text-xs font-bold text-rose-900 hover:underline flex-shrink-0 cursor-pointer"
              >
                Go Approve &rarr;
              </button>
            </div>
          ) : null}

          <div className="flex items-start space-x-3 p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg">
            <span className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-indigo-500"></span>
            <div className="flex-1">
              <p className="text-xs font-bold text-indigo-900">Run Screening Loop</p>
              <p className="text-xs text-indigo-700 mt-0.5">You have un-screened applicant Elena Rostova waiting for an Agentforce IQ analysis under AI Technical Product Manager.</p>
            </div>
            <button 
              onClick={() => onTabChange('applications')}
              className="text-xs font-bold text-indigo-900 hover:underline flex-shrink-0 cursor-pointer"
            >
              Scan CV &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
