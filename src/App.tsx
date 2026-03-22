/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Gift, 
  Cake, 
  Share2, 
  PartyPopper, 
  Music, 
  Music2, 
  Heart, 
  Copy, 
  Check, 
  ArrowLeft,
  Sparkles,
  Star,
  Send
} from 'lucide-react';

// --- Types ---
interface WishData {
  name: string;
  msg: string;
}

// --- Components ---

const TypewriterText = ({ text, delay = 50 }: { text: string; delay?: number }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      setDisplayedText(text.slice(0, index));
      index++;
      if (index > text.length) clearInterval(timer);
    }, delay);
    return () => clearInterval(timer);
  }, [text, delay]);

  return <span>{displayedText}</span>;
};

const ParticleBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ 
          x: Math.random() * 100 + 'vw', 
          y: Math.random() * 100 + 'vh',
          scale: Math.random() * 0.5 + 0.5
        }}
        animate={{ 
          y: [null, Math.random() * 100 + 'vh'],
          x: [null, Math.random() * 100 + 'vw'],
          opacity: [0.2, 0.5, 0.2]
        }}
        transition={{ 
          duration: 15 + Math.random() * 10, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="absolute w-1 h-1 bg-fuchsia-400 rounded-full blur-[1px]"
      />
    ))}
  </div>
);

const FloatingElement = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ y: '110vh', x: Math.random() * 100 + 'vw', opacity: 0, rotate: 0 }}
    animate={{ 
      y: '-10vh', 
      opacity: [0, 1, 1, 0],
      x: (Math.random() * 100 - 50) + 'vw',
      rotate: 360
    }}
    transition={{ 
      duration: 12 + Math.random() * 8, 
      delay, 
      repeat: Infinity,
      ease: "linear"
    }}
    className="fixed bottom-0 pointer-events-none z-0 text-fuchsia-500/20"
  >
    {children}
  </motion.div>
);

const LoadingScreen = () => (
  <motion.div 
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-zinc-950"
  >
    <motion.div
      animate={{ 
        scale: [1, 1.2, 1],
        rotate: [0, 10, -10, 0],
        filter: ["drop-shadow(0 0 0px #d946ef)", "drop-shadow(0 0 20px #d946ef)", "drop-shadow(0 0 0px #d946ef)"]
      }}
      transition={{ repeat: Infinity, duration: 2 }}
      className="text-fuchsia-500"
    >
      <Cake size={80} />
    </motion.div>
    <motion.div 
      initial={{ width: 0 }}
      animate={{ width: 200 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className="mt-8 h-1 bg-fuchsia-500 rounded-full shadow-[0_0_10px_#d946ef]"
    />
    <p className="mt-4 font-mono text-xs tracking-[0.3em] text-fuchsia-400/60 uppercase">
      Loading Magic...
    </p>
  </motion.div>
);

export default function App() {
  const [loading, setLoading] = useState(true);
  const [wish, setWish] = useState<WishData | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Form states
  const [formData, setFormData] = useState({ name: '', msg: '' });
  const [generatedLink, setGeneratedLink] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');
    const msg = params.get('msg');

    if (name && msg) {
      setWish({ name, msg });
    }

    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const triggerConfetti = useCallback((x = 0.5, y = 0.5) => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x, y },
      colors: ['#d946ef', '#8b5cf6', '#ec4899', '#ffffff'],
      disableForReducedMotion: true
    });
  }, []);

  const handleGlobalClick = (e: React.MouseEvent) => {
    if (isRevealed) {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      triggerConfetti(x, y);
    }
  };

  const handleReveal = () => {
    setIsRevealed(true);
    triggerConfetti(0.5, 0.5);
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(() => {
        console.log("Autoplay blocked, waiting for interaction");
      });
      setIsPlaying(true);
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const generateLink = (e: React.FormEvent) => {
    e.preventDefault();
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    params.set('name', formData.name);
    params.set('msg', formData.msg);
    const link = `${baseUrl}?${params.toString()}`;
    setGeneratedLink(link);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    const text = `🎉 Someone sent you a surprise birthday message! Click to open 👉 ${generatedLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div 
      onClick={handleGlobalClick}
      className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-fuchsia-500/30 overflow-x-hidden cursor-default"
    >
      <AnimatePresence>
        {loading && <LoadingScreen />}
      </AnimatePresence>

      {/* Audio Element */}
      <audio 
        ref={audioRef} 
        loop 
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
      />

      {/* Background Elements */}
      <ParticleBackground />
      <div className="fixed inset-0 pointer-events-none z-0">
        <FloatingElement delay={0}><Heart size={24} /></FloatingElement>
        <FloatingElement delay={3}><Star size={20} /></FloatingElement>
        <FloatingElement delay={6}><Sparkles size={28} /></FloatingElement>
        <FloatingElement delay={9}><Heart size={18} /></FloatingElement>
        <FloatingElement delay={12}><Star size={32} /></FloatingElement>
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        
        {!wish ? (
          // --- CREATE WISH PAGE ---
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md p-8 rounded-[2.5rem] bg-zinc-900/40 border border-white/10 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group"
          >
            {/* Decorative Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-fuchsia-500/20 blur-[80px] rounded-full group-hover:bg-fuchsia-500/30 transition-all duration-700" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/20 blur-[80px] rounded-full group-hover:bg-indigo-500/30 transition-all duration-700" />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-indigo-600 text-white shadow-lg shadow-fuchsia-500/20">
                  <PartyPopper size={28} />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Create Magic</h1>
                  <p className="text-xs text-zinc-500 font-mono tracking-widest uppercase">Birthday Link Generator</p>
                </div>
              </div>

              <form onSubmit={generateLink} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Recipient's Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter name..."
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-fuchsia-500/50 focus:ring-4 focus:ring-fuchsia-500/10 outline-none transition-all placeholder:text-zinc-700 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Your Message</label>
                  <textarea 
                    required
                    rows={4}
                    value={formData.msg}
                    onChange={(e) => setFormData({ ...formData, msg: e.target.value })}
                    placeholder="Write a viral message..."
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-fuchsia-500/50 focus:ring-4 focus:ring-fuchsia-500/10 outline-none transition-all resize-none placeholder:text-zinc-700 font-medium"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-5 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold text-lg shadow-xl shadow-fuchsia-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group/btn"
                >
                  <Sparkles size={22} className="group-hover/btn:rotate-12 transition-transform" />
                  Generate Magic Link
                </button>
              </form>

              <AnimatePresence>
                {generatedLink && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 pt-8 border-t border-white/5 space-y-4"
                  >
                    <div className="group/link relative">
                      <div className="p-5 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between gap-4 overflow-hidden">
                        <p className="text-xs text-zinc-500 truncate font-mono select-all">{generatedLink}</p>
                        <button 
                          onClick={copyToClipboard}
                          className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 transition-all shrink-0 active:scale-90"
                        >
                          {copied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
                        </button>
                      </div>
                      {copied && (
                        <motion.span 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest"
                        >
                          Copied to clipboard!
                        </motion.span>
                      )}
                    </div>
                    <button 
                      onClick={shareOnWhatsApp}
                      className="w-full py-5 rounded-2xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/10"
                    >
                      <Send size={22} />
                      Share on WhatsApp
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          // --- WISH DISPLAY PAGE ---
          <div className="w-full max-w-3xl flex flex-col items-center">
            
            {/* Music Toggle */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={toggleMusic}
              className={`fixed top-6 right-6 p-4 rounded-2xl backdrop-blur-2xl border border-white/10 transition-all z-50 group ${isPlaying ? 'bg-fuchsia-500 text-white shadow-[0_0_20px_rgba(217,70,239,0.4)]' : 'bg-zinc-900/50 text-zinc-500'}`}
            >
              {isPlaying ? <Music size={24} className="animate-pulse" /> : <Music2 size={24} />}
              <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-black/50 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {isPlaying ? 'Pause' : 'Play'} Music
              </span>
            </motion.button>

            {/* Back Button */}
            <button
              onClick={() => window.location.href = window.location.origin + window.location.pathname}
              className="fixed top-6 left-6 p-4 rounded-2xl bg-zinc-900/50 text-zinc-500 backdrop-blur-2xl border border-white/10 hover:text-white transition-all z-50 group"
            >
              <ArrowLeft size={24} />
              <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-black/50 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Create New
              </span>
            </button>

            <AnimatePresence mode="wait">
              {!isRevealed ? (
                <motion.div
                  key="surprise"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, rotate: 10, opacity: 0 }}
                  transition={{ type: "spring", damping: 15 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="relative mb-12">
                    <motion.div
                      animate={{ 
                        y: [0, -20, 0],
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                      className="text-fuchsia-500 drop-shadow-[0_0_30px_rgba(217,70,239,0.6)] relative z-10"
                    >
                      <Gift size={160} strokeWidth={1} />
                    </motion.div>
                    <div className="absolute inset-0 bg-fuchsia-500/20 blur-[60px] rounded-full animate-pulse" />
                  </div>
                  
                  <motion.h2 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl font-black mb-4 tracking-tight"
                  >
                    You have a surprise! 🎁
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-zinc-500 mb-10 max-w-xs font-medium"
                  >
                    Someone special sent you a magical birthday message.
                  </motion.p>
                  
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    onClick={handleReveal}
                    className="group relative px-14 py-6 rounded-full bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white font-black text-xl shadow-[0_0_40px_rgba(217,70,239,0.3)] transition-all active:scale-95 hover:scale-105 hover:shadow-[0_0_60px_rgba(217,70,239,0.5)] overflow-hidden"
                  >
                    <span className="relative z-10">Open Surprise</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="message"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full flex flex-col items-center text-center"
                >
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="mb-8 px-8 py-3 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 font-black text-sm tracking-[0.4em] uppercase shadow-[0_0_20px_rgba(217,70,239,0.1)]"
                  >
                    Happy Birthday!
                  </motion.div>

                  <motion.h1 
                    initial={{ opacity: 0, filter: "blur(10px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="text-7xl md:text-9xl font-black mb-12 tracking-tighter bg-gradient-to-b from-white via-white to-zinc-600 bg-clip-text text-transparent drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-glow"
                  >
                    {wish.name}
                  </motion.h1>

                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="relative p-10 md:p-16 rounded-[3rem] bg-zinc-900/30 border border-white/10 backdrop-blur-3xl shadow-[0_20px_80px_rgba(0,0,0,0.4)] w-full group"
                  >
                    {/* Decorative Icons */}
                    <div className="absolute -top-10 -left-10 text-fuchsia-500/30 animate-bounce">
                      <Sparkles size={80} />
                    </div>
                    <div className="absolute -bottom-10 -right-10 text-indigo-500/30 animate-pulse">
                      <Heart size={80} />
                    </div>
                    
                    <div className="text-2xl md:text-4xl leading-tight text-zinc-200 font-serif italic min-h-[4em] flex items-center justify-center">
                      <TypewriterText text={wish.msg} delay={40} />
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2 }}
                    className="mt-16 flex flex-wrap justify-center gap-6"
                  >
                    <button 
                      onClick={() => triggerConfetti()}
                      className="p-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-90 text-fuchsia-400 shadow-lg"
                    >
                      <PartyPopper size={32} />
                    </button>
                    <button 
                      onClick={() => {
                        const baseUrl = window.location.origin + window.location.pathname;
                        const params = new URLSearchParams();
                        params.set('name', wish.name);
                        params.set('msg', wish.msg);
                        const link = `${baseUrl}?${params.toString()}`;
                        navigator.clipboard.writeText(link);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="px-10 py-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-95 flex items-center gap-3 font-bold text-lg shadow-lg"
                    >
                      {copied ? <Check size={24} className="text-emerald-500" /> : <Share2 size={24} />}
                      <span>{copied ? 'Link Copied!' : 'Share this Wish'}</span>
                    </button>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3 }}
                    className="mt-12 text-zinc-600 font-medium text-sm animate-pulse"
                  >
                    Tap anywhere for magic! ✨
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-[10px] font-black text-zinc-700 tracking-[0.5em] uppercase flex items-center gap-3"
        >
          Made with <Heart size={14} className="text-fuchsia-500 fill-fuchsia-500 animate-pulse" /> for you
        </motion.p>
      </footer>

      <style>{`
        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(217,70,239,0.2)); }
          50% { filter: drop-shadow(0 0 40px rgba(217,70,239,0.5)); }
        }
        .animate-glow {
          animation: glow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
