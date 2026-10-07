import React, { useState, useRef, useEffect } from 'react';
import { ReelItem } from '../types';
import { Play, Pause, Eye, Clock, Volume2, VolumeX, ShieldCheck, Sparkles } from 'lucide-react';

interface ReelsSectionProps {
  reels?: ReelItem[];
  onOrderNowClick: () => void;
}

// Fallback high-quality demo video streams if custom URL isn't set yet
const DEFAULT_DEMO_VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
];

export const ReelsSection: React.FC<ReelsSectionProps> = ({
  reels = [],
  onOrderNowClick,
}) => {
  // Sound states: by default, all reels auto-play muted without sound
  const [activeSoundReelId, setActiveSoundReelId] = useState<string | null>(null);
  const [pausedReels, setPausedReels] = useState<Record<string, boolean>>({});
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  useEffect(() => {
    // On mount: ensure all reel videos auto-start playing muted immediately
    Object.values(videoRefs.current).forEach((vid) => {
      if (vid) {
        vid.muted = true;
        vid.play().catch(() => {});
      }
    });
  }, [reels]);

  if (!reels || reels.length === 0) return null;

  const handleCardClick = (reelId: string) => {
    const vid = videoRefs.current[reelId];
    if (!vid) return;

    if (activeSoundReelId === reelId) {
      // Toggle sound off (mute)
      vid.muted = true;
      setActiveSoundReelId(null);
    } else {
      // Mute all other videos
      Object.entries(videoRefs.current).forEach(([id, otherVid]) => {
        if (otherVid && id !== reelId) {
          otherVid.muted = true;
        }
      });

      // Unmute selected video with full audio
      vid.muted = false;
      vid.volume = 1.0;
      vid.play().catch(() => {});
      setActiveSoundReelId(reelId);
    }
  };

  const togglePlayPause = (e: React.MouseEvent, reelId: string) => {
    e.stopPropagation();
    const vid = videoRefs.current[reelId];
    if (!vid) return;

    if (vid.paused) {
      vid.play().catch(() => {});
      setPausedReels((prev) => ({ ...prev, [reelId]: false }));
    } else {
      vid.pause();
      setPausedReels((prev) => ({ ...prev, [reelId]: true }));
    }
  };

  return (
    <section className="py-16 md:py-24 bg-slate-50/70 border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Section Heading */}
        <div className="max-w-2xl mx-auto mb-14">
          <p className="text-xs font-extrabold text-blue-600 uppercase tracking-widest mb-2 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Real Growth Proof</span>
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Client Growth Stories & Live Reels
          </h2>
          <p className="text-slate-600 mt-3 text-sm sm:text-base">
            Live auto-playing video reels of verified Facebook campaign delivery. Click any reel to listen with sound.
          </p>
        </div>

        {/* 3 Facebook Reels Size (9:16 Vertical) Video Cards - Auto start without sound, click to unmute */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
          {reels.slice(0, 3).map((reel, idx) => {
            const hasSound = activeSoundReelId === reel.id;
            const isPaused = pausedReels[reel.id] ?? false;
            const videoSource = reel.videoUrl || DEFAULT_DEMO_VIDEOS[idx % DEFAULT_DEMO_VIDEOS.length];

            return (
              <div
                key={reel.id}
                onClick={() => handleCardClick(reel.id)}
                className={`group relative aspect-9/16 rounded-3xl overflow-hidden shadow-md hover:shadow-2xl border transition-all duration-300 bg-black cursor-pointer transform ${
                  hasSound
                    ? 'ring-4 ring-emerald-500 shadow-2xl scale-[1.02]'
                    : 'hover:-translate-y-1.5 border-slate-200/80'
                }`}
              >
                {/* Auto-playing muted video stream */}
                <video
                  ref={(el) => {
                    videoRefs.current[reel.id] = el;
                  }}
                  src={videoSource}
                  poster={reel.thumbnail}
                  autoPlay
                  muted={!hasSound}
                  playsInline
                  loop
                  className="w-full h-full object-cover"
                />

                {/* Scrim Gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-black/40 transition-opacity pointer-events-none ${
                    hasSound ? 'opacity-40' : 'opacity-80 group-hover:opacity-60'
                  }`}
                />

                {/* Top Meta Badges & Sound Controller */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white text-[11px] font-bold z-20">
                  <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/10 shadow-sm">
                    <Eye className="w-3 h-3 text-cyan-400" />
                    <span>{reel.views || '100K+'}</span>
                  </span>

                  {/* Sound Toggle Pill */}
                  <span
                    className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 border backdrop-blur-md transition-all shadow-md text-[10px] font-black ${
                      hasSound
                        ? 'bg-emerald-600/90 border-emerald-400 text-white animate-pulse'
                        : 'bg-black/70 border-white/20 text-slate-200 group-hover:bg-blue-600 group-hover:text-white'
                    }`}
                  >
                    {hasSound ? (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-white" />
                        <span>Sound ON</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-amber-300" />
                        <span>Sound OFF (Click)</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Center Play/Pause Control on Hover */}
                <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <button
                    type="button"
                    onClick={(e) => togglePlayPause(e, reel.id)}
                    className="w-14 h-14 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center shadow-xl pointer-events-auto transition-transform hover:scale-110 border border-white/20"
                    title={isPaused ? 'Play' : 'Pause'}
                  >
                    {isPaused ? <Play className="w-6 h-6 fill-white ml-0.5" /> : <Pause className="w-6 h-6 fill-white" />}
                  </button>
                </div>

                {/* Duration Badge */}
                {reel.duration && (
                  <div className="absolute bottom-24 right-4 z-20 pointer-events-none">
                    <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/10 text-white text-[10px] font-bold">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>{reel.duration}</span>
                    </span>
                  </div>
                )}

                {/* Bottom Caption & Bengali Subtitle */}
                <div className="absolute bottom-4 left-4 right-4 text-left text-white z-20 space-y-1">
                  <div className="inline-flex items-center gap-1 text-[10px] font-extrabold text-cyan-300 bg-cyan-950/70 border border-cyan-800/60 px-2 py-0.5 rounded-md">
                    <ShieldCheck className="w-3 h-3" />
                    <span>100% Organic Proof</span>
                  </div>
                  <h3 className="text-base font-black leading-tight text-white group-hover:text-cyan-300 transition-colors drop-shadow-md">
                    {reel.title}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2 font-medium drop-shadow-sm">
                    {reel.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="mt-12 text-center">
          <button
            onClick={onOrderNowClick}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            Start Your Organic Campaign
          </button>
        </div>
      </div>
    </section>
  );
};
