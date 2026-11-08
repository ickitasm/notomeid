/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';

interface BumperVideoCardProps {
  className?: string;
}

export const BumperVideoCard: React.FC<BumperVideoCardProps> = ({ className = '' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Attempt to play on mount
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch((err) => {
        // Autoplay policy fallback
        console.log('Video autoplay prevented until interaction:', err);
      });
    }

    // Listen for first user interaction on the page to unmute if desired
    const handleFirstInteraction = () => {
      setHasInteracted(true);
      const vid = videoRef.current;
      if (vid) {
        vid.muted = false;
        setIsMuted(false);
        vid.play().catch(() => {
          // If browser still refuses unmuted playback, stay muted
          vid.muted = true;
          setIsMuted(true);
        });
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (video) {
      const nextMuted = !video.muted;
      video.muted = nextMuted;
      setIsMuted(nextMuted);
      if (!nextMuted) {
        video.play().catch(() => {});
      }
    }
  };

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-[#E4DCDB] dark:border-[#352F2B] bg-[#F8F5F0] dark:bg-[#181412] shadow-md group transition-all ${className}`}
    >
      {/* Video Player */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#F8F5F0] dark:bg-[#181412]">
        <video
          ref={videoRef}
          src="/assets/aistudio/notomee_bumper__1__0f92ea37.mp4"
          autoPlay
          loop
          muted={isMuted}
          playsInline
          preload="auto"
          className="w-full h-full object-cover select-none pointer-events-auto"
          title="Notomee 6 Life Pillars Animation Bumper"
        />

        {/* Audio Mute/Unmute Floating Button */}
        <button
          type="button"
          onClick={toggleSound}
          className="absolute top-3 right-3 z-10 p-2 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-all duration-200 active:scale-90 cursor-pointer shadow-sm flex items-center gap-1.5"
          title={isMuted ? 'Aktifkan Suara' : 'Matikan Suara'}
          aria-label={isMuted ? 'Unmute video' : 'Mute video'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-white/90" />
          ) : (
            <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
          )}
          <span className="text-[10px] font-mono font-medium hidden sm:inline">
            {isMuted ? 'Muted' : 'Audio On'}
          </span>
        </button>

        {/* Brand Tag Pill Bottom-Left */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md text-white/90 text-[10px] font-mono tracking-wide shadow-xs select-none">
          <Sparkles className="w-3 h-3 text-[#E08A68]" />
          <span>Notomee · 6 Life Pillars</span>
        </div>
      </div>
    </div>
  );
};
