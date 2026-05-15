import React, { useState } from 'react';
import { X, Upload, Calendar, FileText, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { useSessions, SessionMedia, UpcomingSession } from '../hooks/useSessions';
import MediaUploader from './MediaUploader';

interface UploadSessionModalProps {
  onClose: () => void;
  editingSession?: UpcomingSession;
}

export default function UploadSessionModal({ onClose, editingSession }: UploadSessionModalProps) {
  const { addUpcomingSession, updateUpcomingSession } = useSessions();
  const [step, setStep] = useState(1);
  
  // State for new session
  const [photos, setPhotos] = useState<SessionMedia[]>(editingSession?.photos || []);
  const [videos, setVideos] = useState<SessionMedia[]>(editingSession?.videos || []);
  const [topic, setTopic] = useState(editingSession?.topic || '');
  const [meetingLink, setMeetingLink] = useState(editingSession?.meetingLink || '');
  const [description, setDescription] = useState(editingSession?.description || '');
  const [time, setTime] = useState(editingSession?.time || '07:00');
  const [displayTime, setDisplayTime] = useState(editingSession?.displayTime || '7:00 AM - 8:30 AM');
  
  const [dateStr, setDateStr] = useState(editingSession?.date || '');
  const [displayDate, setDisplayDate] = useState(editingSession?.displayDate || '');

  // Calendar Logic
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  const firstDay = getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth());

  const calendarDays: Array<{ day: number, dateStr: string, displayStr: string, isPast: boolean } | null> = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
    calendarDays.push({
      day: i,
      dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      displayStr: d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      isPast: d < today
    });
  }

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentYear = new Date().getFullYear();
  const yearsList = Array.from({ length: 5 }, (_, i) => currentYear + i);

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handlePublish = () => {
    // Save details
    const sessionData = {
      topic: topic || 'Untitled Session',
      meetingLink,
      description,
      time: time || '00:00',
      displayTime: displayTime || 'TBD',
      date: dateStr || new Date().toISOString().split('T')[0],
      displayDate: displayDate || new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      photos,
      videos
    };

    if (editingSession) {
      updateUpcomingSession(editingSession.id, sessionData);
      alert('Session updated successfully!');
    } else {
      addUpcomingSession(sessionData);
      alert('Session published successfully!');
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-8 py-6 border-b border-brand-surface-hover flex items-center justify-between bg-brand-surface/30">
          <h2 className="text-2xl font-bold text-brand-text-main">{editingSession ? 'Edit Session' : 'Upload Session'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-brand-surface rounded-full transition-colors"><X className="w-6 h-6 text-brand-text-muted" /></button>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-4 py-6 border-b border-brand-surface-hover bg-brand-surface/10 px-8">
          {[
            { num: 1, label: 'Media', icon: Upload },
            { num: 2, label: 'Details', icon: FileText },
            { num: 3, label: 'Calendar', icon: Calendar }
          ].map((s, i, arr) => (
            <React.Fragment key={s.num}>
              <div className={`flex items-center gap-2 ${step >= s.num ? 'text-brand-primary' : 'text-brand-text-muted'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s.num ? 'bg-brand-primary text-white shadow-md' : 'bg-brand-surface'}`}>
                  {s.num}
                </div>
                <span className="font-bold text-sm hidden sm:block">{s.label}</span>
              </div>
              {i < arr.length - 1 && <div className={`w-12 h-0.5 rounded-full ${step > s.num ? 'bg-brand-primary' : 'bg-brand-surface-hover'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-brand-text-main mb-2">Upload Session Media</h3>
                <p className="text-sm text-brand-text-muted font-medium">Optional: Upload photos or videos for this session.</p>
              </div>
              <MediaUploader 
                onUpload={(media) => {
                  const newMedia = { ...media, id: Date.now().toString() };
                  if (media.type === 'image') setPhotos([...photos, newMedia]);
                  else setVideos([...videos, newMedia]);
                }} 
              />
              {/* Previews */}
              {(photos.length > 0 || videos.length > 0) && (
                <div className="mt-8 space-y-4">
                  <h4 className="font-bold text-brand-text-main text-sm uppercase tracking-widest">Uploaded Files</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[...photos, ...videos].map(item => (
                      <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden bg-brand-surface group border border-brand-surface-hover">
                        {item.type === 'image' ? (
                          <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-brand-surface p-4 text-center">
                            <span className="text-xs font-bold text-brand-text-main line-clamp-2">{item.title}</span>
                            <span className="text-[10px] uppercase text-brand-primary font-black px-2 py-1 bg-brand-primary/10 rounded-full">Video</span>
                          </div>
                        )}
                        <button 
                          onClick={() => {
                            if (item.type === 'image') setPhotos(photos.filter(p => p.id !== item.id));
                            else setVideos(videos.filter(v => v.id !== item.id));
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-brand-text-main mb-2">Session Details</h3>
                <p className="text-sm text-brand-text-muted font-medium">Provide the main details for your upcoming session.</p>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-brand-text-muted uppercase tracking-widest mb-2">Session Title</label>
                  <input type="text" value={topic} onChange={e => setTopic(e.target.value)} className="w-full bg-brand-surface border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-primary outline-none transition-all" placeholder="e.g. Morning Awakening Flow" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-brand-text-muted uppercase tracking-widest mb-2">Internal Time (HH:MM)</label>
                    <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-brand-surface border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-primary outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-brand-text-muted uppercase tracking-widest mb-2">Display Time</label>
                    <input type="text" value={displayTime} onChange={e => setDisplayTime(e.target.value)} className="w-full bg-brand-surface border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-primary outline-none transition-all" placeholder="7:00 AM - 8:30 AM" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-brand-text-muted uppercase tracking-widest mb-2">Meeting Link</label>
                  <input type="url" value={meetingLink} onChange={e => setMeetingLink(e.target.value)} className="w-full bg-brand-surface border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-primary outline-none transition-all" placeholder="https://zoom.us/j/..." />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-brand-text-muted uppercase tracking-widest mb-2">Description (Optional)</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-brand-surface border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-primary outline-none transition-all resize-none h-24" placeholder="What to expect in this session..." />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-brand-text-main mb-2">Calendar Selection</h3>
                <p className="text-sm text-brand-text-muted font-medium">Choose the date for this session.</p>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-brand-text-muted uppercase tracking-widest mb-2">Select Date</label>
                  <input 
                    type="date" 
                    value={dateStr} 
                    onChange={e => {
                      const d = e.target.value;
                      setDateStr(d);
                      if (d) {
                        // Create date in local timezone correctly
                        const parts = d.split('-');
                        const dt = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                        const formatted = dt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                        setDisplayDate(formatted);
                      } else {
                        setDisplayDate('');
                      }
                    }} 
                    className="w-full bg-brand-surface border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-primary outline-none transition-all" 
                  />
                </div>
                {displayDate && (
                  <div className="bg-green-50 p-6 rounded-2xl border border-green-100 flex items-center gap-4">
                    <CheckCircle2 className="w-8 h-8 text-green-500 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-black text-green-600 mb-1">Derived Day</p>
                      <p className="text-lg font-bold text-green-800">{displayDate}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="px-8 py-6 border-t border-brand-surface-hover bg-brand-surface/30 flex items-center justify-between">
          {step > 1 ? (
            <button onClick={handlePrev} className="px-6 py-3 font-bold text-brand-text-main hover:bg-white rounded-xl transition-all shadow-sm border border-brand-surface-hover flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : <div></div>}
          
          {step < 3 ? (
            <button onClick={handleNext} className="px-6 py-3 font-bold bg-brand-primary text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
              Next Step <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handlePublish} className="px-8 py-3 font-bold bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
              Publish Session <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
