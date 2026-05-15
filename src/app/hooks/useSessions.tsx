import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

export interface SessionMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
}

export interface PastSession {
  date: string; 
  displayDate: string; 
  photos: SessionMedia[];
  videos: SessionMedia[];
}

export interface UpcomingSession {
  id: string;
  topic: string;
  date: string;
  displayDate: string;
  time: string;
  displayTime: string;
  meetingLink: string;
  description?: string;
  photos: SessionMedia[];
  videos: SessionMedia[];
}

export interface SessionData {
  pastSessions: Record<string, PastSession>;
  upcomingSessions: UpcomingSession[];
  upcoming?: UpcomingSession; // legacy fallback
}

const DEFAULT_SESSION_DATA: SessionData = {
  pastSessions: {
    "2026-05-11": {
      date: "2026-05-11",
      displayDate: "Monday, May 11, 2026",
      photos: [
        { id: 'p1', type: 'image', url: '/jeya1.jpeg', title: 'Energy Activation' },
        { id: 'p2', type: 'image', url: '/jeya.jpeg', title: 'Deep Meditation' },
      ],
      videos: [
        { id: 'v1', type: 'video', url: '#', title: 'Highlights Part 1' },
      ]
    }
  },
  upcomingSessions: [
    {
      id: "up-default-1",
      topic: "Energy Flow & Rhythm",
      date: "2026-05-15",
      displayDate: "Wednesday, May 15, 2026",
      time: "07:00",
      displayTime: "7:00 AM - 8:30 AM",
      meetingLink: "https://zoom.us",
      photos: [],
      videos: []
    }
  ]
};

export interface SessionContextType {
  sessionData: SessionData;
  addUpcomingSession: (session: Omit<UpcomingSession, 'id'>) => void;
  updateUpcomingSession: (id: string, data: Partial<UpcomingSession>) => void;
  deleteUpcomingSession: (id: string) => void;
  markSessionCompleted: (id: string) => void;
  // legacy update
  updateUpcomingInfo: (data: Partial<Omit<UpcomingSession, 'photos' | 'videos' | 'id'>>) => void;
  addMediaToUpcoming: (type: 'photo' | 'video', media: Omit<SessionMedia, 'id'>) => void;
  removeMediaFromUpcoming: (type: 'photo' | 'video', mediaId: string) => void;
  addPastSession: (date: string, displayDate: string) => void;
  addMediaToPastSession: (date: string, type: 'photo' | 'video', media: Omit<SessionMedia, 'id'>) => void;
  removeMediaFromPastSession: (date: string, type: 'photo' | 'video', id: string) => void;
  setSessionData: (data: SessionData) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionData, setSessionData] = useState<SessionData>(() => {
    try {
      const saved = localStorage.getItem('rhythm_rise_sessions_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.upcoming && !parsed.upcomingSessions) {
          parsed.upcomingSessions = [{ ...parsed.upcoming, id: 'up-legacy-1' }];
          delete parsed.upcoming;
        }
        return parsed;
      }
    } catch (error) {
      console.error("Error loading session data from localStorage:", error);
    }
    return DEFAULT_SESSION_DATA;
  });

  useEffect(() => {
    localStorage.setItem('rhythm_rise_sessions_v4', JSON.stringify(sessionData));
  }, [sessionData]);

  // Sync between tabs/windows
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'rhythm_rise_sessions_v4' && e.newValue) {
        try {
          setSessionData(JSON.parse(e.newValue));
        } catch (error) {
          console.error("Error parsing synced session data:", error);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const addUpcomingSession = (session: Omit<UpcomingSession, 'id'>) => {
    setSessionData(prev => ({
      ...prev,
      upcomingSessions: [...prev.upcomingSessions, { ...session, id: `up-${Date.now()}` }].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }));
  };

  const updateUpcomingSession = (id: string, data: Partial<UpcomingSession>) => {
    setSessionData(prev => ({
      ...prev,
      upcomingSessions: prev.upcomingSessions.map(s => s.id === id ? { ...s, ...data } : s).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }));
  };

  const deleteUpcomingSession = (id: string) => {
    setSessionData(prev => ({
      ...prev,
      upcomingSessions: prev.upcomingSessions.filter(s => s.id !== id)
    }));
  };

  const markSessionCompleted = (id: string) => {
    setSessionData(prev => {
      const session = prev.upcomingSessions.find(s => s.id === id);
      if (!session) return prev;
      
      const newPastSessions = { ...prev.pastSessions };
      if (newPastSessions[session.date]) {
        newPastSessions[session.date].photos = [...newPastSessions[session.date].photos, ...session.photos];
        newPastSessions[session.date].videos = [...newPastSessions[session.date].videos, ...session.videos];
      } else {
        newPastSessions[session.date] = {
          date: session.date,
          displayDate: session.displayDate,
          photos: session.photos,
          videos: session.videos
        };
      }

      return {
        ...prev,
        upcomingSessions: prev.upcomingSessions.filter(s => s.id !== id),
        pastSessions: newPastSessions
      };
    });
  };

  // Legacy updates for the nearest session (AdminDashboard inline form)
  const updateUpcomingInfo = (data: Partial<Omit<UpcomingSession, 'photos' | 'videos' | 'id'>>) => {
    setSessionData(prev => {
      if (prev.upcomingSessions.length === 0) return prev;
      const nearestId = prev.upcomingSessions[0].id;
      return { 
        ...prev, 
        upcomingSessions: prev.upcomingSessions.map(s => s.id === nearestId ? { ...s, ...data } : s)
      };
    });
  };

  const addMediaToUpcoming = (type: 'photo' | 'video', media: Omit<SessionMedia, 'id'>) => {
    const newMedia: SessionMedia = { ...media, id: `upm-${Date.now()}` };
    setSessionData(prev => {
      if (prev.upcomingSessions.length === 0) return prev;
      const nearestId = prev.upcomingSessions[0].id;
      return {
        ...prev,
        upcomingSessions: prev.upcomingSessions.map(s => {
          if (s.id !== nearestId) return s;
          return {
            ...s,
            photos: type === 'photo' ? [...s.photos, newMedia] : s.photos,
            videos: type === 'video' ? [...s.videos, newMedia] : s.videos,
          };
        })
      };
    });
  };

  const removeMediaFromUpcoming = (type: 'photo' | 'video', mediaId: string) => {
    setSessionData(prev => {
      if (prev.upcomingSessions.length === 0) return prev;
      const nearestId = prev.upcomingSessions[0].id;
      return {
        ...prev,
        upcomingSessions: prev.upcomingSessions.map(s => {
          if (s.id !== nearestId) return s;
          return {
            ...s,
            photos: type === 'photo' ? s.photos.filter(m => m.id !== mediaId) : s.photos,
            videos: type === 'video' ? s.videos.filter(m => m.id !== mediaId) : s.videos,
          };
        })
      };
    });
  };

  const addPastSession = (date: string, displayDate: string) => {
    setSessionData(prev => ({
      ...prev,
      pastSessions: { ...prev.pastSessions, [date]: { date, displayDate, photos: [], videos: [] } }
    }));
  };

  const addMediaToPastSession = (date: string, type: 'photo' | 'video', media: Omit<SessionMedia, 'id'>) => {
    const newMedia: SessionMedia = { ...media, id: `past-${Date.now()}` };
    setSessionData(prev => {
      const s = prev.pastSessions[date];
      if (!s) return prev;
      return {
        ...prev,
        pastSessions: {
          ...prev.pastSessions,
          [date]: {
            ...s,
            photos: type === 'photo' ? [...s.photos, newMedia] : s.photos,
            videos: type === 'video' ? [...s.videos, newMedia] : s.videos,
          }
        }
      };
    });
  };

  const removeMediaFromPastSession = (date: string, type: 'photo' | 'video', id: string) => {
    setSessionData(prev => {
      const s = prev.pastSessions[date];
      if (!s) return prev;
      return {
        ...prev,
        pastSessions: {
          ...prev.pastSessions,
          [date]: {
            ...s,
            photos: type === 'photo' ? s.photos.filter(m => m.id !== id) : s.photos,
            videos: type === 'video' ? s.videos.filter(m => m.id !== id) : s.videos,
          }
        }
      };
    });
  };

  return (
    <SessionContext.Provider value={{ 
      sessionData, 
      addUpcomingSession, updateUpcomingSession, deleteUpcomingSession, markSessionCompleted,
      updateUpcomingInfo, addMediaToUpcoming, removeMediaFromUpcoming, 
      addPastSession, addMediaToPastSession, removeMediaFromPastSession,
      setSessionData
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessions() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSessions must be used within a SessionProvider');
  }
  return context;
}
