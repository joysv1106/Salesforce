import React, { useState } from 'react';
import { 
  Cpu, 
  ToggleLeft, 
  ToggleRight, 
  Plus, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle,
  TrendingUp,
  Workflow
} from 'lucide-react';
import { WorkflowRule, UserRole } from '../types';

interface FlowsEditorProps {
  workflows: WorkflowRule[];
  currentRole: UserRole;
  onToggleWorkflow: (id: string) => Promise<void>;
  onCreateWorkflow: (flowData: any) => Promise<void>;
}

export default function FlowsEditor({ 
  workflows, 
  currentRole, 
  onToggleWorkflow, 
  onCreateWorkflow 
}: FlowsEditorProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [triggerEvent, setTriggerEvent] = useState<'OnApplicationSubmit' | 'OnInterviewComplete' | 'OnOfferApprove'>('OnApplicationSubmit');
  const [condition, setCondition] = useState('');
  const [action, setAction] = useState('');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = currentRole === 'HR Admin';

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!name.trim() || !action.trim()) {
      setErrorMsg('Flow Name and Trigger Action are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateWorkflow({
        name,
        triggerEvent,
        condition,
        action,
        description
      });
      setIsCreateOpen(false);
      // Reset
      setName('');
      setCondition('');
      setAction('');
      setDescription('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create workflow flow');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-indigo-600" />
            <span>Salesforce Flow Automation Builder</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Author background trigger logic (Flows) to auto-transition applicant stages on system state changes</p>
        </div>
        {isAdmin ? (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center justify-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Custom Flow Rule</span>
          </button>
        ) : (
          <div className="text-[11px] font-medium text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            Only the Salesforce Admin role can configure declarative flows
          </div>
        )}
      </div>

      {/* Main editor split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flows list */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Declarative Background Flows</h3>
          {workflows.map((flow) => (
            <div 
              key={flow.id}
              className={`bg-white border rounded-xl p-5 shadow-xs space-y-4 transition ${
                flow.isActive ? 'border-indigo-500 ring-1 ring-indigo-50/30' : 'border-slate-200 opacity-70 bg-slate-50/20'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Workflow className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-extrabold text-slate-900 text-sm">{flow.name}</h4>
                  </div>
                  <p className="text-xs text-indigo-700 font-bold bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded inline-block">
                    Trigger: {flow.triggerEvent}
                  </p>
                </div>

                {/* Toggling active status */}
                <button
                  disabled={!isAdmin}
                  onClick={() => onToggleWorkflow(flow.id)}
                  className="focus:outline-none transition-all"
                  title={isAdmin ? 'Toggle Flow Activation' : 'Locked for current role'}
                >
                  {flow.isActive ? (
                    <ToggleRight className="w-12 h-8 text-emerald-500 cursor-pointer" />
                  ) : (
                    <ToggleLeft className="w-12 h-8 text-gray-300 cursor-pointer" />
                  )}
                </button>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed font-semibold">
                {flow.description}
              </p>

              {/* Logic detail block */}
              <div className="grid grid-cols-2 gap-3 pt-1 text-[11px]">
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                  <span className="font-bold text-slate-400 uppercase text-[9px]">IF Condition</span>
                  <p className="font-mono font-bold text-slate-700 mt-0.5">{flow.condition || 'None (Always Fire)'}</p>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                  <span className="font-bold text-slate-400 uppercase text-[9px]">THEN Action Executed</span>
                  <p className="font-mono font-bold text-indigo-600 mt-0.5">{flow.action}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Informational sidebar */}
        <div className="space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Declarative Automation Guide</h3>
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center space-x-2 text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <span>What is a Flow?</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              In Salesforce, <strong>Lightning Flows</strong> allow non-developers to configure complex automated triggers in the database.
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              When specific events fire (such as candidate submittals or offer reviews), active flows evaluate if criteria is met and instantly automate record updating or checklists, reducing manual recruiter tasking.
            </p>
            {!isAdmin && (
              <div className="p-3 bg-amber-50 border border-amber-150 rounded-lg text-xs text-amber-800 flex items-start space-x-1.5 font-semibold">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-500 mt-0.5" />
                <span>You are currently read-only. Switch role to <strong>Salesforce Admin</strong> above to toggle flow activations or create new automated logic loops.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Flow Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm tracking-wide">Configure Custom Flow Rule</h3>
              </div>
              <button 
                onClick={() => setIsCreateOpen(false)}
                className="hover:bg-slate-800 p-1.5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 font-semibold">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Flow Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Notify HM on Technical Clear"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Trigger Database Event *</label>
                <select
                  required
                  value={triggerEvent}
                  onChange={(e) => setTriggerEvent(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                >
                  <option value="OnApplicationSubmit">OnApplicationSubmit (Linked/Created)</option>
                  <option value="OnInterviewComplete">OnInterviewComplete (Panel Finished)</option>
                  <option value="OnOfferApprove">OnOfferApprove (Package Signed)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Trigger Condition Expression</label>
                <input
                  type="text"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  placeholder="e.g. Rating is >= 4"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Action To Execute *</label>
                <input
                  type="text"
                  required
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  placeholder="e.g. Email Alert to HR Admin"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Flow Summary Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what automated outcome this declarative rule enforces..."
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
                  {isSubmitting ? 'Authoring...' : 'Instantiate Flow'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
