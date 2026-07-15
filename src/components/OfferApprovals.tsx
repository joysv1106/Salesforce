import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  DollarSign, 
  TrendingUp, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FolderLock, 
  ArrowRight,
  ShieldAlert,
  Award
} from 'lucide-react';
import { Offer, UserRole } from '../types';

interface OfferApprovalsProps {
  offers: Offer[];
  applications: any[];
  candidates: any[];
  currentRole: UserRole;
  onApproveOffer: (id: string, status: 'Approved' | 'Rejected', approvedBy: string) => Promise<void>;
  onCreateOffer: (offerData: any) => Promise<void>;
}

export default function OfferApprovals({ 
  offers, 
  applications, 
  candidates, 
  currentRole, 
  onApproveOffer,
  onCreateOffer 
}: OfferApprovalsProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [appId, setAppId] = useState('');
  const [salary, setSalary] = useState(130000);
  const [equity, setEquity] = useState('10,000 Options');
  const [bonus, setBonus] = useState(10000);
  const [startDate, setStartDate] = useState('2026-08-15');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canApprove = currentRole === 'Hiring Manager' || currentRole === 'HR Admin';
  const canCreate = currentRole === 'Recruiter' || currentRole === 'HR Admin';

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

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!appId) {
      setErrorMsg('Please select a candidate application.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateOffer({
        applicationId: appId,
        baseSalary: Number(salary),
        equity,
        bonus: Number(bonus),
        startDate,
        notes
      });
      setIsCreateOpen(false);
      setAppId('');
      setNotes('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (offerId: string, status: 'Approved' | 'Rejected') => {
    try {
      await onApproveOffer(offerId, status, currentRole);
      alert(`Offer ${status.toUpperCase()}! Salesforce flow triggered. Candidate stage transitioned.`);
    } catch (err: any) {
      alert('Approval Action Failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <ClipboardCheck className="w-5 h-5 text-indigo-600" />
            <span>Structured Offer Approval Processes</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Enforce salary bounds and trigger executive vetoes before official contract delivery</p>
        </div>
        {canCreate ? (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center justify-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <span>Generate New Salary Proposal</span>
          </button>
        ) : (
          <div className="text-[11px] font-medium text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            Only Recruiters or Admins can originate salary proposals
          </div>
        )}
      </div>

      {/* Main offers pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Salary Proposals Pool</h3>
          {offers.length === 0 ? (
            <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-slate-400 text-xs font-semibold shadow-xs">
              No salary proposals currently registered.
            </div>
          ) : (
            offers.map((off) => {
              const candidate = getCandidateName(off.applicationId);
              const jobTitle = getJobTitle(off.applicationId);
              const isPending = off.approvalStatus === 'Pending';

              return (
                <div 
                  key={off.id}
                  className={`bg-white border p-5 rounded-xl shadow-xs space-y-4 transition hover:shadow-md ${
                    isPending ? 'border-indigo-600' : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">Salary Package</span>
                      <h4 className="font-extrabold text-gray-900 text-base mt-1.5">{candidate}</h4>
                      <p className="text-xs text-gray-500 font-semibold">{jobTitle}</p>
                    </div>
                    <span className={`text-[10px] font-bold border px-2.5 py-0.5 rounded-full ${
                      off.approvalStatus === 'Approved' 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : off.approvalStatus === 'Rejected' 
                          ? 'bg-rose-50 text-rose-800 border-rose-200' 
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {off.approvalStatus}
                    </span>
                  </div>

                  {/* Salary Details Cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-2.5 bg-slate-100/80 rounded border border-slate-200 text-center">
                      <span className="text-[8px] font-bold text-gray-400 uppercase">Base Salary</span>
                      <p className="text-xs font-black text-gray-800 mt-0.5">${off.baseSalary.toLocaleString()}</p>
                    </div>
                    <div className="p-2.5 bg-slate-100/80 rounded border border-slate-200 text-center">
                      <span className="text-[8px] font-bold text-gray-400 uppercase">Equity Vest</span>
                      <p className="text-xs font-black text-gray-800 mt-0.5 truncate">{off.equity}</p>
                    </div>
                    <div className="p-2.5 bg-slate-100/80 rounded border border-slate-200 text-center">
                      <span className="text-[8px] font-bold text-gray-400 uppercase">Target Bonus</span>
                      <p className="text-xs font-black text-gray-800 mt-0.5">${off.bonus.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Notes & Start date */}
                  <div className="text-xs text-gray-600 space-y-1 bg-slate-50 p-3 rounded border border-slate-100">
                    <p><strong className="text-gray-700">Proposed Start Date:</strong> {new Date(off.startDate).toLocaleDateString()}</p>
                    <p className="italic">"{off.notes || 'No notes added.'}"</p>
                  </div>

                  {/* Actions depending on role */}
                  {isPending ? (
                    <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-xs">
                      {canApprove ? (
                        <div className="flex space-x-2 w-full justify-end">
                          <button
                            onClick={() => handleVote(off.id, 'Rejected')}
                            className="flex items-center space-x-1 px-3 py-1.5 border border-rose-300 hover:bg-rose-50 text-rose-700 rounded font-bold transition text-xs"
                          >
                            <XCircle className="w-4 h-4 text-rose-600" />
                            <span>Reject Package</span>
                          </button>
                          <button
                            onClick={() => handleVote(off.id, 'Approved')}
                            className="flex items-center space-x-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold transition shadow-sm text-xs"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Approve & Onboard</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1.5 text-amber-700 bg-amber-50 border border-amber-100 p-2 rounded-lg w-full">
                          <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-500" />
                          <span>Locked: Awaiting Hiring Manager review. You are authorized to read-only.</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 border-t border-gray-100 pt-3 italic flex items-center">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mr-1.5" />
                      Reviewed by {off.approvedBy} on {off.approvalDate ? new Date(off.approvalDate).toLocaleDateString() : 'N/A'}.
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right approval pipeline graphics */}
        <div className="space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Salesforce Approval Stage Diagram</h3>
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-6">
            <div className="flex items-center space-x-2 text-sm font-bold text-slate-800">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Package Flowchart Steps</span>
            </div>

            <div className="relative pl-6 space-y-6 border-l border-indigo-100">
              {/* Step 1 */}
              <div className="relative">
                <span className="absolute -left-[30px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">1</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Step 1: Recruiter Proposal Generation</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Recruiting constructs base salary package, triggers compliance bounds checks, and submits for sign-off.</p>
                  <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded text-[9px] font-bold mt-1.5">Completed</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <span className="absolute -left-[30px] top-0 w-4 h-4 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">2</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Step 2: Hiring Manager Approval Veto</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Hiring Manager audits Agentforce AI scores, validates budget, and issues Approve or Reject verdicts.</p>
                  <span className="inline-block bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.5 rounded text-[9px] font-bold mt-1.5">Active Approval Step</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <span className="absolute -left-[30px] top-0 w-4 h-4 rounded-full bg-slate-300 border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">3</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-400">Step 3: Automated Onboarding Checklist Provisioning</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">Upon approval, background Salesforce Flows automatically instantiate onboarding checklist tasks.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Salary Proposal Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <ClipboardCheck className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm tracking-wide">Generate Salary Proposal</h3>
              </div>
              <button 
                onClick={() => setIsCreateOpen(false)}
                className="hover:bg-slate-800 p-1.5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOffer} className="p-5 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 font-semibold">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Candidate Application *</label>
                <select
                  required
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                >
                  <option value="">-- Choose Candidate Requisition --</option>
                  {applications
                    .filter(app => app.stage === 'Selected' || app.stage === 'Interview' || app.stage === 'Shortlisted')
                    .map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.candidate?.name} - {app.job?.title} (Stage: {app.stage})
                      </option>
                    ))}
                </select>
                <p className="text-[10px] text-slate-400">Shows candidates in 'Selected', 'Shortlisted', or 'Interview' stages.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Base Salary ($)</label>
                  <input
                    type="number"
                    required
                    value={salary}
                    onChange={(e) => setSalary(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Equity Options</label>
                  <input
                    type="text"
                    required
                    value={equity}
                    onChange={(e) => setEquity(e.target.value)}
                    placeholder="e.g. 10,000 RSUs"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target Bonus ($)</label>
                  <input
                    type="number"
                    required
                    value={bonus}
                    onChange={(e) => setBonus(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Proposed Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Negotiation Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record package reasons, sign-on demands, or budget exceptions..."
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                />
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Submitting...' : 'Generate Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
