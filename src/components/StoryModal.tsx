import { Character } from "../characters";
import { X, BookOpen, MessageCircle } from "lucide-react";
import { motion } from "motion/react";

interface StoryModalProps {
  character: Character;
  onClose: () => void;
  onStartChat: (character: Character, initialPrompt?: string) => void;
}

export default function StoryModal({ character, onClose, onStartChat }: StoryModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.85)] bg-[#0c0a09] border-2 border-[#2b2520] flex flex-col max-h-[85vh]"
      >
        {/* Film Strip Border Decoration (Left & Right margins) */}
        <div className="absolute left-0 top-0 bottom-0 w-4 flex flex-col justify-around bg-[#1c1917] border-r border-[#2e2a24] opacity-80 pointer-events-none z-20">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="w-2 h-2.5 bg-black/80 rounded-[1px] mx-auto border border-[#3e382f]" />
          ))}
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-4 flex flex-col justify-around bg-[#1c1917] border-l border-[#2e2a24] opacity-80 pointer-events-none z-20">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="w-2 h-2.5 bg-black/80 rounded-[1px] mx-auto border border-[#3e382f]" />
          ))}
        </div>

        {/* Header containing the Cinema Marquee Board/Sign */}
        <div className="p-6 pb-2 relative shrink-0 flex flex-col items-center z-10 select-none px-8">
          <button
            onClick={onClose}
            id="close-story-modal"
            className="absolute top-4 right-6 p-2 transition bg-[#2e1c0c]/80 hover:bg-[#452b15] rounded-full text-amber-300 border border-amber-500/20 cursor-pointer z-30"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Golden/Amber Marquee Board */}
          <div className="relative w-full max-w-lg mt-4 px-6 py-5 bg-[#1a1410] rounded-2xl border-2 border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.25)] flex flex-col items-center text-center">
            {/* Soft Warm Glowing LED Dot Indicators on corners */}
            <div className="absolute top-1.5 left-3 w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_6px_#facc15]" />
            <div className="absolute top-1.5 right-3 w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_6px_#facc15]" />
            <div className="absolute bottom-1.5 left-3 w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_6px_#facc15]" />
            <div className="absolute bottom-1.5 right-3 w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_6px_#facc15]" />

            {/* Stage title */}
            <span className="inline-flex items-center gap-1 px-3 py-1 mb-2.5 text-[10px] md:text-xs font-black bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20 text-yellow-300 rounded-full border border-yellow-400/30 uppercase tracking-widest animate-pulse">
              🎬 Chương Cốt Truyện Đặc Biệt
            </span>

            {/* Character Star with Cinema Marquee Title Typography */}
            <div className="flex items-center gap-3">
              <span className="text-4xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">{character.avatar}</span>
              <h2 className="text-2xl md:text-3xl font-serif font-black tracking-tight text-[#FAF9F6] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] filter drop-shadow-[0_0_8px_rgba(253,224,71,0.5)]">
                {character.name}
              </h2>
            </div>
          </div>
        </div>

        {/* Narrative projector screen section */}
        <div className="relative flex-1 overflow-hidden flex flex-col min-h-0 bg-[#070504]">
          {/* Cinema screen light gradient backglow (simulating the optical lens projector beam) */}
          <div className="absolute inset-x-0 top-0 bottom-0 bg-[radial-gradient(circle_at_center,rgba(254,240,138,0.12)_0%,rgba(0,0,0,0)_75%)] pointer-events-none z-0" />
          
          {/* Header Marker label */}
          <div className="relative z-10 flex items-center justify-center gap-2 text-stone-500 font-extrabold text-[10px] tracking-[0.25em] uppercase mt-2 shrink-0">
            <BookOpen className="w-3.5 h-3.5 text-stone-600" />
            <span>PROJECTOR PLAYBACK</span>
          </div>

          {/* Cinematic Storyline Text in elegant aesthetic serif with glowing projection shadows */}
          <div 
            id="story-scroll-container" 
            className="relative z-10 flex-1 overflow-y-auto mx-8 my-4 pr-3 text-[#E2E8F0] leading-relaxed text-sm md:text-base whitespace-pre-line bg-black/60 p-6 md:p-8 rounded-2xl border border-stone-800/80 shadow-[inset_0_4px_16px_rgba(0,0,0,0.9),0_0_20px_rgba(253,224,71,0.03)] select-text scroll-smooth font-serif italic text-center"
            style={{ 
              textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 12px rgba(254,240,138,0.15)',
            }}
          >
            {character.storyline || character.story}
          </div>
        </div>

        {/* Retro movie-house admit-one design footer */}
        <div className="p-4 bg-[#110f0e] border-t border-stone-800/80 flex items-center justify-end gap-3 shrink-0 px-8 relative z-20">
          <button
            onClick={onClose}
            id="close-button-footer"
            className="px-5 py-2.5 text-xs font-black text-stone-400 hover:text-amber-400 bg-stone-900 border border-stone-800 hover:border-amber-500/30 rounded-full transition duration-150 cursor-pointer uppercase tracking-widest shadow-md"
          >
            Đóng lại
          </button>
          
          {!character.chatbotUrl ? (
            <button
              disabled
              id="start-chat-footer"
              className="flex items-center gap-2 px-6 py-3 text-xs font-black text-stone-600 bg-stone-900 border border-stone-800 rounded-full cursor-not-allowed uppercase tracking-wider opacity-60"
            >
              <MessageCircle className="w-4 h-4" />
              Sắp ra mắt
            </button>
          ) : (
            <button
              onClick={() => onStartChat(character)}
              id="start-chat-footer"
              className="flex items-center gap-2 px-6 py-3 text-xs font-black text-amber-950 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 active:scale-95 border-2 border-yellow-200 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.4)] transition duration-150 cursor-pointer uppercase tracking-widest"
            >
              <MessageCircle className="w-4 h-4 text-amber-950" />
              Nhắn tin ngay
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
