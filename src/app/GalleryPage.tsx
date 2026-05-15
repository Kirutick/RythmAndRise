import { useState } from 'react';
import { Menu, X, Phone, MessageCircle, Heart, Sparkles, Users, Brain, Play, ArrowLeft } from 'lucide-react';
import { useMedia } from './hooks/useMedia';
import { useNavigate } from 'react-router-dom';

export default function GalleryPage() {
  const { media } = useMedia();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-surface" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-brand-surface-hover sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-brand-text-main hover:text-brand-primary transition-all font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <div className="flex items-center gap-3">
            <img src="/logo.jpeg" alt="Logo" className="w-10 h-10 rounded-full" />
            <h1 className="text-xl font-bold text-brand-text-main" style={{ fontFamily: 'Playfair Display, serif' }}>
              Media Gallery
            </h1>
          </div>
          <div className="w-24"></div> {/* Spacer */}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '600', color: 'black', marginBottom: '1rem' }}>
            Moments of Transformation
          </h2>
          <p className="text-lg text-brand-text-muted max-w-2xl mx-auto">
            Explore our collection of yoga sessions, wellness workshops, and life coaching moments.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {media.map((item) => (
            <div key={item.id} className="group relative aspect-video rounded-3xl overflow-hidden shadow-xl bg-white border border-brand-surface-hover">
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-brand-text-main flex items-center justify-center text-white">
                  <Play className="w-12 h-12 fill-white" />
                  <p className="absolute bottom-4 left-4 text-xs opacity-60">Video Content</p>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <p className="text-white font-medium text-lg">{item.title}</p>
              </div>
            </div>
          ))}

          {media.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-brand-surface-hover">
              <p className="text-brand-text-muted">No media items added yet.</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-brand-surface-hover text-center">
        <p className="text-brand-text-muted text-sm">© 2026 Rhythm & Rise with Jeya. All rights reserved.</p>
      </footer>
    </div>
  );
}
