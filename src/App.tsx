/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import Premium3DBackground from './components/Premium3DBackground';
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
  Send,
  ImagePlus,
  X,
  Camera
} from 'lucide-react';

// --- Types ---
interface WishData {
  name: string;
  msg: string;
  occasion: string;
}

const OCCASIONS = [
  { id: 'birthday', label: 'Birthday', icon: Cake, color: 'fuchsia', emoji: '🎂', title: 'Happy Birthday' },
  { id: 'anniversary', label: 'Anniversary', icon: Heart, color: 'rose', emoji: '💍', title: 'Happy Anniversary' },
  { id: 'newyear', label: 'New Year', icon: PartyPopper, color: 'amber', emoji: '🎆', title: 'Happy New Year' },
  { id: 'graduation', label: 'Graduation', icon: Star, color: 'indigo', emoji: '🎓', title: 'Congratulations' },
  { id: 'valentine', label: 'Valentine', icon: Heart, color: 'red', emoji: '❤️', title: 'Happy Valentine' },
  { id: 'congrats', label: 'Congrats', icon: Sparkles, color: 'emerald', emoji: '🎊', title: 'Congratulations' },
];

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
  const [formData, setFormData] = useState({ name: '', msg: '', occasion: 'birthday' });
  const [photo, setPhoto] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  
  // 3D Tilt State
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateXValue = ((y - centerY) / centerY) * -10; // Max 10 deg
    const rotateYValue = ((x - centerX) / centerX) * 10;
    
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('n') || params.get('name');
    const msg = params.get('m') || params.get('msg');
    const occasionParam = params.get('o') || 'birthday';

    if (name && msg) {
      const occasionData = OCCASIONS.find(o => o.id === occasionParam) || OCCASIONS[0];
      setWish({ 
        name, 
        msg, 
        occasion: occasionParam
      });
    }

    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Use low quality to keep URL short
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          resolve(dataUrl);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsCompressing(true);
        const compressed = await compressImage(file);
        setPhoto(compressed);
      } catch (err) {
        console.error("Error uploading photo:", err);
      } finally {
        setIsCompressing(false);
      }
    }
  };

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
    params.set('n', formData.name);
    params.set('m', formData.msg);
    params.set('o', formData.occasion);
    
    const link = `${baseUrl}?${params.toString()}`;
    setGeneratedLink(link);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    const text = `🎁 Tumhare liye ek surprise hai 😍\n👉 ${generatedLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div 
      onClick={handleGlobalClick}
      className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-fuchsia-500/30 overflow-x-hidden cursor-default relative"
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

      {/* Premium 3D Background */}
      <Premium3DBackground occasion={wish?.occasion || formData.occasion} />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        
        {!wish ? (
          // --- CREATE WISH PAGE ---
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              rotateX,
              rotateY
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.5 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ transformPerspective: 1000 }}
            className="w-full max-w-md p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] relative overflow-hidden group"
          >
            {/* Decorative Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-fuchsia-500/10 blur-[100px] rounded-full group-hover:bg-fuchsia-500/20 transition-all duration-700" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-700" />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 text-white shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]">
                  <PartyPopper size={28} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-md">Create Magic</h1>
                  <p className="text-xs text-zinc-300 font-mono tracking-widest uppercase mt-1">Premium Wish Generator</p>
                </div>
              </div>

              <form onSubmit={generateLink} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-widest ml-1 drop-shadow-sm">Select Occasion</label>
                  <div className="grid grid-cols-3 gap-2">
                    {OCCASIONS.map((occ) => (
                      <button
                        key={occ.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, occasion: occ.id })}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                          formData.occasion === occ.id 
                            ? 'bg-white/20 backdrop-blur-lg border-white/40 text-white shadow-[0_4px_15px_rgba(0,0,0,0.2)] shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]' 
                            : 'bg-white/5 backdrop-blur-md border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <occ.icon size={20} />
                        <span className="text-[10px] font-bold mt-1">{occ.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-widest ml-1 drop-shadow-sm">Recipient's Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter name..."
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 focus:border-white/30 focus:bg-white/10 focus:ring-4 focus:ring-white/10 outline-none transition-all placeholder:text-zinc-400 font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-widest ml-1 drop-shadow-sm">Add a Photo (Optional)</label>
                  <div className="relative">
                    {!photo ? (
                      <label className="flex flex-col items-center justify-center w-full h-32 rounded-2xl bg-white/5 backdrop-blur-md border border-dashed border-white/20 hover:border-white/40 hover:bg-white/10 transition-all cursor-pointer group/upload shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                        {isCompressing ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-6 h-6 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
                            <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Processing...</span>
                          </div>
                        ) : (
                          <>
                            <Camera size={24} className="text-zinc-400 group-hover/upload:text-white transition-colors mb-2 drop-shadow-sm" />
                            <span className="text-[10px] font-bold text-zinc-400 group-hover/upload:text-zinc-300 uppercase tracking-widest">Click to upload photo</span>
                          </>
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handlePhotoUpload}
                          className="hidden" 
                        />
                      </label>
                    ) : (
                      <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
                        <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setPhoto(null)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-red-500/80 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-widest ml-1 drop-shadow-sm">Your Message</label>
                  <textarea 
                    required
                    rows={4}
                    value={formData.msg}
                    onChange={(e) => setFormData({ ...formData, msg: e.target.value })}
                    placeholder="Write a viral message..."
                    className="w-full px-5 py-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 focus:border-white/30 focus:bg-white/10 focus:ring-4 focus:ring-white/10 outline-none transition-all resize-none placeholder:text-zinc-400 font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/30 text-white font-black text-lg shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] transition-all active:scale-[0.98] flex items-center justify-center gap-3 group/btn"
                >
                  <Sparkles size={22} className="group-hover/btn:rotate-12 transition-transform text-white drop-shadow-md" />
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
                      <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-between gap-4 overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                        <p className="text-xs text-zinc-300 truncate font-mono select-all">
                          {generatedLink.length > 40 ? `${generatedLink.substring(0, 40)}...` : generatedLink}
                        </p>
                        <button 
                          onClick={copyToClipboard}
                          className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all shrink-0 active:scale-90"
                        >
                          {copied ? <Check size={20} className="text-emerald-400 drop-shadow-sm" /> : <Copy size={20} />}
                        </button>
                      </div>
                      {copied && (
                        <motion.span 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest drop-shadow-md"
                        >
                          Copied to clipboard!
                        </motion.span>
                      )}
                    </div>
                    <button 
                      onClick={shareOnWhatsApp}
                      className="w-full py-5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/20 text-white font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                    >
                      <Send size={22} className="text-white drop-shadow-md" />
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
              className={`fixed top-6 right-6 p-4 rounded-2xl backdrop-blur-2xl border transition-all z-50 group ${isPlaying ? 'bg-white/20 border-white/40 text-white shadow-[0_8px_32px_0_rgba(255,255,255,0.2)]' : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white'}`}
            >
              {isPlaying ? <Music size={24} className="animate-pulse drop-shadow-md" /> : <Music2 size={24} />}
              <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {isPlaying ? 'Pause' : 'Play'} Music
              </span>
            </motion.button>

            {/* Back Button */}
            <button
              onClick={() => window.location.href = window.location.origin + window.location.pathname}
              className="fixed top-6 left-6 p-4 rounded-2xl bg-white/5 text-zinc-300 backdrop-blur-2xl border border-white/10 hover:bg-white/10 hover:text-white transition-all z-50 group shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]"
            >
              <ArrowLeft size={24} />
              <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
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
                  className="flex flex-col items-center text-center relative z-10"
                >
                  <div className="relative mb-12">
                    <motion.div
                      animate={{ 
                        y: [0, -20, 0],
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                      className="text-zinc-100 drop-shadow-[0_0_40px_rgba(255,255,255,0.3)] relative z-10"
                    >
                      <Gift size={160} strokeWidth={0.5} />
                    </motion.div>
                    <div className="absolute inset-0 bg-white/5 blur-[80px] rounded-full animate-pulse" />
                  </div>
                  
                  <motion.h2 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl font-black mb-4 tracking-tight text-white drop-shadow-md"
                  >
                    You have a surprise! 🎁
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-zinc-400 mb-10 max-w-xs font-medium"
                  >
                    Someone special sent you a magical surprise message.
                  </motion.p>
                  
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    onClick={handleReveal}
                    className="group relative px-14 py-6 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/30 text-white font-black text-xl shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] transition-all active:scale-95 hover:scale-105 overflow-hidden"
                  >
                    <span className="relative z-10 drop-shadow-md">Open Surprise</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="message"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full flex flex-col items-center text-center relative z-10"
                >
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="mb-8 px-8 py-3 rounded-full bg-white/10 border border-white/20 text-white font-black text-sm tracking-[0.4em] uppercase shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-xl"
                  >
                    {OCCASIONS.find(o => o.id === wish.occasion)?.title || 'Special Wish'}!
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
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      rotateX,
                      rotateY
                    }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 300, damping: 30, mass: 0.5 }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{ transformPerspective: 1000 }}
                    className="relative p-10 md:p-16 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] w-full group"
                  >
                    {/* Decorative Icons */}
                    <div className="absolute -top-10 -left-10 text-white/10 animate-bounce">
                      <Sparkles size={80} />
                    </div>
                    <div className="absolute -bottom-10 -right-10 text-white/10 animate-pulse">
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
                      className="p-5 rounded-3xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all active:scale-90 text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-xl"
                    >
                      <PartyPopper size={32} className="drop-shadow-md" />
                    </button>
                    <button 
                      onClick={() => {
                        const baseUrl = window.location.origin + window.location.pathname;
                        const params = new URLSearchParams();
                        params.set('n', wish.name);
                        params.set('m', wish.msg);
                        params.set('o', wish.occasion);
                        
                        const link = `${baseUrl}?${params.toString()}`;
                        navigator.clipboard.writeText(link);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="px-10 py-5 rounded-3xl bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/30 text-white transition-all active:scale-95 flex items-center gap-3 font-black text-lg shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
                    >
                      {copied ? <Check size={24} className="text-emerald-400 drop-shadow-md" /> : <Share2 size={24} className="drop-shadow-md" />}
                      <span className="drop-shadow-md">{copied ? 'Link Copied!' : 'Share this Wish'}</span>
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
