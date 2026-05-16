import { useState, useMemo, useEffect } from 'react';
import { AuthService } from './services/authService';
import { LayoutDashboard, LogOut, Trash2, ImageIcon, Video, Calendar, PlusCircle, Sparkles, Monitor, History, FastForward, CheckCircle2, AlertCircle, Link as LinkIcon, ChevronLeft, ChevronRight, X, ChevronDown, Clock, Upload, Pencil, Menu } from 'lucide-react';
import { useMedia } from './hooks/useMedia';
import { useSessions } from './hooks/useSessions';
import { useLandingPage } from './hooks/useLandingPage';
import { useNavigate } from 'react-router-dom';
import MediaUploader from './components/MediaUploader';
import UploadSessionModal from './components/UploadSessionModal';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'gallery' | 'landing' | 'upcoming' | 'previous'>('gallery');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { images: landingImages, updateImage: updateLandingImage } = useLandingPage();
  const { media, addMedia: addGalleryMedia, removeMedia: removeGalleryMedia } = useMedia();
  const { 
    sessionData, updateUpcomingSession, deleteUpcomingSession, markSessionCompleted,
    addPastSession, addMediaToPastSession, removeMediaFromPastSession,
    setSessionData
  } = useSessions();
  const navigate = useNavigate();
  
  const [newGalleryMedia, setNewGalleryMedia] = useState({ type: 'photo' as 'photo' | 'video', url: '', title: '' });
  const [newUpcomingMedia, setNewUpcomingMedia] = useState({ type: 'photo' as 'photo' | 'video', url: '', title: '' });
  const [newPreviousMedia, setNewPreviousMedia] = useState({ type: 'photo' as 'photo' | 'video', url: '', title: '' });

  const [showGalleryTypeDropdown, setShowGalleryTypeDropdown] = useState(false);
  const [showUpcomingTypeDropdown, setShowUpcomingTypeDropdown] = useState(false);
  const [showHistoryTypeDropdown, setShowHistoryTypeDropdown] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingSession, setEditingSession] = useState<(typeof sessionData.upcomingSessions)[0] | null>(null);

  const nearest = sessionData.upcomingSessions[0] || { topic: '', date: '', displayDate: '', time: '', displayTime: '', meetingLink: '' };
  const [upcomingForm, setUpcomingForm] = useState(nearest);

  useEffect(() => {
    if (sessionData.upcomingSessions.length > 0) {
      setUpcomingForm(sessionData.upcomingSessions[0]);
    }
  }, [sessionData.upcomingSessions]);

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [startTime, setStartTime] = useState({ hour: '07', minute: '00', period: 'AM' });
  const [endTime, setEndTime] = useState({ hour: '08', minute: '30', period: 'AM' });

  const handleTimeSave = () => {
    const startStr = `${startTime.hour}:${startTime.minute} ${startTime.period}`;
    const endStr = `${endTime.hour}:${endTime.minute} ${endTime.period}`;
    let hour24 = parseInt(startTime.hour);
    if (startTime.period === 'PM' && hour24 !== 12) hour24 += 12;
    if (startTime.period === 'AM' && hour24 === 12) hour24 = 0;
    const time24 = `${String(hour24).padStart(2, '0')}:${startTime.minute}`;
    setUpcomingForm(prev => ({ ...prev, time: time24, displayTime: `${startStr} - ${endStr}` }));
    setShowTimePicker(false);
  };

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth()));
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const yearsList = Array.from({ length: 11 }, (_, i) => today.getFullYear() - 1 + i);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const d = new Date(year, month, i);
      const displayStr = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      days.push({ day: i, dateStr, displayStr });
    }
    return days;
  }, [currentMonth]);

  const handleSelectUpcomingDate = (dateStr: string, displayStr: string) => {
    setUpcomingForm(prev => ({ ...prev, date: dateStr, displayDate: displayStr }));
  };

  const [adminSelectedDate, setAdminSelectedDate] = useState("2026-05-11");
  const [adminDisplayDate, setAdminDisplayDate] = useState("Monday, May 11, 2026");
  
  const activePastSession = sessionData.pastSessions[adminSelectedDate];

  const deleteFullSession = (dateKey: string) => {
    if (window.confirm("Are you sure you want to delete this entire session history?")) {
      const newPast = { ...sessionData.pastSessions };
      delete newPast[dateKey];
      setSessionData({ ...sessionData, pastSessions: newPast });
      alert("Session deleted successfully!");
    }
  };

  return (
    <div className="min-h-screen bg-brand-surface flex page-container" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-white border-b border-brand-surface-hover flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-3">
          <img src="/logo.jpeg" alt="Logo" className="w-10 h-10 rounded-full border-2 border-brand-primary/20" />
          <span className="font-bold text-brand-text-main">Admin Control</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-brand-text-main bg-brand-surface rounded-xl">
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`w-72 bg-white border-r border-brand-surface-hover flex flex-col fixed inset-y-0 shadow-sm z-50 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <img src="/logo.jpeg" alt="Logo" className="w-12 h-12 rounded-full border-2 border-brand-primary/20" />
            <div><span className="block font-bold text-brand-text-main text-sm">Admin Control</span><span className="text-[10px] text-brand-text-muted uppercase tracking-widest font-bold">Rhythm & Rise</span></div>
          </div>
          <div className="space-y-6">
            <button onClick={() => { setActiveTab('gallery'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${activeTab === 'gallery' ? 'bg-brand-primary text-white shadow-lg' : 'text-brand-text-muted hover:bg-brand-surface hover:text-brand-text-main'}`}><LayoutDashboard className="w-5 h-5" /> Main Gallery</button>
            <button onClick={() => { setActiveTab('landing'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${activeTab === 'landing' ? 'bg-brand-primary text-white shadow-lg' : 'text-brand-text-muted hover:bg-brand-surface hover:text-brand-text-main'}`}><ImageIcon className="w-5 h-5" /> Landing Page Photos</button>
            <button onClick={() => { setActiveTab('upcoming'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${activeTab === 'upcoming' ? 'bg-brand-primary text-white shadow-lg' : 'text-brand-text-muted hover:bg-brand-surface hover:text-brand-text-main'}`}><FastForward className="w-5 h-5" /> Upcoming Session</button>
          </div>
        </div>
        <div className="mt-auto p-8 border-t border-brand-surface-hover"><button onClick={() => { AuthService.logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 font-bold hover:bg-red-50 transition-all"><LogOut className="w-5 h-5" /> Sign Out</button></div>
      </aside>

      <main className="flex-1 w-full lg:ml-72 mt-20 lg:mt-0 p-4 sm:p-8 lg:p-12 overflow-x-hidden">
        {activeTab === 'gallery' && (
          <div className="max-w-6xl space-y-12 mx-auto">
            <header><div className="flex items-center gap-2 text-brand-primary font-black text-xs uppercase tracking-widest mb-2"><Monitor className="w-4 h-4" /> Visual Identity</div><h1 className="text-4xl font-bold text-brand-text-main" style={{ fontFamily: 'Playfair Display, serif' }}>Public Lookbook</h1></header>
            
            {/* SPLIT SLIDABLE GALLERY */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Column: Photos */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-xl font-bold text-brand-text-main flex items-center gap-3">
                    <ImageIcon className="text-brand-primary w-5 h-5" /> Photos
                  </h4>
                  <div className="flex gap-2">
                    <button onClick={() => document.getElementById('photo-scroll')?.scrollBy({left: -300, behavior: 'smooth'})} className="p-2 bg-white rounded-full border border-brand-surface-hover shadow-sm hover:bg-brand-surface transition-all"><ChevronLeft className="w-4 h-4" /></button>
                    <button onClick={() => document.getElementById('photo-scroll')?.scrollBy({left: 300, behavior: 'smooth'})} className="p-2 bg-white rounded-full border border-brand-surface-hover shadow-sm hover:bg-brand-surface transition-all"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="relative">
                  <div id="photo-scroll" className="flex flex-nowrap gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory px-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {media.filter(m => m.type === 'image').map(item => (
                      <div key={item.id} className="flex-none w-64 bg-white p-4 rounded-[2.5rem] border border-brand-surface-hover shadow-sm snap-start">
                        <div className="aspect-square bg-brand-surface rounded-3xl overflow-hidden mb-4 relative">
                          <img src={item.url} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex items-center justify-between px-2">
                          <span className="font-bold text-brand-text-main text-[10px] truncate max-w-[120px]">{item.title}</span>
                          <button onClick={() => removeGalleryMedia(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                    {media.filter(m => m.type === 'image').length === 0 && (
                      <div className="w-full text-center py-20 bg-brand-surface rounded-3xl text-brand-text-muted font-bold px-8">No photos uploaded yet.</div>
                    )}
                  </div>
                  <div className="absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-brand-surface to-transparent pointer-events-none"></div>
                </div>
              </div>

              {/* Right Column: Videos */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-xl font-bold text-brand-text-main flex items-center gap-3">
                    <Video className="text-brand-primary w-5 h-5" /> Videos
                  </h4>
                  <div className="flex gap-2">
                    <button onClick={() => document.getElementById('video-scroll')?.scrollBy({left: -400, behavior: 'smooth'})} className="p-2 bg-white rounded-full border border-brand-surface-hover shadow-sm hover:bg-brand-surface transition-all"><ChevronLeft className="w-4 h-4" /></button>
                    <button onClick={() => document.getElementById('video-scroll')?.scrollBy({left: 400, behavior: 'smooth'})} className="p-2 bg-white rounded-full border border-brand-surface-hover shadow-sm hover:bg-brand-surface transition-all"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="relative">
                  <div id="video-scroll" className="flex flex-nowrap gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory px-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {media.filter(m => m.type === 'video').map(item => (
                      <div key={item.id} className="flex-none w-80 bg-white p-5 rounded-[2.5rem] border border-brand-surface-hover shadow-sm snap-start">
                        <div className="aspect-video bg-brand-text-main rounded-3xl overflow-hidden mb-4 flex items-center justify-center text-white relative">
                          <Video className="w-10 h-10 opacity-30" />
                          <div className="absolute inset-0 bg-black/10 flex items-center justify-center"><div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center"><Video className="w-5 h-5" /></div></div>
                        </div>
                        <div className="flex items-center justify-between px-2">
                          <span className="font-bold text-brand-text-main text-[10px] truncate max-w-[180px]">{item.title}</span>
                          <button onClick={() => removeGalleryMedia(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                    {media.filter(m => m.type === 'video').length === 0 && (
                      <div className="w-full text-center py-20 bg-brand-surface rounded-3xl text-brand-text-muted font-bold px-8">No videos uploaded yet.</div>
                    )}
                  </div>
                  <div className="absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-brand-surface to-transparent pointer-events-none"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'landing' && (
          <div className="max-w-4xl space-y-12">
            <header>
              <div className="flex items-center gap-2 text-brand-primary font-black text-xs uppercase tracking-widest mb-2">
                <ImageIcon className="w-4 h-4" /> Branding & Visuals
              </div>
              <h1 className="text-4xl font-bold text-brand-text-main" style={{ fontFamily: 'Playfair Display, serif' }}>Landing Page Photos</h1>
              <p className="text-brand-text-muted mt-2">Manage the main visuals that appear on your public homepage.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Hero Image Control */}
              <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-brand-surface-hover space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-brand-text-main flex items-center gap-2">Hero Main Image</h3>
                  <div className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-black uppercase tracking-widest">Home Section</div>
                </div>
                
                <div className="aspect-[4/5] bg-brand-surface rounded-[2rem] overflow-hidden border border-brand-surface-hover relative group">
                  <img src={landingImages.hero} className="w-full h-full object-cover object-center" alt="Hero Preview" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <span className="text-white text-[10px] font-bold bg-white/20 px-3 py-1.5 rounded-full border border-white/30">Live Hero Preview</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-xs text-brand-text-muted font-medium">Recommended: High quality 4:3 or 16:9 vertical/square image of yourself or a session.</p>
                  <MediaUploader onUpload={(media) => {
                    updateLandingImage('hero', media.url);
                    alert('Hero image updated successfully!');
                  }} />
                </div>
              </div>

              {/* About Image Control */}
              <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-brand-surface-hover space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-brand-text-main flex items-center gap-2">"Meet Jeya" Image</h3>
                  <div className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-black uppercase tracking-widest">About Section</div>
                </div>

                <div className="aspect-[3/4] bg-brand-surface rounded-[2rem] overflow-hidden border border-brand-surface-hover relative group">
                  <img src={landingImages.about} className="w-full h-full object-cover object-center" alt="About Preview" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <span className="text-white text-[10px] font-bold bg-white/20 px-3 py-1.5 rounded-full border border-white/30">Live About Preview</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-xs text-brand-text-muted font-medium">Recommended: A professional portrait or action shot for the introduction section.</p>
                  <MediaUploader onUpload={(media) => {
                    updateLandingImage('about', media.url);
                    alert('About section image updated successfully!');
                  }} />
                </div>
              </div>
            </div>

            <div className="bg-brand-surface p-8 rounded-[2.5rem] border border-dashed border-brand-primary/30 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-primary shadow-sm"><Sparkles className="w-6 h-6" /></div>
                <div>
                  <h4 className="font-bold text-brand-text-main">Need to reset to defaults?</h4>
                  <p className="text-xs text-brand-text-muted">This will revert the landing page to the original placeholder images.</p>
                </div>
              </div>
              <button 
                onClick={() => { if(window.confirm('Reset all landing page images to defaults?')) { localStorage.removeItem('rhythm_rise_landing_v1'); window.location.reload(); } }}
                className="px-6 py-3 bg-white text-brand-text-main rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all border border-brand-surface-hover"
              >
                Reset Images
              </button>
            </div>
          </div>
        )}

        {activeTab === 'upcoming' && (
          <div className="max-w-5xl space-y-12">
            <header><div className="flex items-center gap-2 text-brand-primary font-black text-xs uppercase tracking-widest mb-2"><Sparkles className="w-4 h-4" /> Next Up</div><h1 className="text-4xl font-bold text-brand-text-main" style={{ fontFamily: 'Playfair Display, serif' }}>Live Session Control</h1></header>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-7 space-y-12">
                <form onSubmit={e => { e.preventDefault(); if(sessionData.upcomingSessions.length > 0) updateUpcomingSession(sessionData.upcomingSessions[0].id, upcomingForm); else alert('Please use Upload Session to create a new session first.'); alert('Session updated successfully!'); }} className="bg-white p-10 rounded-[3rem] shadow-sm border border-brand-surface-hover space-y-8">
                  <h3 className="text-xl font-bold text-brand-text-main flex items-center gap-2">Session Details</h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-brand-text-muted uppercase tracking-widest mb-2">Theme / Topic</label>
                      <input type="text" value={upcomingForm.topic} onChange={e => setUpcomingForm({...upcomingForm, topic: e.target.value})} className="w-full bg-brand-surface border-none rounded-2xl px-5 py-4 text-sm font-bold" />
                    </div>
                    <div className="relative">
                      <label className="block text-[10px] font-black text-brand-text-muted uppercase tracking-widest mb-2">Broadcast Time</label>
                      <button type="button" onClick={() => setShowTimePicker(!showTimePicker)} className="w-full bg-brand-surface rounded-2xl px-5 py-4 text-sm font-bold flex items-center justify-between">
                        <span>{upcomingForm.displayTime}</span><Clock className="w-4 h-4 text-brand-primary" />
                      </button>
                      {showTimePicker && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-[2rem] shadow-2xl border border-brand-surface-hover p-8 z-50 space-y-6">
                          <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-4 text-center">
                              <p className="text-[10px] uppercase tracking-widest text-brand-primary">Starting</p>
                              <div className="flex gap-2">
                                <select value={startTime.hour} onChange={e => setStartTime({...startTime, hour: e.target.value})} className="flex-1 bg-brand-surface rounded-xl p-2 text-xs font-bold">{Array.from({length:12}, (_,i)=>String(i+1).padStart(2,'0')).map(h=><option key={h} value={h}>{h}</option>)}</select>
                                <select value={startTime.minute} onChange={e => setStartTime({...startTime, minute: e.target.value})} className="flex-1 bg-brand-surface rounded-xl p-2 text-xs font-bold">{['00','15','30','45'].map(m=><option key={m} value={m}>{m}</option>)}</select>
                                <select value={startTime.period} onChange={e => setStartTime({...startTime, period: e.target.value})} className="flex-1 bg-brand-surface rounded-xl p-2 text-xs font-bold"><option value="AM">AM</option><option value="PM">PM</option></select>
                              </div>
                            </div>
                            <div className="space-y-4 text-center">
                              <p className="text-[10px] uppercase tracking-widest text-brand-primary">Ending</p>
                              <div className="flex gap-2">
                                <select value={endTime.hour} onChange={e => setEndTime({...endTime, hour: e.target.value})} className="flex-1 bg-brand-surface rounded-xl p-2 text-xs font-bold">{Array.from({length:12}, (_,i)=>String(i+1).padStart(2,'0')).map(h=><option key={h} value={h}>{h}</option>)}</select>
                                <select value={endTime.minute} onChange={e => setEndTime({...endTime, minute: e.target.value})} className="flex-1 bg-brand-surface rounded-xl p-2 text-xs font-bold">{['00','15','30','45'].map(m=><option key={m} value={m}>{m}</option>)}</select>
                                <select value={endTime.period} onChange={e => setEndTime({...endTime, period: e.target.value})} className="flex-1 bg-brand-surface rounded-xl p-2 text-xs font-bold"><option value="AM">AM</option><option value="PM">PM</option></select>
                              </div>
                            </div>
                          </div>
                          <button type="button" onClick={handleTimeSave} className="w-full bg-brand-primary text-white py-3 rounded-xl shadow-lg">Confirm Selection</button>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-brand-text-muted uppercase tracking-widest mb-2">Meeting Link</label>
                      <input type="text" value={upcomingForm.meetingLink} onChange={e => setUpcomingForm({...upcomingForm, meetingLink: e.target.value})} className="w-full bg-brand-surface border-none rounded-2xl px-5 py-4 text-sm font-bold" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-brand-primary text-white py-5 rounded-[2rem] font-bold shadow-xl">Update Session</button>
                </form>
              </div>
              <div className="lg:col-span-5">
                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-brand-surface-hover h-full">
                  <header className="mb-8 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-brand-text-main flex items-center gap-2">Session Date</h3>
                    <div className="flex gap-2">
                      <select value={currentMonth.getMonth()} onChange={(e) => setCurrentMonth(new Date(currentMonth.getFullYear(), parseInt(e.target.value)))} className="bg-brand-surface border-none rounded-lg px-2 py-1.5 text-xs font-bold outline-none">{months.map((m, i) => <option key={m} value={i}>{m}</option>)}</select>
                      <select value={currentMonth.getFullYear()} onChange={(e) => setCurrentMonth(new Date(parseInt(e.target.value), currentMonth.getMonth()))} className="bg-brand-surface border-none rounded-lg px-2 py-1.5 text-xs font-bold outline-none">{yearsList.map((y) => <option key={y} value={y}>{y}</option>)}</select>
                    </div>
                  </header>
                  <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-black text-brand-text-muted uppercase mb-4 opacity-40"><span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span></div>
                  <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((d, i) => {
                      if (!d) return <div key={i} className="aspect-square" />;
                      
                      const isPast = !!sessionData.pastSessions[d.dateStr];
                      const isUpcoming = sessionData.upcomingSessions.some(s => s.date === d.dateStr);
                      const isSelected = upcomingForm.date === d.dateStr;
                      
                      let btnClass = "hover:bg-brand-surface text-brand-text-main";
                      let dotClass = "";

                      if (isSelected) {
                        btnClass = "bg-brand-primary text-white shadow-lg scale-110 z-10";
                      } else if (isUpcoming) {
                        btnClass = "bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20";
                        dotClass = "bg-brand-primary";
                      } else if (isPast) {
                        btnClass = "bg-green-50 text-green-600 hover:bg-green-100";
                        dotClass = "bg-green-500";
                      }

                      return (
                        <div key={i} className="aspect-square flex items-center justify-center">
                          <button 
                            type="button" 
                            onClick={() => handleSelectUpcomingDate(d.dateStr, d.displayStr)} 
                            className={`w-full h-full rounded-xl text-xs font-bold transition-all relative ${btnClass}`}
                          >
                            {d.day}
                            {(isPast || isUpcoming) && !isSelected && (
                              <div className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${dotClass}`}></div>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-8 flex items-center justify-center gap-6 pt-6 border-t border-brand-surface-hover">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-brand-primary"></div>
                      <span className="text-[9px] font-black text-brand-text-muted uppercase tracking-widest">Upcoming</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-[9px] font-black text-brand-text-muted uppercase tracking-widest">Completed</span>
                    </div>
                  </div>
                  {upcomingForm.displayDate && (
                    <div className="mt-6 bg-green-50 p-6 rounded-2xl border border-green-100 flex items-center gap-4 animate-in fade-in">
                      <CheckCircle2 className="w-8 h-8 text-green-500 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-black text-green-600 mb-1">
                          {new Date(upcomingForm.date).toLocaleDateString('en-US', { weekday: 'long' })}
                        </p>
                        <p className="text-lg font-bold text-green-800">
                          {new Date(upcomingForm.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center pt-8">
              <button onClick={() => setShowUploadModal(true)} className="bg-brand-primary text-white py-5 px-10 rounded-[2rem] font-bold shadow-xl flex items-center gap-3 hover:scale-105 transition-all">
                <Upload className="w-6 h-6" />
                Upload New Session
              </button>
            </div>

            {/* Session History (Admin Side) */}
            <div className="mt-16 space-y-6 pt-16 border-t border-brand-surface-hover">
              <header>
                <h3 className="text-3xl font-bold text-brand-text-main flex items-center gap-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                  <History className="w-6 h-6 text-brand-primary" /> Session History & Management
                </h3>
                <p className="text-sm text-brand-text-muted mt-2">Manage all scheduled sessions. Nearest upcoming sessions are shown first.</p>
              </header>

              <div className="space-y-4">
                {sessionData.upcomingSessions.length === 0 ? (
                  <div className="bg-brand-surface p-10 rounded-[2rem] text-center text-brand-text-muted font-bold border border-brand-surface-hover">
                    No active sessions found.
                  </div>
                ) : (
                  sessionData.upcomingSessions.map((session, idx) => (
                    <div key={session.id} className="bg-white p-6 rounded-[2rem] border border-brand-surface-hover shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-md">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${idx === 0 ? 'bg-brand-primary text-white' : 'bg-brand-surface text-brand-text-muted'}`}>
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="font-bold text-brand-text-main text-lg leading-tight mb-1">{session.topic}</h4>
                          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-brand-text-muted">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {session.date}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {session.displayTime}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 md:ml-auto flex-wrap">
                        <button 
                          onClick={() => { setEditingSession(session); setShowUploadModal(true); }}
                          className="px-4 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs rounded-xl transition-all flex items-center gap-2"
                        >
                          <Pencil className="w-4 h-4" /> Edit
                        </button>
                        <button 
                          onClick={() => {
                            if(window.confirm('Mark this session as completed? It will be moved to Past Sessions.')) markSessionCompleted(session.id);
                          }} 
                          className="px-4 py-2.5 bg-green-50 text-green-600 hover:bg-green-100 font-bold text-xs rounded-xl transition-all flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Complete
                        </button>
                        <button 
                          onClick={() => {
                            if(window.confirm('Are you sure you want to delete this scheduled session?')) deleteUpcomingSession(session.id);
                          }} 
                          className="px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs rounded-xl transition-all flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'previous' && (
          <div className="max-w-4xl space-y-12">
            <header><div className="flex items-center gap-2 text-brand-primary font-black text-xs uppercase tracking-widest mb-2"><History className="w-4 h-4" /> Archivist</div><h1 className="text-4xl font-bold text-brand-text-main" style={{ fontFamily: 'Playfair Display, serif' }}>Session History</h1></header>
            
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-brand-surface-hover">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-brand-text-main">Select Session Date</h3>
                {activePastSession && (
                  <button onClick={() => deleteFullSession(adminSelectedDate)} className="flex items-center gap-2 text-red-500 font-bold hover:bg-red-50 px-4 py-2 rounded-xl transition-all">
                    <Trash2 className="w-4 h-4" /> Delete This Session History
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <input type="text" value={adminSelectedDate} onChange={e => setAdminSelectedDate(e.target.value)} className="w-full bg-brand-surface border-none rounded-2xl px-5 py-4 text-sm font-bold" placeholder="YYYY-MM-DD" />
                <input type="text" value={adminDisplayDate} onChange={e => setAdminDisplayDate(e.target.value)} className="w-full bg-brand-surface border-none rounded-2xl px-5 py-4 text-sm font-bold" placeholder="Display Name" />
              </div>
              {!activePastSession ? (
                <button onClick={() => addPastSession(adminSelectedDate, adminDisplayDate)} className="w-full bg-brand-primary text-white py-4 rounded-[2rem] font-bold flex items-center justify-center gap-2 shadow-lg"><PlusCircle className="w-5 h-5" /> Initialize History Entry</button>
              ) : (
                <div className="bg-green-50 text-green-700 p-5 rounded-3xl flex items-center gap-3 border border-green-100 font-bold"><CheckCircle2 className="w-6 h-6" /> Session initialized & ready for media</div>
              )}
            </div>

            {activePastSession && (
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-brand-surface-hover">
                <header className="mb-10 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-brand-text-main flex items-center gap-3">
                    <History className="w-6 h-6 text-brand-primary" /> 
                    Archive Media: {adminDisplayDate}
                  </h3>
                </header>

                <MediaUploader 
                  onUpload={(item) => {
                    addMediaToPastSession(adminSelectedDate, item.type === 'image' ? 'photo' : 'video', {
                      ...item,
                      id: Date.now().toString()
                    });
                    alert('Session history updated!');
                  }}
                />

                <div className="grid grid-cols-2 gap-4 mt-10 pt-10 border-t border-brand-surface-hover">
                  {[...activePastSession.photos, ...activePastSession.videos].map(item => (
                    <div key={item.id} className="flex items-center justify-between p-5 bg-brand-surface rounded-[1.5rem] border border-brand-surface-hover">
                      <div className="flex items-center gap-3">
                        {item.type === 'image' ? <ImageIcon className="w-4 h-4 text-brand-primary" /> : <Video className="w-4 h-4 text-brand-primary" />}
                        <span className="text-sm font-bold text-brand-text-main truncate max-w-[150px]">{item.title}</span>
                      </div>
                      <button onClick={() => removeMediaFromPastSession(adminSelectedDate, item.type==='image'?'photo':'video', item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      
      {showUploadModal && <UploadSessionModal onClose={() => { setShowUploadModal(false); setEditingSession(null); }} editingSession={editingSession ?? undefined} />}
    </div>
  );
}
