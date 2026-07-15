import React, { useState } from 'react';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  User, 
  Calendar, 
  Plus, 
  X, 
  TrendingUp, 
  Layers,
  Sparkles
} from 'lucide-react';
import { JobOpening, UserRole } from '../types';

interface JobListProps {
  jobs: JobOpening[];
  onCreateJob: (jobData: any) => Promise<void>;
  onUpdateJobStatus: (id: string, status: string) => Promise<void>;
  currentRole: UserRole;
}

export default function JobList({ jobs, onCreateJob, onUpdateJobStatus, currentRole }: JobListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [skills, setSkills] = useState('');
  const [exp, setExp] = useState(3);
  const [desc, setDesc] = useState('');
  const [minSal, setMinSal] = useState(90000);
  const [maxSal, setMaxSal] = useState(130000);
  const [vacancies, setVacancies] = useState(1);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canEdit = currentRole === 'Recruiter' || currentRole === 'HR Admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!title.trim()) {
      setFormError('Job Title is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateJob({
        title,
        department,
        requiredSkills: skills.split(',').map(s => s.trim()).filter(Boolean),
        experienceYears: Number(exp),
        description: desc,
        minSalary: Number(minSal),
        maxSalary: Number(maxSal),
        vacancies: Number(vacancies)
      });
      setIsModalOpen(false);
      // Reset form
      setTitle('');
      setSkills('');
      setDesc('');
      setExp(3);
      setMinSal(90000);
      setMaxSal(130000);
      setVacancies(1);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create job');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Draft': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'On Hold': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Closed': return 'bg-rose-100 text-rose-800 border-rose-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            <span>Job Requisitions Registry</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Configure openings, departments, skill scopes, and vacancy volumes</p>
        </div>
        {canEdit ? (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Job Opening</span>
          </button>
        ) : (
          <div className="text-[11px] font-medium text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            Only Recruiter or Admin role can add job postings
          </div>
        )}
      </div>

      {/* Main Jobs Listing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job Cards list */}
        <div className="lg:col-span-2 space-y-4">
          {jobs.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-xl border border-slate-200 text-slate-500 shadow-xs">
              No job postings available. Click 'New Job Opening' to create one.
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`bg-white p-5 rounded-xl border transition cursor-pointer shadow-xs flex flex-col justify-between hover:shadow-sm ${
                  selectedJob?.id === job.id ? 'border-indigo-600 ring-2 ring-indigo-50/50' : 'border-slate-200'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm hover:text-indigo-600 transition-colors">{job.title}</h3>
                      <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                        <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">{job.department}</span>
                        <span>&bull;</span>
                        <span className="flex items-center"><MapPin className="w-3 h-3 mr-0.5 text-slate-400" /> Remote</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${getStatusStyle(job.status)}`}>
                      {job.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {job.description || 'No job description provided.'}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {job.requiredSkills.map((skill, index) => (
                      <span key={index} className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3.5 mt-3.5 text-xs text-slate-500">
                  <span className="flex items-center font-semibold text-slate-700">
                    <DollarSign className="w-3.5 h-3.5 mr-0.5 text-slate-400" />
                    ${(job.minSalary / 1000).toFixed(0)}k - ${(job.maxSalary / 1000).toFixed(0)}k
                  </span>
                  <span className="flex items-center">
                    <User className="w-3.5 h-3.5 mr-0.5 text-slate-400" />
                    {job.vacancies} {job.vacancies === 1 ? 'vacancy' : 'vacancies'}
                  </span>
                  <span className="flex items-center text-[10px]">
                    <Calendar className="w-3.5 h-3.5 mr-0.5 text-slate-400" />
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Job Detail Panel */}
        <div className="lg:col-span-1">
          {selectedJob ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-5 sticky top-20">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Selected Requisition</span>
                  <h3 className="font-extrabold text-slate-900 text-base leading-tight mt-0.5">{selectedJob.title}</h3>
                  <p className="text-xs font-bold text-indigo-600 mt-0.5">{selectedJob.department}</p>
                </div>
                <button 
                  onClick={() => setSelectedJob(null)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status Editor for recruiters */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Status Controller</span>
                {canEdit ? (
                  <select
                    value={selectedJob.status}
                    onChange={(e) => onUpdateJobStatus(selectedJob.id, e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Closed">Closed</option>
                  </select>
                ) : (
                  <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-xs font-semibold text-slate-700">
                    Currently: <strong className="text-indigo-600">{selectedJob.status}</strong> (Read-only for {currentRole})
                  </div>
                )}
              </div>

              <div className="space-y-2.5 text-xs leading-relaxed">
                <div>
                  <h4 className="font-bold text-slate-400 uppercase text-[9px] tracking-wider mb-1">Position Details</h4>
                  <p className="text-slate-600 mt-1 leading-relaxed">{selectedJob.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                    <span className="text-[9px] font-bold uppercase text-slate-400">Experience required</span>
                    <p className="font-bold text-slate-800 mt-0.5">{selectedJob.experienceYears}+ years</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                    <span className="text-[9px] font-bold uppercase text-slate-400">Total Vacancies</span>
                    <p className="font-bold text-slate-800 mt-0.5">{selectedJob.vacancies} open</p>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="font-bold text-slate-400 uppercase text-[9px] tracking-wider mb-1.5">Required Skill Mapping</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedJob.requiredSkills.map((skill, index) => (
                      <span key={index} className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-lg">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500 flex flex-col items-center justify-center space-y-2 h-[200px] shadow-inner">
              <Briefcase className="w-8 h-8 text-slate-300 animate-bounce" />
              <p className="text-xs font-semibold text-slate-400">Select an open job requisition on the left to inspect complete parameters and skill metrics.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Job Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm tracking-wide">Configure New Job Opening</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="hover:bg-slate-800 p-1.5 rounded-lg text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 font-semibold">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Department *</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Product Management">Product Management</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Sales">Sales</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Experience Level (Years)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={exp}
                    onChange={(e) => setExp(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Required Skills (Comma separated) *</span>
                    <span className="text-[10px] text-indigo-600 font-normal flex items-center"><Sparkles className="w-3 h-3 mr-0.5" /> For Agentforce IQ match</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="React, TypeScript, Tailwind CSS, Vite"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Minimum Salary ($)</label>
                  <input
                    type="number"
                    required
                    value={minSal}
                    onChange={(e) => setMinSal(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Maximum Salary ($)</label>
                  <input
                    type="number"
                    required
                    value={maxSal}
                    onChange={(e) => setMaxSal(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Open Vacancies</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={vacancies}
                    onChange={(e) => setVacancies(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Job Description</label>
                  <textarea
                    rows={3}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Provide a detailed overview of roles, expectations, and core challenges..."
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Posting...' : 'Create Requisition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
