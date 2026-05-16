import { useState } from 'react';
import { Menu, X, Phone, MessageCircle, Heart, Sparkles, Users, Brain, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Analytics } from "@vercel/analytics/react"
import { useLandingPage } from './hooks/useLandingPage';

export default function LandingPage() {
  const { images } = useLandingPage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    goal: '',
    contactMethod: 'whatsapp'
  });

  // Custom Dropdown State for Goal Selection (FIXED FONT)
  const [isGoalDropdownOpen, setIsGoalDropdownOpen] = useState(false);
  const goals = [
    "Weight Loss & Toning",
    "Yoga & Stretching",
    "Postnatal Recovery",
    "Stress Relief & Meditation",
    "Manifestation & Mindset",
    "Corporate Training",
    "Other"
  ];

  const phoneNumber = "+91 7695997100"; // Replace with actual number
  const whatsappLink = `https://wa.me/${phoneNumber}?text=Hi! I'd like to know more about your wellness programs.`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.goal) {
      alert("Please select a primary goal.");
      return;
    }
    const message = `Hi! I'm ${formData.name}. My primary goal is ${formData.goal}. Please contact me at ${formData.phone} via ${formData.contactMethod}.`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-brand-surface page-container" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-brand-surface-hover">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-black" style={{ color: 'black' }}>
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <img src="/logo.jpeg" alt="Rhythm & Rise Logo" className="w-12 h-12 rounded-full object-cover shadow-sm" />
              <div>
                <h1 className="text-brand-text-main" style={{ fontFamily: '"Abril Fatface", serif', fontSize: '1.5rem', fontWeight: '400', lineHeight: '1.2' }}>
                  Rhythm & Rise
                </h1>
                <p className="text-xs text-brand-text-muted"><b>with Jeya</b></p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8" >
              <button onClick={() => scrollToSection('home')} className="text-brand-text-main/80 hover:text-brand-primary transition-colors">Home</button>
              <button onClick={() => scrollToSection('about')} className="text-brand-text-main/80 hover:text-brand-primary transition-colors">About</button>
              <button onClick={() => scrollToSection('services')} className="text-brand-text-main/80 hover:text-brand-primary transition-colors">Services</button>
              <button onClick={() => scrollToSection('testimonials')} className="text-brand-text-main/80 hover:text-brand-primary transition-colors">Testimonials</button>
              <button onClick={() => scrollToSection('contact')} className="text-brand-text-main/80 hover:text-brand-primary transition-colors">Contact</button>
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <a href="/login" className="px-6 py-2.5 bg-white border border-brand-surface-hover rounded-full font-bold text-brand-text-main hover:bg-brand-surface transition-all">Login</a>
              <button
                onClick={() => scrollToSection('contact')}
                className="hidden md:block px-6 py-2.5 bg-brand-primary text-white rounded-full hover:bg-brand-primary-hover focus:outline-none focus:ring-4 focus:ring-brand-primary/20 transition-all shadow-sm"
              >
                Book Free Call
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-brand-text-main/80"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-brand-surface-hover" style={{ color: 'black' }}>
              <nav className="flex flex-col gap-4">
                <button onClick={() => scrollToSection('home')} className="text-left force-black hover:text-brand-primary">Home</button>
                <button onClick={() => scrollToSection('about')} className="text-left force-black hover:text-brand-primary">About</button>
                <button onClick={() => scrollToSection('services')} className="text-left force-black hover:text-brand-primary">Services</button>
                <button onClick={() => scrollToSection('testimonials')} className="text-left force-black hover:text-brand-primary">Testimonials</button>
                <button onClick={() => scrollToSection('contact')} className="text-left force-black hover:text-brand-primary">Contact</button>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="px-6 py-2.5 bg-brand-primary text-white rounded-full text-center"
                >
                  Book Free Call
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-black" style={{ color: 'black' }}>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 md:space-y-8">
              <div className="inline-block px-4 py-1.5 bg-white/100 backdrop-blur-sm rounded-full">
                <p className="text-sm text-black font-extrabold">Life Transformation • Corporate Trainer • Manifestation Coach</p>
              </div>

              <h2 style={{ fontFamily: 'Salsa', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '600', lineHeight: '1.15', color: 'black' }}>
                Move Your Energy.<br />
                Rise Into Your Best Life.
              </h2>

              <p className="text-lg text-black leading-relaxed max-w-xl" style={{ fontFamily: '"Cause", sans-serif' }}>
                Tired of feeling disconnected from your body and dreams? I guide women like you with rhythm, movement, meditation, and manifestation techniques that actually transform your life.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => scrollToSection('contact')}
                  className="px-8 py-4 bg-brand-primary text-white rounded-full hover:bg-brand-primary-hover focus:outline-none focus:ring-4 focus:ring-brand-primary/20 transition-all shadow-lg hover:shadow-xl"
                >
                  Book Your Free Consultation
                </button>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-white border-2 border-brand-primary text-brand-primary rounded-full hover:bg-brand-primary hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat on WhatsApp
                </a>
              </div>
            </div>

            <div className="relative">
              {/* Background Glow Layer */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-brand-primary-hover/20 rounded-3xl transform rotate-3 -z-10"></div>
              
              {/* Stable Image Container */}
              <div className="relative w-full aspect-[4/5] md:aspect-auto md:h-[600px] min-h-[500px] rounded-3xl overflow-hidden shadow-2xl bg-brand-surface border border-brand-surface-hover">
                <img
                  src={images.hero || '/jeya1.jpeg'}
                  alt="Woman practicing yoga in peaceful home setting"
                  className="w-full h-full object-cover object-center block transition-opacity duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 md:py-24 bg-white text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-black" style={{ color: 'black' }}>
          <div className="text-center mb-16">
            <h3 style={{ fontFamily: 'Ubuntu', fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: '600', color: 'var(--color-brand-text-main)', marginBottom: '1rem' }}>
              What I Offer
            </h3>
            <p className="text-lg text-black max-w-2xl mx-auto" style={{ fontFamily: '"Rubik", sans-serif' }}>
              Holistic transformation programs designed for your unique journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8" style={{ fontFamily: '"Rubik", sans-serif' }}>
            {[
              {
                icon: <Users className="w-8 h-8" style={{ fontFamily: '"Rubik", sans-serif' }} />,
                title: "Corporate Training",
                desc: "Stress management, team motivation, leadership development, and workplace positivity for thriving organizations.",
                bgClass: "bg-brand-primary-active"
              },
              {
                icon: <Sparkles className="w-8 h-8" style={{ fontFamily: '"Rubik", sans-serif' }} />,
                title: "Manifestation & Law of Attraction",
                desc: "Goal setting, affirmations, and visualization techniques to align your energy with your dreams.",
                bgClass: "bg-brand-primary-active"
              },
              {
                icon: <Heart className="w-8 h-8" style={{ fontFamily: '"Rubik", sans-serif' }} />,
                title: "Rhythm & Movement",
                desc: "Dance-based energy activation, music therapy, and fun fitness that celebrates your body.",
                bgClass: "bg-brand-primary-active"
              },
              {
                icon: <Brain className="w-8 h-8" style={{ fontFamily: '"Rubik", sans-serif' }} />,
                title: "Meditation & Healing",
                desc: "Guided meditation for emotional balance, mental clarity, and deep inner peace.",
                bgClass: "bg-brand-primary-active"
              }
            ].map((service, i) => (
              <div
                key={i}
                className="group p-8 bg-gradient-to-br from-brand-background to-white rounded-2xl border border-brand-surface-hover hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-black"
              >
                <div className={`w-16 h-16 rounded-full ${service.bgClass} flex items-center justify-center text-white mb-6 shadow-md`}>
                  {service.icon}
                </div>
                <h4 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', fontWeight: '600', color: 'black', marginBottom: '0.75rem' }}>
                  {service.title}
                </h4>
                <p className="text-black leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>

          {/* Programs */}
          <div className="mt-20 text-black">
            <h4 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: '600', color: 'black', marginBottom: '2rem', textAlign: 'center' }}>
              Choose Your Journey
            </h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-black">
              {[
                { name: "2-Hours Power Session", desc: "Quick, impactful transformation session" },
                { name: "Weekly Workshops", desc: "Interactive group sessions" },
                { name: "21-Day / 30-Day Life Shift", desc: "Step-by-step guided transformation" },
                { name: "Personal Coaching", desc: "One-to-one deep dive sessions" }
              ].map((program, i) => (
                <div
                  key={i}
                  className="p-6 bg-white border-2 border-brand-surface-hover rounded-xl hover:border-brand-primary transition-all"
                >
                  <h5 className="mb-2" style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.125rem', fontWeight: '600', color: 'var(--color-brand-text-main)' }}>
                    {program.name}
                  </h5>
                  <p className="text-sm text-brand-text-muted">{program.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Different */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-brand-primary/10 to-brand-surface-hover/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-black" style={{ color: 'black' }}>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: '600', color: 'black', marginBottom: '3rem', textAlign: 'center' }}>
            Why This is Different
          </h3>

          <div className="grid md:grid-cols-3 gap-12 text-black" style={{ color: 'black' }}>
            {[
              {
                title: "No Gym Needed",
                desc: "Everything happens in the comfort of your home or online — at your pace, in your space.",
                imgSrc: "/no gym.jpg"
              },
              {
                title: "Holistic Approach",
                desc: "Body, mind, and energy in one program. Not just physical fitness, but complete life transformation.",
                imgSrc: "/yoga.png"
              },
              {
                title: "Personalized for Women",
                desc: "Not one-size-fits-all. Designed specifically for women's bodies, cycles, and life stages.",
                imgSrc: "/gender (1).png"
              }
            ].map((item, i) => (
              <div key={i} className="text-center">
                {item.imgSrc ? (
                  <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full overflow-hidden flex items-center justify-center shadow-md">
                    <img src={item.imgSrc} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-brand-primary to-brand-primary-hover flex items-center justify-center shadow-md">
                    <div className="w-8 h-8 border-2 border-white rounded-full"></div>
                  </div>
                )}
                <h4 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', fontWeight: '600', color: 'black', marginBottom: '0.75rem' }}>
                  {item.title}
                </h4>
                <p className="text-brand-text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-24 bg-white text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-black" style={{ color: 'black' }}>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              {/* Background Glow Layer */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/30 to-brand-primary-hover/30 rounded-3xl transform -rotate-3 -z-10"></div>
              
              {/* Stable Image Container */}
              <div className="relative w-full aspect-[3/4] md:aspect-auto md:h-[650px] min-h-[550px] rounded-3xl overflow-hidden shadow-2xl bg-brand-surface border border-brand-surface-hover">
                <img
                  src={images.about || '/jeya.jpeg'}
                  alt="Jeya - Life Transformation Coach"
                  className="w-full h-full object-cover object-center block transition-opacity duration-700"
                />
              </div>
            </div>

            <div className="space-y-6 text-black" style={{ fontFamily: '"Ubuntu", sans-serif', color: 'black' }}>
              <h3 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: '600', color: 'black' }}>
                Meet Jeya
              </h3>

              <p className="text-lg text-brand-text-muted leading-relaxed" style={{ color: 'black' }}>
                I'm Jeya, a passionate Life Transformation Coach and Corporate Trainer who believes that true wellness comes from harmony between body, mind, and spirit.
              </p>

              <p className="text-lg text-brand-text-muted leading-relaxed" style={{ color: 'black' }}>
                With expertise in energy-based healing, manifestation techniques, and motivational training, I've helped hundreds of women across India overcome stress, gain clarity, and build confident life paths.
              </p>

              <p className="text-lg text-brand-text-muted leading-relaxed" style={{ color: 'black' }}>
                My approach combines movement, meditation, music, and mindset work — because I've seen firsthand that when you align your energy, everything else falls into place.
              </p>

              <div className="pt-4 space-y-3" style={{ color: 'black' }}>
                <div className="flex items-center gap-3 text-brand-text-muted">
                  <div className="w-2 h-2 rounded-full bg-brand-primary"></div>
                  <span style={{ color: 'black' }}>Certified in yoga, fitness & wellness coaching</span>
                </div>
                <div className="flex items-center gap-3 text-brand-text-muted">
                  <div className="w-2 h-2 rounded-full bg-brand-primary"></div>
                  <span style={{ color: 'black' }}>Manifestation & Law of Attraction specialist</span>
                </div>
                <div className="flex items-center gap-3 text-brand-text-muted">
                  <div className="w-2 h-2 rounded-full bg-brand-primary"></div>
                  <span style={{ color: 'black' }}>Coached 200+ women to transform their lives</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 md:py-24 bg-gradient-to-br from-brand-surface-hover/30 to-[#FBF9F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-black" style={{ color: 'black' }}>
          <div className="text-center mb-16">
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: '600', color: 'black', marginBottom: '1rem' }}>
              Voices of Transformation
            </h3>
            <p className="text-lg text-brand-text-muted" style={{ color: 'black' }}>Real stories from real women</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8" style={{ color: 'black' }}>
            {[
              {
                quote: "Jeya's sessions are full of energy and positivity—truly life-changing. I feel more aligned with my goals than ever.",
                name: "Priya S",
                location: "Chennai",
                result: "Lost 8kg and found inner peace"
              },
              {
                quote: "I feel more confident, calm, and focused after joining Rhythm & Rise. The manifestation techniques actually work!",
                name: "Ananya M",
                location: "Chennai",
                result: "Overcame burnout & stress"
              },
              {
                quote: "As a new mom, I struggled to find time for myself. Jeya's at-home sessions changed everything for me.",
                name: "Kavya R",
                location: "Chennai",
                result: "Postnatal recovery & confidence"
              }
            ].map((testimonial, i) => (
              <div
                key={i}
                className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                <div className="mb-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Heart key={i} className="w-5 h-5 fill-brand-primary text-brand-primary" />
                    ))}
                  </div>
                  <p style={{ fontFamily: '"Roboto Condensed", sans-serif' }} className="text-brand-text-main/80 italic leading-relaxed">"{testimonial.quote}"</p>
                </div>
                <div className="pt-6 border-t border-brand-surface-hover">
                  <p style={{ fontFamily: 'Playfair Display, serif', fontWeight: '600', color: 'var(--color-brand-text-main)' }}>
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-brand-text-muted mt-1">{testimonial.location}</p>
                  <p className="text-sm text-brand-primary mt-2">{testimonial.result}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-brand-primary to-brand-primary-hover">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '600', color: 'white', marginBottom: '1rem' }}>
            Your journey starts with one conversation.
          </h3>
          <p className="text-white/90 text-lg mb-8">Let's talk about your transformation.</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`tel:${phoneNumber}`}
              className="px-8 py-4 bg-white text-brand-primary rounded-full hover:bg-background transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" />
              Call Now
            </a>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white rounded-full hover:bg-white hover:text-brand-primary transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp Me
            </a>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="py-16 md:py-24 bg-white text-black">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 style={{ fontFamily: 'Oswald', fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: '750', color: 'black', marginBottom: '1rem' }}>
              Let's Connect
            </h3>
            <p className="text-lg text-black">Share your goals and I'll reach out to you</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-black bg-brand-background p-8 md:p-10 rounded-2xl shadow-lg">
            <div>
              <label className="block text-black mb-2">Your Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-brand-surface-hover rounded-xl focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-black mb-2">Phone Number</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-brand-surface-hover rounded-xl focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all"
                placeholder="+91 xxxxx xxxxx"
              />
            </div>

            {/* Custom Dropdown for Primary Goal (FIXED FONT) */}
            <div className="relative">
              <label className="block text-black mb-2">Primary Goal</label>
              <button 
                type="button"
                onClick={() => setIsGoalDropdownOpen(!isGoalDropdownOpen)}
                className="w-full px-4 py-3 bg-white text-brand-text-main font-bold flex items-center justify-between border border-brand-surface-hover rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all text-left"
              >
                <span className={formData.goal ? "opacity-100" : "opacity-40"}>
                  {formData.goal || "Select your goal"}
                </span>
                <ChevronDown className={`w-5 h-5 text-brand-primary transition-transform duration-300 ${isGoalDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isGoalDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-2xl border border-brand-surface-hover z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="py-2">
                    {goals.map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => { setFormData({ ...formData, goal }); setIsGoalDropdownOpen(false); }}
                        className="w-full px-5 py-3 text-left text-brand-text-main font-bold hover:bg-brand-surface hover:text-brand-primary transition-all flex items-center justify-between group"
                      >
                        {goal}
                        {formData.goal === goal && <CheckCircle2 className="w-4 h-4 text-brand-primary group-hover:text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-black mb-2">Preferred Contact Method</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="whatsapp"
                    checked={formData.contactMethod === 'whatsapp'}
                    onChange={(e) => setFormData({ ...formData, contactMethod: e.target.value })}
                    className="w-4 h-4 text-brand-primary"
                  />
                  <span className="text-black">WhatsApp</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="call"
                    checked={formData.contactMethod === 'call'}
                    onChange={(e) => setFormData({ ...formData, contactMethod: e.target.value })}
                    className="w-4 h-4 text-brand-primary"
                  />
                  <span className="text-black">Call</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-8 py-4 bg-brand-primary text-white rounded-xl hover:bg-brand-primary-hover focus:outline-none focus:ring-4 focus:ring-brand-primary/20 transition-all shadow-lg hover:shadow-xl"
            >
              Send Message via WhatsApp
            </button>
          </form>

          <div className="mt-12 text-center space-y-4">
            <p className="text-black">Or reach out directly:</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`tel:${phoneNumber}`}
                className="inline-flex items-center gap-2 text-black hover:text-gray-700"
              >
                <Phone className="w-5 h-5" />
                {phoneNumber}
              </a>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-black hover:text-gray-700"
              >
                <MessageCircle className="w-5 h-5" />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-brand-text-main text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-black" style={{ color: 'black' }}>
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.jpeg" alt="Rhythm & Rise Logo" className="w-10 h-10 rounded-full object-cover shadow-sm" />
                <div>
                  <h4 style={{ fontFamily: '"Abril Fatface", serif', fontSize: '1.25rem', fontWeight: '400', color: 'black' }}>
                    Rhythm & Rise
                  </h4>
                  <p className="text-sm text-white/70">with Jeya</p>
                </div>
              </div>
              <p className="text-white/70 text-sm">
                Life Transformation • Corporate Training • Manifestation Coaching
              </p>
            </div>

            <div>
              <h5 className="mb-4" style={{ fontFamily: 'Playfair Display, serif', fontWeight: '600' }}>Quick Links</h5>
              <div className="space-y-2 text-sm">
                <button onClick={() => scrollToSection('home')} className="block text-white/70 hover:text-white transition-colors">Home</button>
                <button onClick={() => scrollToSection('about')} className="block text-white/70 hover:text-white transition-colors">About</button>
                <button onClick={() => scrollToSection('services')} className="block text-white/70 hover:text-white transition-colors">Services</button>
                <button onClick={() => scrollToSection('testimonials')} className="block text-white/70 hover:text-white transition-colors">Testimonials</button>
              </div>
            </div>

            <div>
              <h5 className="mb-4" style={{ fontFamily: 'Playfair Display, serif', fontWeight: '600' }}>Location</h5>
              <p className="text-white/70 text-sm mb-2">Based in India</p>
              <p className="text-white/70 text-sm">Online sessions available worldwide</p>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 text-center text-sm text-white/60">
            <p>© 2026 Rhythm & Rise with Jeya. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50 group"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-7 h-7 text-white" />
        <span className="absolute right-full mr-3 px-3 py-1.5 bg-brand-text-main text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Chat with us
        </span>
      </a>
      <Analytics />
    </div>
  );
}
