import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Zap, Shield, Sparkles } from 'lucide-react';

interface HomePageProps {
  onStart: () => void;
}

export const Home: React.FC<HomePageProps> = ({ onStart }) => {
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = () => {
    setIsStarting(true);
    onStart();
  };

  return (
    <div className="h-screen w-screen bg-[#0f172a] flex flex-col items-center justify-center px-6 relative overflow-hidden font-sans select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-[#38bdf8]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/6 left-1/2 -translate-x-1/2 w-[450px] h-[220px] bg-[#1e293b]/60 rounded-full blur-[110px] pointer-events-none" />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-4xl flex flex-col items-center text-center gap-7 sm:gap-9 z-10"
      >
        {/* ── Top Header: Emoji + Title + Subtitle ────────────────── */}
        <div className="flex flex-col items-center gap-3">
          {/* Animated Signature Emoji with subtle warm aura */}
          <div className="relative flex items-center justify-center">
            <div className="absolute w-24 h-24 rounded-full bg-amber-400/15 blur-2xl pointer-events-none" />
            <motion.span
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
              className="text-6xl sm:text-7xl select-none filter drop-shadow-[0_8px_20px_rgba(245,158,11,0.25)] block"
              role="img"
              aria-label="Smiling Face"
            >
              😊
            </motion.span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase mt-1 drop-shadow-sm">
            FACE REACTION
          </h1>

          <p className="text-[#38bdf8] text-xs sm:text-sm font-bold tracking-[0.25em] uppercase">
            MATCH THE EXPRESSION. BEAT THE CLOCK.
          </p>
        </div>

        {/* ── Single Col-8 Card: Real Face Detection ─────────────── */}
        <div className="w-full flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="w-full sm:w-10/12 md:w-8/12 bg-[#162032]/85 backdrop-blur-xl border border-white/10 hover:border-[#38bdf8]/40 rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.35)] transition-all duration-300 flex flex-col items-center gap-4"
          >
            {/* Cyan Camera Icon */}
            <div className="flex items-center justify-center w-13 h-13 rounded-2xl bg-[#38bdf8]/12 border border-[#38bdf8]/30 text-[#38bdf8] shadow-[0_0_20px_rgba(56,189,248,0.2)]">
              <Camera size={24} strokeWidth={2.2} />
            </div>

            {/* Title & Description */}
            <div className="flex flex-col items-center gap-1.5">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                Real Face Detection
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm font-medium max-w-md">
                MediaPipe AI reads your expressions live
              </p>
            </div>

            {/* Sleek Sub-features Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-white/5 w-full">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0f172a]/70 border border-white/5 text-white/70 text-[11px] font-semibold">
                <Zap size={13} className="text-[#38bdf8]" />
                <span>5s Per Round</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0f172a]/70 border border-white/5 text-white/70 text-[11px] font-semibold">
                <Sparkles size={13} className="text-[#38bdf8]" />
                <span>Instant Match</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0f172a]/70 border border-white/5 text-white/70 text-[11px] font-semibold">
                <Shield size={13} className="text-emerald-400" />
                <span>100% Private</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Primary Action Button ──────────────────────────────── */}
        <motion.button
          whileHover={isStarting ? {} : { scale: 1.03 }}
          whileTap={isStarting ? {} : { scale: 0.97 }}
          onClick={handleStart}
          disabled={isStarting}
          className="flex items-center justify-center gap-3 px-9 sm:px-11 py-3.5 sm:py-4 bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#0f172a] font-black text-base sm:text-lg tracking-wider rounded-2xl shadow-[0_0_30px_rgba(56,189,248,0.4)] hover:shadow-[0_0_45px_rgba(56,189,248,0.65)] transition-all duration-200 cursor-pointer uppercase disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isStarting ? (
            <>
              <div className="w-5 h-5 border-2 border-[#0f172a] border-t-transparent rounded-full animate-spin" />
              <span>STARTING…</span>
            </>
          ) : (
            <>
              <Camera size={21} strokeWidth={2.5} />
              <span>START FACE RECOGNITION</span>
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
};
