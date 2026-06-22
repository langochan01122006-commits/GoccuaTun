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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl shadow-2xl bg-[#E0F2FE] border border-blue-200 flex flex-col max-h-[85vh]"
      >
        {/* Banner header inside background */}
        <div className={`p-6 bg-gradient-to-r ${character.avatarBg} text-white relative shrink-0`}>
          <button
            onClick={onClose}
            id="close-story-modal"
            className="absolute top-4 right-4 p-2 transition bg-white/20 hover:bg-white/30 rounded-full text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4">
            <span className="text-5xl leading-none">{character.avatar}</span>
            <div>
              <span className="inline-block px-2.5 py-0.5 mb-1.5 text-xs font-semibold bg-white/20 rounded-full text-white backdrop-blur-md">
                Chương Cốt Truyện Đặc Biệt 📖
              </span>
              <h2 className="text-2xl font-bold tracking-tight font-sans">{character.name}</h2>
            </div>
          </div>
        </div>

        {/* Story content */}
        <div className="p-6 md:p-8 flex-1 overflow-hidden flex flex-col min-h-0 bg-[#E0F2FE]">
          {/* Header Title */}
          <div className="flex items-center gap-2 text-[#0F172A] font-extrabold text-sm tracking-wider uppercase mb-4 shrink-0">
            <BookOpen className="w-4 h-4 text-slate-700" />
            <span>CỐT TRUYỆN</span>
          </div>

          {/* Scrollable text area displaying full storyline */}
          <div id="story-scroll-container" className="flex-1 overflow-y-auto pr-2 text-[#1E293B] leading-relaxed text-sm md:text-base whitespace-pre-line bg-white/40 p-5 md:p-6 rounded-2xl border border-white/60 shadow-inner select-text scroll-smooth font-sans">
            {character.storyline || character.story}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-[#D0E7FF] border-t border-blue-200/60 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            id="close-button-footer"
            className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition cursor-pointer"
          >
            Đóng lại
          </button>
          
          {character.id === "16" || character.id === "17" ? (
            <button
              disabled
              id="start-chat-footer"
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white/80 bg-[#555555] rounded-xl shadow-md transition duration-150 cursor-not-allowed opacity-90"
            >
              <MessageCircle className="w-4 h-4" />
              Sắp ra mắt
            </button>
          ) : (
            <button
              onClick={() => onStartChat(character)}
              id="start-chat-footer"
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-md transition duration-150 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              Nhắn tin ngay
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
