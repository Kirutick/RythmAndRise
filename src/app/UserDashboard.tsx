import { LogOut, Calendar as CalendarIcon, Star, Clock, Play, ChevronLeft, ChevronRight, Image as ImageIcon, Video, CalendarDays, Info, ExternalLink, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useSessions } from './hooks/useSessions';

function CountdownTimer({ targetDate, targetTime }: { targetDate: string, targetTime: string }) {
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const target = new Date(`${targetDate}T${targetTime}:00`).getTime();
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        setTimeLeft(null);
        clearInterval(timer);
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, targetTime]);

  if (!timeLeft) return <div className="text-sm font-bold text-green-500 bg-green-50 px-3 py-1 rounded-full border border-green-100">Session in progress or completed</div>;

  return (
    <div className="flex gap-4">
      {[
        { label: 'Days', value: timeLeft.days },
        { label: 'Hrs', value: timeLeft.hours },
        { label: 'Min', value: timeLeft.minutes },
        { label: 'Sec', value: timeLeft.seconds }
      ].map((unit) => (
        <div key={unit.label} className="text-center">
          <div className="text-xl font-black text-brand-primary leading-none">{String(unit.value).padStart(2, '0')}</div>
          <div className="text-[9px] uppercase tracking-widest font-bold text-brand-text-muted mt-1">{unit.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const { sessionData } = useSessions();
  const { pastSessions, upcomingSessions } = sessionData;

  const [selectedDate, setSelectedDate] = useState("2026-05-11");
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 4));

  const activeSession = pastSessions[selectedDate];

  const [activePrevPhoto, setActivePrevPhoto] = useState(0);
  const [activePrevVideo, setActivePrevVideo] = useState(0);
  const [activeUpPhoto, setActiveUpPhoto] = useState(0);
  const [activeUpVideo, setActiveUpVideo] = useState(0);

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const topCardRef = useRef<HTMLDivElement>(null);

  const defaultSession = upcomingSessions[0] || null;
  const upcoming = selectedSessionId && defaultSession ? upcomingSessions.find(s => s.id === selectedSessionId) || defaultSession : defaultSession;

  const carouselPhotos = upcoming?.photos?.filter(p => p.type === 'image') || [];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  useEffect(() => {
    setActiveImageIndex(0);
  }, [upcoming?.id]);

  useEffect(() => {
    if (carouselPhotos.length <= 1) return;
    
    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % carouselPhotos.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [carouselPhotos.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (topCardRef.current && !topCardRef.current.contains(event.target as Node)) {
        const target = event.target as Element;
        if (!target.closest('.future-session-card')) {
          setSelectedSessionId(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = Array.from({ length: 11 }, (_, i) => 2024 + i);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ day: i, dateStr });
    }
    return days;
  }, [currentMonth]);

  return (
    <div className="min-h-screen bg-brand-surface" style={{ fontFamily: 'Inter, sans-serif' }}>
      <nav className="bg-white border-b border-brand-surface-hover sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.jpeg" alt="Logo" className="w-10 h-10 rounded-full" />
            <span className="font-bold text-brand-text-main" style={{ fontFamily: 'Playfair Display, serif' }}>Member Area</span>
          </div>
          <button onClick={() => navigate('/')} className="flex items-center gap-2 bg-white border border-brand-surface-hover text-black px-5 py-2.5 rounded-xl transition-all font-bold hover:bg-black hover:text-white shadow-sm">
            <LogOut className="w-4 h-4" /><span>Logout</span>
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-bold text-brand-text-main" style={{ fontFamily: 'Playfair Display, serif' }}>Hello, Member!</h1>
          <p className="text-sm text-brand-text-muted mt-1">Select a date on the calendar to relive your journey.</p>
        </header>

        <div className="space-y-16">
          {/* HISTORY SECTION */}
          <section className="space-y-8">
            <div className="flex items-center gap-2 text-brand-primary font-bold text-xs uppercase tracking-widest mb-3"><Star className="w-4 h-4" /> Session History</div>
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
              <div className="xl:col-span-4 space-y-6">
                <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-brand-surface-hover">
                  <div className="flex items-center justify-between mb-8 px-2">
                    <div className="flex gap-2">
                      <select value={currentMonth.getMonth()} onChange={(e) => setCurrentMonth(new Date(currentMonth.getFullYear(), parseInt(e.target.value)))} className="bg-brand-surface border border-brand-surface-hover rounded-xl px-4 py-2.5 text-[11px] font-bold text-brand-text-main outline-none cursor-pointer hover:bg-brand-surface-hover transition-colors shadow-sm">
                        {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
                      </select>
                      <select value={currentMonth.getFullYear()} onChange={(e) => setCurrentMonth(new Date(parseInt(e.target.value), currentMonth.getMonth()))} className="bg-brand-surface border border-brand-surface-hover rounded-xl px-4 py-2.5 text-[11px] font-bold text-brand-text-main outline-none cursor-pointer hover:bg-brand-surface-hover transition-colors shadow-sm">
                        {years.map((y) => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-2 hover:bg-brand-surface rounded-full"><ChevronLeft className="w-4 h-4" /></button>
                      <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-2 hover:bg-brand-surface rounded-full"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-brand-text-muted uppercase tracking-widest mb-4 opacity-50"><span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span></div>
                  <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((d, i) => {
                      if (!d) return <div key={i} className="aspect-square" />;
                      
                      const isPast = !!pastSessions[d.dateStr];
                      const isUpcoming = upcomingSessions.some(s => s.date === d.dateStr);
                      const isSelected = selectedDate === d.dateStr;
                      
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
                            onClick={() => { setSelectedDate(d.dateStr); setActivePrevPhoto(0); setActivePrevVideo(0); }} 
                            className={`w-full h-full rounded-2xl text-xs font-bold transition-all relative ${btnClass}`}
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
                  <div className="mt-6 flex items-center justify-center gap-6 pt-4 border-t border-brand-surface-hover">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-brand-primary"></div>
                      <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Upcoming</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Completed</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="xl:col-span-8">
                {activeSession ? (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="inline-flex px-5 py-2 bg-white border border-brand-primary/20 rounded-2xl shadow-sm"><h2 className="text-lg font-bold text-brand-primary flex items-center gap-2"><CalendarIcon className="w-4 h-4" />{activeSession.displayDate}</h2></div>
                    <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-xl border border-brand-surface-hover">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-surface border border-brand-surface-hover rounded-xl text-brand-text-main text-xs font-bold uppercase tracking-wider"><Video className="w-3.5 h-3.5" /> Videos</div>
                          <div className="relative aspect-video bg-brand-surface rounded-[2.5rem] overflow-hidden shadow-inner border border-brand-surface-hover">
                            {activeSession.videos.length > 0 ? (
                              activeSession.videos.map((v, i) => (
                                <div key={v.id} className={`absolute inset-0 transition-opacity duration-500 ${i === activePrevVideo ? 'opacity-100' : 'opacity-0'} flex items-center justify-center`}>
                                  <div className="text-center p-4">
                                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-3"><Play className="w-7 h-7 fill-white text-white translate-x-0.5" /></div>
                                    <div className="inline-block px-4 py-1.5 bg-white/90 rounded-full shadow-sm"><p className="text-brand-text-main text-xs font-bold">{v.title}</p></div>
                                  </div>
                                </div>
                              ))
                            ) : <div className="flex items-center justify-center h-full text-white/40 text-xs font-medium">No videos</div>}
                            {activeSession.videos.length > 1 && (
                              <><button onClick={() => setActivePrevVideo(p => (p-1+activeSession.videos.length)%activeSession.videos.length)} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 rounded-full text-white"><ChevronLeft className="w-4 h-4" /></button>
                              <button onClick={() => setActivePrevVideo(p => (p+1)%activeSession.videos.length)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 rounded-full text-white"><ChevronRight className="w-4 h-4" /></button></>
                            )}
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-surface border border-brand-surface-hover rounded-xl text-brand-text-main text-xs font-bold uppercase tracking-wider"><ImageIcon className="w-3.5 h-3.5" /> Photos</div>
                          <div className="relative aspect-video bg-brand-surface rounded-[2.5rem] overflow-hidden shadow-inner border border-brand-surface-hover">
                            {activeSession.photos.length > 0 ? (
                              activeSession.photos.map((p, i) => (
                                <div key={p.id} className={`absolute inset-0 transition-opacity duration-500 ${i === activePrevPhoto ? 'opacity-100' : 'opacity-0'}`}>
                                  {/* Backdrop for aspect ratio preservation */}
                                  <img src={p.url} className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-20 scale-110" alt="" aria-hidden="true" />
                                  <img src={p.url} className="relative z-10 w-full h-full object-contain" alt={p.title} />
                                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-white/50 z-20"><p className="text-brand-text-main text-xs font-bold whitespace-nowrap">{p.title}</p></div>
                                </div>
                              ))
                            ) : <div className="flex items-center justify-center h-full text-brand-text-muted/40 text-xs font-medium uppercase tracking-widest">No photos</div>}
                            {activeSession.photos.length > 1 && (
                              <><button onClick={() => setActivePrevPhoto(p => (p-1+activeSession.photos.length)%activeSession.photos.length)} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 rounded-full text-white"><ChevronLeft className="w-4 h-4" /></button>
                              <button onClick={() => setActivePrevPhoto(p => (p+1)%activeSession.photos.length)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 rounded-full text-white"><ChevronRight className="w-4 h-4" /></button></>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : <div className="h-full min-h-[450px] flex flex-col items-center justify-center bg-white rounded-[3rem] shadow-xl border border-dashed border-brand-surface-hover p-12 text-center animate-in fade-in duration-500"><div className="w-24 h-24 bg-brand-surface rounded-full flex items-center justify-center text-brand-text-muted mb-6"><CalendarIcon className="w-10 h-10" /></div><h3 className="text-2xl font-bold text-brand-text-main mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>No session held</h3><p className="text-brand-text-muted max-w-sm">No session was held on this date. Select a date with a dot below it.</p></div>}
              </div>
            </div>
          </section>

          {/* UPCOMING SESSION SECTION */}
          <section className="space-y-8">
            <div className="flex items-center gap-2 text-brand-primary font-bold text-xs uppercase tracking-widest mb-3"><Clock className="w-4 h-4" /> Next Live Chapter</div>
            {upcomingSessions.length === 0 ? (
              <div className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-brand-surface-hover text-center">
                <CalendarIcon className="w-12 h-12 text-brand-text-muted mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-brand-text-main">No Upcoming Sessions</h3>
                <p className="text-brand-text-muted">Stay tuned for future updates.</p>
              </div>
            ) : (() => {
              const isPreview = selectedSessionId !== null && upcoming?.id !== defaultSession?.id;

              return (
                <div className="space-y-12">
                  <div ref={topCardRef} className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-xl border border-brand-surface-hover relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-bl-[8rem] -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                    {isPreview && (
                      <button onClick={() => setSelectedSessionId(null)} className="absolute top-8 right-8 z-50 p-3 bg-white hover:bg-brand-surface-hover rounded-full transition-all text-brand-text-muted hover:text-brand-text-main shadow-md border border-brand-surface-hover hover:scale-110">
                        <X className="w-5 h-5" />
                      </button>
                    )}
                    <div key={upcoming.id} className="relative z-10 space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                        <div className="space-y-6">
                          <div className={`inline-flex items-center gap-2 px-4 py-2 bg-brand-surface border border-brand-surface-hover rounded-2xl ${isPreview ? 'text-brand-text-main' : 'text-brand-primary'} text-xs font-bold uppercase tracking-wider`}><CalendarIcon className="w-4 h-4" /> {isPreview ? 'Previewing Session' : 'Upcoming Session'}</div>
                          <div>
                            <h2 className="text-4xl font-bold text-brand-text-main mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>{upcoming.topic}</h2>
                            <div className="inline-flex items-center gap-3 px-5 py-2 bg-brand-surface rounded-full">
                              <p className="text-base font-bold text-brand-primary">{upcoming.displayDate} • {upcoming.displayTime}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-4 flex-shrink-0">
                          {/* Countdown Timer */}
                          <div className="bg-white p-6 rounded-[2.5rem] shadow-lg border border-brand-surface-hover">
                            <CountdownTimer targetDate={upcoming.date} targetTime={upcoming.time} />
                          </div>

                          {/* Auto Photo Carousel */}
                          {carouselPhotos.length > 0 && (
                            <div className="relative w-full h-32 md:h-40 bg-brand-surface rounded-[2.5rem] shadow-inner border border-brand-surface-hover overflow-hidden group/carousel">
                            {carouselPhotos.map((p, i) => (
                              <div key={p.id} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === activeImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                                <img src={p.url} className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-20 scale-110" alt="" aria-hidden="true" />
                                <img 
                                  src={p.url} 
                                  alt={p.title || 'Session photo'} 
                                  className="relative z-10 w-full h-full object-contain" 
                                />
                              </div>
                            ))}
                              {carouselPhotos.length > 1 && (
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                                  {carouselPhotos.map((_, i) => (
                                    <button 
                                      key={i} 
                                      onClick={() => setActiveImageIndex(i)}
                                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === activeImageIndex ? 'bg-white w-3' : 'bg-white/50 hover:bg-white/80'}`} 
                                      aria-label={`Go to slide ${i + 1}`}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {(() => {
                        const ensureAbsoluteUrl = (url: string) => {
                          if (!url) return "";
                          const trimmedUrl = url.trim();
                          if (!trimmedUrl) return "";
                          if (/^(https?:\/\/)/i.test(trimmedUrl)) return trimmedUrl;
                          return `https://${trimmedUrl}`;
                        };

                        const finalUrl = ensureAbsoluteUrl(upcoming.meetingLink);

                        return (
                          <div className="flex flex-col sm:flex-row items-center gap-6">
                            <a 
                              href={finalUrl || "#"} 
                              target={finalUrl ? "_blank" : "_self"} 
                              rel="noopener noreferrer"
                              title={finalUrl ? `Link: ${finalUrl}` : "No link provided by admin"}
                              className={`w-full sm:w-auto px-12 py-4 bg-brand-primary text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 ${!finalUrl ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                              onClick={(e) => { if(!finalUrl) { alert("Admin hasn't set the meeting link yet!"); e.preventDefault(); } }}
                            >
                              <Play className="w-5 h-5 fill-white" />
                              Join Live Meeting
                            </a>
                            <button className="w-full sm:w-auto px-10 py-4 bg-brand-surface text-brand-text-main rounded-full font-bold hover:bg-brand-surface-hover transition-all flex items-center justify-center gap-2">
                              <Info className="w-5 h-5" />
                              Session Preparation
                            </button>
                          </div>
                        );
                      })()}


                    </div>
                  </div>
                  {upcomingSessions.length > 1 && (
                    <div className="pt-8 space-y-4">
                      <div className="flex items-center gap-2 text-brand-primary font-bold text-[10px] uppercase tracking-widest px-2"><CalendarDays className="w-3 h-3" /> Future Sessions</div>
                      <div className="flex flex-nowrap gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide px-2">
                        {upcomingSessions.slice(1).map(session => {
                          const isSelected = selectedSessionId === session.id;
                          return (
                            <div 
                              key={session.id} 
                              onClick={() => setSelectedSessionId(session.id)}
                              className={`future-session-card w-72 flex-none bg-white p-6 rounded-[2rem] border ${isSelected ? 'border-brand-primary ring-2 ring-brand-primary/20 shadow-md scale-[1.02]' : 'border-brand-surface-hover shadow-sm hover:border-brand-primary/50'} snap-start flex flex-col justify-between cursor-pointer transition-all duration-300`}
                            >
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <CalendarIcon className="w-4 h-4 text-brand-primary" />
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-text-muted">{session.displayDate}</span>
                                </div>
                                <h4 className="font-bold text-brand-text-main text-sm mb-1 line-clamp-1" title={session.topic}>{session.topic}</h4>
                                <p className="text-xs text-brand-text-muted font-bold mb-4">{session.displayTime}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {session.videos.length > 0 ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-full"><Video className="w-3 h-3" /> Video</span>
                                ) : null}
                                {session.photos.length > 0 ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-full"><ImageIcon className="w-3 h-3" /> Photo</span>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </section>
        </div>
      </main>
    </div>
  );
}
