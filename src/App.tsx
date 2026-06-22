import { useState, useEffect, useRef, CSSProperties } from "react";
import { CHARACTERS, Character } from "./characters";
import { Search, Heart, Sparkles, MessageCircle, BookOpen, Volume2, VolumeX, Moon, Sun, ArrowLeft, RotateCcw, BarChart3, Gift, Check, X, Copy, ScrollText, Music, Play, Pause, SkipBack, SkipForward, ListMusic, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import StoryModal from "./components/StoryModal";
import ChatBox from "./components/ChatBox";
import { getAllVotes, voteForCharacter, unvoteForCharacter } from "./firebase";

const donateQrImg = "/src/assets/images/donate_qr_code_1781767011629.jpg";

const playlist = [
  { id: 1, title: "Young and Beautiful", playlist: "Playlist #1", url: "https://files.catbox.moe/xht7wt.mp3" },
  { id: 2, title: "Summertime Sadness", playlist: "Playlist #2", url: "https://files.catbox.moe/fb4zok.mp3" },
  { id: 3, title: "Say Yes To Heaven", playlist: "Playlist #3", url: "https://files.catbox.moe/3x9ccc.mp3" },
  { id: 4, title: "Beauty and a beat", playlist: "Playlist #4", url: "https://files.catbox.moe/fdej6i.mp3" },
  { id: 5, title: "Y Que Fue?", playlist: "Playlist #5", url: "https://files.catbox.moe/1rk4uy.mp3" },
  { id: 6, title: "Beast", playlist: "Playlist #6", url: "https://files.catbox.moe/e23z1k.mp3" },
  { id: 7, title: "Bye", playlist: "Playlist #7", url: "https://files.catbox.moe/ap4m1x.mp3" }
];

const welcomeBgUrl = "https://i.pinimg.com/736x/dd/67/ba/dd67bac0e301af9afa05de6c2494c80e.jpg";
const mainBgUrl = "https://i.pinimg.com/736x/06/cb/e4/06cbe483611ba5fbd0bc25c2e41bf67c.jpg";

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("Tất cả");
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [backdropTheme, setBackdropTheme] = useState<"pastel" | "sunset" | "cosmic">("pastel");
  
  // Voting and Donate states
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [userVotedIds, setUserVotedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('userVotedIds');
    return saved ? JSON.parse(saved) : [];
  });
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [isCommandModalOpen, setIsCommandModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  
  // Music Player states
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicProgress, setMusicProgress] = useState(0);
  const [musicDuration, setMusicDuration] = useState(0);
  const [isPlaylistViewOpen, setIsPlaylistViewOpen] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [floatingNotes, setFloatingNotes] = useState<{ id: number; text: string; left: string; size: string; duration: string }[]>([]);

  useEffect(() => {
    if (!isPlaying) {
      setFloatingNotes([]);
      return;
    }

    const noteSymbols = ["🎵", "🎶", "♩", "♪", "♫"];
    const interval = setInterval(() => {
      const id = Date.now() + Math.random();
      const text = noteSymbols[Math.floor(Math.random() * noteSymbols.length)];
      const left = `${Math.floor(Math.random() * 40) - 20}px`; // random offset
      const size = `${Math.random() * 8 + 14}px`; // random size
      const duration = `${Math.random() * 1.5 + 2}s`; // custom speed

      setFloatingNotes((prev) => [...prev, { id, text, left, size, duration }]);

      setTimeout(() => {
        setFloatingNotes((prev) => prev.filter((note) => note.id !== id));
      }, 3500);
    }, 700);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [donateCode, setDonateCode] = useState("");
  const [donateStatus, setDonateStatus] = useState<"idle" | "success" | "error">("idle");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    playClickSound(550, 0.05);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  useEffect(() => {
    async function loadVotes() {
      try {
        const votesData = await getAllVotes();
        setVotes(votesData);
      } catch (err) {
        console.error("Failed to load votes:", err);
      }
    }
    loadVotes();
  }, []);

  // Music Player logic
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setMusicProgress(audioRef.current.currentTime);
    }
  };

  const handleDurationChange = () => {
    if (audioRef.current) {
      setMusicDuration(audioRef.current.duration || 0);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setMusicDuration(audioRef.current.duration || 0);
    }
  };

  const handleEnded = () => {
    playNextTrack();
  };

  // Sync play/pause state of the DOM audio node
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch((err) => {
        console.warn("Audio play failed/prevented:", err);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  // Handle immediate track change, clearing previous state
  useEffect(() => {
    setMusicProgress(0);
    setMusicDuration(0);
  }, [currentTrackIndex]);

  const toggleMusicPlay = () => {
    playClickSound(300, 0.08);
    setIsPlaying(!isPlaying);
  };

  const playNextTrack = () => {
    playClickSound(300, 0.08);
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
    setIsPlaying(true);
  };

  const playPrevTrack = () => {
    playClickSound(300, 0.08);
    setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    setIsPlaying(true);
  };

  const handleMusicProgressChange = (e: any) => {
    if (audioRef.current) {
      const newTime = Number(e.target.value);
      try {
        audioRef.current.currentTime = newTime;
        setMusicProgress(newTime);
      } catch (err) {
        console.warn("Failed to seek position on current socket state:", err);
      }
    }
  };

  const formatMusicTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleVote = async (characterId: string) => {
    playClickSound(620, 0.08);
    
    if (userVotedIds.includes(characterId)) {
      // Unvote optimistic update
      setVotes((prev) => ({
        ...prev,
        [characterId]: Math.max(0, (prev[characterId] || 0) - 1),
      }));

      const newVotedIds = userVotedIds.filter(id => id !== characterId);
      setUserVotedIds(newVotedIds);
      localStorage.setItem('userVotedIds', JSON.stringify(newVotedIds));

      try {
        const updatedCount = await unvoteForCharacter(characterId);
        setVotes((prev) => ({
          ...prev,
          [characterId]: updatedCount,
        }));
      } catch (err) {
        console.error("Failed to unvote:", err);
      }
    } else {
      if (userVotedIds.length >= 3) {
        alert("Bạn đã hết lượt vote! Vui lòng hủy vote nhân vật khác để chọn lại.");
        return;
      }
      
      // Vote optimistic update
      setVotes((prev) => ({
        ...prev,
        [characterId]: (prev[characterId] || 0) + 1,
      }));

      const newVotedIds = [...userVotedIds, characterId];
      setUserVotedIds(newVotedIds);
      localStorage.setItem('userVotedIds', JSON.stringify(newVotedIds));

      try {
        const updatedCount = await voteForCharacter(characterId);
        setVotes((prev) => ({
          ...prev,
          [characterId]: updatedCount,
        }));
      } catch (err) {
        console.error("Failed to submit vote:", err);
      }
    }
  };

  const handleVerifyDonate = () => {
    playClickSound(580, 0.1);
    if (donateCode.trim().toUpperCase() === "TIEMMEOLUOI") {
      setDonateStatus("success");
    } else {
      setDonateStatus("error");
    }
  };

  // Selected character triggers
  const [chattingCharacter, setChattingCharacter] = useState<Character | null>(null);
  const [storyCharacter, setStoryCharacter] = useState<Character | null>(null);

  // List of tags for filter menu
  const tags = [
    "Tất cả",
    "Hiện đại",
    "Fantasy",
    "Ngọt sủng",
    "NP",
    "Xuyên không",
    "Hài",
    "Ngược",
    "TXVT",
    "Cổ Trang",
    "Dark Romance",
    "Ngoại Tình",
    "R18/21+",
    "2 COUPLE",
    "Age Gap",
    "Size Gap",
    "Slowburn",
     "Nhân thú",
     "Côn trùng",
     "BG",
     "BL",
     "GL",
     "Việt Nam xưa"
  ];

  // Dynamic Featured Card: find character with highest vote count
  const getFeaturedHubby = () => {
    let bestChar = CHARACTERS[0];
    let maxVotes = -1;
    for (const char of CHARACTERS) {
      const charVotes = votes[char.id] || 0;
      if (charVotes > maxVotes) {
        maxVotes = charVotes;
        bestChar = char;
      }
    }
    return bestChar;
  };

  const featuredHubby = getFeaturedHubby();

  // Filtered listing based on query and selected category tag
  const filteredCharacters = CHARACTERS.filter((char) => {
    const matchesSearch = char.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = activeTag === "Tất cả" || char.tags.some(t => t.toLowerCase() === activeTag.toLowerCase());
    return matchesSearch && matchesTag;
  });

  // Simple synthesizer tool sound effect for click actions
  const playClickSound = (freq = 400, duration = 0.05) => {
    if (!isSoundOn) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Sound blocked or unsupported
    }
  };

  // Triggers immediate chat in a new tab using the chatbotUrl
  const handleStartChat = (character: Character, initialPrompt?: string) => {
    playClickSound(550, 0.1);
    setStoryCharacter(null); // Close story popup if open
    
    if (character.chatbotUrl) {
      window.open(character.chatbotUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Change background theme cycle
  const cycleBackdropTheme = () => {
    playClickSound(480, 0.08);
    if (backdropTheme === "pastel") setBackdropTheme("sunset");
    else if (backdropTheme === "sunset") setBackdropTheme("cosmic");
    else setBackdropTheme("pastel");
  };

  // Style helper based on selected theme
  const getBackgroundStyles = () => {
    return "text-[#FAF9F6]";
  };

  const currentSong = playlist[currentTrackIndex];

  return (
    <div 
      className={`min-h-screen ${getBackgroundStyles()} transition-all duration-700 font-sans flex flex-col items-center select-none relative overflow-x-hidden ${hasEntered ? "p-4 md:p-6" : "justify-center p-6"}`}
      style={hasEntered ? {} : {
        backgroundImage: `url('${welcomeBgUrl}')`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Fixed background div behind everything when entered for mobile compatibility */}
      {hasEntered && (
        <div 
          id="main-fixed-bg"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundImage: `url('${mainBgUrl}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            zIndex: -1
          }}
        />
      )}
      {/* Real-time DOM audio element properly integrated with React state and events */}
      <audio
        ref={audioRef}
        src={currentSong?.url}
        crossOrigin="anonymous"
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />



      {/* Gentle dark overlay for welcome screen to make white text pop without blur */}
      {!hasEntered && (
        <div className="absolute inset-0 bg-black/25 z-0 pointer-events-none" />
      )}

      {/* Ocean waves animation when had entered the portal */}
      {hasEntered && (
        <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none overflow-hidden z-0 opacity-30">
          <svg className="absolute bottom-0 w-[200%] h-32 text-sky-200/50 fill-current animate-wave-1" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,60 C150,100 350,20 500,60 C650,100 850,20 1000,60 C1150,100 1350,20 1500,60 L1500,120 L0,120 Z"></path>
          </svg>
          <svg className="absolute bottom-0 w-[200%] h-32 text-blue-200/40 fill-current animate-wave-2" viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ left: "-50%" }}>
            <path d="M0,50 C180,10 320,90 500,50 C680,10 820,90 1000,50 C1180,10 1320,90 1500,50 L1500,120 L0,120 Z"></path>
          </svg>
        </div>
      )}


      <AnimatePresence mode="wait">
        {!hasEntered ? (
          <motion.div
            key="welcome-panel"
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: -30, transition: { duration: 0.5 } }}
            className="w-full max-w-lg z-10 flex flex-col items-center justify-center text-center space-y-8 relative py-12"
          >
            {/* Top controls panel for welcome screen */}
            <div className="absolute -top-16 right-0 flex items-center gap-2">
              {/* Light mode toggle */}
              <button
                onClick={cycleBackdropTheme}
                id="welcome-toggle-theme"
                className="p-2.5 transition duration-150 bg-white/40 hover:bg-white/50 backdrop-blur-md rounded-full shadow border border-white/30 text-slate-800 active:scale-95 flex items-center justify-center cursor-pointer"
                title="Thay đổi màu nền chủ đề"
              >
                {backdropTheme === "cosmic" ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
              </button>
              {/* Sound flag toggle */}
              <button
                onClick={() => {
                  setIsSoundOn(!isSoundOn);
                  if (!isSoundOn) playClickSound(600, 0.05);
                }}
                id="welcome-toggle-sound"
                className="p-2.5 transition duration-150 bg-white/40 hover:bg-white/50 backdrop-blur-md rounded-full shadow border border-white/30 text-slate-800 active:scale-95 flex items-center justify-center cursor-pointer"
                title={isSoundOn ? "Tắt âm thanh thông báo" : "Bật âm thanh thông báo"}
              >
                {isSoundOn ? <Volume2 className="w-4 h-4 text-pink-500 animate-pulse" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              </button>
            </div>

            {/* Cute animated bow with sparkles */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="relative mb-[-3rem] z-10 flex items-center justify-center pointer-events-none"
            >
              {/* Bow SVG with pulse effect */}
              <motion.div
                animate={{ scale: [1, 1.05, 1], opacity: [0.9, 1, 0.9] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="relative mt-4"
              >
                {/* SVG for a cute blue bow */}
                <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
                  {/* Left Ribbon */}
                  <path d="M60 40 C30 -20, 5 10, 10 40 C15 70, 40 80, 60 40 Z" fill="#38BDF8" />
                  {/* Right Ribbon */}
                  <path d="M60 40 C90 -20, 115 10, 110 40 C105 70, 80 80, 60 40 Z" fill="#38BDF8" />
                  {/* Left Tail */}
                  <path d="M50 40 C45 60, 20 80, 15 75 C25 60, 40 45, 50 40 Z" fill="#0284C7" />
                  {/* Right Tail */}
                  <path d="M70 40 C75 60, 100 80, 105 75 C95 60, 80 45, 70 40 Z" fill="#0284C7" />
                  {/* Center Knot */}
                  <ellipse cx="60" cy="40" rx="14" ry="18" fill="#7DD3FC" />
                  <ellipse cx="60" cy="40" rx="6" ry="8" fill="#BAE6FD" />
                </svg>

                {/* Sparkles around the bow */}
                {/* Top left sparkle */}
                <motion.div
                  animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.2, ease: "easeInOut" }}
                  className="absolute -top-2 left-2 text-yellow-300 pointer-events-none"
                >
                  <Sparkles className="w-4 h-4" fill="currentColor" />
                </motion.div>
                {/* Top right sparkle */}
                <motion.div
                  animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 0.5], rotate: [0, 45, 90] }}
                  transition={{ repeat: Infinity, duration: 1.8, delay: 0.5, ease: "easeInOut" }}
                  className="absolute -top-4 right-4 text-white pointer-events-none"
                >
                  <Sparkles className="w-5 h-5" fill="currentColor" />
                </motion.div>
                {/* Bottom left sparkle */}
                <motion.div
                  animate={{ opacity: [0, 1, 0], scale: [0.5, 1.1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2.1, delay: 0.1, ease: "easeInOut" }}
                  className="absolute bottom-2 left-6 text-yellow-100 pointer-events-none"
                >
                  <Sparkles className="w-3 h-3" fill="currentColor" />
                </motion.div>
                {/* Bottom right sparkle */}
                <motion.div
                  animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5], rotate: [0, -45, -90] }}
                  transition={{ repeat: Infinity, duration: 1.6, delay: 0.8, ease: "easeInOut" }}
                  className="absolute bottom-1 right-2 text-yellow-300 pointer-events-none"
                >
                  <Sparkles className="w-4 h-4" fill="currentColor" />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Card Container */}
            <div 
              className="rounded-[24px] p-8 md:p-12 shadow-2xl flex flex-col items-center justify-center space-y-6 text-center w-[90%] max-w-sm mx-auto border-2 border-white/20"
              style={{ backgroundColor: '#9FC1ED' }}
            >
              {/* Typography center title block */}
              <div className="space-y-3 drop-shadow-md">
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="text-4xl md:text-5xl font-black tracking-tight leading-none text-white pb-2 select-none"
                >
                  𝚆𝙴𝙻𝙲𝙾𝙼𝙴 𝚃𝙾 𝙼𝚈 𝙷𝙾𝚄𝚂𝙴
                </motion.h2>

                <motion.p
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="text-sm md:text-base font-bold tracking-wider text-white uppercase drop-shadow-sm flex items-center justify-center"
                >
                  【 𝐆𝐨́𝐜 𝐜𝐮̉𝐚 𝐓𝐮𝐧 】
                </motion.p>
              </div>

              {/* Romantic description tag */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-xs text-white font-medium italic max-w-[200px] drop-shadow-sm"
              >
                "Nhà nhỏ của Tun nơi tìm thấy một nửa của thế giới"
              </motion.p>

              {/* Cute bottom action trigger */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="pt-2 w-full flex flex-col items-center"
              >
                <button
                  onClick={() => {
                    playClickSound(650, 0.15);
                    setHasEntered(true);
                    setIsPlaying(true);
                  }}
                  id="welcome-enter-btn"
                  className="w-full py-3.5 text-white text-base font-bold rounded-2xl shadow-lg hover:shadow-pink-400/40 hover:opacity-90 transform hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 font-sans"
                  style={{ backgroundColor: '#F7BCF0' }}
                >
                  ౨ৎ Ghé nhà của Tun ౨ৎ
                </button>
              </motion.div>
            </div>

            {/* Social Links Outside */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="flex items-center justify-center gap-3 mt-6"
            >
              <a
                href="https://discord.gg/UXYJmxXBY"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-black/45 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/10 hover:bg-black/60 transition-all active:scale-95 flex items-center gap-1.5"
              >
                Discord 💬
              </a>
              <a
                href="https://www.facebook.com/share/18yG86eq1t/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-black/45 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/10 hover:bg-black/60 transition-all active:scale-95 flex items-center gap-1.5"
              >
                Facebook 🌐
              </a>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="main-portal"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-4xl z-10 flex flex-col gap-5"
          >
            {/* Top Navigation Row */}
            <div className="flex justify-between items-center">
              {/* Back button to Welcome Portal */}
              <button
                onClick={() => {
                  playClickSound(500, 0.1);
                  setHasEntered(false);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-all text-xs font-bold leading-none select-none cursor-pointer shadow-sm group"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#EDC5E4] transition-transform group-hover:-translate-x-0.5" />
                <span>Quay lại</span>
              </button>

              {/* Minimalist round tool buttons at the top right */}
              <div className="flex items-center gap-1.5 md:gap-2">
                {/* Cycle backgrounds selector */}
                <button
                  onClick={cycleBackdropTheme}
                  id="top-cycle-theme"
                  className="p-2.5 transition duration-150 bg-white hover:bg-slate-50 border border-slate-100 rounded-full shadow-sm text-slate-600 active:scale-95 flex items-center justify-center cursor-pointer"
                  title={`Giao diện hiện tại: ${
                    backdropTheme === "pastel" ? "Pastel Nhật Bản" : backdropTheme === "sunset" ? "Hoàng Hôn Lãng Mạn" : "Thiên Hà Huyền Bí"
                  }`}
                >
                  {backdropTheme === "cosmic" ? (
                    <Sun className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Moon className="w-4 h-4 text-indigo-500" />
                  )}
                </button>

                {/* General Back/Reset system buttons if active */}
                {(chattingCharacter || searchQuery || activeTag !== "Tất cả") && (
                  <button
                    onClick={() => {
                      playClickSound(300, 0.1);
                      setChattingCharacter(null);
                      searchQuery && setSearchQuery("");
                      activeTag !== "Tất cả" && setActiveTag("Tất cả");
                    }}
                    id="top-reset-general"
                    className="p-2.5 transition duration-150 bg-blue-500 hover:bg-blue-600 rounded-full shadow-md text-white active:scale-95 flex items-center justify-center cursor-pointer"
                    title="Quay lại ban đầu"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Announcement bar */}
            <div 
              onClick={() => {
                playClickSound(500, 0.1);
                setIsAnnouncementModalOpen(true);
              }}
              className="w-full overflow-hidden rounded-full py-2 md:py-2.5 px-3 md:px-4 shadow-lg cursor-pointer border border-white/20 hover:border-white/40 group flex transition-all text-white items-center gap-2 relative z-20"
              style={{ backgroundColor: 'transparent' }}
            >
              <div className="shrink-0 flex items-center z-10">
                <div className="flex items-center justify-center bg-white/80 rounded-full text-slate-800 shadow-sm w-6 h-6 md:w-7 md:h-7 shrink-0 font-bold">
                  📢
                </div>
              </div>
              <div className="flex-1 overflow-hidden relative h-5 md:h-6 flex items-center" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
                <div 
                  className="flex animate-marquee whitespace-nowrap text-xs md:text-sm font-bold tracking-wide text-white"
                  style={{ textShadow: "1px 1px 4px rgba(0, 0, 0, 0.85)" }}
                >
                  <span className="px-4">Chào mừng các nhỏ đến với góc của Tun! Nếu có thắc mắc hãy vào góc hỗ trợ hoặc ib trực tiếp qua FB của Tun</span>
                  <span className="px-4" aria-hidden="true">Chào mừng các nhỏ đến với góc của Tun! Nếu có thắc mắc hãy vào góc hỗ trợ hoặc ib trực tiếp qua FB của Tun</span>
                </div>
              </div>
            </div>



            {/* Conditional Flow: Active chatbot screen vs Home list screen */}
            <AnimatePresence mode="wait">
              {chattingCharacter ? (
                <motion.div
                  key="chat-screen"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  className="w-full flex items-center justify-center"
                >
                  <ChatBox
                    character={chattingCharacter}
                    onBack={() => setChattingCharacter(null)}
                    isSoundOn={isSoundOn}
                    onToggleSound={() => setIsSoundOn(!isSoundOn)}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="catalog-screen"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  {/* Interactive Option Buttons panel */}
                  <div className="grid grid-cols-3 gap-2 md:gap-3 w-full">
                    {/* Pink sen button (Góc trái) */}
                    <button
                      onClick={() => {
                        playClickSound(500, 0.1);
                        setIsVoteModalOpen(true);
                      }}
                      id="welcome-vote-btn"
                      className="w-full flex items-center justify-center gap-1.5 py-3 px-2 rounded-2xl font-bold bg-[#F6BFD3] hover:bg-[#F2ADC6] text-slate-800 shadow-md active:scale-95 transform hover:-translate-y-0.5 transition-all text-[11px] md:text-sm border border-pink-300/30 cursor-pointer text-center"
                    >
                      <BarChart3 className="w-4 h-4 md:w-5 md:h-5" />
                      <span>Bình chọn</span>
                    </button>

                    {/* Orange button (Góc phải) - Updated to Blue Donate✨ */}
                    <button
                      onClick={() => {
                        playClickSound(500, 0.1);
                        setIsDonateModalOpen(true);
                      }}
                      id="welcome-donate-btn"
                      className="w-full flex items-center justify-center gap-1.5 py-3 px-2 rounded-2xl font-bold bg-[#87D0E8] hover:bg-[#70C5E2] text-slate-800 shadow-md active:scale-95 transform hover:-translate-y-0.5 transition-all text-[11px] md:text-sm border border-blue-300/30 cursor-pointer text-center"
                    >
                      <Gift className="w-4 h-4 md:w-5 md:h-5" />
                      <span>Donate✨</span>
                    </button>

                    {/* Command button */}
                    <button
                      onClick={() => {
                        playClickSound(500, 0.1);
                        setIsCommandModalOpen(true);
                      }}
                      id="welcome-command-btn"
                      className="w-full flex items-center justify-center gap-1.5 py-3 px-2 rounded-2xl font-bold bg-[#F2BF8F] hover:bg-[#EDA96B] text-slate-800 shadow-md active:scale-95 transform hover:-translate-y-0.5 transition-all text-[11px] md:text-sm border border-amber-300/30 cursor-pointer text-center"
                    >
                      <ScrollText className="w-4 h-4 md:w-5 md:h-5" />
                      <span>Hỗ trợ 🤝</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="relative w-full">
                      <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
                        <Search className="w-5 h-5 text-blue-400" />
                      </span>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm một nửa... 🔍"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-900/40 border border-white/10 rounded-2xl shadow-sm text-[#FAF9F6] placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 backdrop-blur-md transition"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => {
                            playClickSound(300, 0.05);
                            setSearchQuery("");
                          }}
                          className="absolute inset-y-0 right-4 flex items-center text-xs text-slate-400 hover:text-blue-500 font-semibold"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Tag Filters list matching theme colors (Primary: Blue "Tất cả", Secondary: Pink categories tags) */}
                    <div className="flex flex-wrap items-center gap-1.5 md:gap-2 py-1 max-h-52 overflow-y-auto no-scrollbar">
                      {tags.map((tag) => {
                        const isSelected = activeTag === tag;
                        return (
                          <button
                            key={tag}
                            onClick={() => {
                              playClickSound(450, 0.05);
                              setActiveTag(tag);
                            }}
                            id={`tag-filter-${tag}`}
                            className={`px-3 py-1.5 md:px-4 py-2 text-xs font-bold rounded-full border transition-all duration-200 active:scale-95 cursor-pointer shrink-0 ${
                              isSelected
                                ? "bg-[#FAF9F6] text-slate-900 border-[#FAF9F6] shadow-md transform -translate-y-0.5"
                                : "bg-slate-900/40 text-[#FAF9F6] hover:bg-slate-800/60 border-white/10 backdrop-blur-sm"
                            }`}
                          >
                            {tag === "Tất cả" ? "⭐ Tất cả" : tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Featured Top Voted Character Banner/Section */}
                  {featuredHubby && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.1 }}
                      id="featured-hubby-banner"
                      className="relative overflow-hidden rounded-3xl border border-yellow-500/35 p-5 md:p-6 bg-gradient-to-br from-amber-950/45 via-[#2d120a]/60 to-slate-950/45 backdrop-blur-md shadow-xl flex flex-col md:flex-row items-center gap-5 justify-between transition-all duration-300 hover:border-yellow-400/50 group"
                    >
                      {/* Ambient background decoration */}
                      <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 bg-amber-400/5 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-400/10 transition-all duration-500" />
                      
                      <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left w-full relative z-10">
                        {/* Avatar container */}
                        <div className="relative shrink-0 flex items-center justify-center">
                          <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-tr ${featuredHubby.avatarBg} flex items-center justify-center text-4xl md:text-5xl shadow-lg relative group-hover:scale-105 transition duration-300 ring-4 ring-yellow-400/20`}>
                            {featuredHubby.avatar}
                          </div>
                          <span className="absolute -bottom-2 -right-1 bg-yellow-400 text-yellow-950 font-black text-[9px] md:text-xs px-2 py-0.5 rounded-full shadow border border-amber-300 flex items-center gap-0.5 uppercase tracking-wide">
                            👑 NO.1
                          </span>
                        </div>

                        {/* Name & descriptive details */}
                        <div className="space-y-1.5 w-full">
                          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                            <span className="px-2.5 py-0.5 text-[9px] md:text-[10px] font-black bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-950 rounded-full border border-yellow-300/40 uppercase tracking-widest shadow-sm">
                              TOP 1 CHỨ CÒN AI NỮA 👑
                            </span>
                            <h4 className="text-xl md:text-2xl font-black text-[#FAF9F6] tracking-tight group-hover:text-amber-200 transition">
                              {featuredHubby.name}
                            </h4>
                          </div>

                          {/* Rank categories list & dynamic values */}
                          <div className="flex flex-wrap items-center gap-1.5 justify-center sm:justify-start mt-1">
                            <span className="px-2.5 py-0.5 text-[9px] font-black bg-[#F7D943] text-[#78350F] rounded border border-yellow-500/30 uppercase tracking-wider">
                              Hạng 1
                            </span>
                            {featuredHubby.tags.map((t, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 text-[9px] font-bold text-pink-400 bg-pink-950/40 border border-pink-500/20 rounded uppercase"
                              >
                                {t}
                              </span>
                            ))}
                            <span className="px-2 py-0.5 text-[9px] font-black text-amber-300 bg-amber-950/40 border border-amber-500/20 rounded">
                              🔥 {(votes[featuredHubby.id] || 0).toLocaleString()} VOTE
                            </span>
                          </div>

                          <p className="text-xs md:text-sm text-slate-300 max-w-xl line-clamp-2 mt-1 leading-relaxed">
                            {featuredHubby.description}
                          </p>
                        </div>
                      </div>

                      {/* Clickable Actions block */}
                      <div className="flex items-center gap-2 w-full md:w-auto shrink-0 mt-2 md:mt-0 relative z-10 border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
                        {/* Interactive Chat Trigger */}
                        {!featuredHubby.chatbotUrl ? (
                          <button
                            disabled
                            id={`featured-chat-btn-${featuredHubby.id}`}
                            className="flex-1 md:w-32 flex items-center justify-center gap-1.5 px-4 py-3 bg-[#555555]/85 text-white/80 font-black text-xs rounded-xl shadow-md cursor-not-allowed opacity-90 border border-transparent"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Sắp ra mắt
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartChat(featuredHubby)}
                            id={`featured-chat-btn-${featuredHubby.id}`}
                            className="flex-1 md:w-32 flex items-center justify-center gap-1.5 px-4 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-yellow-950 font-black text-xs rounded-xl shadow-md transition duration-150 active:scale-95 cursor-pointer border border-yellow-300/40"
                          >
                            <MessageCircle className="w-4 h-4 text-yellow-950" />
                            Chat Ngay
                          </button>
                        )}

                        {/* Interactive Story Trigger */}
                        <button
                          onClick={() => {
                            playClickSound(480, 0.08);
                            setStoryCharacter(featuredHubby);
                          }}
                          id={`featured-story-btn-${featuredHubby.id}`}
                          className="flex-1 md:w-32 flex items-center justify-center gap-1.5 px-4 py-3 text-amber-200 bg-amber-950/50 hover:bg-amber-900/40 border border-amber-500/30 text-xs font-black rounded-xl transition duration-150 active:scale-95 cursor-pointer"
                        >
                          <BookOpen className="w-4 h-4" />
                          Cốt truyện
                        </button>

                        {/* Profile Button */}
                        <a
                          href={featuredHubby.profileUrl || "#"}
                          target={featuredHubby.profileUrl ? "_blank" : undefined}
                          rel={featuredHubby.profileUrl ? "noopener noreferrer" : undefined}
                          id={`featured-profile-btn-${featuredHubby.id}`}
                          className="flex-1 md:w-32 flex items-center justify-center gap-1.5 px-4 py-3 text-amber-200 bg-amber-950/50 hover:bg-amber-900/40 border border-amber-500/30 text-xs font-black rounded-xl transition duration-150 active:scale-95 cursor-pointer"
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </a>
                      </div>
                    </motion.div>
                  )}

                  {/* Characters scrollable vertical listing: "Dàn Harem nhà Tun" */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🌷</span>
                        <h3 className="font-extrabold text-base md:text-lg text-[#185396]">
                          Dàn Harem nhà Tun ({filteredCharacters.length})
                        </h3>
                      </div>
                      <span className="text-xs text-[#FAF9F6]/60 font-mono">
                        Updated Daily • Live
                      </span>
                    </div>

                    {filteredCharacters.length === 0 ? (
                      <div className="p-12 text-center rounded-3xl bg-white/55 border border-slate-200/60 shadow-sm flex flex-col items-center justify-center gap-2">
                        <span className="text-4xl text-slate-400">🍂</span>
                        <p className="text-sm text-slate-500 font-medium">Các mỹ nam/mỹ nữ tag này vẫn đang xếp hàng chờ Tun duyệt...</p>
                        <button
                          onClick={() => {
                            playClickSound(300, 0.1);
                            setSearchQuery("");
                            setActiveTag("Tất cả");
                          }}
                          className="mt-2 text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Thử đặt lại bộ lọc
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3.5">
                        {filteredCharacters.map((char, index) => {
                          const isTopCharacter = char.id === featuredHubby?.id;
                          return (
                          <motion.div
                            key={char.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.04 }}
                            className={`group overflow-hidden rounded-2xl border p-4 flex flex-col md:flex-row items-center gap-4 justify-between transition-all duration-200 ${
                              isTopCharacter 
                                ? 'bg-amber-950/75 border-amber-500/30 backdrop-blur-md shadow-md' 
                                : 'bg-slate-950/75 hover:bg-slate-900/85 border-white/10 backdrop-blur-md shadow-sm hover:shadow-md hover:border-pink-500/30'
                            }`}
                          >
                            {/* Numerical index and profile avatar block */}
                            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left w-full">
                              
                              {/* Left index placement digit badge */}
                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-sm font-bold text-slate-400 w-5 text-center font-mono">
                                  #{char.id}
                                </span>
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${char.avatarBg} flex items-center justify-center text-3xl shadow-sm relative group-hover:scale-105 transition`}>
                                  {char.avatar}
                                </div>
                              </div>

                              <div className="space-y-1 w-full">
                                <div className="flex flex-wrap items-center gap-1.5 justify-center sm:justify-start">
                                  <h4 className="text-lg font-bold text-[#FAF9F6] font-sans group-hover:text-blue-200 transition">
                                    {char.name}
                                  </h4>
                                  
                                  {/* Display specific tags style pink */}
                                  <div className="flex flex-wrap gap-1.5 mt-1 sm:mt-0">
                                    {isTopCharacter && (
                                      <span className="px-2 py-0.5 text-[9px] font-bold bg-[#F7D943] text-[#78350F] rounded border border-yellow-500/30 uppercase">
                                        Hạng 1
                                      </span>
                                    )}
                                    {char.tags.map((t, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-0.5 text-[9px] font-bold text-pink-500 bg-pink-50 rounded border border-pink-100/50 uppercase"
                                      >
                                        {t}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <p className="text-xs text-slate-100 line-clamp-2 md:line-clamp-1 max-w-md font-sans">
                                  {char.description}
                                </p>
                              </div>
                            </div>

                            {/* Actions buttons panel: "Chat" (Blue), "Cốt truyện" (Pink) */}
                            <div className="flex items-center gap-1.5 md:gap-2.5 w-full md:w-auto shrink-0 mt-3 md:mt-0 border-t md:border-t-0 border-slate-100/85 pt-3 md:pt-0">
                              {/* Chat Button (Blue or Gray if Coming Soon) */}
                              {!char.chatbotUrl ? (
                                <button
                                  disabled
                                  id={`chat-btn-${char.id}`}
                                  className="flex-1 md:w-28 flex items-center justify-center gap-1 px-3 py-2.5 bg-[#555555]/85 text-white/80 font-bold text-xs rounded-xl shadow-sm cursor-not-allowed opacity-90"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  Sắp ra mắt
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleStartChat(char)}
                                  id={`chat-btn-${char.id}`}
                                  className="flex-1 md:w-28 flex items-center justify-center gap-1 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition duration-150 active:scale-95 cursor-pointer"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  Chat
                                </button>
                              )}

                              {/* Storyline Button (Pink) */}
                              <button
                                onClick={() => {
                                  playClickSound(480, 0.08);
                                  setStoryCharacter(char);
                                }}
                                id={`story-btn-${char.id}`}
                                className="flex-1 md:w-28 flex items-center justify-center gap-1 px-3 py-2.5 text-pink-600 bg-pink-50 hover:bg-pink-100 border border-pink-200/50 text-xs font-bold rounded-xl transition duration-150 active:scale-95 cursor-pointer"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                                Cốt truyện
                              </button>

                              {/* Profile Button */}
                              <a
                                href={char.profileUrl || "#"}
                                target={char.profileUrl ? "_blank" : undefined}
                                rel={char.profileUrl ? "noopener noreferrer" : undefined}
                                id={`profile-btn-${char.id}`}
                                className="flex-1 md:w-28 flex items-center justify-center gap-1 px-3 py-2.5 text-pink-600 bg-pink-50 hover:bg-pink-100 border border-pink-200/50 text-xs font-bold rounded-xl transition duration-150 active:scale-95 cursor-pointer"
                              >
                                <User className="w-3.5 h-3.5" />
                                Profile
                              </a>
                            </div>
                          </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Character Voting Modal */}
      <AnimatePresence>
        {isVoteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                playClickSound(300, 0.08);
                setIsVoteModalOpen(false);
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-white/10 select-none z-10 flex flex-col max-h-[85vh]"
              style={{ backgroundColor: '#4D1B12' }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-sans">🗳️</span>
                  <h3 className="text-lg md:text-xl font-black text-[#FEF3C7] uppercase tracking-tight">
                    Vote cho ghệ iu
                  </h3>
                </div>
                <button
                  onClick={() => {
                    playClickSound(300, 0.08);
                    setIsVoteModalOpen(false);
                  }}
                  className="p-1.5 rounded-full hover:bg-black/20 text-[#FEF3C7]/80 hover:text-[#FEF3C7] transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-2">
                <p className="text-xs italic text-[#FEF3C7]/80">
                  *Hãy bỏ phiếu cho chàng trai chiếm trọn trái tim bạn! Số lượt bình chọn được lưu trữ trực tuyến vĩnh viễn.*
                </p>
              </div>

              {/* Scrollable list of characters */}
              <div className="flex-1 overflow-y-auto no-scrollbar py-2 space-y-3 pr-1">
                {[...CHARACTERS].sort((a, b) => (votes[b.id] || 0) - (votes[a.id] || 0)).map((char, index) => {
                  const currentVotes = votes[char.id] || 0;
                  const isVoted = userVotedIds.includes(char.id);
                  const rank = index + 1;
                  
                  let rankColor: string | undefined = undefined;
                  if (rank === 1) rankColor = '#FFF940';
                  else if (rank === 2) rankColor = '#C9C9C3';
                  else if (rank === 3) rankColor = '#F0A029';

                  return (
                    <div
                      key={char.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200"
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center justify-center w-6 shrink-0 font-bold" style={{ color: rankColor || '#FEF3C7' }}>
                          #{rank}
                        </div>
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${char.avatarBg} flex items-center justify-center text-2xl shadow-sm shrink-0`}>
                          {char.avatar}
                        </div>
                        <div className="text-left">
                          <h4 className="font-bold text-sm md:text-base text-[#FEF3C7]" style={rankColor ? { color: rankColor } : {}}>
                            {char.name}
                          </h4>
                          <span className="text-xs font-medium text-[#FEF3C7]/70">
                            {char.tags[0]}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="text-right">
                          <div 
                            className="flex items-center gap-1 text-xs md:text-sm font-bold px-2.5 py-1 rounded-full border"
                            style={{ 
                              color: rankColor || '#FEF3C7', 
                              borderColor: rankColor ? `${rankColor}40` : 'rgba(254, 243, 199, 0.3)',
                              backgroundColor: rankColor ? `${rankColor}10` : 'rgba(254, 243, 199, 0.1)'
                            }}
                          >
                            <span>{currentVotes}</span>
                            <span style={{ color: rankColor }}>🌟</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleVote(char.id)}
                          className={`px-4 py-2 font-bold text-xs rounded-xl shadow-sm transition active:scale-95 cursor-pointer flex items-center justify-center border border-white/5 ${
                            isVoted 
                              ? 'bg-white/10 hover:bg-white/20 text-[#FEF3C7]' 
                              : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white'
                          }`}
                        >
                          {isVoted ? 'Hủy vote' : 'Bình chọn'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-white/10 text-center">
                <button
                  onClick={() => {
                    playClickSound(300, 0.08);
                    setIsVoteModalOpen(false);
                  }}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 text-[#FEF3C7] font-bold text-xs rounded-full transition-all cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Donate popup window */}
      <AnimatePresence>
        {isDonateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                playClickSound(300, 0.08);
                setIsDonateModalOpen(false);
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-[360px] mx-auto rounded-2xl p-6 shadow-2xl border border-black/5 select-none z-10 flex flex-col space-y-4 px-4"
              style={{ backgroundColor: '#F0CCE3' }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-black/10">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-sans">🎁</span>
                  <h3 className="text-lg md:text-xl font-black text-[#4D1B12] uppercase tracking-tight">
                    Góp lúa cho Tun 🌾
                  </h3>
                </div>
                <button
                  onClick={() => {
                    playClickSound(300, 0.08);
                    setIsDonateModalOpen(false);
                  }}
                  className="p-1.5 rounded-full hover:bg-black/5 text-[#4D1B12]/60 hover:text-[#4D1B12] transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-center">
                {/* Visual Title */}
                <h4 className="text-lg md:text-xl font-extrabold text-[#4D1B12] font-sans tracking-tight">
                  Góp tiền mua bim bim cho Tun 🫶🏻
                </h4>

                {/* Adorable Description */}
                <p className="text-xs text-[#4D1B12]/80 font-medium leading-relaxed">
                  Nếu bạn yêu thích các chatbot của Tun, hãy donate một chút lòng thành để mình có thêm động lực ra mắt nhiều Character hơn nha!
                </p>

                {/* QR Code Container with subtle halo */}
                <div className="relative py-2 flex justify-center">
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl transform scale-75"></div>
                  <div className="relative p-2.5 bg-white/50 rounded-2xl border border-white/60 shadow-sm">
                    <img
                      src="https://img.vietqr.io/image/970418-3510790840-compact2.png?addInfo=Donete+cho+Tun+mua+bimbim&accountName=LA+NGOC+HAN"
                      alt="Donate QR Code"
                      referrerPolicy="no-referrer"
                      className="w-44 h-44 object-cover rounded-xl border border-white shadow-inner mx-auto"
                    />
                    <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 bg-[#4D1B12] text-white text-[9px] uppercase font-extrabold px-2.5 py-0.5 rounded-full shadow-sm">
                      Scan QR Code 📸
                    </div>
                  </div>
                </div>

                {/* Detailed Bank Card copy info */}
                <div className="space-y-2.5 pt-1 text-left">
                  <p className="text-[11px] font-bold text-[#4D1B12]/70 uppercase tracking-wider pl-1">
                    Thông tin chuyển khoản
                  </p>

                  <div className="bg-white/40 rounded-2xl border border-white/60 p-3.5 space-y-3 font-sans">
                    {/* Bank Name */}
                    <div className="flex items-center justify-between gap-2.5 text-xs">
                      <div>
                        <span className="text-[#4D1B12]/70 block text-[10px]">Ngân hàng</span>
                        <span className="font-extrabold text-[#4D1B12]">
                          BIDV
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy("BIDV", "bank")}
                        className="p-1.5 rounded-lg bg-white/50 hover:bg-white border border-white/60 text-[#4D1B12]/60 hover:text-[#4D1B12] transition shrink-0 cursor-pointer"
                        title="Sao chép tên ngân hàng"
                      >
                        {copiedField === "bank" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Account number */}
                    <div className="flex items-center justify-between gap-2.5 text-xs pt-1.5 border-t border-black/5">
                      <div>
                        <span className="text-[#4D1B12]/70 block text-[10px]">Số tài khoản</span>
                        <span className="font-mono font-extrabold text-base text-[#4D1B12] tracking-wider">
                          3510790840
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy("3510790840", "account")}
                        className="p-1.5 rounded-lg bg-white/50 hover:bg-white border border-white/60 text-[#4D1B12]/60 hover:text-[#4D1B12] transition shrink-0 cursor-pointer"
                        title="Sao chép số tài khoản"
                      >
                        {copiedField === "account" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Account holder name */}
                    <div className="flex items-center justify-between gap-2.5 text-xs pt-1.5 border-t border-black/5">
                      <div>
                        <span className="text-[#4D1B12]/70 block text-[10px]">Tên chủ tài khoản</span>
                        <span className="font-extrabold text-[#4D1B12]">
                          LA NGOC HAN
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy("LA NGOC HAN", "name")}
                        className="p-1.5 rounded-lg bg-white/50 hover:bg-white border border-white/60 text-[#4D1B12]/60 hover:text-[#4D1B12] transition shrink-0 cursor-pointer"
                        title="Sao chép tên người nhận"
                      >
                        {copiedField === "name" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Syntax message */}
                    <div className="flex items-center justify-between gap-2.5 text-xs pt-1.5 border-t border-black/5">
                      <div>
                        <span className="text-[#4D1B12]/70 block text-[10px]">Cú pháp lời nhắn</span>
                        <span className="font-bold text-[#4D1B12] italic">
                          "Donate cho Tun"
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy("Donate cho Tun", "note")}
                        className="p-1.5 rounded-lg bg-white/50 hover:bg-white border border-white/60 text-[#4D1B12]/60 hover:text-[#4D1B12] transition shrink-0 cursor-pointer"
                        title="Sao chép cú pháp"
                      >
                        {copiedField === "note" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Copy pill notifications indicator */}
                <AnimatePresence>
                  {(copiedField === "bank" || copiedField === "account" || copiedField === "name" || copiedField === "note") && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="text-[10px] font-bold text-center text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-950 py-1.5 rounded-full"
                    >
                      ✓ Đã sao chép thành công vào bộ nhớ tạm!
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Close Bottom Button */}
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => {
                      playClickSound(300, 0.08);
                      setIsDonateModalOpen(false);
                    }}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-2xl transition cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Command Details Modal */}
      <AnimatePresence>
        {isCommandModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => {
                playClickSound(300, 0.08);
                setIsCommandModalOpen(false);
              }}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-md rounded-3xl p-6 shadow-2xl border border-white/10 select-none z-10 flex flex-col max-h-[85vh]"
              style={{ backgroundColor: '#4D1B12' }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg md:text-xl font-black text-[#FEF3C7] tracking-tight">
                    HỖ TRỢ NGƯỜI CHƠI 🤝
                  </h3>
                </div>
                <button
                  onClick={() => {
                    playClickSound(300, 0.08);
                    setIsCommandModalOpen(false);
                  }}
                  className="p-1.5 rounded-full hover:bg-black/20 text-[#FEF3C7]/80 hover:text-[#FEF3C7] transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-2">
                <p className="text-xs text-[#FEF3C7]/80 italic">
                  *Chọn nội dung bạn cần hỗ trợ để xem chi tiết:*
                </p>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar py-2 space-y-3 pr-1">
                <a
                  href="https://docs.google.com/document/d/1I1aGYMD0d8nfukA2ZtV2r4KewbA8JakukA2YSRuPzdc/edit?usp=drivesdk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-4 rounded-2xl border transition-all duration-200 hover:bg-white/10"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                >
                  <span className="font-bold text-base text-[#FEF3C7]">Hướng dẫn chơi 📖</span>
                </a>
                
                <a
                  href="https://docs.google.com/document/d/1BmyFxW6a22cV5mKHOGCFzRj3v-nmujSd0-J-qCOfEOQ/edit?usp=drivesdk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-4 rounded-2xl border transition-all duration-200 hover:bg-white/10"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                >
                  <span className="font-bold text-base text-[#FEF3C7]">Lệnh chống bị bonk 🛡️</span>
                </a>
              </div>

              <div className="pt-4 border-t border-white/10 text-center">
                <button
                  onClick={() => {
                    playClickSound(300, 0.08);
                    setIsCommandModalOpen(false);
                  }}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 text-[#FEF3C7] font-bold text-xs rounded-full transition-all cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Announcement popup window */}
      <AnimatePresence>
        {isAnnouncementModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => {
                playClickSound(300, 0.08);
                setIsAnnouncementModalOpen(false);
              }}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-[360px] mx-auto rounded-2xl p-6 shadow-2xl border border-white/10 select-none z-10 flex flex-col space-y-4 px-4 bg-[#1E293B]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-sans">📢</span>
                  <h3 className="text-lg md:text-xl font-black text-[#FEF3C7] tracking-tight">
                    Chi tiết thông báo
                  </h3>
                </div>
                <button
                  onClick={() => {
                    playClickSound(300, 0.08);
                    setIsAnnouncementModalOpen(false);
                  }}
                  className="p-1.5 rounded-full hover:bg-black/20 text-[#FEF3C7]/80 hover:text-[#FEF3C7] transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-center">
                <p className="text-sm text-[#FEF3C7]/90 font-medium leading-relaxed font-sans">
                  Chào mừng các nhỏ đến với góc của tun! Nếu có thắc mắc hãy vào góc hỗ trợ hoặc ib trực tiếp qua FB của Tun
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 text-center">
                <button
                  onClick={() => {
                    playClickSound(300, 0.08);
                    setIsAnnouncementModalOpen(false);
                  }}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 text-[#FEF3C7] font-bold text-xs rounded-full transition-all cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Visual Novel Storyteller dialog popup */}
      <AnimatePresence>
        {storyCharacter && (
          <StoryModal
            character={storyCharacter}
            onClose={() => {
              playClickSound(300, 0.08);
              setStoryCharacter(null);
            }}
            onStartChat={handleStartChat}
          />
        )}
      </AnimatePresence>

      {/* Footer system branding bar */}
      <footer className="mt-12 text-center text-slate-400 font-sans text-[10px] md:text-xs py-6 flex flex-col items-center gap-3 z-10 w-full max-w-4xl border-t border-white/10">
        {hasEntered && (
          <div className="flex items-center gap-3">
            <a
              href="https://discord.gg/UXYJmxXBY"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 bg-black/45 backdrop-blur-md text-white text-[10px] font-bold rounded-full border border-white/10 hover:bg-black/60 transition-all active:scale-95 flex items-center gap-1.5"
            >
              Discord 💬
            </a>
            <a
              href="https://www.facebook.com/share/18yG86eq1t/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 bg-black/45 backdrop-blur-md text-white text-[10px] font-bold rounded-full border border-white/10 hover:bg-black/60 transition-all active:scale-95 flex items-center gap-1.5"
            >
              Facebook 🌐
            </a>
          </div>
        )}
        <p className="font-semibold" style={{ color: '#EDB4E7' }}>Character Simulator by Tun</p>
      </footer>

      {/* Floating Music Button */}
      {hasEntered && (
        <div className="fixed bottom-6 right-6 z-40">
          {/* Flying music notes container */}
          {isPlaying && (
            <div className="absolute inset-0 pointer-events-none overflow-visible">
              {floatingNotes.map((note) => (
                <span
                  key={note.id}
                  className="absolute animate-float-up-fade text-[#93C5FD]/90 font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] select-none pointer-events-none"
                  style={{
                    left: note.left,
                    bottom: '45px',
                    fontSize: note.size,
                    animationDuration: note.duration,
                  }}
                >
                  {note.text}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={() => {
              playClickSound(300, 0.08);
              setIsMusicModalOpen(true);
            }}
            className={`p-4 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.15)] border border-slate-200/50 hover:scale-105 active:scale-95 transition-all group flex items-center justify-center relative ${isPlaying ? 'bg-white text-slate-800 animate-spin-slow' : 'bg-white/80 hover:bg-white text-slate-700'}`}
          >
            <Music className="w-6 h-6 text-slate-700 group-hover:text-slate-900" />
            {isPlaying && (
              <span className="absolute top-1 right-1 w-3 h-3 bg-pink-400 rounded-full animate-ping"></span>
            )}
          </button>
        </div>
      )}

      {/* Music Player Modal */}
      <AnimatePresence>
        {isMusicModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => {
                playClickSound(300, 0.08);
                setIsMusicModalOpen(false);
              }}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-[320px] mx-auto rounded-3xl p-6 shadow-2xl overflow-hidden z-10 flex flex-col"
              style={{
                background: '#3543A6',
                boxShadow: '0 25px 50px -12px rgba(32, 42, 107, 0.6)'
              }}
            >
              {/* Cloud styling decorations */}
              <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/clouds.png')" }}></div>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white rounded-full blur-3xl opacity-10"></div>
              <div className="absolute top-10 -left-10 w-24 h-24 bg-white rounded-full blur-3xl opacity-10"></div>
              
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6 relative z-10">
                <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <Music className="w-5 h-5 text-[#1DB954]" /> Spotify
                </h3>
                <div className="flex items-center gap-2">
                  {isPlaylistViewOpen && (
                    <button
                      onClick={() => {
                        playClickSound(300, 0.08);
                        setIsPlaylistViewOpen(false);
                      }}
                      className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition cursor-pointer"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      playClickSound(300, 0.08);
                      setIsMusicModalOpen(false);
                      setIsPlaylistViewOpen(false);
                    }}
                    className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="relative z-10 w-full flex-1 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {!isPlaylistViewOpen ? (
                    <motion.div
                      key="player-view"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col w-full"
                    >
                      <div className="flex flex-col items-center mb-6">
                        <div className="w-28 h-28 rounded-full bg-[#202A6B] shadow-lg flex items-center justify-center mb-4 relative overflow-hidden group border border-white/15">
                           <div className={`absolute inset-0 bg-blue-900/50 rounded-full ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }}>
                             <div className="w-full h-full opacity-90" style={{ backgroundImage: "url('https://i.pinimg.com/736x/88/df/d2/88dfd27be6fd7170abdef1921379f6e7.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                           </div>
                           <div className="w-8 h-8 rounded-full bg-[#3543A6] relative z-10 shadow-inner border border-white/20"></div>
                        </div>
                        <h4 className="text-lg font-bold text-white text-center px-4 truncate w-full">{currentSong?.title || "No track selected"}</h4>
                        <p className="text-sm text-[#FCC5E3] font-medium mt-1">{currentSong?.playlist || `Playlist #${currentTrackIndex + 1}`}</p>
                      </div>

                      <div className="w-full mb-6 relative">
                        <div className="flex items-center justify-between text-xs font-bold font-mono text-white/70 mb-2">
                          <span>{formatMusicTime(musicProgress)}</span>
                          <span>{formatMusicTime(musicDuration)}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={musicDuration || 100}
                          value={musicProgress || 0}
                          onChange={handleMusicProgressChange}
                          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                        />
                      </div>

                      <div className="flex items-center justify-center gap-6 mb-6">
                        <button onClick={playPrevTrack} className="p-2 text-white/80 hover:bg-white/10 hover:text-white rounded-full transition cursor-pointer">
                          <SkipBack className="w-6 h-6" fill="currentColor" />
                        </button>
                        <button 
                          onClick={toggleMusicPlay}
                          className="w-14 h-14 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-lg hover:bg-neutral-100 hover:scale-105 active:scale-95 transition cursor-pointer"
                        >
                          {isPlaying ? <Pause className="w-6 h-6" fill="currentColor" /> : <Play className="w-6 h-6 ml-1" fill="currentColor" />}
                        </button>
                        <button onClick={playNextTrack} className="p-2 text-white/80 hover:bg-white/10 hover:text-white rounded-full transition cursor-pointer">
                          <SkipForward className="w-6 h-6" fill="currentColor" />
                        </button>
                      </div>

                      <button 
                        onClick={() => {
                          playClickSound(300, 0.08);
                          setIsPlaylistViewOpen(true);
                        }}
                        className="w-full py-3 bg-white/10 hover:bg-white/25 border border-white/20 flex items-center justify-center gap-2 rounded-xl text-white font-bold text-sm shadow-sm transition cursor-pointer"
                      >
                        <ListMusic className="w-4 h-4" /> MỞ DANH SÁCH NHẠC
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="playlist-view"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col w-full h-[320px]"
                    >
                      {/* Current Playlist */}
                      <div className="flex-1 overflow-y-auto mb-4 pr-1 space-y-2 no-scrollbar">
                        {playlist.map((track, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              playClickSound(300, 0.08);
                              setCurrentTrackIndex(index);
                              setIsPlaying(true);
                            }}
                            className={`w-full text-left p-3 rounded-xl transition flex justify-between items-center ${index === currentTrackIndex ? 'bg-white/20 text-white shadow-md border border-white/20' : 'bg-white/5 text-white/80 hover:bg-white/10 hover:text-white'}`}
                          >
                            <span className="font-bold text-sm truncate mr-2">{track.title}</span>
                            {index === currentTrackIndex && isPlaying && (
                              <Music className="w-4 h-4 animate-pulse shrink-0 text-[#1DB954]" />
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
