import React, { useState } from 'react';
import { 
  Users, 
  Mail, 
  Phone, 
  GraduationCap, 
  Calendar, 
  Plus, 
  X, 
  BookOpen, 
  Tag, 
  FolderSearch,
  CheckCircle2,
  Brain
} from 'lucide-react';
import { Candidate, UserRole } from '../types';

interface CandidateListProps {
  candidates: Candidate[];
  onRegisterCandidate: (candidateData: any) => Promise<void>;
  currentRole: UserRole;
  onApplyForJob: (candidateId: string, jobId: string) => Promise<void>;
  jobs: { id: string; title: string }[];
}

export default function CandidateList({ 
  candidates, 
  onRegisterCandidate, 
  currentRole,
  onApplyForJob,
  jobs 
}: CandidateListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  
  // Submit Job Application State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [applyNotes, setApplyNotes] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState('');

  // Register Candidate Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [education, setEducation] = useState('');
  const [skills, setSkills] = useState('');
  const [exp, setExp] = useState(3);
  const [resume, setResume] = useState('');
  const [summary, setSummary] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canEdit = currentRole === 'Recruiter' || currentRole === 'HR Admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!name.trim() || !email.trim()) {
      setFormError('Candidate Name and Email are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onRegisterCandidate({
        name,
        email,
        phone,
        education,
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        experienceYears: Number(exp),
        resumeText: resume,
        summary
      });
      setIsModalOpen(false);
      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setEducation('');
      setSkills('');
      setExp(3);
      setResume('');
      setSummary('');
    } catch (err: any) {
      setFormError(err.message || 'Failed to register candidate');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyError('');
    if (!selectedJobId) {
      setApplyError('Please choose a job to apply to.');
      return;
    }
    if (!selectedCandidate) return;

    setIsApplying(true);
    try {
      await onApplyForJob(selectedCandidate.id, selectedJobId);
      setIsApplyModalOpen(false);
      setSelectedJobId('');
      setApplyNotes('');
      alert('Application successfully linked inside Salesforce! Flows will initiate in the background.');
    } catch (err: any) {
      setApplyError(err.message || 'Candidate has already applied to this job.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>Candidate Directory Console</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Maintain profile details, qualifications, and submit candidate linkages to open roles</p>
        </div>
        {canEdit ? (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Candidate</span>
          </button>
        ) : (
          <div className="text-[11px] font-medium text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            Only Recruiter or Admin can manually register new talent profiles
          </div>
        )}
      </div>

      {/* Main Candidate Table & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Candidate Details</th>
                  <th className="p-4">Education & Degrees</th>
                  <th className="p-4">Skills & Tools</th>
                  <th className="p-4">Experience</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {candidates.map((cand) => (
                  <tr 
                    key={cand.id}
                    onClick={() => setSelectedCandidate(cand)}
                    className={`hover:bg-slate-50 cursor-pointer transition ${
                      selectedCandidate?.id === cand.id ? 'bg-indigo-50/50' : ''
                    }`}
                  >
                    <td className="p-4">
                      <div className="space-y-1">
                        <p className="font-extrabold text-slate-900 text-sm">{cand.name}</p>
                        <div className="flex flex-col space-y-0.5 text-slate-500 text-[11px]">
                          <span className="flex items-center"><Mail className="w-3 h-3 mr-1 text-slate-400" /> {cand.email}</span>
                          <span className="flex items-center"><Phone className="w-3 h-3 mr-1 text-slate-400" /> {cand.phone || 'No phone'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 max-w-[150px] truncate">
                      <div className="flex items-center space-x-1.5 text-slate-700">
                        <GraduationCap className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="font-medium">{cand.education || 'Self-taught / Other'}</span>
                      </div>
                    </td>
                    <td className="p-4 max-w-[200px]">
                      <div className="flex flex-wrap gap-1">
                        {cand.skills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="text-[9px] font-bold bg-slate-100 text-slate-800 border border-slate-200 px-1.5 py-0.5 rounded">
                            {skill}
                          </span>
                        ))}
                        {cand.skills.length > 3 && (
                          <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1 py-0.5 rounded">
                            +{cand.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-800">
                      {cand.experienceYears} {cand.experienceYears === 1 ? 'year' : 'years'}
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setSelectedCandidate(cand);
                          setIsApplyModalOpen(true);
                        }}
                        className="px-2.5 py-1 border border-indigo-200 hover:border-indigo-400 text-indigo-600 hover:text-indigo-800 font-bold rounded-lg hover:bg-indigo-50 transition text-[10px] cursor-pointer"
                      >
                        Submit Application
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inspect Panel */}
        <div className="lg:col-span-1">
          {selectedCandidate ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-5 sticky top-20">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-indigo-600 font-extrabold shadow-inner">
                    {selectedCandidate.name[0]}
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Talent Profile</span>
                    <h3 className="font-extrabold text-slate-900 text-sm leading-tight">{selectedCandidate.name}</h3>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedCandidate(null)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs leading-relaxed">
                <div className="space-y-1">
                  <h4 className="font-bold uppercase text-[9px] tracking-wider text-slate-400 flex items-center"><GraduationCap className="w-3.5 h-3.5 mr-1 text-slate-400" /> Academics & Degrees</h4>
                  <p className="text-slate-800 font-semibold">{selectedCandidate.education || 'No academic degrees listed'}</p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold uppercase text-[9px] tracking-wider text-slate-400 flex items-center"><Tag className="w-3.5 h-3.5 mr-1 text-slate-400" /> Complete Skills Mapping</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedCandidate.skills.map((skill, index) => (
                      <span key={index} className="text-[10px] font-bold bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-lg">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 bg-indigo-50/50 border border-indigo-100 p-3.5 rounded-xl">
                  <h4 className="font-bold uppercase text-[9px] tracking-wider text-indigo-600 flex items-center"><Brain className="w-3.5 h-3.5 mr-1 text-indigo-500" /> Profile Summary</h4>
                  <p className="text-slate-700 leading-normal italic text-[11px]">"{selectedCandidate.summary || 'No summary text provided.'}"</p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold uppercase text-[9px] tracking-wider text-slate-400 flex items-center"><BookOpen className="w-3.5 h-3.5 mr-1 text-slate-400" /> Full Resume Document Text</h4>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[10px] text-slate-600 font-mono overflow-y-auto max-h-[160px] whitespace-pre-wrap leading-relaxed shadow-inner">
                    {selectedCandidate.resumeText || 'No detailed resume document registered.'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsApplyModalOpen(true)}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
              >
                Submit Candidate for Active Requisitions
              </button>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500 flex flex-col items-center justify-center space-y-2 h-[200px] shadow-inner">
              <FolderSearch className="w-8 h-8 text-slate-300 animate-pulse" />
              <p className="text-xs font-semibold text-slate-400">Select any candidate profile on the left to inspect raw resume documents and academic degrees.</p>
            </div>
          )}
        </div>
      </div>

      {/* Register Candidate Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm tracking-wide">Register New Candidate</h3>
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
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@example.com"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 345-6789"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Years of Experience</label>
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
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Academic Education</label>
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="e.g. BS in Computer Science, MIT"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Skills (Comma separated)</label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g. React, TypeScript, Redux, Node.js"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Brief Elevator Summary</label>
                  <input
                    type="text"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="e.g. Dedicated React developer with experience delivering responsive CRM views..."
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Detailed Resume Document / Work History</label>
                  <textarea
                    rows={4}
                    value={resume}
                    onChange={(e) => setResume(e.target.value)}
                    placeholder="Paste full resume document, previous roles, dates, and achievements here..."
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
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
                  {isSubmitting ? 'Registering...' : 'Register Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Link to Job Modal (Submit Application) */}
      {isApplyModalOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm tracking-wide">Submit Candidate for Job Opening</h3>
              </div>
              <button 
                onClick={() => setIsApplyModalOpen(false)}
                className="hover:bg-slate-800 p-1.5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="p-5 space-y-4">
              {applyError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 font-semibold">
                  {applyError}
                </div>
              )}

              <div className="space-y-1 bg-slate-50 border border-slate-100 p-3 rounded-lg">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Candidate Name</label>
                <p className="font-bold text-slate-900 text-sm">{selectedCandidate.name}</p>
                <p className="text-[11px] text-slate-500">{selectedCandidate.email}</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Job Opening Requisition *</label>
                <select
                  required
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                >
                  <option value="">-- Choose Requisition --</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>{job.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Initial Submittal Notes</label>
                <textarea
                  rows={2}
                  value={applyNotes}
                  onChange={(e) => setApplyNotes(e.target.value)}
                  placeholder="e.g. Top sourcing find. Highly qualified candidate."
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                />
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isApplying}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {isApplying ? 'Linking...' : 'Submit Linkage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
