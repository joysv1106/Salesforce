import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Plus, 
  Star, 
  FolderLock,
  MessageSquare,
  Award
} from 'lucide-react';
import { Interview, UserRole } from '../types';

interface InterviewManagerProps {
  interviews: Interview[];
  applications: any[];
  candidates: any[];
  currentRole: UserRole;
  onScheduleInterview: (interviewData: any) => Promise<void>;
  onUpdateFeedback: (id: string, status: string, feedback: string, rating: number) => Promise<void>;
}

export default function InterviewManager({ 
  interviews, 
  applications, 
  candidates, 
  currentRole, 
  onScheduleInterview, 
  onUpdateFeedback 
}: InterviewManagerProps) {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [selectedIntId, setSelectedIntId] = useState<string>('');

  // Schedule Interview Form State
  const [appId, setAppId] = useState('');
  const [type, setType] = useState<'Technical' | 'Cultural' | 'Managerial' | 'HR'>('Technical');
  const [date, setDate] = useState('2026-07-20T10:00');
  const [interviewers, setInterviewers] = useState('');
  const [scheduleError, setScheduleError] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  // Feedback Submission Form State
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);
  const [feedbackError, setFeedbackError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canEdit = currentRole === 'Recruiter' || currentRole === 'HR Admin';
  const canVote = currentRole === 'Interviewer' || currentRole === 'Recruiter' || currentRole === 'HR Admin';

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleError('');
    if (!appId || !date) {
      setScheduleError('Application and Date are required.');
      return;
    }

    setIsScheduling(true);
    try {
      await onScheduleInterview({
        applicationId: appId,
        type,
        scheduledAt: new Date(date).toISOString(),
        interviewers: interviewers.split(',').map(i => i.trim()).filter(Boolean)
      });
      setIsScheduleOpen(false);
      setAppId('');
      setInterviewers('');
    } catch (err: any) {
      setScheduleError(err.message || 'Failed to schedule');
    } finally {
      setIsScheduling(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError('');
    if (!feedback.trim()) {
      setFeedbackError('Feedback comments are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdateFeedback(selectedIntId, 'Completed', feedback, rating);
      setIsFeedbackOpen(false);
      setFeedback('');
      setRating(5);
      alert('Feedback and scoring successfully logged in Salesforce! Candidates who pass technical screening will advance to Selected.');
    } catch (err: any) {
      setFeedbackError(err.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCandidateNameByAppId = (id: string) => {
    const app = applications.find(a => a.id === id);
    if (!app) return 'Unknown candidate';
    const cand = candidates.find(c => c.id === app.candidateId);
    return cand ? cand.name : 'Unknown';
  };

  const getJobTitleByAppId = (id: string) => {
    const app = applications.find(a => a.id === id);
    return app ? app.job?.title : 'Unknown Job';
  };

  return (
    <div className="space-y-6">
      {/* Title ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <span>Interview & Panel Coordinations</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Schedule evaluation rounds and record panel scores inside the CRM system</p>
        </div>
        {canEdit ? (
          <button
            onClick={() => setIsScheduleOpen(true)}
            className="flex items-center justify-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Interview Loop</span>
          </button>
        ) : (
          <div className="text-[11px] font-medium text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            Only Recruiter or Admin roles can schedule interview panels
          </div>
        )}
      </div>

      {/* Google Workspace Info Banner */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 flex items-center space-x-2.5 text-xs text-blue-900 font-semibold shadow-xs">
        <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
        <span>Unified Calendaring: Seamlessly register these interview panel slots to your <strong>Google Calendar</strong> and dispatch participant invitations directly under the <strong>Google Workspace Integration</strong> dashboard!</span>
      </div>

      {/* Main Interviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {interviews.length === 0 ? (
          <div className="col-span-full bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-xs font-semibold shadow-xs">
            No interviews scheduled currently. Schedule an interview round above.
          </div>
        ) : (
          interviews.map((int) => {
            const isCompleted = int.status === 'Completed';
            const candidateName = getCandidateNameByAppId(int.applicationId);
            const jobTitle = getJobTitleByAppId(int.applicationId);

            return (
              <div 
                key={int.id}
                className={`bg-white border rounded-xl shadow-xs p-5 space-y-4 flex flex-col justify-between hover:shadow-md transition ${
                  isCompleted ? 'border-slate-200 bg-slate-50/50' : 'border-indigo-600'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{int.type} Round</span>
                      <h4 className="font-extrabold text-slate-900 text-sm mt-0.5">{candidateName}</h4>
                      <p className="text-xs text-indigo-600 font-semibold truncate max-w-[180px]">{jobTitle}</p>
                    </div>
                    <span className={`text-[9px] font-bold border px-2 py-0.5 rounded-full ${
                      isCompleted 
                        ? 'bg-slate-100 text-slate-600 border-slate-200' 
                        : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                    }`}>
                      {int.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500">
                    <p className="flex items-center font-semibold text-slate-700">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400 flex-shrink-0" />
                      {new Date(int.scheduledAt).toLocaleString()}
                    </p>
                    <div className="flex items-start">
                      <Users className="w-3.5 h-3.5 mr-1.5 text-slate-400 mt-0.5 flex-shrink-0" />
                      <p className="leading-normal">
                        <span className="font-bold text-slate-700">Panel:</span> {int.interviewers.join(', ')}
                      </p>
                    </div>
                  </div>

                  {isCompleted ? (
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold uppercase text-indigo-600 flex items-center">
                          <MessageSquare className="w-3.5 h-3.5 mr-1" /> Panel Score
                        </span>
                        <div className="flex text-amber-500">
                          {Array.from({ length: int.rating || 0 }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-600 italic">"{int.feedback}"</p>
                    </div>
                  ) : null}
                </div>

                {!isCompleted && (
                  <div className="border-t border-gray-100 pt-3 flex justify-end">
                    {canVote ? (
                      <button
                        onClick={() => {
                          setSelectedIntId(int.id);
                          setIsFeedbackOpen(true);
                        }}
                        className="flex items-center space-x-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold shadow-xs transition"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Submit Panel Score</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-400 font-medium italic flex items-center">
                        <FolderLock className="w-3.5 h-3.5 mr-1" /> Only panel members can score candidates
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Schedule Interview Modal */}
      {isScheduleOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm tracking-wide">Schedule Interview Panel</h3>
              </div>
              <button 
                onClick={() => setIsScheduleOpen(false)}
                className="hover:bg-slate-800 p-1.5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSchedule} className="p-5 space-y-4">
              {scheduleError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 font-semibold">
                  {scheduleError}
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
                  <option value="">-- Select Candidate & Job --</option>
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.candidate?.name} - {app.job?.title} (Stage: {app.stage})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Interview Type *</label>
                <select
                  required
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                >
                  <option value="Technical">Technical Interview</option>
                  <option value="Cultural">Cultural Fit Interview</option>
                  <option value="Managerial">Managerial Review</option>
                  <option value="HR">HR & Benefits Review</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Scheduled Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Panel Members (Comma separated)</label>
                <input
                  type="text"
                  required
                  value={interviewers}
                  onChange={(e) => setInterviewers(e.target.value)}
                  placeholder="e.g. Marc Benioff (SVP Eng), Sarah Admin"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                />
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isScheduling}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {isScheduling ? 'Scheduling...' : 'Schedule Panel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Feedback Modal */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm tracking-wide">Submit Interview Scorecard</h3>
              </div>
              <button 
                onClick={() => setIsFeedbackOpen(false)}
                className="hover:bg-slate-800 p-1.5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="p-5 space-y-4">
              {feedbackError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 font-semibold">
                  {feedbackError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Candidate Score (1-5 Stars)</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition cursor-pointer"
                    >
                      <Star className={`w-8 h-8 ${rating >= star ? 'text-amber-500 fill-current' : 'text-slate-200'}`} />
                    </button>
                  ))}
                </div>
                {rating >= 4 && (
                  <p className="text-[10px] text-emerald-600 font-semibold flex items-center">
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Score triggers automatic promotion to Selected stage.
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Detailed Panel Comments *</label>
                <textarea
                  rows={4}
                  required
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Record strengths, code review answers, structural designs, and core culture fit observations..."
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400"
                />
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsFeedbackOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Logging...' : 'Submit Scorecard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
