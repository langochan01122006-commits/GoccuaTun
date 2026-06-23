import { useState, useEffect, useRef, CSSProperties } from "react";
import { CHARACTERS, Character } from "./characters";
import { Search, Heart, Sparkles, MessageCircle, BookOpen, Volume2, VolumeX, Moon, Sun, ArrowLeft, RotateCcw, BarChart3, Gift, Check, X, Copy, ScrollText, Music, Play, Pause, SkipBack, SkipForward, ListMusic, User, Package, PackageOpen, Megaphone, Star, Info, PenTool, DoorOpen, Flame, Shield, Map, Crown, Leaf } from "lucide-react";
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

const welcomeBgUrl = "https://i.pinimg.com/736x/8a/fd/3d/8afd3dee4740c895aca5af0194db18d2.jpg";
const mainBgUrl = "https://i.pinimg.com/736x/8a/fd/3d/8afd3dee4740c895aca5af0194db18d2.jpg";

function getRuneSymbol(tag: string): string {
  const t = tag.toLowerCase().trim();
  if (t === "tất cả") return "❂";
  if (t.includes("hiện đại")) return "⚡";
  if (t.includes("fantasy")) return "✦";
  if (t.includes("ngọt") || t.includes("sủng")) return "❤";
  if (t === "np") return "♾";
  if (t.includes("xuyên không")) return "🌀";
  if (t.includes("hài") || t.includes("vui")) return "☼";
  if (t.includes("ngược")) return "💧";
  if (t === "txvt") return "⚔";
  if (t.includes("cổ trang")) return "📜";
  if (t.includes("dark") || t.includes("hắc")) return "🖤";
  if (t.includes("ngoại tình")) return "🥀";
  if (t.includes("r18") || t.includes("21+") || t.includes("h+") || t.includes("nhạy cảm")) return "🔥";
  if (t.includes("couple")) return "♊";
  if (t.includes("age gap")) return "⏳";
  if (t.includes("size gap")) return "⇄";
  if (t.includes("slowburn")) return "🕯";
  if (t.includes("nhân thú") || t.includes("pet")) return "🐾";
  if (t.includes("côn trùng")) return "⛤";
  if (t === "bg") return "♀";
  if (t === "bl") return "♂";
  if (t === "gl") return "⚢";
  if (t.includes("việt nam")) return "🏮";
  return "✦";
}

function getTicketColorClass(tag: string): string {
  const t = tag.toLowerCase().trim();
  if (t === "tất cả") return "ticket-cream";
  if (t === "hiện đại" || t === "txvt" || t === "bl") return "ticket-lilac";
  if (t === "fantasy" || t === "xuyên không" || t === "gl") return "ticket-blue";
  if (t === "ngọt sủng" || t === "bg" || t.includes("couple")) return "ticket-pink";
  if (t === "np" || t.includes("r18") || t.includes("dark")) return "ticket-pink";
  if (t === "hài" || t === "nhân thú" || t === "côn trùng") return "ticket-mint";
  if (t === "ngược" || t === "ngoại tình" || t === "slowburn") return "ticket-blue";
  if (t === "cổ trang" || t.includes("xưa") || t.includes("gap")) return "ticket-peach";
  
  // deterministic fallback
  const code = tag.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const palettes = ["ticket-cream", "ticket-pink", "ticket-blue", "ticket-mint", "ticket-lilac", "ticket-peach"];
  return palettes[code % palettes.length];
}

interface PlushieTheme {
  bg: string;
  border: string;
  shadow: string;
  textColor: string;
  accentColor: string;
  tagBg: string;
  badge: string;
  noteText: string;
}

function getPlushieCardTheme(id: number, isTop: boolean): PlushieTheme {
  const themes: PlushieTheme[] = [
    // Pink
    {
      bg: "bg-gradient-to-b from-[#FFF2F5] via-[#FFE2EA] to-[#FFD1DE]",
      border: "border-4 border-[#FFAEC1]",
      shadow: "shadow-[inset_0_4px_10px_rgba(255,255,255,0.8),0_10px_25px_rgba(255,174,193,0.35)]",
      textColor: "text-[#C2185B]",
      accentColor: "text-[#E91E63]",
      tagBg: "bg-[#FFF0F3] border-[#FFC2D1] text-[#D81B60]",
      badge: "⭐ Đẹp nhất",
      noteText: "text-[#D81B60]/70",
    },
    // Baby Blue
    {
      bg: "bg-gradient-to-b from-[#F0F8FF] via-[#E0F2FE] to-[#D0EFFF]",
      border: "border-4 border-[#93C5FD]",
      shadow: "shadow-[inset_0_4px_10px_rgba(255,255,255,0.8),0_10px_25px_rgba(147,197,253,0.35)]",
      textColor: "text-[#1E3A8A]",
      accentColor: "text-[#2563EB]",
      tagBg: "bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]",
      badge: "⭐ Siêu cute",
      noteText: "text-[#1D4ED8]/70",
    },
    // Emerald Mint
    {
      bg: "bg-gradient-to-b from-[#F0FDF4] via-[#E6FDF0] to-[#CCFBF1]",
      border: "border-4 border-[#99F6E4]",
      shadow: "shadow-[inset_0_4px_10px_rgba(255,255,255,0.8),0_10px_25px_rgba(153,246,228,0.35)]",
      textColor: "text-[#0F766E]",
      accentColor: "text-[#0D9488]",
      tagBg: "bg-[#F0FDF4] border-[#99F6E4] text-[#0F766E]",
      badge: "⭐ Siêu mềm",
      noteText: "text-[#0F766E]/70",
    },
    // Purple Lilac
    {
      bg: "bg-gradient-to-b from-[#F9F5FF] via-[#F3E8FF] to-[#E9D5FF]",
      border: "border-4 border-[#D8B4FE]",
      shadow: "shadow-[inset_0_4px_10px_rgba(255,255,255,0.8),0_10px_25px_rgba(216,180,254,0.35)]",
      textColor: "text-[#581C87]",
      accentColor: "text-[#7E22CE]",
      tagBg: "bg-[#F9F5FF] border-[#E9D5FF] text-[#6B21A8]",
      badge: "⭐ Đáng yêu",
      noteText: "text-[#6B21A8]/70",
    },
    // Orange Peach
    {
      bg: "bg-gradient-to-b from-[#FFFDF5] via-[#FFF3DB] to-[#FFE4C4]",
      border: "border-4 border-[#FDBA74]",
      shadow: "shadow-[inset_0_4px_10px_rgba(255,255,255,0.8),0_10px_25px_rgba(253,186,116,0.35)]",
      textColor: "text-[#854D0E]",
      accentColor: "text-[#EA580C]",
      tagBg: "bg-[#FFFCEB] border-[#FED7AA] text-[#B45309]",
      badge: "⭐ Ôm sướng",
      noteText: "text-[#B45309]/70",
    }
  ];

  const index = id % themes.length;
  const theme = { ...themes[index] };

  if (isTop) {
    theme.bg = "bg-gradient-to-b from-[#FFFDF0] via-[#FFF9D6] to-[#FFEAA5]";
    theme.border = "border-4 border-[#FBBF24]";
    theme.shadow = "shadow-[inset_0_4px_12px_rgba(255,255,255,0.95),0_15px_30px_rgba(245,158,11,0.4)]";
    theme.textColor = "text-[#78350F]";
    theme.accentColor = "text-[#D97706]";
    theme.tagBg = "bg-[#FFFDF0] border-[#FDE68A] text-[#92400E]";
    theme.badge = "👑 TOP Gacha Thú Bông";
  }

  return theme;
}

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
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
  const [punchedTicketId, setPunchedTicketId] = useState<string | null>(null);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [isCommandModalOpen, setIsCommandModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [isCrystalActivated, setIsCrystalActivated] = useState(false);
  const [isSmokeAnimating, setIsSmokeAnimating] = useState(false);
  const [highlightedMenuIdx, setHighlightedMenuIdx] = useState<number>(-1);
  const [hoveredLandmark, setHoveredLandmark] = useState<number | null>(null);
  const [hoverOrb1, setHoverOrb1] = useState(false);
  const [hoverOrb2, setHoverOrb2] = useState(false);
  
  // Custom Arcade Dispenser states
  const [dispensedTicket, setDispensedTicket] = useState<'cam_nang' | 'ho_than' | null>(null);
  const [isArcadeVibrating, setIsArcadeVibrating] = useState(false);
  const [isArcadeSmoke, setIsArcadeSmoke] = useState(false);
  
  // Custom Arcade Fountain states
  const [isCoinFalling, setIsCoinFalling] = useState(false);
  const [isWaterSplashing, setIsWaterSplashing] = useState(false);
  const [splashRipples, setSplashRipples] = useState<{ id: number }[]>([]);
  
  // Music Player states
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicProgress, setMusicProgress] = useState(0);
  const [musicDuration, setMusicDuration] = useState(0);
  const [isPlaylistViewOpen, setIsPlaylistViewOpen] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [gachaResult, setGachaResult] = useState<Character | null>(null);
  const [isSummoning, setIsSummoning] = useState(false);
  const [floatingNotes, setFloatingNotes] = useState<{ id: number; text: string; left: string; size: string; duration: string; color: string }[]>([]);

  useEffect(() => {
    if (!isPlaying) {
      setFloatingNotes([]);
      return;
    }

    const noteSymbols = ["🎵", "🎶", "🎼"];
    const colors = ["#FFE79A", "#FFAE34", "#FBCFE8", "#F9A8D4"];
    const interval = setInterval(() => {
      setFloatingNotes((prev) => {
        if (prev.length >= 3) {
          return prev; // limit max concurrent notes
        }
        const id = Date.now() + Math.random();
        const text = noteSymbols[Math.floor(Math.random() * noteSymbols.length)];
        const left = `${Math.floor(Math.random() * 30) - 15}px`; // random gentler offset
        const size = `${Math.random() * 6 + 14}px`; // slightly smaller, gentler size
        const duration = `1.5s`; // shorter duration
        const color = colors[Math.floor(Math.random() * colors.length)];

        // schedule removal after 1500ms
        setTimeout(() => {
          setFloatingNotes((oldList) => oldList.filter((note) => note.id !== id));
        }, 1500);

        return [...prev, { id, text, left, size, duration, color }];
      });
    }, 1000); // 1000ms interval for fewer notes

    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    if (!isCommandModalOpen) {
      setIsCrystalActivated(false);
      setIsSmokeAnimating(false);
      setDispensedTicket(null);
      setIsArcadeVibrating(false);
      setIsArcadeSmoke(false);
    }
  }, [isCommandModalOpen]);

  const startExploreJourney = () => {
    setIsMapOpen(false);
    setIsPlaying(true);
    playClickSound(800, 0.15);

    // Dynamic sequential sweeping shimmer over the 4 menu options
    let delay = 350;
    [0, 1, 2, 3].forEach((idx) => {
      setTimeout(() => {
        setHighlightedMenuIdx(idx);
        playClickSound(340 + idx * 80, 0.08);
      }, delay + idx * 600);
    });

    // Clear highlights after completion
    setTimeout(() => {
      setHighlightedMenuIdx(-1);
    }, delay + 4 * 600);
  };

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [donateCode, setDonateCode] = useState("");
  const [donateStatus, setDonateStatus] = useState<"idle" | "success" | "error">("idle");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    
    if (isDonateModalOpen) {
      setIsCoinFalling(true);
      playClickSound(950, 0.08);
      setTimeout(() => playClickSound(1250, 0.08), 80);
      
      setTimeout(() => {
        setIsCoinFalling(false);
        setIsWaterSplashing(true);
        
        const rippleId = Date.now();
        setSplashRipples((prev) => [...prev, { id: rippleId }]);
        setTimeout(() => {
          setSplashRipples((prev) => prev.filter((r) => r.id !== rippleId));
        }, 1200);

        // Water drop bubbly resonance sequence
        playClickSound(780, 0.12);
        setTimeout(() => playClickSound(1020, 0.15), 60);
        setTimeout(() => playClickSound(1550, 0.2), 120);
      }, 450);

      setTimeout(() => {
        setIsWaterSplashing(false);
      }, 1000);
    } else {
      playClickSound(550, 0.05);
    }

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
  const [flippedCardIds, setFlippedCardIds] = useState<Record<string, boolean>>({});

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



      {/* GIAO ĐOẠN 1: MÀN HÌNH WELCOME (KHI VỪA MỞ WEB) */}
      <AnimatePresence>
        {!hasEntered && (
          <motion.div
            key="welcome-screen"
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.5, ease: "easeInOut" } }}
            className="w-full max-w-xl flex flex-col items-center justify-center min-h-[85vh] px-4 py-8 z-10 text-center relative font-sans my-auto mt-16 md:mt-24"
          >
            {/* Elegant glowing board with glassmorphic backing - Royal Burgundy Gold theme */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full border-2 border-[#FFAE34] p-8 md:p-12 rounded-[28px] shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(255,174,52,0.12)] flex flex-col items-center relative overflow-visible"
              style={{
                background: "rgba(110, 35, 20, 0.7) !important",
                backgroundColor: "rgba(110, 35, 20, 0.7)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              <div className="absolute inset-2 border border-[#FFAE34]/20 rounded-[22px] pointer-events-none" />

              {/* Glowing hollow royal crown floating precisely on top edge with floating stars */}
              <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 flex flex-col items-center z-20 pointer-events-none select-none">
                {/* Sparkles / Twinkling stars */}
                <div className="relative w-32 h-14 overflow-visible -mb-3 flex justify-center">
                  {/* Sparkle 1: Gold, top center-left */}
                  <motion.div
                    animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-2 left-6 w-3 h-3 text-[#FFAE34] filter drop-shadow-[0_0_4px_#FFAE34]"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2 Q12 12 22 12 Q12 12 12 22 Q12 12 2 12 Q12 12 12 2" />
                    </svg>
                  </motion.div>

                  {/* Sparkle 2: Cyan/Blue, top center-right */}
                  <motion.div
                    animate={{ y: [-3, 1, -3], opacity: [0.6, 1, 0.6], scale: [1, 0.7, 1] }}
                    transition={{ duration: 2.7, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                    className="absolute top-0 right-8 w-4 h-4 text-[#4DEEEA] filter drop-shadow-[0_0_6px_#4DEEEA]"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2 Q12 12 22 12 Q12 12 12 22 Q12 12 2 12 Q12 12 12 2" />
                    </svg>
                  </motion.div>

                  {/* Sparkle 3: Gold, further left, very tiny */}
                  <motion.div
                    animate={{ y: [2, -2, 2], opacity: [0.2, 0.9, 0.2] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                    className="absolute top-6 left-2 w-2.5 h-2.5 text-[#FFE79A] filter drop-shadow-[0_0_3px_#FFE79A]"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2 Q12 12 22 12 Q12 12 12 22 Q12 12 2 12 Q12 12 12 2" />
                    </svg>
                  </motion.div>

                  {/* Sparkle 4: Cyan/Blue, further right, tiny */}
                  <motion.div
                    animate={{ y: [-1, 3, -1], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 2.3, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
                    className="absolute top-5 right-3 w-2.5 h-2.5 text-[#60a5fa] filter drop-shadow-[0_0_3px_#60a5fa]"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2 Q12 12 22 12 Q12 12 12 22 Q12 12 2 12 Q12 12 12 2" />
                    </svg>
                  </motion.div>
                </div>

                {/* Custom Royal Crown sitting directly on the line */}
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="flex items-center justify-center -mt-4"
                >
                  <svg viewBox="0 0 100 65" className="w-20 h-16 overflow-visible select-none filter drop-shadow-[0_0_15px_rgba(255,174,52,0.95)]">
                    {/* Crown base solid dark fill to prevent background border crossing */}
                    <path
                      d="M 12 43 L 22 18 L 38 36 L 50 10 L 62 36 L 78 18 L 88 43 L 85 50 L 15 50 Z"
                      fill="rgba(110, 35, 20, 0.98)"
                    />
                    
                    {/* Crown Body Path (Hollow style) */}
                    <path
                      d="M 15 50 L 12 43 L 22 18 L 38 36 L 50 10 L 62 36 L 78 18 L 88 43 L 85 50"
                      fill="none"
                      stroke="#FFAE34"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    
                    {/* Crown Base Line */}
                    <path
                      d="M 8 50 L 92 50"
                      stroke="#FFAE34"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    
                    {/* Thin royal inner accent line */}
                    <path
                      d="M 14 46 L 86 46"
                      stroke="#FFE79A"
                      strokeWidth="1.2"
                      opacity="0.8"
                    />
                    
                    {/* Peaks royal jewels */}
                    <circle cx="22" cy="18" r="3" fill="#FFE79A" stroke="#FFAE34" strokeWidth="1" />
                    <circle cx="50" cy="10" r="3.5" fill="#FFE79A" stroke="#FFAE34" strokeWidth="1" />
                    <circle cx="78" cy="18" r="3" fill="#FFE79A" stroke="#FFAE34" strokeWidth="1" />
                    
                    {/* Inner accent diamond in the center */}
                    <path d="M 50 25 L 46 31 L 50 37 L 54 31 Z" fill="#FFE79A" stroke="#FFAE34" strokeWidth="0.5" />
                    <circle cx="34" cy="38" r="1.5" fill="#FFE79A" />
                    <circle cx="66" cy="38" r="1.5" fill="#FFE79A" />
                  </svg>
                </motion.div>
              </div>

              <div className="absolute top-4 left-4 text-[#FFAE34]/40 animate-pulse">✦</div>
              <div className="absolute bottom-4 right-4 text-[#FFAE34]/40 animate-pulse">✦</div>
              <div className="absolute top-1/4 right-6 text-pink-400/20 animate-pulse">✨</div>
              <div className="absolute bottom-1/4 left-6 text-blue-400/20 animate-pulse">✨</div>

              {/* Spacer for Floating Crown */}
              <div className="h-6" />

              <h1 
                className="text-3xl md:text-5xl font-serif italic font-black tracking-widest drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] mb-2 uppercase select-none"
                style={{
                  color: "#FFE79A",
                  textShadow: "0 0 10px #FFAE34",
                }}
              >
                KHU GIẢI TRÍ CỦA TUN
              </h1>
              
              <div className="text-sm font-serif font-black text-[#FFE79A] tracking-[0.15em] mb-5 uppercase select-none">
                [ Góc của Tun ]
              </div>

              <p className="text-sm md:text-base text-white/90 leading-relaxed font-serif italic max-w-sm mb-8 filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] select-none">
                “Nơi những câu chuyện ma thuật bắt đầu...”
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{ boxShadow: ["0 0 10px rgba(255,174,52,0.3)", "0 0 25px rgba(255,174,52,0.65)", "0 0 10px rgba(255,174,52,0.3)"] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                onClick={() => {
                  playClickSound(600, 0.1);
                  setHasEntered(true);
                  setIsMapOpen(true);
                  setIsPlaying(true);
                }}
                className="relative w-full max-w-xs py-4 px-8 font-serif font-black text-[#6E2314] rounded-xl hover:brightness-110 active:scale-95 duration-150 cursor-pointer overflow-visible group tracking-[0.2em] text-xs uppercase"
                style={{
                  background: "linear-gradient(135deg, #FFAE34, #FFE79A, #FFAE34)",
                }}
              >
                {/* Left ticket cutout notch */}
                <div 
                  className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-r border-[#FFAE34]/35 z-10"
                  style={{ backgroundColor: "rgba(110, 35, 20, 1)" }}
                />
                {/* Right ticket cutout notch */}
                <div 
                  className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-l border-[#FFAE34]/35 z-10"
                  style={{ backgroundColor: "rgba(110, 35, 20, 1)" }}
                />

                <span className="relative z-10 flex items-center justify-center gap-1.5 font-bold">
                  XÉ VÉ VÀO CỔNG 🎟️
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </motion.button>
            </motion.div>

            {/* Global Gradients for Orbs */}
            <svg width="0" height="0" className="absolute">
              <defs>
                <linearGradient id="keyGoldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffe082" />
                  <stop offset="30%" stopColor="#ffd175" />
                  <stop offset="70%" stopColor="#d4af37" />
                  <stop offset="100%" stopColor="#8b7355" />
                </linearGradient>
                <radialGradient id="nebulaPurpleGold" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(124, 58, 237, 0.60)" />
                  <stop offset="35%" stopColor="rgba(99, 102, 241, 0.40)" />
                  <stop offset="70%" stopColor="rgba(255, 231, 154, 0.15)" />
                  <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
                </radialGradient>
              </defs>
            </svg>

            {/* 2 Constellation Orbs at the bottom */}
            <div className="grid grid-cols-2 gap-12 md:gap-16 w-full mt-12 px-4 justify-items-center">
              {/* Orb 1: Discord Constellation */}
              <motion.a
                href="https://discord.gg/UXYJmxXBY"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playClickSound(500, 0.15)}
                onMouseEnter={() => setHoverOrb1(true)}
                onMouseLeave={() => setHoverOrb1(false)}
                className="flex flex-col items-center justify-center select-none cursor-pointer focus:outline-none group relative no-underline w-full max-w-[140px]"
              >
                {/* Floating parent */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                  className="flex flex-col items-center w-full"
                >
                  {/* Glowing breathing orb structure */}
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-24 h-24 flex items-center justify-center relative rounded-full"
                  >
                    {/* Pulsing Outer Nebula Glow */}
                    <div 
                      className={`absolute inset-0 rounded-full transition-all duration-700 blur-md pointer-events-none ${
                        hoverOrb1 ? "scale-125 opacity-100 bg-[#7c3aed]/25" : "scale-100 opacity-60 bg-[#4f46e5]/10"
                      }`}
                    />

                    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible relative z-10">
                      {/* Celestial Nebula backing */}
                      <circle cx="50" cy="50" r="46" fill="url(#nebulaPurpleGold)" className="transition-transform duration-700 group-hover:scale-110" />
                      
                      {/* Astrological compass ring / stellar dial */}
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#FFAE34" strokeWidth="0.5" strokeDasharray="1 6" className="animate-[spin_40s_linear_infinite] opacity-40 group-hover:opacity-60 transition-opacity" />
                      <circle cx="50" cy="50" r="38" fill="none" stroke="#FFE79A" strokeWidth="0.5" strokeDasharray="4 4" className="animate-[spin_60s_linear_infinite_reverse] opacity-20 group-hover:opacity-40 transition-opacity" />

                      {/* Constellation Star coordinates/vertices connecting logic */}
                      <g className="transition-opacity duration-500" style={{ opacity: hoverOrb1 ? 0.35 : 0 }}>
                        <line x1="50" y1="12" x2="50" y2="88" stroke="#FFE79A" strokeWidth="0.5" />
                        <line x1="12" y1="50" x2="88" y2="50" stroke="#FFE79A" strokeWidth="0.5" />
                        <line x1="23" y1="23" x2="77" y2="77" stroke="#FFE79A" strokeWidth="0.5" />
                        <line x1="23" y1="77" x2="77" y2="23" stroke="#FFE79A" strokeWidth="0.5" />
                      </g>

                      {/* Sparkly random stars in the sky map */}
                      <circle cx="28" cy="24" r="1" fill="#FFF5B8" className="animate-pulse" />
                      <circle cx="76" cy="32" r="0.8" fill="#FFFFFF" style={{ animationDelay: '1s' }} className="animate-pulse" />
                      <circle cx="18" cy="65" r="1.2" fill="#FFE79A" style={{ animationDelay: '2.5s' }} className="animate-pulse" />
                      <circle cx="82" cy="74" r="1" fill="#FFFFFF" style={{ animationDelay: '1.8s' }} className="animate-pulse" />
                      <circle cx="45" cy="84" r="0.8" fill="#FFF5B8" style={{ animationDelay: '0.5s' }} className="animate-pulse" />

                      {/* Discord Constellation Pathway */}
                      <g transform="translate(24, 28) scale(0.40)">
                        <path
                          d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.43-5c1,.73,2,1.48,3,2.2a75,75,0,0,0,51.72,0c1-.72,2-1.47,3-2.2a68.43,68.43,0,0,1-10.43,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83C129,54.65,123.48,31.58,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"
                          fill="none"
                          stroke="url(#keyGoldGradient)"
                          className="transition-all duration-700"
                          style={{
                            strokeWidth: hoverOrb1 ? 2.5 : 1.5,
                            strokeDasharray: hoverOrb1 ? "none" : "2.5 10",
                            fill: hoverOrb1 ? "rgba(255, 231, 154, 0.16)" : "rgba(255, 255, 255, 0.04)",
                            filter: hoverOrb1 ? "drop-shadow(0 0 10px #FFD54F)" : "drop-shadow(0 0 1px rgba(255,255,255,0.2))",
                            transition: "all 0.8s cubic-bezier(0.25, 1, 0.5, 1)",
                          }}
                        />
                      </g>
                    </svg>
                  </motion.div>

                  {/* Text descriptions */}
                  <span className="text-xs font-serif font-black tracking-[0.15em] text-[#FFE79A] uppercase text-center mt-3 group-hover:text-amber-200 duration-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    Chòm Sao Discord
                  </span>
                  <span className="text-[9px] font-serif text-[#ffd175]/60 mt-0.5 italic group-hover:text-white/80 duration-300">
                    “Phím tào & Gặp gỡ”
                  </span>
                </motion.div>
              </motion.a>

              {/* Orb 2: Facebook Constellation */}
              <motion.a
                href="https://www.facebook.com/share/18yG86eq1t/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playClickSound(550, 0.15)}
                onMouseEnter={() => setHoverOrb2(true)}
                onMouseLeave={() => setHoverOrb2(false)}
                className="flex flex-col items-center justify-center select-none cursor-pointer focus:outline-none group relative no-underline w-full max-w-[140px]"
              >
                {/* Floating parent with offset delay */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                  className="flex flex-col items-center w-full"
                >
                  {/* Glowing breathing orb structure */}
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
                    className="w-24 h-24 flex items-center justify-center relative rounded-full"
                  >
                    {/* Pulsing Outer Nebula Glow */}
                    <div 
                      className={`absolute inset-0 rounded-full transition-all duration-700 blur-md pointer-events-none ${
                        hoverOrb2 ? "scale-125 opacity-100 bg-[#7c3aed]/25" : "scale-100 opacity-60 bg-[#4f46e5]/10"
                      }`}
                    />

                    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible relative z-10">
                      {/* Celestial Nebula backing */}
                      <circle cx="50" cy="50" r="46" fill="url(#nebulaPurpleGold)" className="transition-transform duration-700 group-hover:scale-110" />
                      
                      {/* Astrological compass ring / stellar dial */}
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#FFAE34" strokeWidth="0.5" strokeDasharray="1 6" className="animate-[spin_35s_linear_infinite] opacity-40 group-hover:opacity-60 transition-opacity" />
                      <circle cx="50" cy="50" r="38" fill="none" stroke="#FFE79A" strokeWidth="0.5" strokeDasharray="4 4" className="animate-[spin_50s_linear_infinite_reverse] opacity-20 group-hover:opacity-40 transition-opacity" />

                      {/* Constellation Star coordinates/vertices connecting logic */}
                      <g className="transition-opacity duration-500" style={{ opacity: hoverOrb2 ? 0.35 : 0 }}>
                        <line x1="50" y1="12" x2="50" y2="88" stroke="#FFE79A" strokeWidth="0.5" />
                        <line x1="12" y1="50" x2="88" y2="50" stroke="#FFE79A" strokeWidth="0.5" />
                        <line x1="23" y1="23" x2="77" y2="77" stroke="#FFE79A" strokeWidth="0.5" />
                        <line x1="23" y1="77" x2="77" y2="23" stroke="#FFE79A" strokeWidth="0.5" />
                      </g>

                      {/* Sparkly random stars in the sky map */}
                      <circle cx="72" cy="21" r="1.1" fill="#FFF5B8" className="animate-pulse" />
                      <circle cx="21" cy="35" r="0.9" fill="#FFFFFF" style={{ animationDelay: '1.2s' }} className="animate-pulse" />
                      <circle cx="85" cy="58" r="0.7" fill="#FFE79A" style={{ animationDelay: '2.1s' }} className="animate-pulse" />
                      <circle cx="15" cy="78" r="1.3" fill="#FFFFFF" style={{ animationDelay: '0.8s' }} className="animate-pulse" />
                      <circle cx="58" cy="82" r="1" fill="#FFF5B8" style={{ animationDelay: '2.7s' }} className="animate-pulse" />

                      {/* Facebook Constellation Pathway */}
                      <g transform="translate(32.5, 23) scale(1.45)">
                        <path
                          d="M19 12h-3V9.5c0-.83.67-1.5 1.5-1.5H19V5h-3.5C12.46 5 10 7.46 10 10.5V12H8v3h2v9h4v-9h3.5l.5-3z"
                          fill="none"
                          stroke="url(#keyGoldGradient)"
                          className="transition-all duration-700"
                          style={{
                            strokeWidth: hoverOrb2 ? 2.5 : 1.5,
                            strokeDasharray: hoverOrb2 ? "none" : "2.5 8",
                            fill: hoverOrb2 ? "rgba(255, 231, 154, 0.16)" : "rgba(255, 255, 255, 0.04)",
                            filter: hoverOrb2 ? "drop-shadow(0 0 10px #FFD54F)" : "drop-shadow(0 0 1px rgba(255,255,255,0.2))",
                            transition: "all 0.8s cubic-bezier(0.25, 1, 0.5, 1)",
                          }}
                        />
                      </g>
                    </svg>
                  </motion.div>

                  {/* Text descriptions */}
                  <span className="text-xs font-serif font-black tracking-[0.15em] text-[#FFE79A] uppercase text-center mt-3 group-hover:text-amber-200 duration-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    Chòm Sao Facebook
                  </span>
                  <span className="text-[9px] font-serif text-[#ffd175]/60 mt-0.5 italic group-hover:text-white/80 duration-300">
                    “Tin tức & Kết nối”
                  </span>
                </motion.div>
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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


      {/* Traveler's Map Modal Overlay on top of the main portal website */}
      <AnimatePresence>
        {isMapOpen && (
          <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto z-50">
            {/* Backdrop behind the map providing beautiful glassmorphism backdrop blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={startExploreJourney}
              className="absolute inset-0"
              style={{
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                background: "rgba(0, 0, 0, 0.6)"
              }}
            />

            {/* Quick floating theme & sound controls on the map screen */}
            <div className="absolute top-6 right-6 flex items-center gap-2 z-30">
              <button
                onClick={cycleBackdropTheme}
                className={`magic-candle-btn ${backdropTheme === "cosmic" ? "lit" : "unlit"}`}
                title="Thay đổi màu nền chủ đề"
              >
                <Flame className="w-4 h-4 magic-candle-flame" />
              </button>
              <button
                onClick={() => {
                  setIsSoundOn(!isSoundOn);
                  if (!isSoundOn) playClickSound(600, 0.05);
                }}
                className="p-2 transition duration-150 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/20 text-white active:scale-95 flex items-center justify-center cursor-pointer"
                title={isSoundOn ? "Tắt âm thanh thông báo" : "Bật âm thanh thông báo"}
              >
                {isSoundOn ? <Volume2 className="w-4 h-4 text-pink-400 animate-pulse" /> : <VolumeX className="w-4 h-4 text-[#eedebd]/60" />}
              </button>
            </div>

            {/* Traveler's Map Parchment Container */}
            <motion.div
              key="parchment-map"
              initial={{ scaleX: 0.02, scaleY: 0.85, opacity: 0 }}
              animate={{ scaleX: 1, scaleY: 1, opacity: 1 }}
              exit={{ scaleY: 0.05, opacity: 0, transition: { duration: 0.45, ease: "easeInOut" } }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-[580px] parchment-container p-6 md:p-8 flex flex-col items-center overflow-visible select-none border-amber-950/40 shadow-2xl my-auto"
            >
              {/* Wooden rollers layout on left and right for scroll unrolling feel */}
              <div className="absolute left-[-4px] top-0 bottom-0 w-3.5 bg-gradient-to-r from-[#1c0c04] via-[#4d260c] to-[#1c0c04] rounded-l-md border-r border-amber-900/40 shadow-md pointer-events-none" />
              <div className="absolute right-[-4px] top-0 bottom-0 w-3.5 bg-gradient-to-l from-[#1c0c04] via-[#4d260c] to-[#1c0c04] rounded-r-md border-l border-amber-900/40 shadow-md pointer-events-none" />

              {/* Stylized Close Button 'X' */}
              <button
                onClick={startExploreJourney}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#5d4037] hover:bg-[#4e342e] border border-amber-900/40 text-[#eedebd] flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-all text-sm font-bold z-30"
                title="Đóng bản đồ"
              >
                ✕
              </button>

              {/* Magical map title */}
              <div className="text-center space-y-1.5 md:space-y-2 mt-4 px-4 z-10">
                <motion.h2 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="text-2xl md:text-3xl font-serif font-black tracking-[0.2em] text-[#4e342e] uppercase filter drop-shadow-[0_1.5px_1px_rgba(255,255,255,0.7)]"
                >
                  BẢN ĐỒ ĐỊNH MỆNH CHỈ ĐƯỜNG 🗺️
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.75 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="text-[10px] md:text-xs font-handwritten text-[#795548] uppercase tracking-wide italic font-bold"
                >
                  【 Thăng hoa lộ trình, bảo điển thiên cơ dẫn bước 】
                </motion.p>
              </div>

              {/* Interactive Map Illustration Stage */}
              <div className="relative w-full aspect-[4/3] sm:aspect-[4/3] bg-[#eedcbd]/35 border border-[#8d6e63]/30 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center mt-6">
                
                {/* Vintage windrose decoration */}
                <div className="absolute top-[35%] left-[45%] opacity-[0.06] select-none pointer-events-none">
                  <svg className="w-56 h-56 animate-spin" style={{ animationDuration: '40s' }} viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#5d4037" strokeWidth="1" />
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#5d4037" strokeWidth="0.5" strokeDasharray="2,2" />
                    <path d="M50 5 L50 95 M5 50 L95 50 M18 18 L82 82 M18 82 L82 18" stroke="#5d4037" strokeWidth="0.8" />
                    <polygon points="50,50 50,20 53,35" fill="#5d4037" />
                    <polygon points="50,50 50,20 47,35" fill="#5d4037" opacity="0.5" />
                    <polygon points="50,50 50,80 47,65" fill="#5d4037" />
                    <polygon points="50,50 50,80 53,65" fill="#5d4037" opacity="0.5" />
                  </svg>
                </div>

                {/* Magic connected paths using relative coordinates */}
                <svg className="absolute inset-x-0 inset-y-0 w-full h-full pointer-events-none z-0" viewBox="0 0 500 300" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="parchment-magic-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#d97706" />
                      <stop offset="50%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#be123c" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 110 90 Q 250 40, 390 100 Q 250 180, 130 220 Q 250 270, 370 200"
                    fill="none"
                    stroke="url(#parchment-magic-grad)"
                    strokeWidth="2.5"
                    className="map-magic-path opacity-65"
                  />
                </svg>

                {/* Landmarks list rendering mapping */}
                <div className="absolute inset-0 z-10">
                  {/* Point 1: Vé Ưu Tiên 🌟  Coordinates: left: 22%, top: 30% */}
                  <div 
                    style={{ left: "22%", top: "30%" }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                  >
                    <div
                      onMouseEnter={() => {
                        setHoveredLandmark(1);
                        playClickSound(480, 0.03);
                      }}
                      onMouseLeave={() => setHoveredLandmark(null)}
                      onClick={() => {
                        playClickSound(500, 0.1);
                        setIsMapOpen(false);
                        setIsVoteModalOpen(true);
                        setIsDonateModalOpen(false);
                        setIsCommandModalOpen(false);
                      }}
                      className="cursor-pointer hover:scale-110 active:scale-95 transition-all duration-300"
                    >
                      {/* Stylized Golden Gate Ticket */}
                      <div className="relative flex flex-col items-center">
                        <div className="absolute -inset-2 bg-yellow-400/20 rounded-full blur-[8px] animate-pulse" />
                        <div className="relative w-12 h-9 bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 rounded-sm border border-yellow-200/60 shadow-md flex items-center justify-center overflow-hidden">
                          <div className="absolute left-[-4px] w-2.5 h-2.5 rounded-full bg-[#faedd6]" />
                          <div className="absolute right-[-4px] w-2.5 h-2.5 rounded-full bg-[#faedd6]" />
                          <Star className="w-5 h-5 text-white filter drop-shadow-[0_0_3px_#fff]" fill="currentColor" />
                        </div>
                      </div>
                    </div>
                    {/* Tiny visual text overlay with hand-written font */}
                    <div className="mt-1 px-1.5 py-0.5 bg-[#fbf5e6]/95 border border-[#8d6e63]/40 rounded shadow-sm">
                      <span className="font-serif font-black text-[9px] text-[#4e342e] whitespace-nowrap">
                        Vé Ưu Tiên 🌟
                      </span>
                    </div>
                  </div>

                  {/* Point 2: Giếng Ước Nguyện 🔮 Coordinates: left: 78%, top: 33% */}
                  <div 
                    style={{ left: "78%", top: "33%" }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                  >
                    <div
                      onMouseEnter={() => {
                        setHoveredLandmark(2);
                        playClickSound(480, 0.03);
                      }}
                      onMouseLeave={() => setHoveredLandmark(null)}
                      onClick={() => {
                        playClickSound(500, 0.1);
                        setIsMapOpen(false);
                        setIsDonateModalOpen(true);
                        setIsVoteModalOpen(false);
                        setIsCommandModalOpen(false);
                      }}
                      className="cursor-pointer hover:scale-110 active:scale-95 transition-all duration-300"
                    >
                      {/* Stylized stone well */}
                      <div className="relative flex flex-col items-center">
                        <div className="absolute -inset-3 bg-indigo-500/15 rounded-full blur-[10px]" />
                        <div className="relative w-11 h-11 flex flex-col items-center">
                          {/* Well base */}
                          <div className="w-9 h-6 bg-gradient-to-b from-stone-500 to-stone-700 rounded-b-md border border-stone-400 shadow flex items-center justify-center mt-2.5">
                            <span className="text-[8px] text-stone-300">🧱</span>
                          </div>
                          {/* Roof and posts */}
                          <div className="absolute top-0.5 w-[38px] h-2 bg-red-800 rounded border-b border-red-950" />
                          <div className="absolute top-1.5 w-[1px] h-3 bg-stone-600 left-[4px]" />
                          <div className="absolute top-1.5 w-[1px] h-3 bg-stone-600 right-[4px]" />
                          <div className="absolute top-1 rotate-[45deg] animate-pulse text-[8px] z-10 bg-purple-500/80 rounded-full w-3.5 h-3.5 flex items-center justify-center">
                            🔮
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-1 px-1.5 py-0.5 bg-[#fbf5e6]/95 border border-[#8d6e63]/40 rounded shadow-sm">
                      <span className="font-serif font-black text-[9px] text-[#4e342e] whitespace-nowrap">
                        Giếng Ước Nguyện 🔮
                      </span>
                    </div>
                  </div>

                  {/* Point 3: Quầy Hướng Dẫn 🎪 Coordinates: left: 26%, top: 73% */}
                  <div 
                    style={{ left: "26%", top: "73%" }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                  >
                    <div
                      onMouseEnter={() => {
                        setHoveredLandmark(3);
                        playClickSound(480, 0.03);
                      }}
                      onMouseLeave={() => setHoveredLandmark(null)}
                      onClick={() => {
                        playClickSound(500, 0.1);
                        setIsMapOpen(false);
                        setIsCommandModalOpen(true);
                      }}
                      className="cursor-pointer hover:scale-110 active:scale-95 transition-all duration-300"
                    >
                      {/* Elegant Velvet Merchant Tent */}
                      <div className="relative flex flex-col items-center">
                        <div className="absolute -inset-2 bg-rose-400/15 rounded-full blur-[8px]" />
                        <div className="w-11 h-10 bg-gradient-to-b from-rose-600 to-indigo-900 border border-purple-300/40 rounded-t-xl shadow-md flex items-center justify-center relative">
                          <div className="absolute top-[-5px] w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-yellow-400" />
                          <div className="w-3.5 h-3.5 rounded-full bg-cyan-300 border border-white/50 shadow-[0_0_6px_#22d3ee] animate-pulse absolute bottom-1" />
                          <div className="absolute inset-y-0 left-0 w-2 bg-rose-850 rounded-tl-xl border-r border-[#ffe79a]/10" />
                          <div className="absolute inset-y-0 right-0 w-2 bg-rose-850 rounded-tr-xl border-l border-[#ffe79a]/10" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-1 px-1.5 py-0.5 bg-[#fbf5e6]/95 border border-[#8d6e63]/40 rounded shadow-sm">
                      <span className="font-serif font-black text-[9px] text-[#4e342e] whitespace-nowrap">
                        Quầy Hướng Dẫn 🎪
                      </span>
                    </div>
                  </div>

                  {/* Point 4: Lưu Bút Du Khách 📜 Coordinates: left: 74%, top: 67% */}
                  <div 
                    style={{ left: "74%", top: "67%" }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                  >
                    <a
                      href="https://www.facebook.com/share/18yG86eq1t/?mibextid=wwXIfr"
                      target="_blank"
                      rel="noopener noreferrer"
                      onMouseEnter={() => {
                        setHoveredLandmark(4);
                        playClickSound(480, 0.03);
                      }}
                      onMouseLeave={() => setHoveredLandmark(null)}
                      onClick={() => {
                        playClickSound(500, 0.1);
                        setIsMapOpen(false);
                      }}
                      className="cursor-pointer hover:scale-110 active:scale-95 transition-all duration-300 flex flex-col items-center"
                    >
                      {/* Elegant handwriting feather & book scroll */}
                      <div className="relative flex flex-col items-center">
                        <div className="absolute -inset-2 bg-amber-400/10 rounded-full blur-[8px]" />
                        <div className="w-11 h-9 bg-[#fefaca] border-2 border-amber-900/80 rounded shadow-md transform -rotate-3 relative flex items-center justify-center border-l-[3px] border-l-amber-950">
                          <BookOpen className="w-4 h-4 text-amber-900/60" />
                          <div className="absolute -top-3.5 -right-1 rotate-[30deg] origin-bottom animate-bounce text-[10px]">
                            ✍️
                          </div>
                        </div>
                      </div>
                    </a>
                    <div className="mt-1 px-1.5 py-0.5 bg-[#fbf5e6]/95 border border-[#8d6e63]/40 rounded shadow-sm">
                      <span className="font-serif font-black text-[9px] text-[#4e342e] whitespace-nowrap">
                        Lưu Bút Du Khách 📜
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* High-fidelity handwritten notes board explaining detail on mouse hover */}
              <div className="w-full mt-4 px-4 py-2 bg-[#fdf8ed] border border-[#d7ccc8] rounded-xl relative shadow-md overflow-hidden flex flex-col items-center justify-center text-center">
                <div className="absolute inset-0 bg-gradient-to-b from-[#fbf5e6]/20 to-[#f3e5c8]/30 mix-blend-multiply opacity-80 pointer-events-none" />
                
                <h4 className="text-[10px] sm:text-xs font-serif font-black tracking-wider text-[#5d4037] uppercase flex items-center gap-1.5 z-10">
                  {hoveredLandmark === 1 && <span>🎯 🌟 VÉ ƯU TIÊN</span>}
                  {hoveredLandmark === 2 && <span>🎯 🔮 GIẾNG ƯỚC NGUYỆN</span>}
                  {hoveredLandmark === 3 && <span>🎯 🎪 QUẦY HƯỚNG DẪN</span>}
                  {hoveredLandmark === 4 && <span>🎯 📜 LƯU BÚT DU KHÁCH</span>}
                  {hoveredLandmark === null && <span className="animate-pulse">🗺️ TÌNH TRẠNG CHỈ THỊ GIAO CƠ</span>}
                </h4>
                
                <p className="text-[13px] md:text-base font-handwritten text-[#3e2723] italic h-8 flex items-center justify-center select-none z-10 transition-all duration-200">
                  {hoveredLandmark === 1 && "“Nơi đón nhận những đặc quyền tối thượng.”"}
                  {hoveredLandmark === 2 && "“Thả một đồng xu, định mệnh sẽ trả lời bạn.”"}
                  {hoveredLandmark === 3 && "“Lều tiên tri giải đáp mọi thắc mắc của lữ khách.”"}
                  {hoveredLandmark === 4 && "“Ghi lại dấu chân của bạn tại thánh điện này.”"}
                  {hoveredLandmark === null && "* Di chuột hoặc chạm vào kỷ vật lấp lánh để triệu hồi gợi ý mật thư *"}
                </p>
              </div>

              {/* Nút "Bước Vào Lâu Đài" at bottom of map */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="w-full mt-6 z-20"
              >
                <button
                  onClick={startExploreJourney}
                  className="w-full py-4 text-base font-bold shadow-lg hover:brightness-105 active:scale-95 transition-all text-amber-100 hover:text-white rounded-md border-y border-[#ffd54f]/50 cursor-pointer flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: "#6D4C41",
                    backgroundImage: "linear-gradient(to bottom, #795548, #5d4037)",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)"
                  }}
                >
                  🏰 BƯỚC VÀO LÂU ĐÀI ➜
                </button>
              </motion.div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main website content renders when entered */}
      {hasEntered && (
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
                className="portal-back-btn group"
              >
                <DoorOpen className="w-4 h-4 portal-back-icon" />
                <span>Trở Về Cổng Chính</span>
              </button>

              {/* Minimalist round tool buttons at the top right */}
              <div className="flex items-center gap-1.5 md:gap-2">
                {/* Cycle backgrounds selector */}
                <button
                  onClick={cycleBackdropTheme}
                  id="top-cycle-theme"
                  className={`magic-candle-btn ${backdropTheme === "cosmic" ? "lit" : "unlit"}`}
                  title={`Giao diện hiện tại: ${
                    backdropTheme === "pastel" ? "Pastel Nhật Bản" : backdropTheme === "sunset" ? "Hoàng Hôn Lãng Mạn" : "Thiên Hà Huyền Bí"
                  }`}
                >
                  <Flame className="w-4 h-4 magic-candle-flame" />
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
              className="w-full py-2 md:py-2.5 px-3 md:px-4 cursor-pointer group flex transition-all items-center gap-2 relative z-20 royal-ribbon-bar"
            >
              <div className="shrink-0 flex items-center z-10">
                <div className="flex items-center justify-center w-6 h-6 md:w-7 md:h-7 shrink-0">
                  <Megaphone className="w-4 h-4 md:w-5 md:h-5 text-[#FFAE34]" style={{ color: '#FFAE34' }} fill="#FFAE34" />
                </div>
              </div>
              <div className="flex-1 overflow-hidden relative h-5 md:h-6 flex items-center" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
                <div 
                  className="flex animate-marquee whitespace-nowrap text-xs md:text-sm font-bold tracking-wide"
                  style={{ textShadow: "1px 1px 4px rgba(0, 0, 0, 0.85)", color: '#FFE79A' }}
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 w-full">
                    {/* Pink sen button (Góc trái) */}
                    <button
                      onClick={() => {
                        playClickSound(500, 0.1);
                        setIsVoteModalOpen(true);
                        setIsDonateModalOpen(false);
                        setIsCommandModalOpen(false);
                      }}
                      id="welcome-vote-btn"
                      className={`w-full flex items-center justify-center gap-1 py-3 pr-1 pl-4.5 min-[375px]:pl-5 md:pr-2 md:pl-6 rounded-md font-bold royal-card-btn shadow-md active:scale-95 transform hover:-translate-y-0.5 text-[9.5px] min-[320px]:text-[10px] min-[375px]:text-[11px] md:text-xs lg:text-sm cursor-pointer text-center relative whitespace-nowrap ${highlightedMenuIdx === 0 ? "shimmer-sweep-active" : ""}`}
                    >
                      <div className="ticket-stub-line"></div>
                      <Star className="w-3 h-3 md:w-4 md:h-4 relative z-10 shrink-0 text-[#FFAE34]" fill="#FFAE34" />
                      <span className="relative z-10">Vé Ưu Tiên ⭐</span>
                    </button>

                    {/* Orange button (Góc phải) - Updated to Blue Donate✨ */}
                    <button
                      onClick={() => {
                        playClickSound(500, 0.1);
                        setIsDonateModalOpen(true);
                        setIsVoteModalOpen(false);
                        setIsCommandModalOpen(false);
                      }}
                      id="welcome-donate-btn"
                      className={`w-full flex items-center justify-center gap-1 py-3 pr-1 pl-4.5 min-[375px]:pl-5 md:pr-2 md:pl-6 rounded-md font-bold royal-card-btn shadow-md active:scale-95 transform hover:-translate-y-0.5 text-[9.5px] min-[320px]:text-[10px] min-[375px]:text-[11px] md:text-xs lg:text-sm cursor-pointer text-center relative whitespace-nowrap ${highlightedMenuIdx === 1 ? "shimmer-sweep-active" : ""}`}
                    >
                      <div className="ticket-stub-line"></div>
                      <Sparkles className="w-3 h-3 md:w-4 md:h-4 relative z-10 shrink-0 text-[#FFAE34]" />
                      <span className="relative z-10">Giếng Ước Nguyện 🔮</span>
                    </button>

                    {/* Command button */}
                    <button
                      onClick={() => {
                        playClickSound(500, 0.1);
                        setIsCommandModalOpen(true);
                        setIsVoteModalOpen(false);
                        setIsDonateModalOpen(false);
                      }}
                      id="welcome-command-btn"
                      className={`w-full flex items-center justify-center gap-1 py-3 pr-1 pl-4.5 min-[375px]:pl-5 md:pr-2 md:pl-6 rounded-md font-bold royal-card-btn shadow-md active:scale-95 transform hover:-translate-y-0.5 text-[9.5px] min-[320px]:text-[10px] min-[375px]:text-[11px] md:text-xs lg:text-sm cursor-pointer text-center relative whitespace-nowrap ${highlightedMenuIdx === 2 ? "shimmer-sweep-active" : ""}`}
                    >
                      <div className="ticket-stub-line"></div>
                      <Info className="w-3 h-3 md:w-4 md:h-4 relative z-10 shrink-0 text-[#FFAE34]" />
                      <span className="relative z-10">Quầy Hướng Dẫn 🎪</span>
                    </button>

                    {/* Feedback button */}
                    <a
                      href="https://ngl.link/gnhocuatun"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => playClickSound(500, 0.1)}
                      id="welcome-feedback-btn"
                      className={`w-full flex items-center justify-center gap-1 py-3 pr-1 pl-4.5 min-[375px]:pl-5 md:pr-2 md:pl-6 rounded-md font-bold royal-card-btn shadow-md active:scale-95 transform hover:-translate-y-0.5 text-[9.5px] min-[320px]:text-[10px] min-[375px]:text-[11px] md:text-xs lg:text-sm cursor-pointer text-center relative whitespace-nowrap ${highlightedMenuIdx === 3 ? "shimmer-sweep-active" : ""}`}
                    >
                      <div className="ticket-stub-line"></div>
                      <PenTool className="w-3 h-3 md:w-4 md:h-4 relative z-10 shrink-0 text-[#FFAE34]" />
                      <span className="relative z-10">Lưu Bút Du Khách 📜</span>
                    </a>
                  </div>

                  <div className="space-y-4">
                    <div className="relative w-full">
                      <span className="absolute inset-y-0 left-4 flex items-center">
                        <Search className="w-5 h-5 text-[#FFAE34]" />
                      </span>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm một nửa... 🔍"
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm magic-search-input shadow-sm"
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

                    {/* Gacha Random Button */}
                    <div className="magic-ticket-wrapper">
                      <button
                        onClick={() => {
                          playClickSound(600, 0.1);
                          setIsSummoning(true);
                          const randomIndex = Math.floor(Math.random() * CHARACTERS.length);
                          setGachaResult(CHARACTERS[randomIndex]);
                          setTimeout(() => {
                            setIsSummoning(false);
                          }, 1200);
                        }}
                        className="magic-ticket focus:outline-none"
                      >
                        <div className="magic-ticket-inner">
                          Cốc Cốc Cốc ai gọi đó 🐰
                        </div>
                      </button>
                    </div>

                    {/* Tag Filters list matching theme colors (Primary: Blue "Tất cả", Secondary: Pink categories tags) */}
                    <div className="flex flex-wrap items-center gap-2 py-2.5 max-h-52 overflow-y-auto no-scrollbar">
                      {tags.map((tag) => {
                        const isSelected = activeTag === tag;
                        const symbol = getRuneSymbol(tag);
                        return (
                          <button
                            key={tag}
                            onClick={() => {
                              playClickSound(450, 0.05);
                              setActiveTag(tag);
                            }}
                            id={`tag-filter-${tag}`}
                            className={`mini-ticket-stub ${getTicketColorClass(tag)} ${isSelected ? "selected" : ""}`}
                          >
                            {isSelected && (
                              <span className="ticket-punched-mark">
                                {tag.length % 2 === 0 ? "⭐" : "❤️"}
                              </span>
                            )}
                            <span className="rune-prefix-icon">{symbol}</span>
                            <span>{tag}</span>
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
                      className="golden-ticket-pass-card pl-8 pr-6 py-5 md:py-6 flex flex-col md:flex-row items-center gap-5 justify-between transition-all duration-300 group"
                    >
                      {/* Ambient background decoration */}
                      <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-yellow-500/10 transition-all duration-500" />
                      
                      <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left w-full relative z-10 pl-4">
                        {/* Avatar container with Royal Gacha Sphere & LIMITED tag */}
                        <div className="relative shrink-0 flex items-center justify-center">
                          <div className="relative w-28 h-28 flex items-center justify-center">
                            {/* Glowing effect around royal capsule */}
                            <div className="absolute inset-x-0 inset-y-0 bg-yellow-400/25 rounded-full blur-[6px] opacity-80 animate-pulse pointer-events-none" />
                            <div className="absolute -inset-1 bg-gradient-to-tr from-amber-500 via-yellow-200 to-amber-300 rounded-full blur-[3px] opacity-70" />
                            
                            {/* Gold capsule border edge */}
                            <div className="absolute inset-0 bg-gradient-to-b from-amber-400 via-yellow-200 to-amber-600 rounded-full p-[2.5px] shadow-lg">
                              <div className="w-full h-full rounded-full bg-stone-950 flex items-center justify-center overflow-hidden relative">
                                {/* Soft warm light source behind plushie */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/20 via-amber-400/25 to-yellow-300/30 animate-pulse" />
                                
                                {/* The featured plushie */}
                                <span className="text-6xl drop-shadow-[0_6px_12px_rgba(0,0,0,0.3)] z-10 select-none animate-bounce-slow">
                                  {featuredHubby.avatar}
                                </span>
                                
                                {/* 3D Glossy curved glare layer */}
                                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.6)_0%,rgba(255,255,255,0.25)_25%,rgba(0,0,0,0.25)_85%,rgba(255,255,255,0.35)_100%)] z-20 pointer-events-none">
                                  <div className="absolute top-1 left-4 w-9 h-3.5 bg-gradient-to-b from-white/70 to-transparent rounded-full rotate-[-25deg]" />
                                  <div className="absolute bottom-1 right-4 w-3.5 h-1.5 bg-white/40 rounded-full blur-[0.5px]" />
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Secret/Limited Ribbon */}
                          <span className="absolute -bottom-2 bg-gradient-to-r from-red-600 via-amber-500 to-yellow-500 text-white font-black text-[9px] px-3 py-1 rounded-full shadow-[0_4px_10px_rgba(239,68,68,0.5)] border border-amber-200 flex items-center gap-0.5 uppercase tracking-widest select-none z-30 animate-bounce-slow" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
                            🔖 SECRET RARE
                          </span>
                        </div>

                        {/* Name & descriptive details */}
                        <div className="space-y-1.5 w-full">
                          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                            <span className="px-4 py-1.5 font-sans text-[11px] md:text-xs tracking-wider bg-gradient-to-r from-[#4a370e] to-[#78350f] border-2 border-yellow-400 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.45)] text-yellow-300 font-black uppercase flex items-center gap-1 select-none">
                              🧸 SIÊU THÚ BÔNG HUYỀN THOẠI 🧸
                            </span>
                            <h4 className="text-xl md:text-2xl font-black text-[#FAF9F6] tracking-tight group-hover:text-amber-200 transition animate-pulse">
                              {featuredHubby.name}
                            </h4>
                          </div>

                          {/* Rank categories list & dynamic values */}
                          <div className="flex flex-wrap items-center gap-1.5 justify-center sm:justify-start mt-1">
                            <span className="px-2.5 py-1 text-[9.5px] font-black bg-gradient-to-r from-yellow-400 to-amber-500 text-stone-950 rounded border border-yellow-200 uppercase tracking-wider select-none shadow-[0_0_8px_rgba(250,204,21,0.5)]">
                              🔖 VÉ VÀNG VIP
                            </span>
                            {featuredHubby.tags.map((t, idx) => {
                              const symbol = getRuneSymbol(t);
                              return (
                                <span
                                  key={idx}
                                  className={`mini-ticket-stub ticket-sm ${getTicketColorClass(t)} select-none`}
                                >
                                  <span className="rune-prefix-icon">{symbol}</span>
                                  <span>{t}</span>
                                </span>
                              );
                            })}
                            
                            {/* Unique Gacha gold priority votes */}
                            <span className="px-3 py-0.5 text-[9.5px] font-black text-yellow-100 bg-gradient-to-r from-[#7c2d12] to-[#b45309] border border-yellow-500/30 rounded-full flex items-center gap-1 shadow-sm uppercase tracking-wider select-none">
                              <span>🎟️ {(votes[featuredHubby.id] || 0).toLocaleString()} LỢT ƯU TIÊN VÀNG</span>
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

                  {/* Characters scrollable vertical listing: "Bộ sưu tập thú bông lưu niệm" */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl filter drop-shadow-[0_0_8px_rgba(236,72,153,0.6)] animate-pulse">🧸</span>
                        <h3 className="font-sans font-black text-lg md:text-xl bg-gradient-to-r from-pink-400 via-orange-300 to-yellow-300 bg-clip-text text-transparent filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)] tracking-wide uppercase">
                          BỘ SƯU TẬP THÚ BÔNG LƯU NIỆM ({filteredCharacters.length})
                        </h3>
                      </div>
                      <span className="text-[10px] md:text-xs font-bold text-pink-300 bg-pink-950/40 border border-pink-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider font-sans">
                        Gacha Collection
                      </span>
                    </div>

                    {filteredCharacters.length === 0 ? (
                      <div className="p-12 text-center rounded-3xl bg-white/55 border border-slate-200/60 shadow-sm flex flex-col items-center justify-center gap-2">
                        <span className="text-4xl text-slate-400">🍂</span>
                        <p className="text-sm text-slate-500 font-medium">Khu vui chơi này hiện chưa mở 🎢</p>
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
                      <div className="flex flex-wrap gap-8 justify-center px-2 py-8">
                        {filteredCharacters.map((char, index) => {
                          const isTopCharacter = char.id === featuredHubby?.id;
                          const isFlipped = !!flippedCardIds[char.id];
                          const plushTheme = getPlushieCardTheme(Number(char.id) || 0, isTopCharacter);
                          
                          // Slight natural rotation angle for the fluffy look
                          const rotationAngle = ((index % 3) - 1) * 1.5; 
                          
                          return (
                            <motion.div
                              key={char.id}
                              initial={{ opacity: 0, scale: 0.9, y: 30 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                              style={{ 
                                transform: `rotate(${rotationAngle}deg)`,
                              }}
                              className="plushie-card-container select-none"
                              onClick={() => {
                                playClickSound(350, 0.08);
                                setFlippedCardIds(prev => ({
                                  ...prev,
                                  [char.id]: !prev[char.id]
                                }));
                              }}
                            >
                              <div className={`plushie-card-inner ${isFlipped ? "is-flipped" : ""}`}>
                                {/* Front Side */}
                                <div className={`plushie-card-front ${plushTheme.bg} ${plushTheme.border} ${plushTheme.shadow} flex flex-col justify-between h-full relative`}>
                                  <div className="plushie-inner-border"></div>
                                  
                                  {/* Top header of the plushie gacha certification card */}
                                  <div className={`flex justify-between items-center text-[9px] font-sans font-black uppercase tracking-wider ${plushTheme.textColor} z-10 w-full`}>
                                    <span>🎈 Plushie № 0{char.id} 🎈</span>
                                    <span className="font-bold opacity-90">{plushTheme.badge}</span>
                                  </div>
                                  
                                  {/* Gacha Sphere translucent sphere containing the chibi plushie */}
                                  <div className="flex flex-col items-center justify-center my-auto z-10 w-full">
                                    <div className="relative w-32 h-32 flex items-center justify-center">
                                      {/* Inner glowing core of the capsule */}
                                      <div className="absolute inset-2 bg-gradient-to-tr from-white/40 via-[#FFF9DC] to-white/50 rounded-full blur-[3px] animate-pulse pointer-events-none" />
                                      
                                      {/* Avatar/Plushie itself inside */}
                                      <div className="absolute z-10 scale-100 group-hover:scale-110 active:scale-95 transition-transform duration-300">
                                        {/* Dynamic movement / floating look */}
                                        <span className="text-7xl drop-shadow-[0_8px_16px_rgba(0,0,0,0.18)] inline-block select-none animate-bounce-slow">
                                          {char.avatar}
                                        </span>
                                      </div>

                                      {/* The glass capsule shiny front shell (semi-transparent plastic cover) */}
                                      <div className="absolute inset-0 rounded-full border-2 border-white/60 bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.6)_0%,rgba(255,255,255,0.25)_25%,rgba(0,0,0,0.18)_85%,rgba(255,255,255,0.35)_100%)] shadow-[inset_0_-8px_16px_rgba(0,0,0,0.32),inset_0_8px_16px_rgba(255,255,255,0.45),0_12px_24px_rgba(0,0,0,0.22)] pointer-events-none z-20">
                                        {/* Light sheen crescent */}
                                        <div className="absolute top-1.5 left-4.5 w-9 h-3.5 bg-gradient-to-b from-white/70 to-transparent rounded-full rotate-[-25deg]" />
                                        {/* Bottom specular glow reflecting */}
                                        <div className="absolute bottom-1 right-3.5 w-3 h-1.5 bg-white/40 rounded-full blur-[0.5px]" />
                                      </div>
                                    </div>
                                    
                                    {/* Name & Title */}
                                    <h4 className={`text-lg md:text-xl font-black mt-4 ${plushTheme.textColor} text-center font-sans tracking-wide`}>
                                      {char.name}
                                    </h4>
                                    
                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-1 justify-center mt-2.5 max-w-full">
                                      {char.tags.map((t, idx) => {
                                        const symbol = getRuneSymbol(t);
                                        return (
                                          <span
                                            key={idx}
                                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase font-sans tracking-tight transition-transform active:scale-95 ${plushTheme.tagBg}`}
                                          >
                                            <span>{symbol}</span>
                                            <span>{t}</span>
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </div>
                                  
                                  {/* Footer of the Card front */}
                                  <div className={`text-center text-[9px] ${plushTheme.noteText} font-sans font-bold tracking-wider pt-2 border-t border-black/5 z-10 flex items-center justify-center gap-1.5 w-full`}>
                                    <span>✨ Nhấn để lật xem chứng nhận ✨</span>
                                  </div>
                                </div>

                                {/* Back Side */}
                                <div className={`plushie-card-back ${plushTheme.bg} ${plushTheme.border} ${plushTheme.shadow} flex flex-col justify-between h-full relative`}>
                                  <div className="plushie-inner-border"></div>
                                  
                                  {/* Back Header */}
                                  <div className={`flex justify-between items-center text-[9px] font-sans font-black uppercase tracking-wider ${plushTheme.textColor} z-10 w-full`}>
                                    <span>📜 CHỨNG NHẬN BẢO HÀNH 📜</span>
                                    <span>#{char.id}</span>
                                  </div>
                                  
                                  {/* Back Content scroll/description body */}
                                  <div className="my-auto flex flex-col gap-2.5 z-10 px-1 overflow-y-auto max-h-[190px] custom-scrollbar scroll-smooth">
                                    <h5 className={`text-md font-bold ${plushTheme.textColor} text-center mt-1 font-sans`}>
                                      {char.name}
                                    </h5>
                                    
                                    <p className={`text-[11.5px] leading-relaxed ${plushTheme.textColor} opacity-90 text-justify italic font-serif px-2 bg-white/40 p-2.5 rounded-2xl border border-white/60 shadow-sm`}>
                                      "{char.description}"
                                    </p>
                                  </div>
                                  
                                  {/* Back Action buttons themed beautifully */}
                                  <div className="flex flex-col gap-2 z-10 mt-auto pt-3 border-t border-black/5 w-full">
                                    {/* Row of buttons */}
                                    <div className="flex gap-2">
                                      {/* Chat Button */}
                                      {!char.chatbotUrl ? (
                                        <button
                                          disabled
                                          onClick={(e) => e.stopPropagation()}
                                          className="flex-1 select-none flex items-center justify-center gap-1 px-2.5 py-1.5 bg-[#444]/10 text-slate-400 font-bold text-[10px] rounded-xl border border-slate-300 cursor-not-allowed opacity-50"
                                        >
                                          <MessageCircle className="w-3 h-3" />
                                          Sắp ra mắt
                                        </button>
                                      ) : (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleStartChat(char);
                                          }}
                                          className="flex-1 select-none flex items-center justify-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-emerald-500/20 to-teal-600/30 text-emerald-800 hover:from-emerald-500/35 hover:to-teal-600/45 border border-emerald-500/30 font-bold text-[10px] rounded-xl transition duration-150 active:scale-95"
                                        >
                                          <MessageCircle className="w-3 h-3" />
                                          Trò chuyện
                                        </button>
                                      )}

                                      {/* Plot Button */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          playClickSound(480, 0.08);
                                          setStoryCharacter(char);
                                        }}
                                        className="flex-1 select-none flex items-center justify-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-purple-500/10 to-violet-600/20 text-purple-800 hover:from-purple-500/20 hover:to-violet-600/30 border border-purple-500/20 font-bold text-[10px] rounded-xl transition duration-150 active:scale-95"
                                      >
                                        <BookOpen className="w-3 h-3" />
                                        Tiểu sử truyện
                                      </button>
                                    </div>

                                    {/* Profile Anchor Button */}
                                    <a
                                      href={char.profileUrl || "#"}
                                      target={char.profileUrl ? "_blank" : undefined}
                                      rel={char.profileUrl ? "noopener noreferrer" : undefined}
                                      onClick={(e) => e.stopPropagation()}
                                      className="select-none flex items-center justify-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-blue-500/10 to-cyan-600/20 text-blue-800 hover:from-blue-500/20 hover:to-cyan-600/30 border border-blue-500/20 font-bold text-[10px] rounded-xl transition duration-150 active:scale-95 text-center"
                                    >
                                      <User className="w-3 h-3 inline-block" />
                                      Xem Hồ sơ chi tiết
                                    </a>
                                  </div>
                                </div>
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
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="ticket-container-modal relative w-full max-w-lg select-none z-10 flex flex-col max-h-[85vh] text-[#1976D2]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#1976D2]/30 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-2xl animate-bounce text-[#FFD600]" style={{ filter: "drop-shadow(0 0 5px rgba(255,214,0,0.5))" }}>🎫</span>
                  <h3 className="text-lg md:text-xl font-bold royal-gold-glow-text tracking-widest uppercase mb-0">
                    BẢNG VÀNG VÉ ƯU TIÊN
                  </h3>
                </div>
                <button
                  onClick={() => {
                    playClickSound(300, 0.08);
                    setIsVoteModalOpen(false);
                  }}
                  className="p-1.5 rounded-lg hover:bg-[#1976D2]/10 text-[#1976D2] transition cursor-pointer relative z-20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-2.5 relative z-10 text-center sm:text-left">
                <p className="text-[11px] md:text-xs font-serif italic text-amber-200/90 leading-relaxed">
                  ⚡ Hãy trao Tấm Vé Ưu Tiên của bạn cho câu chuyện bạn yêu thích nhất để đưa tác phẩm lên đỉnh vinh quang!
                </p>
              </div>

              {/* Scrollable list of characters */}
              <div className="flex-1 overflow-y-auto no-scrollbar py-2 space-y-3.5 pr-1 relative z-10">
                {[...CHARACTERS].sort((a, b) => (votes[b.id] || 0) - (votes[a.id] || 0)).map((char, index) => {
                  const currentVotes = votes[char.id] || 0;
                  const isVoted = userVotedIds.includes(char.id);
                  const rank = index + 1;
                  
                  let rankColor: string | undefined = undefined;
                  let ticketSpecialBorder = '';
                  if (rank === 1) {
                    rankColor = '#1976D2';
                    ticketSpecialBorder = 'border-[#1976D2]/80 shadow-[0_0_15px_rgba(25,118,210,0.35)]';
                  } else if (rank === 2) {
                    rankColor = '#1976D2';
                    ticketSpecialBorder = 'border-[#1976D2]/50 shadow-[0_0_12px_rgba(25,118,210,0.25)]';
                  } else if (rank === 3) {
                    rankColor = '#1976D2';
                  }

                  return (
                    <div
                      key={char.id}
                      className={`golden-fastpass-ticket ${ticketSpecialBorder} ${isVoted ? 'border-[#1976D2] bg-[#FFD600]' : ''} ${punchedTicketId === char.id ? 'animate-ticket-rumble' : ''}`}
                    >
                      {/* Ticket Notches at left & right */}
                      <div className="ticket-notch-l" />
                      <div className="ticket-notch-r" />

                      <div className="flex items-center justify-between relative z-10 w-full">
                        <div className="flex items-center gap-3">
                          {/* Rank */}
                          <div className="flex flex-col items-center justify-center w-6 shrink-0 font-sans font-black text-xs" style={{ color: rankColor || '#1976D2' }}>
                            {rank === 1 ? '👑' : `#${rank}`}
                          </div>
                          {/* Ticket avatar */}
                          <div className={`w-11 h-11 rounded-full bg-gradient-to-tr ${char.avatarBg} flex items-center justify-center text-2xl shadow-md shrink-0 border ${rank <= 2 ? 'border-[#1976D2]/65 shadow-[0_0_10px_rgba(25,118,210,0.25)]' : 'border-[#1976D2]/30'}`}>
                            {char.avatar}
                          </div>
                          <div className="text-left">
                            <h4 className="font-bold text-sm md:text-base text-[#1976D2] flex items-center gap-1 m-0" style={rank <= 2 ? { color: rankColor } : {}}>
                              {char.name}
                              {isVoted && <span className="text-[9px] text-[#1976D2] ml-1 font-black uppercase tracking-wider">● ĐÃ VOTE</span>}
                            </h4>
                            <span className="text-[9px] font-bold text-[#1976D2]/80 flex items-center gap-1 font-sans uppercase tracking-wider mt-0.5">
                              <span>{getRuneSymbol(char.tags[0])}</span>
                              <span>{char.tags[0]}</span>
                            </span>
                          </div>
                        </div>

                        {/* Votes & Puncher Action on the right side */}
                        <div className="flex items-center gap-3 md:gap-4 pl-3 border-l border-[#1976D2]/20">
                          {/* Total gold pass tickets counted */}
                          <div className="text-right flex flex-col items-end justify-center min-w-[70px]">
                            <div className="text-xs font-black font-sans text-[#1976D2]">
                              {currentVotes} VÉ VÀNG
                            </div>
                            <span className="text-[8px] font-bold text-[#1976D2]/70 uppercase tracking-widest mt-0.5">
                              Tích lũy
                            </span>
                          </div>

                          {/* Ticket Puncher activation trigger button */}
                          <button
                            onClick={() => {
                              playClickSound(isVoted ? 420 : 650, 0.1);
                              handleVote(char.id);
                              setPunchedTicketId(char.id);
                              setTimeout(() => setPunchedTicketId(null), 550);
                            }}
                            className={`ticket-slot-arcade-btn ${isVoted ? 'punched' : ''} ${punchedTicketId === char.id ? 'animate-ticket-punch' : ''}`}
                            title={isVoted ? 'Hủy tấm vé đã bình chọn' : 'Đút vé vàng trao Tấm Vé Ưu Tiên'}
                          >
                            <span className="ticket-slot-slit" />
                            
                            {/* Sparkles explosion container rendered dynamically */}
                            {punchedTicketId === char.id && (
                              <div className="sparkle-punch-explosion">
                                <span className="absolute text-[#FFD600] text-xs party-sparkle-1">⭐</span>
                                <span className="absolute text-[#FFE033] text-xs party-sparkle-2">✨</span>
                                <span className="absolute text-[#FFD600] text-xs party-sparkle-3">✦</span>
                                <span className="absolute text-[#64B5F6] text-xs party-sparkle-4">💫</span>
                                <span className="absolute text-[#42A5F5] text-xs party-sparkle-5">✨</span>
                              </div>
                            )}

                            {/* Ticket slide sliding visual helper on hover */}
                            {!isVoted && <span className="ticket-slide-visual">🎟️</span>}
                            
                            {/* Glowing ticket slot text indicator */}
                            <span className="relative z-10 flex items-center gap-1 select-none text-shadow-[0_0_4px_currentColor]">
                              {isVoted ? "✓ ĐÃ NHẬN VÉ" : "🎟️ ĐÚT VÉ"}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-[#1976D2]/20 text-center relative z-10">
                <button
                  onClick={() => {
                    playClickSound(300, 0.08);
                    setIsVoteModalOpen(false);
                  }}
                  className="px-6 py-2 bg-[#FFD600] hover:bg-[#ffeb3b] text-[#1976D2] border-2 border-[#1976D2] font-bold text-xs rounded-full transition-all cursor-pointer shadow-[0_4px_12px_rgba(25,118,210,0.35)]"
                >
                  Đóng Bảng Vàng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Wishing Well / Donate Modal */}
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
              initial={{ scale: 0.85, opacity: 0, y: 45 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 45 }}
              transition={{ type: "spring", damping: 20, stiffness: 140 }}
              className="fountain-brick-masonry relative w-full max-w-[380px] mx-auto p-5 md:p-6 shadow-2xl select-none z-10 flex flex-col space-y-4 px-5 overflow-hidden text-[#1976D2]"
            >
              {/* Virtual Floating Coins in background layout */}
              <div className="absolute top-14 left-4 scale-125 z-20 animate-coin-float-fast font-serif select-none pointer-events-none opacity-80" style={{ animationDelay: "0s" }}>🪙</div>
              <div className="absolute top-24 right-4 z-20 animate-bounce font-serif select-none pointer-events-none opacity-70" style={{ animationDelay: "1s" }}>✨</div>
              <div className="absolute bottom-16 left-3 scale-110 z-20 animate-pulse font-serif select-none pointer-events-none opacity-60" style={{ animationDelay: "0.5s" }}>🪙</div>
              <div className="absolute top-44 right-5 scale-95 z-20 animate-bounce font-serif select-none pointer-events-none opacity-80" style={{ animationDelay: "1.5s" }}>🪙</div>

              {/* Water droplet splash visual effect */}
              {isWaterSplashing && (
                <div className="absolute inset-x-0 bottom-1/2 top-4 flex items-center justify-center pointer-events-none z-30">
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <div className="absolute w-2 h-2 rounded-full bg-cyan-300/80 animate-ping" />
                    {/* Drop 1 */}
                    <motion.div
                      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                      animate={{ x: -30, y: -40, scale: 0.3, opacity: 0 }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                      className="absolute w-2.5 h-2.5 rounded-full bg-cyan-200/95 blur-[0.5px] border border-cyan-100/40"
                    />
                    {/* Drop 2 */}
                    <motion.div
                      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                      animate={{ x: 30, y: -40, scale: 0.3, opacity: 0 }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                      className="absolute w-2.5 h-2.5 rounded-full bg-cyan-200/95 blur-[0.5px] border border-cyan-100/40"
                    />
                    {/* Drop 3 */}
                    <motion.div
                      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                      animate={{ x: -25, y: -20, scale: 0.2, opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="absolute w-2 h-2 rounded-full bg-cyan-300/90 blur-[0.5px]"
                    />
                    {/* Drop 4 */}
                    <motion.div
                      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                      animate={{ x: 25, y: -20, scale: 0.2, opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="absolute w-2 h-2 rounded-full bg-cyan-300/90 blur-[0.5px]"
                    />
                    {/* Drop 5 */}
                    <motion.div
                      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                      animate={{ x: 0, y: -55, scale: 0.4, opacity: 0 }}
                      transition={{ duration: 0.55, ease: "easeOut" }}
                      className="absolute w-3.5 h-3.5 rounded-full bg-cyan-100/95 blur-[0.5px]"
                    />
                  </div>
                </div>
              )}

              {/* Falling coin from copied event triggers */}
              {isCoinFalling && (
                <motion.div
                  initial={{ y: -70, x: -15, rotate: 0, opacity: 1, scale: 1.5 }}
                  animate={{ y: 155, x: 0, rotate: 720, opacity: [1, 1, 0.9, 0] }}
                  transition={{ duration: 0.45, ease: "easeIn" }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 z-50 pointer-events-none text-4xl filter drop-shadow-[0_4px_10px_rgba(234,179,8,0.95)]"
                >
                  🪙
                </motion.div>
              )}

              {/* Moss patches at the corners to represent rêu phong cổ kính */}
              <div className="absolute top-1 left-1 w-6 h-6 bg-emerald-600/15 rounded-full blur-[8px] pointer-events-none" />
              <div className="absolute bottom-1 right-2 w-8 h-8 bg-emerald-500/10 rounded-full blur-[10px] pointer-events-none" />

              <div className="flex items-center justify-between pb-2.5 border-b border-[#1976D2]/20 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-2xl animate-spin" style={{ animationDuration: '6s', filter: "drop-shadow(0 0 5px rgba(255,214,0,0.4))" }}>⛲</span>
                  <h3 className="text-sm md:text-base font-sans font-black text-[#1976D2] drop-shadow-[0_0_8px_rgba(25,118,210,0.2)] uppercase tracking-wider">
                    ĐÀI PHUN NƯỚC MAY MẮN ✨
                  </h3>
                </div>
                <button
                  onClick={() => {
                    playClickSound(300, 0.08);
                    setIsDonateModalOpen(false);
                  }}
                  className="p-1.5 rounded-lg hover:bg-[#1976D2]/10 text-[#1976D2] transition cursor-pointer relative z-20"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-center relative z-10">
                {/* Visual Title */}
                <h4 className="text-xs md:text-sm font-black text-[#1976D2] font-sans tracking-wide uppercase drop-shadow-[0_2px_4px_rgba(25,118,210,0.1)]">
                  🔮 THẢ XU ĐỔI VẬN ĐỊNH MỆNH 🔮
                </h4>

                {/* Adorable Description */}
                <p className="text-[10px] md:text-[11px] text-[#1976D2]/80 font-serif leading-relaxed px-1">
                  Mỗi đồng xu lữ khách thả vào đài phun nước không chỉ mang lại may mắn lớn mà còn tiếp thêm năng lượng cho Vương Quốc của Tun phát triển mạnh mẽ hơn!
                </p>

                {/* QR Code Container inside dynamic water pond with Swimming Ring / Lifeboy frame */}
                <div className="relative py-2.5 flex justify-center">
                  
                  {/* Water Pond Background behind QR */}
                  <div className="absolute w-48 h-48 rounded-full bg-[#E3F2FD] border border-[#1976D2]/20 shadow-inner flex items-center justify-center transform -translate-y-2 pointer-events-none">
                    {/* Ring Ripple concentric circles on the water */}
                    <div className="absolute w-40 h-40 rounded-full border border-dashed border-[#1976D2]/10 animate-spin" style={{ animationDuration: '30s' }} />
                    <div className="absolute w-32 h-32 rounded-full border border-dashed border-[#1976D2]/15 animate-water-surface-ripple" />
                    <div className="absolute w-24 h-24 rounded-full border border-[#1976D2]/20 animate-pulse" />
                  </div>

                  {/* Ripple elements triggered by active clicks */}
                  {splashRipples.map((ripple) => (
                    <motion.div
                      key={ripple.id}
                      initial={{ scale: 0.5, opacity: 0.9 }}
                      animate={{ scale: 2.5, opacity: 0 }}
                      transition={{ duration: 1.1, ease: "easeOut" }}
                      className="absolute w-24 h-24 rounded-full border-[3px] border-dashed border-[#1976D2] pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(50%+8px)] z-20"
                    />
                  ))}

                  {/* Swimming Float Ring styled around the QR (Bông hoa súng hoặc phao bơi) */}
                  <div className="relative z-10 animate-slow-swim pb-2">
                    <div className="rounded-full border-[8px] border-double border-[#FFD600] p-2 bg-[#ffffff]/90 shadow-[0_12px_30px_rgba(25,118,210,0.2),inset_0_0_12px_rgba(25,118,210,0.1)]">
                      <img
                        src="https://img.vietqr.io/image/970418-3510790840-compact2.png?addInfo=Donete+cho+Tun+mua+bimbim&accountName=LA+NGOC+HAN"
                        alt="Fountain Well QR Code"
                        referrerPolicy="no-referrer"
                        className="w-32 h-32 object-cover rounded-full border border-[#1976D2]/20 shadow-inner"
                      />
                    </div>
                    
                    {/* Rebranded label badge inside the water */}
                    <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 bg-[#FFD600] hover:bg-[#ffeb3b] text-[#1976D2] text-[9px] uppercase font-black font-sans px-3.5 py-1 rounded-full shadow-[0_3px_12px_rgba(255,214,0,0.5)] tracking-wider border-2 border-[#1976D2] select-none transition-colors whitespace-nowrap">
                      🪙 Ở TÂM HỒ NHẬN XU
                    </div>
                  </div>
                </div>

                {/* Detailed Bank Card copy info */}
                <div className="space-y-2 pt-1.5 text-left">
                  <p className="text-[10px] font-black text-[#1976D2] uppercase tracking-widest pl-1">
                    🪙 CHI TIẾT HỒ CÔNG ĐỨC
                  </p>

                  <div className="p-2.5 space-y-2 font-serif rounded-xl border border-[#1976D2]/20 bg-[#ffffff] backdrop-blur-sm">
                    {/* Bank Name */}
                    <div className={`rounded-lg p-2 flex items-center justify-between gap-2 text-xs transition-all ${copiedField === 'bank' ? 'bg-[#FFD600] border-2 border-[#1976D2] shadow-[0_0_10px_rgba(25,118,210,0.2)]' : 'bg-[#E3F2FD] border border-[#1976D2]/30'}`}>
                      <div>
                        <span className="text-[#1976D2]/80 block text-[8px] uppercase font-black font-sans tracking-widest">💎 NƠI TIẾP NHẬN ĐỒNG XU</span>
                        <span className="font-extrabold text-[#1976D2] text-xs md:text-sm tracking-wide">
                          BIDV (Ngân hàng Đầu tư và Phát triển VN)
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          handleCopy("BIDV", "bank");
                        }}
                        className="p-1.5 rounded-md bg-[#FFD600] hover:bg-[#ffeb3b] border-2 border-[#1976D2] text-[#1976D2] active:scale-90 transition cursor-pointer"
                        title="Copy tên ngân hàng tiếp nhận"
                      >
                        {copiedField === "bank" ? (
                          <Check className="w-3.5 h-3.5 text-[#1976D2] animate-pulse" />
                        ) : (
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Account number */}
                    <div className={`rounded-lg p-2 flex items-center justify-between gap-2 text-xs transition-all ${copiedField === 'account' ? 'bg-[#FFD600] border-2 border-[#1976D2] shadow-[0_0_10px_rgba(25,118,210,0.2)]' : 'bg-[#E3F2FD] border border-[#1976D2]/30'}`}>
                      <div>
                        <span className="text-[#1976D2]/80 block text-[8px] uppercase font-black font-sans tracking-widest">🔑 MÃ SỐ HỒ ƯỚC NGUYỆN</span>
                        <span className="font-mono font-extrabold text-sm text-[#1976D2] tracking-widest block mt-0.5">
                          3510790840
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          handleCopy("3510790840", "account");
                        }}
                        className="p-1.5 rounded-md bg-[#FFD600] hover:bg-[#ffeb3b] border-2 border-[#1976D2] text-[#1976D2] active:scale-90 transition cursor-pointer"
                        title="Copy mã số hồ ước nguyện"
                      >
                        {copiedField === "account" ? (
                          <Check className="w-3.5 h-3.5 text-[#1976D2] animate-pulse" />
                        ) : (
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Account holder name */}
                    <div className={`rounded-lg p-2 flex items-center justify-between gap-2 text-xs transition-all ${copiedField === 'name' ? 'bg-[#FFD600] border-2 border-[#1976D2] shadow-[0_0_10px_rgba(25,118,210,0.2)]' : 'bg-[#E3F2FD] border border-[#1976D2]/30'}`}>
                      <div>
                        <span className="text-[#1976D2]/80 block text-[8px] uppercase font-black font-sans tracking-widest">👑 THẦN GIỮ ĐÀI PHUN NƯỚC</span>
                        <span className="font-extrabold text-[#1976D2] uppercase tracking-wider text-xs block mt-0.5">
                          LA NGOC HAN
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          handleCopy("LA NGOC HAN", "name");
                        }}
                        className="p-1.5 rounded-md bg-[#FFD600] hover:bg-[#ffeb3b] border-2 border-[#1976D2] text-[#1976D2] active:scale-90 transition cursor-pointer"
                        title="Copy danh tính thủ hộ"
                      >
                        {copiedField === "name" ? (
                          <Check className="w-3.5 h-3.5 text-[#1976D2] animate-pulse" />
                        ) : (
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Syntax message */}
                    <div className={`rounded-lg p-2 flex items-center justify-between gap-2 text-xs transition-all ${copiedField === 'note' ? 'bg-[#FFD600] border-2 border-[#1976D2] shadow-[0_0_10px_rgba(25,118,210,0.2)]' : 'bg-[#E3F2FD] border border-[#1976D2]/30'}`}>
                      <div>
                        <span className="text-[#1976D2]/80 block text-[8px] uppercase font-black font-sans tracking-widest">🔮 PHÉP LÀNH HỒ ƯỚC</span>
                        <span className="font-semibold text-[#1976D2] italic tracking-wide">
                          "Donate cho Tun"
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          handleCopy("Donate cho Tun", "note");
                        }}
                        className="p-1.5 rounded-md bg-[#FFD600] hover:bg-[#ffeb3b] border-2 border-[#1976D2] text-[#1976D2] active:scale-90 transition cursor-pointer"
                        title="Copy lời khấn nguyện"
                      >
                        {copiedField === "note" ? (
                          <Check className="w-3.5 h-3.5 text-[#1976D2] animate-pulse" />
                        ) : (
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Magical statement */}
                <p className="text-[9.5px] text-[#1976D2]/60 font-serif italic text-center leading-relaxed">
                  "Mọi đồng xu công đức đều chuyển hóa thành năng lực vạn linh thúc đẩy vương quốc Tun bền vững hưng thịnh!"
                </p>

                {/* Solid copy pill notification indicator */}
                <AnimatePresence>
                  {(copiedField === "bank" || copiedField === "account" || copiedField === "name" || copiedField === "note") && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="text-[10px] font-black text-center text-[#1976D2] bg-[#ffffff] border-2 border-[#1976D2]/30 py-1.5 rounded-full font-sans"
                    >
                      🪙 Đồng xu đã bay thẳng vào đài phun nước may mắn!
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Final seal and closing button */}
                <div className="pt-2 flex items-center justify-between gap-4 mt-2">
                  {/* Wax Seal with "TUN" rebranded as Coin dispenser lever badge */}
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-10 h-10 rounded-full bg-[#FFD600] border-2 border-[#1976D2] flex items-center justify-center cursor-pointer shadow-[0_4px_10px_rgba(25,118,210,0.15)] active:scale-95 transition-transform"
                      onClick={() => {
                        // Play golden coin sound
                        playClickSound(1100, 0.12);
                        setTimeout(() => playClickSound(1300, 0.12), 40);
                      }}
                      title="Huy hiệu Vận Mệnh của Đền Thần"
                    >
                      <span className="text-[#1976D2] text-[9px] font-black font-mono">TUN</span>
                    </div>
                    <span className="text-[9.5px] text-[#1976D2]/50 italic font-serif text-left leading-tight">
                      Vận Thuyết<br/>Chi Xu
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      playClickSound(300, 0.08);
                      setIsDonateModalOpen(false);
                    }}
                    className="flex-1 py-1.5 md:py-2.5 bg-[#FFD600] hover:bg-[#ffeb3b] border-2 border-[#1976D2] text-[#1976D2] font-bold text-xs rounded-xl shadow-[0_4px_12px_rgba(25,118,210,0.15)] active:scale-95 transition cursor-pointer"
                  >
                    Trở Lại Bản Đồ 🗺️
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Command Details Modal (The Mystic Divination Booth) */}
      <AnimatePresence>
        {isCommandModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-[8px] p-4 selection:bg-emerald-950/40">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-b from-[#10b981]/10 via-black/50 to-black/80"
              onClick={() => {
                playClickSound(300, 0.08);
                setIsCommandModalOpen(false);
              }}
            />
            {/* The Divination Portal Container */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 45 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 45 }}
              transition={{ type: "spring", damping: 25, stiffness: 120 }}
              className="relative w-full max-w-[430px] mx-auto select-none z-10 flex flex-col items-center bg-[#E3F2FD] rounded-[32px] p-6 pb-12 shadow-[0_20px_50px_rgba(25,118,210,0.45)] border-4 border-[#1976D2] overflow-hidden"
            >
              {/* Overlapping Velvet Hanging Drapes on Left and Right edges */}
              <div 
                className="absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-[#bbdefb] via-[#90caf9] to-[#64b5f6]/30 border-r border-[#1976D2]/30 z-20 rounded-l-[28px] pointer-events-none divination-curtain-l"
              >
                {/* Visual folds on drapes using border overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-transparent opacity-70" />
                <div className="absolute top-0 bottom-0 right-1.5 w-[2px] bg-[#1976D2]/20 blur-[1px] opacity-40" />
              </div>
              <div 
                className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-[#bbdefb] via-[#90caf9] to-[#64b5f6]/30 border-l border-[#1976D2]/30 z-20 rounded-r-[28px] pointer-events-none divination-curtain-r"
              >
                <div className="absolute inset-0 bg-gradient-to-l from-black/10 via-transparent to-transparent opacity-70" />
                <div className="absolute top-0 bottom-0 left-1.5 w-[2px] bg-[#1976D2]/20 blur-[1px] opacity-40" />
              </div>

              {/* Astrological Cosmic Star Background in middle */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(25,118,210,0.1)_0%,transparent_70%)] pointer-events-none" />

              {/* Booth Header/Title */}
              <div className="text-center pt-3 relative z-30 px-6">
                <h3 className="font-serif italic font-extrabold text-[#1976D2] text-lg md:text-xl tracking-wider uppercase drop-shadow-[0_1px_2px_rgba(25,118,210,0.1)]">
                  QUẦY VÉ HƯỚNG DẪN 🎰
                </h3>
                <p className="text-[10px] font-sans text-[#1976D2]/80 font-bold uppercase tracking-widest mt-1">
                  The Retro Magic Arcade Dispenser
                </p>
              </div>

              {/* Main Stage: Retro Arcade Ticket Machine */}
              <motion.div 
                animate={isArcadeVibrating ? {
                  x: [0, -4, 4, -4, 4, -2, 2, 0],
                  y: [0, 2, -2, 2, -2, 1, -1, 0],
                } : {}}
                transition={{ duration: 0.5, ease: "linear" }}
                className="w-full flex flex-col items-center justify-center space-y-6 pt-8 pb-2 relative z-30 px-4"
              >
                {/* Brass / Copper metallic retro vending device */}
                <div className="w-full max-w-[340px] bg-[#ffffff] border-4 border-[#1976D2] rounded-2xl shadow-[0_10px_20px_rgba(25,118,210,0.15)] p-4 relative overflow-hidden flex flex-col items-center">
                  
                  {/* Metal Rivet indicators at corners with classic polished brass glow */}
                  <div className="absolute top-2.5 left-2.5 w-2 h-2 rounded-full bg-[#FFD600] border border-[#1976D2] shadow-[0_0_5px_rgba(255,214,0,0.8)]" />
                  <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#FFD600] border border-[#1976D2] shadow-[0_0_5px_rgba(255,214,0,0.8)]" />
                  <div className="absolute bottom-2.5 left-2.5 w-2 h-2 rounded-full bg-[#FFD600] border border-[#1976D2] shadow-[0_0_5px_rgba(255,214,0,0.8)]" />
                  <div className="absolute bottom-2.5 right-2.5 w-2 h-2 rounded-full bg-[#FFD600] border border-[#1976D2] shadow-[0_0_5px_rgba(255,214,0,0.8)]" />

                  {/* Retro CRT Screen display */}
                  <div className="w-full h-24 bg-[#E3F2FD] border-2 border-[#1976D2] rounded-xl p-3 overflow-hidden flex flex-col items-center justify-center relative shadow-[inset_0_0_15px_rgba(25,118,210,0.2),0_0_12px_rgba(25,118,210,0.15)]">
                    
                    {/* Retro Scanline effect dynamic overlays */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/5 pointer-events-none z-10" />
                    <div 
                      className="absolute inset-0 opacity-[0.03] pointer-events-none z-20"
                      style={{
                        backgroundImage: 'linear-gradient(rgba(25,118,210,0.5) 50%, rgba(25,118,210,1) 50%)',
                        backgroundSize: '100% 4px',
                      }}
                    />
                    
                    {/* Golden Yellow neon phosphor text info display */}
                    <div className="text-center z-10 select-none flex flex-col items-center justify-center">
                      <p className="text-xs md:text-sm font-sans font-black text-[#1976D2] tracking-wider flex items-center gap-1 drop-shadow-[0_0_8px_rgba(25,118,210,0.3)] animate-pulse">
                        🎟️ TRẠM THÔNG TIN LỮ KHÁCH 🎟️
                      </p>
                      <p className="text-[9px] font-mono text-[#1976D2]/90 uppercase tracking-widest mt-2 font-bold">
                        VUI LÒNG CHỌN LOẠI VÉ BẠN MUỐN IN
                      </p>
                    </div>
                  </div>

                  {/* 2 separate interactive action arrays (Left: Blue, Right: Red) */}
                  <div className="w-full grid grid-cols-2 gap-4 mt-4">
                    
                    {/* Left Dispensation Station (Vé Cẩm Nang) */}
                    <div className="group flex flex-col items-center text-center space-y-2.5 p-3.5 bg-[#ffffff] rounded-xl border-2 border-[#1976D2]/50 shadow-[0_2px_5px_rgba(25,118,210,0.05)] transition-all duration-300 hover:border-[#1976D2]">
                      <span className="text-[10px] font-black font-serif text-[#1976D2] tracking-wider">
                        CẨM NANG CHƠI
                      </span>
                      
                      {/* Big blue arcade release button */}
                      <button
                        onClick={() => {
                          if (dispensedTicket === 'cam_nang') {
                            playClickSound(260, 0.05);
                            return;
                          }
                          // 1. Smoke effect activation
                          playClickSound(220, 0.1);
                          setIsArcadeSmoke(true);
                          
                          // ASCENDING magical tones for ticket discharge
                          setTimeout(() => playClickSound(380, 0.1), 100);
                          setTimeout(() => playClickSound(580, 0.1), 220);
                          setTimeout(() => {
                            setDispensedTicket('cam_nang');
                            setIsArcadeSmoke(false);
                          }, 600);
                        }}
                        className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#FFD600] border-b-4 border-[#1976D2] text-[#1976D2] shadow-md active:border-b-0 active:translate-y-[4px] hover:brightness-110 active:shadow-inner cursor-pointer flex items-center justify-center text-base md:text-lg transition-transform"
                        title="In Vé Cẩm Nang Hướng Dẫn"
                      >
                        🟡
                      </button>

                      {/* Ticket Slot - notch representation with marquee on hover */}
                      <div className="flex flex-col items-center space-y-1.5 w-full mt-1">
                        {/* Notch rãnh cắt ngang màu đen */}
                        <div className="w-full h-1 bg-[#1976D2]/80 rounded shadow-[inset_0_1px_2px_rgba(25,118,210,0.5)] opacity-80" />
                        
                        {/* Elegant ticket slot LED flashing marquee */}
                        <div className="relative p-[2.5px] rounded-lg overflow-hidden bg-white shadow-inner w-full max-w-[110px] border border-[#1976D2]">
                          {/* Glowing flowing LED Marquee gradient border */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[conic-gradient(from_0deg,#FFD600,#ffeb3b,#FFD600)] animate-spin" style={{ animationDuration: '1.2s' }} />
                          {/* Glowing background fallback to ensure vibrant colors */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-40 bg-[#FFD600] blur-[3px] transition-opacity" />
                          
                          {/* The actual slot slit */}
                          <div className="relative bg-[#1976D2]/80 rounded-md flex items-center justify-center h-4 border border-[#1976D2]/40 z-10 shadow-[inset_0_2px_5px_rgba(25,118,210,0.5)]">
                            <div className="w-11/12 h-[2px] bg-[#FFD600]/80 rounded-full border-b border-[#ffeb3b]/30 relative overflow-hidden">
                              <div className="absolute inset-x-0 bottom-0 h-[1x] bg-[#fef08a]/80 animate-pulse" />
                            </div>
                          </div>
                        </div>

                        <p className="text-[7.5px] font-sans text-[#1976D2]/60 group-hover:text-[#1976D2] font-bold transition-colors uppercase tracking-tight">
                          Khử ấn nhận vé
                        </p>
                      </div>
                    </div>

                    {/* Right Dispensation Station (Vé Hộ Thân) */}
                    <div className="group flex flex-col items-center text-center space-y-2.5 p-3.5 bg-[#ffffff] rounded-xl border-2 border-[#1976D2]/50 shadow-[0_2px_5px_rgba(25,118,210,0.05)] transition-all duration-300 hover:border-[#1976D2]">
                      <span className="text-[10px] font-black font-serif text-[#1976D2] tracking-wider">
                        BÙA HỘ THÂN
                      </span>

                      {/* Big yellow arcade release button */}
                      <button
                        onClick={() => {
                          if (dispensedTicket === 'ho_than') {
                            playClickSound(260, 0.05);
                            return;
                          }
                          // 1. Shaking machine effect activation
                          playClickSound(180, 0.12);
                          setIsArcadeVibrating(true);
                          
                          // Heavy mechanical vibrational rumble audio sequence
                          setTimeout(() => playClickSound(160, 0.12), 100);
                          setTimeout(() => playClickSound(190, 0.12), 200);
                          setTimeout(() => playClickSound(150, 0.12), 300);
                          setTimeout(() => playClickSound(220, 0.1), 400);
                          setTimeout(() => {
                            setDispensedTicket('ho_than');
                            setIsArcadeVibrating(false);
                          }, 550);
                        }}
                        className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#FFD600] border-b-4 border-[#1976D2] text-[#1976D2] shadow-md active:border-b-0 active:translate-y-[4px] hover:brightness-110 active:shadow-inner cursor-pointer flex items-center justify-center text-base md:text-lg transition-transform"
                        title="In Bùa Hộ Mệnh Lệnh Chỉ"
                      >
                        🟡
                      </button>

                      {/* Ticket Slot - notch representation with marquee on hover */}
                      <div className="flex flex-col items-center space-y-1.5 w-full mt-1">
                        {/* Notch rãnh cắt ngang màu xanh nhạt dập ghim */}
                        <div className="w-full h-1 bg-[#1976D2]/80 rounded shadow-[inset_0_1px_2px_rgba(25,118,210,0.5)] opacity-80" />
                        
                        {/* Elegant ticket slot LED flashing marquee */}
                        <div className="relative p-[2.5px] rounded-lg overflow-hidden bg-white shadow-inner w-full max-w-[110px] border border-[#1976D2]">
                          {/* Glowing flowing LED Marquee gradient border */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[conic-gradient(from_0deg,#FFD600,#ffeb3b,#FFD600)] animate-spin" style={{ animationDuration: '1.2s' }} />
                          {/* Glowing background fallback to ensure vibrant colors */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-40 bg-[#FFD600] blur-[3px] transition-opacity" />
                          
                          {/* The actual slot slit */}
                          <div className="relative bg-[#1976D2]/80 rounded-md flex items-center justify-center h-4 border border-[#1976D2]/40 z-10 shadow-[inset_0_2px_5px_rgba(25,118,210,0.5)]">
                            <div className="w-11/12 h-[2px] bg-[#FFD600]/80 rounded-full border-b border-[#ffeb3b]/30 relative overflow-hidden">
                              <div className="absolute inset-x-0 bottom-0 h-[1px] bg-[#fef08a]/80 animate-pulse" />
                            </div>
                          </div>
                        </div>

                        <p className="text-[7.5px] font-sans text-stone-500 group-hover:text-[#ea580c] font-bold transition-colors uppercase tracking-tight">
                          Truy lộc bạt sầu
                        </p>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Smoke rising visualization effect from slots */}
                {isArcadeSmoke && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none flex items-center justify-center overflow-visible z-30">
                    <div className="divination-smoke-particle w-6 h-6 rounded-full bg-[#1976D2]/30 blur-[4px] absolute" style={{ animationDelay: '0s', left: '25%' }} />
                    <div className="divination-smoke-particle w-8 h-8 rounded-full bg-[#FFD600]/25 blur-[6px] absolute" style={{ animationDelay: '0.2s', left: '35%' }} />
                    <div className="divination-smoke-particle w-7 h-7 rounded-full bg-[#1976D2]/20 blur-[5px] absolute" style={{ animationDelay: '0.5s', left: '65%' }} />
                  </div>
                )}
              </motion.div>

              {/* The Dispensed Ticket Overlay (gorgeous pop-up ticket inside the screen) */}
              <AnimatePresence>
                {dispensedTicket && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0, rotate: -5, y: 100 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 50, rotate: 5 }}
                    transition={{ type: "spring", damping: 18, stiffness: 150 }}
                    className="absolute inset-x-4 top-24 bottom-6 z-40 bg-[#ffffff]/95 rounded-2xl border-2 border-dashed border-[#1976D2]/50 p-5 shadow-[0_20px_50px_rgba(25,118,210,0.35)] flex flex-col justify-between overflow-y-auto no-scrollbar backdrop-blur-md"
                  >
                    {/* Ticket top border style */}
                    <div className="flex justify-between text-[8px] font-mono text-[#1976D2]/60 uppercase tracking-widest border-b border-dashed border-[#1976D2]/30 pb-2 select-none">
                      <span>Arcade Ticket Dispenser v1.0</span>
                      <span>Serial No: #{dispensedTicket === 'cam_nang' ? '9201-CN' : '7730-HT'}</span>
                    </div>

                    {dispensedTicket === 'cam_nang' ? (
                      /* CAM NANG TICKET CONTENT */
                      <div className="flex-1 flex flex-col pt-3 text-left">
                        <div className="text-center mb-3 relative">
                          <span className="text-2xl">🎫</span>
                          <h4 className="font-serif font-black text-[#1976D2] text-lg uppercase drop-shadow-[0_2px_4px_rgba(25,118,210,0.2)]">
                            VÉ CẨM NANG DU HÀNH
                          </h4>
                          <p className="text-[9px] font-mono text-[#1976D2]/60 uppercase tracking-widest">
                            Gia Đình Thần Kỳ Nhà Tun
                          </p>
                        </div>

                        <div className="space-y-3 text-[#1976D2] overflow-y-auto max-h-[180px] pr-1 scrollbar-thin">
                          <div className="p-2.5 bg-[#ffffff] rounded-xl border border-[#1976D2]/20 shadow-[0_2px_8px_rgba(25,118,210,0.1)]">
                            <h5 className="font-serif font-bold text-xs text-[#1976D2] flex items-center gap-1.5">
                              ⭐ Vé Ưu Tiên (Priority Ticket)
                            </h5>
                            <p className="text-[10px] text-[#1976D2]/80 mt-1 leading-relaxed">
                              Dành tặng lượt bình chọn chí tôn từ rương báu để dâng lễ phong thần tại Altar, hỗ trợ gia tăng tu vi vinh hiển cho các mỹ nam mỹ nữ của vương quốc.
                            </p>
                          </div>

                          <div className="p-2.5 bg-[#ffffff] rounded-xl border border-[#1976D2]/20 shadow-[0_2px_8px_rgba(25,118,210,0.1)]">
                            <h5 className="font-serif font-bold text-xs text-[#1976D2] flex items-center gap-1.5">
                              🔮 Giếng Ước Nguyện (Wishing Well)
                            </h5>
                            <p className="text-[10px] text-[#1976D2]/80 mt-1 leading-relaxed">
                              Nơi chôn giấu tâm tư, mộng tưởng thầm kín của du khách gửi tới thượng đế. Dâng hiến lễ vật vàng bạc thành tâm để nuôi dưỡng mầm cây quốc gia hưng thịnh.
                            </p>
                          </div>

                          <div className="p-2.5 bg-[#ffffff] rounded-xl border border-[#1976D2]/20 shadow-[0_2px_8px_rgba(25,118,210,0.1)]">
                            <h5 className="font-serif font-bold text-xs text-[#1976D2] flex items-center gap-1.5">
                              📜 Lưu Bút Du Khách (Guestbook)
                            </h5>
                            <p className="text-[10px] text-[#1976D2]/80 mt-1 leading-relaxed">
                              Đặt dấu tay lên bức tường ký ức, khắc ghi lại những cảm xúc mộc mạc và chân thành nhất trong hành trình thám hiểm tiên giới linh thiêng.
                            </p>
                          </div>
                        </div>

                        {/* Full Doc link */}
                        <a
                          href="https://docs.google.com/document/d/1I1aGYMD0d8nfukA2ZtV2r4KewbA8JakukA2YSRuPzdc/edit?usp=drivesdk"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => playClickSound(500, 0.1)}
                          className="w-full mt-4 py-2.5 rounded-xl text-xs font-serif font-black text-center bg-[#FFD600] text-[#1976D2] border-2 border-[#1976D2] hover:bg-[#ffeb3b] active:scale-95 transition flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(25,118,210,0.15)]"
                        >
                          <span>Đọc Toàn Bộ Bản Thư Cẩm Nang 📖</span>
                        </a>
                      </div>
                    ) : (
                      /* HO THAN TICKET CONTENT */
                      <div className="flex-1 flex flex-col pt-3 text-left">
                        <div className="text-center mb-3 relative">
                          <span className="text-2xl">🛡️</span>
                          <h4 className="font-serif font-black text-[#1976D2] text-lg uppercase drop-shadow-[0_2px_4px_rgba(25,118,210,0.2)]">
                            BÙA HỘ THÂN CHỐNG BONK
                          </h4>
                          <p className="text-[9px] font-mono text-[#1976D2]/60 uppercase tracking-widest">
                            Supremacy Shield Spell
                          </p>
                        </div>

                        <div className="space-y-3 text-[#1976D2] overflow-y-auto max-h-[180px] pr-1 scrollbar-thin">
                          <div className="p-2.5 bg-[#ffffff] rounded-xl border border-[#1976D2]/20 shadow-[0_2px_8px_rgba(25,118,210,0.1)]">
                            <h5 className="font-serif font-bold text-xs text-[#1976D2] flex items-center gap-1.5">
                              ⚔️ Cấm Xâm Phạm Vương Lãnh
                            </h5>
                            <p className="text-[10px] text-[#1976D2]/80 mt-1 leading-relaxed">
                              Nghiêm cấm tuyệt đối mọi hành vi công kích phi lễ, spam, phá quấy hay quấy rối bừa bãi vương lãnh linh thiêng và thần dân đang tu hành pháp lực tại điện thờ Altar.
                            </p>
                          </div>

                          <div className="p-2.5 bg-[#ffffff] rounded-xl border border-[#1976D2]/20 shadow-[0_2px_8px_rgba(25,118,210,0.1)]">
                            <h5 className="font-serif font-bold text-xs text-[#1976D2] flex items-center gap-1.5">
                              ⚡ Phép Thuật Phản Chấn 100%
                            </h5>
                            <p className="text-[10px] text-[#1976D2]/80 mt-1 leading-relaxed">
                              Lá bùa hộ mệnh phong ấn lời nguyền tối thượng, lập tức hóa giải và phản hồi mọi sát thương hoặc hành vi bonk ác ý ngược lại kẻ thủ ác, phong tỏa hoàn toàn nội lực hắc ám.
                            </p>
                          </div>

                          <div className="p-2.5 bg-[#ffffff] rounded-xl border border-[#1976D2]/20 shadow-[0_2px_8px_rgba(25,118,210,0.1)]">
                            <h5 className="font-serif font-bold text-xs text-[#1976D2] flex items-center gap-1.5">
                              🏵️ Thiên Lệnh Bảo Hộ Gia Tộc
                            </h5>
                            <p className="text-[10px] text-[#1976D2]/80 mt-1 leading-relaxed">
                              Giúp chư vị hào kiệt an tâm gacha ngắm mộng đẹp, giao lưu đàm đạo bằng tấm lòng tri kỷ chân thuần mà không sợ bất kỳ thế lực cuồng phong nào quấy nhiễu.
                            </p>
                          </div>
                        </div>

                        {/* Full Doc link */}
                        <a
                          href="https://docs.google.com/document/d/1BmyFxW6a22cV5mKHOGCFzRj3v-nmujSd0-J-qCOfEOQ/edit?usp=drivesdk"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => playClickSound(500, 0.1)}
                          className="w-full mt-4 py-2.5 rounded-xl text-xs font-serif font-black text-center bg-[#FFD600] text-[#1976D2] border-2 border-[#1976D2] hover:bg-[#ffeb3b] active:scale-95 transition flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(25,118,210,0.15)]"
                        >
                          <span>Xem Lệnh Chỉ Chống Bonk Đầy Đủ 🛡️</span>
                        </a>
                      </div>
                    )}

                    {/* Return Ticket Button at bottom */}
                    <button
                      onClick={() => {
                        playClickSound(300, 0.08);
                        setDispensedTicket(null);
                      }}
                      className="w-full mt-4 py-2 border-2 border-dashed border-[#FFD600]/50 hover:border-[#FFD600] text-[#FFD600] font-mono tracking-widest text-[10px] cursor-pointer"
                    >
                      ▲ HOÀN VÉ VÀO MÁY IN
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Close Button: Astrological Eye representation (Mắt Thần Chiêm Tinh) */}
              <button
                onClick={() => {
                  playClickSound(300, 0.08);
                  setIsCommandModalOpen(false);
                }}
                title="Đóng Hướng Dẫn"
                className="absolute top-4 right-4 bg-[#FFD600] hover:brightness-110 border-2 border-[#1976D2] rounded-full w-9 h-9 flex items-center justify-center shadow-[0_4px_12px_rgba(25,118,210,0.15)] hover:bg-[#ffeb3b] active:scale-95 transition-all cursor-pointer z-50 group"
              >
                {/* SVG Astrological Eye shape -> Changed to close icon */}
                <svg className="w-5 h-5 text-[#1976D2] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
              
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Announcement popup window (The Wizard's Notice Board) */}
      <AnimatePresence>
        {isAnnouncementModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
              onClick={() => {
                playClickSound(300, 0.08);
                setIsAnnouncementModalOpen(false);
              }}
            />
            {/* The Notice Board Container */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-[390px] mx-auto z-10 flex flex-col items-center"
            >
              {/* Hanging Ropes extending to top of screen */}
              {/* Left hanging rope */}
              <div className="absolute top-[-200vh] left-[20%] w-1.5 h-[200vh] bg-gradient-to-r from-[#221208] via-[#8c6747] to-[#221208] shadow-[2px_0_5px_rgba(0,0,0,0.55)] border-r border-[#1a0a03] pointer-events-none z-[-1]" />
              {/* Right hanging rope */}
              <div className="absolute top-[-200vh] right-[20%] w-1.5 h-[200vh] bg-gradient-to-r from-[#221208] via-[#8c6747] to-[#221208] shadow-[2px_0_5px_rgba(0,0,0,0.55)] border-r border-[#1a0a03] pointer-events-none z-[-1]" />

              {/* Left hanging connection loops */}
              <div className="absolute top-[-10px] left-[18%] flex flex-col items-center gap-1 z-20 pointer-events-none">
                <div className="rope-knot-tight" />
                <div className="wood-bracket-ring" />
              </div>
              {/* Right hanging connection loops */}
              <div className="absolute top-[-10px] right-[18%] flex flex-col items-center gap-1 z-20 pointer-events-none">
                <div className="rope-knot-tight" />
                <div className="wood-bracket-ring" />
              </div>

              {/* The Actual Wooden Plaque */}
              <div 
                className="rustic-wood-sign relative w-full rounded-2xl p-6 shadow-[0_20px_45px_rgba(0,0,0,0.8),inset_0_2px_5px_rgba(255,255,255,0.45)] mt-4 flex flex-col space-y-5 px-7 py-6 text-center select-none"
              >
                {/* Organic Green Leaf close button at the top corner */}
                <button
                  onClick={() => {
                    playClickSound(300, 0.08);
                    setIsAnnouncementModalOpen(false);
                  }}
                  className="absolute -top-3 -right-3 p-2 bg-[#15803d] hover:bg-[#166534] active:scale-95 transition-all rounded-full text-yellow-105 border-2 border-[#14532d] cursor-pointer z-30 shadow-md group flex items-center justify-center hover:rotate-12"
                  title="Đóng Bảng Gỗ"
                >
                  <Leaf className="w-4 h-4 text-yellow-200 group-hover:animate-pulse" />
                </button>

                {/* Header Title on board: Wood-themed label */}
                <div className="flex items-center justify-center pb-2 border-b border-[#5c3a21]/20">
                  <span className="text-lg mr-1.5">🪵</span>
                  <h3 className="text-xs font-serif font-black text-[#5c3a21] uppercase tracking-[0.2em] font-bold">
                    BẢNG TIN KHU VUI CHƠI
                  </h3>
                </div>

                {/* Notice text written directly over the wooden plaque with hand-painted paint style */}
                <div className="py-2.5 text-center">
                  <p className="wood-painted-handcrafted-text text-sm md:text-base selection:bg-yellow-800/20">
                    Chào mừng đến trung tâm giải trí của Tun, Hãy đến quầy hướng dẫn để biết đi đâu chơi nhé 🌟
                  </p>
                </div>

                {/* Bottom Wooden Branch Close handle / button */}
                <div className="pt-2.5 flex justify-center">
                  <button
                    onClick={() => {
                      playClickSound(300, 0.08);
                      setIsAnnouncementModalOpen(false);
                    }}
                    className="px-5 py-2 bg-[#5c3a21] hover:bg-[#4a2e1a] text-[#fffbeb] font-serif font-bold text-[10px] tracking-widest rounded-lg border border-[#3b2314] shadow-md hover:brightness-105 active:scale-95 transition-all duration-150 cursor-pointer flex items-center gap-1.5 uppercase"
                  >
                    <Leaf className="w-3.5 h-3.5 text-green-300" />
                    <span>Xác nhận</span>
                  </button>
                </div>
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
      <footer className={`mt-12 text-center text-slate-400 py-6 flex flex-col items-center gap-3 z-10 w-full max-w-4xl ${hasEntered ? "border-t border-white/10 font-sans text-[10px] md:text-xs" : ""}`}>
        {hasEntered ? (
          <>
            <div className="flex items-center gap-3">
              <a
                href="https://discord.gg/UXYJmxXBY"
                target="_blank"
                rel="noopener noreferrer"
                className="mini-oval-tag"
              >
                Discord 💬
              </a>
              <a
                href="https://www.facebook.com/share/18yG86eq1t/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="mini-oval-tag"
              >
                Facebook 🌐
              </a>
            </div>
            <p 
              className="select-none text-center max-w-lg px-4 mt-1" 
              style={{ 
                fontFamily: "'Georgia', 'Times New Roman', serif", 
                fontSize: "12px", 
                color: "#FFE79A", 
                opacity: 0.55, 
                letterSpacing: "1.5px",
                lineHeight: "1.6"
              }}
            >
              ✦ Chào mừng đến với Khu giải trí của Tun • Bản đồ ảo ảnh mở ra thế giới của những câu chuyện huyền bí ✦
            </p>
          </>
        ) : (
          <p 
            className="select-none text-center max-w-lg px-4" 
            style={{ 
              fontFamily: "'Georgia', 'Times New Roman', serif", 
              fontSize: "12px", 
              color: "#FFE79A", 
              opacity: 0.55, 
              letterSpacing: "1.5px",
              lineHeight: "1.6"
            }}
          >
            ✦ Chào mừng đến với Khu giải trí của Tun • Bản đồ ảo ảnh mở ra thế giới của những câu chuyện huyền bí ✦
          </p>
        )}
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
                  className="absolute animate-float-up-fade font-bold select-none pointer-events-none"
                  style={{
                    left: `calc(50% - 12px + ${note.left})`,
                    bottom: '20px',
                    fontSize: note.size,
                    color: note.color,
                    animationDuration: note.duration,
                    filter: `drop-shadow(0 0 6px ${note.color})`,
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
            className={`music-ticket-btn hover:shadow-[0_0_15px_rgba(255,174,52,0.6)] active:scale-95 transition-all group ${isPlaying ? 'animate-sway' : ''}`}
          >
            <div className="music-ticket-inner-border"></div>
            {isPlaying ? (
              <div className="flex items-end justify-center gap-1 h-6 relative z-10 px-1">
                <span className="w-1 bg-[#FFAE34] rounded-full animate-eq-1 shadow-[0_0_8px_#FFAE34]" />
                <span className="w-1 bg-[#FFAE34] rounded-full animate-eq-2 shadow-[0_0_8px_#FFAE34]" style={{ animationDelay: '0.1s' }} />
                <span className="w-1 bg-[#FFAE34] rounded-full animate-eq-3 shadow-[0_0_8px_#FFAE34]" style={{ animationDelay: '0.2s' }} />
                <span className="w-1 bg-[#FFAE34] rounded-full animate-eq-4 shadow-[0_0_8px_#FFAE34]" style={{ animationDelay: '0.15s' }} />
                <span className="w-1 bg-[#FFAE34] rounded-full animate-eq-2 shadow-[0_0_8px_#FFAE34]" style={{ animationDelay: '0.3s' }} />
              </div>
            ) : (
              <Music className="w-6 h-6 text-[#FFAE34] relative z-10" style={{ filter: 'drop-shadow(0 0 4px rgba(255,174,52,0.4))' }} />
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
              className="relative w-full max-w-[340px] mx-auto rounded-3xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(181,138,67,0.25)] overflow-hidden z-10 flex flex-col border-[5px] border-[#8a5d30]"
              style={{
                background: 'radial-gradient(circle at center, #5c3012 0%, #3e1e07 65%, #1e0d02 100%)',
              }}
            >
              {/* Inner brass plate styled decorative borders */}
              <div className="absolute inset-1 border border-[#ffd175]/25 rounded-2xl pointer-events-none z-0" />
              <div className="absolute inset-1.5 border border-[#44220b] rounded-2xl pointer-events-none z-0" />
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none mix-blend-overlay" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/wood-pattern.png')" }}></div>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500 rounded-full blur-3xl opacity-[0.08] pointer-events-none"></div>
              
              <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 mb-5 relative z-10">
                <h3 className="text-sm font-serif font-black text-amber-100 tracking-widest flex items-center gap-2">
                  <Music className="w-4 h-4 text-amber-400 animate-pulse" /> THE GRAMOPHONE
                </h3>
                <div className="flex items-center gap-1.5">
                  {isPlaylistViewOpen && (
                    <button
                      onClick={() => {
                        playClickSound(300, 0.08);
                        setIsPlaylistViewOpen(false);
                      }}
                      className="p-1 rounded-full text-amber-200/70 hover:text-amber-200 hover:bg-amber-900/40 transition cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      playClickSound(300, 0.08);
                      setIsMusicModalOpen(false);
                      setIsPlaylistViewOpen(false);
                    }}
                    className="p-1 rounded-full text-amber-200/60 hover:text-amber-200 hover:bg-amber-900/40 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tone Arm element placing on the side */}
              {!isPlaylistViewOpen && (
                <div 
                  className="absolute top-[72px] right-[10px] w-24 h-36 pointer-events-none z-20 transition-all duration-[1200ms] ease-in-out"
                  style={{
                    transformOrigin: '76px 14px',
                    transform: isPlaying ? 'rotate(24deg)' : 'rotate(0deg)',
                  }}
                >
                  {/* SVG for a beautiful golden metal tone arm */}
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 150">
                    {/* Decorative golden Pivot Base with screws */}
                    <circle cx="80" cy="20" r="14" fill="url(#brass-grad-arm)" stroke="#3e2307" strokeWidth="1.5" />
                    <circle cx="80" cy="20" r="8" fill="#3e2307" />
                    <circle cx="80" cy="20" r="3" fill="#ffd175" />
                    {/* Outer ring accent */}
                    <circle cx="80" cy="20" r="18" fill="none" stroke="#ffd175" strokeWidth="0.8" strokeDasharray="2,2" opacity="0.4" />
                    
                    {/* Metallic arm bar */}
                    <path 
                      d="M 80 20 Q 82 72, 54 100 T 36 128" 
                      fill="none" 
                      stroke="url(#silver-brass-grad-arm)" 
                      strokeWidth="3.2" 
                      strokeLinecap="round"
                    />
                    
                    {/* Weight balance slider */}
                    <rect x="74" y="2" width="12" height="6" rx="1" fill="#2d1c0b" />
                    
                    {/* Headshell/Needle block */}
                    <g transform="translate(36, 128) rotate(-35)">
                      {/* Shell holder */}
                      <rect x="-6" y="-3" width="12" height="18" rx="1" fill="url(#brass-grad-arm)" stroke="#221102" strokeWidth="1" />
                      {/* Red status gem marker on needle cartridge */}
                      <circle cx="0" cy="3" r="1.5" fill="#ef4444" />
                      {/* Metal needle stick tip */}
                      <line x1="0" y1="15" x2="-2" y2="24" stroke="#d4d4d4" strokeWidth="1" />
                      <circle cx="-2" cy="24" r="1.2" fill="#fff" />
                    </g>

                    {/* Gradients definitions for Tone Arm */}
                    <defs>
                      <linearGradient id="brass-grad-arm" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffd175" />
                        <stop offset="40%" stopColor="#d3a23a" />
                        <stop offset="100%" stopColor="#7a5214" />
                      </linearGradient>
                      <linearGradient id="silver-brass-grad-arm" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="35%" stopColor="#e5e5e5" />
                        <stop offset="65%" stopColor="#ffd175" />
                        <stop offset="100%" stopColor="#7a5214" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              )}

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
                      <div className="flex flex-col items-center mb-5 relative">
                        {/* Gramophone Platter / Deck Frame */}
                        <div className="relative w-48 h-48 md:w-52 md:h-52 rounded-full flex items-center justify-center p-1.5 shadow-[0_15px_30px_rgba(0,0,0,0.65),inset_0_4px_8px_rgba(255,255,255,0.15)] bg-gradient-to-br from-[#8a5d30] via-[#522b10] to-[#291202] border-[3px] border-[#b5863d]">
                          
                          {/* Inner brass rim of deck */}
                          <div className="absolute inset-2 rounded-full border border-[#ffd175]/30 pointer-events-none" />

                          {/* Vinyl Record */}
                          <div 
                            className="w-full h-full rounded-full relative flex items-center justify-center overflow-hidden vinyl-record-spin cursor-pointer"
                            style={{ 
                              background: 'radial-gradient(circle, #2a2a2a 0%, #151515 35%, #050505 60%, #1a1a1a 80%, #020202 100%)',
                              boxShadow: 'inset 0 0 12px rgba(0,0,0,0.9), 0 5px 12px rgba(0,0,0,0.5)',
                              animationPlayState: isPlaying ? 'running' : 'paused',
                            }}
                          >
                            {/* Record grooves concentric rings */}
                            <div className="absolute inset-4 rounded-full border border-neutral-800/80 pointer-events-none" />
                            <div className="absolute inset-8 rounded-full border border-neutral-900/60 pointer-events-none" />
                            <div className="absolute inset-12 rounded-full border border-neutral-800/80 pointer-events-none" />
                            <div className="absolute inset-16 rounded-full border border-neutral-900/60 pointer-events-none" />
                            <div className="absolute inset-20 rounded-full border border-neutral-800/80 pointer-events-none" />
                            
                            {/* Shimmer/reflective luster overlays */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent rotate-12 pointer-events-none opacity-30" />
                            <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-white/5 to-transparent rotate-12 pointer-events-none opacity-30" />
                            <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-white/5 to-transparent -rotate-35 pointer-events-none opacity-35" />
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent -rotate-35 pointer-events-none opacity-35" />

                            {/* Center Golden Record Label */}
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full relative flex items-center justify-center overflow-hidden border-2 border-[#b5863d] shadow-[0_2px_5px_rgba(0,0,0,0.55)]" style={{ background: 'linear-gradient(135deg, #2d1607 0%, #522b10 50%, #170801 100%)' }}>
                              <div className="absolute inset-0.5 rounded-full border border-[#f5cc60]/40 pointer-events-none" />
                              <div className="w-full h-full opacity-70 scale-90 rounded-full bg-cover bg-center" style={{ backgroundImage: "url('https://i.pinimg.com/736x/88/df/d2/88dfd27be6fd7170abdef1921379f6e7.jpg')" }} />
                              {/* Spindle hole */}
                              <div className="absolute w-3.5 h-3.5 rounded-full bg-[#f3d078] border border-[#522b10] flex items-center justify-center shadow-inner z-10">
                                <div className="w-1 h-1 rounded-full bg-black" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Dust Particles floating lơ lửng around */}
                        {isPlaying && Array.from({ length: 6 }).map((_, i) => (
                          <div
                            key={i}
                            className="absolute gold-dust-particle rounded-full bg-amber-400 pointer-events-none"
                            style={{
                              left: `${20 + (i * 12)}%`,
                              bottom: '30%',
                              width: `${1.2 + (i % 3)}px`,
                              height: `${1.2 + (i % 3)}px`,
                              filter: 'blur(0.4px) drop-shadow(0 0 2.5px #f59e0b)',
                              animationDelay: `${i * 0.6}s`,
                              '--dust-x': `${(i % 2 === 0 ? 1 : -1) * (15 + (i * 4))}px`,
                              '--dust-dur': `${3.5 + (i % 3)}s`
                            } as CSSProperties}
                          />
                        ))}
                      </div>

                      {/* Song information with soft italic fonts */}
                      <div className="text-center mb-4 px-2 relative z-10">
                        <h4 className="text-base md:text-lg font-serif italic text-[#FFE79A] text-center tracking-wide line-clamp-1 drop-shadow-md pr-1">
                          {currentSong?.title || "No track selected"}
                        </h4>
                        <p className="text-[11px] font-serif italic text-amber-300/60 mt-0.5 tracking-wider">
                          {currentSong?.playlist || `Album #${currentTrackIndex + 1}`}
                        </p>
                      </div>

                      {/* Classic wood-carved timeline groove with brass accents */}
                      <div className="w-full mb-5 relative z-10 px-2 font-serif">
                        <div className="flex items-center justify-between text-[11px] italic font-semibold text-amber-200/80 mb-1.5">
                          <span>{formatMusicTime(musicProgress)}</span>
                          <span>{formatMusicTime(musicDuration)}</span>
                        </div>
                        <div className="relative flex items-center h-2.5">
                          {/* Inner dark trench slot of wood */}
                          <div className="absolute inset-0 bg-[#1c0d02] rounded-full border border-[#8a5d30]/35 shadow-inner" />
                          <input
                            type="range"
                            min="0"
                            max={musicDuration || 100}
                            value={musicProgress || 0}
                            onChange={handleMusicProgressChange}
                            className="w-full h-1 bg-transparent rounded-full appearance-none cursor-pointer accent-[#ffd175] absolute left-0 right-0 z-10"
                            style={{
                              WebkitAppearance: 'none',
                              outline: 'none',
                            }}
                          />
                          {/* Gold accent filled progress line */}
                          <div 
                            className="absolute top-[3px] left-0 h-1 bg-gradient-to-r from-amber-600 via-[#ffd175] to-amber-200 rounded-full pointer-events-none" 
                            style={{ width: `${(musicProgress / (musicDuration || 100)) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Classic Cast Brass Control Knobs */}
                      <div className="flex items-center justify-center gap-5 mb-5 relative z-10">
                        <button 
                          onClick={playPrevTrack} 
                          title="Trước đó"
                          className="w-10 h-10 rounded-full flex items-center justify-center brass-button cursor-pointer"
                        >
                          <SkipBack className="w-4 h-4" fill="currentColor" stroke="none" />
                        </button>
                        <button 
                          onClick={toggleMusicPlay}
                          title={isPlaying ? "Dừng nhạc" : "Phát nhạc"}
                          className="w-13 h-13 rounded-full flex items-center justify-center brass-button shadow-lg cursor-pointer transform hover:scale-105 active:scale-95"
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5 animate-none" fill="currentColor" stroke="none" />
                          ) : (
                            <Play className="w-5 h-5 ml-1" fill="currentColor" stroke="none" />
                          )}
                        </button>
                        <button 
                          onClick={playNextTrack} 
                          title="Sau đó"
                          className="w-10 h-10 rounded-full flex items-center justify-center brass-button cursor-pointer"
                        >
                          <SkipForward className="w-4 h-4" fill="currentColor" stroke="none" />
                        </button>
                      </div>

                      <button 
                        onClick={() => {
                          playClickSound(300, 0.08);
                          setIsPlaylistViewOpen(true);
                        }}
                        className="w-full py-2.5 bg-gradient-to-r from-[#4d260c] to-[#291202] hover:from-[#623211] hover:to-[#3e1b04] border border-[#ffd175]/35 hover:border-[#ffd175]/60 flex items-center justify-center gap-2 rounded-xl text-amber-200 font-serif font-bold text-xs tracking-wider shadow-md transition-all cursor-pointer"
                      >
                        <ListMusic className="w-4 h-4 text-amber-300" /> KHAI PHÁP KHÚC PHỔ
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="playlist-view"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col w-full h-[320px] font-serif text-amber-100"
                    >
                      <h4 className="text-xs font-bold text-amber-300/75 uppercase tracking-widest mb-3 pl-1">
                        SÁCH BẢN CHÚ KHÚC
                      </h4>
                      {/* Current Playlist */}
                      <div className="flex-1 overflow-y-auto mb-4 pr-1 space-y-2 no-scrollbar custom-scrollbar">
                        {playlist.map((track, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              playClickSound(300, 0.08);
                              setCurrentTrackIndex(index);
                              setIsPlaying(true);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl transition flex justify-between items-center border ${
                              index === currentTrackIndex 
                                ? 'bg-[#5c3012]/80 text-[#ffd175] border-[#ffd175]/60 shadow-[0_0_10px_rgba(255,174,52,0.3)] font-bold' 
                                : 'bg-[#291202]/55 border-[#8a5d30]/20 text-amber-100/85 hover:bg-[#522b10]/40 hover:text-amber-100'
                            }`}
                          >
                            <span className="font-serif italic text-xs truncate mr-2">{track.title}</span>
                            {index === currentTrackIndex && isPlaying && (
                              <Music className="w-3.5 h-3.5 animate-pulse shrink-0 text-[#ffd175]" />
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

      {/* Gacha Modal */}
      <AnimatePresence>
        {gachaResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.85, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 30, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 120 }}
              className="relative w-full max-w-[380px] rounded-[36px] p-5 md:p-6 shadow-[0_20px_50px_rgba(244,63,94,0.3)] bg-gradient-to-b from-[#0f111a] via-[#090b11] to-[#040508] border-4 border-pink-500/50 flex flex-col items-center overflow-hidden"
              style={{
                backgroundImage: "url('https://www.transparenttextures.com/patterns/dark-matter.png')"
              }}
            >
              {/* Retro arcade glowing corner decals */}
              <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-pink-400/80 rounded-tl-md pointer-events-none" />
              <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-pink-400/80 rounded-tr-md pointer-events-none" />
              <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-pink-400/80 rounded-bl-md pointer-events-none" />
              <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-pink-400/80 rounded-br-md pointer-events-none" />

              {/* Close Button at top absolute in retro frame */}
              <button
                onClick={() => {
                  playClickSound(300, 0.05);
                  setGachaResult(null);
                }}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-pink-950/40 hover:bg-rose-600/60 border border-pink-500/30 text-pink-300 hover:text-white transition cursor-pointer z-50 animate-none"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Floating Arcade Sparkle Particles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute bg-cyan-400 rounded-full animate-pulse"
                    style={{
                      left: `${15 + (Math.sin(i) * 35 + 35)}%`,
                      top: `${15 + (Math.cos(i) * 35 + 35)}%`,
                      width: `${3 + (i % 3)}px`,
                      height: `${3 + (i % 3)}px`,
                      filter: 'blur(0.3px)',
                      animationDuration: `${1.5 + (i % 3)}s`,
                      animationDelay: `${i * 0.4}s`
                    }}
                  />
                ))}
              </div>

              {/* Claw Machine Glass Chamber Grid Stage */}
              <div className="relative w-full h-48 md:h-52 rounded-[30px] border-[5px] border-cyan-500/80 bg-slate-950/85 shadow-[0_0_20px_rgba(6,182,212,0.4),inset_0_0_25px_rgba(0,0,0,0.9)] overflow-hidden flex items-center justify-center mb-5">
                
                {/* Shiny Glass highlights */}
                <div className="absolute top-0 inset-x-0 h-[30%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-10" />
                <div className="absolute left-3 top-3 bottom-3 w-1.5 bg-white/5 rounded-full pointer-events-none z-10" />

                {/* Grid background representing arcade neon style */}
                <div className="absolute inset-0 opacity-15 pointer-events-none z-0 bg-grid-pattern" 
                     style={{ 
                       backgroundImage: "radial-gradient(#06b6d4 1.5px, transparent 1.5px)", 
                       backgroundSize: "16px 16px" 
                     }} 
                />

                {/* A pool of cute plushy toys / gacha balls at the bottom of the glass cabinet */}
                <div className="absolute bottom-1 inset-x-3 h-14 opacity-85 flex justify-around items-end select-none pointer-events-none z-0">
                  <span className="text-3xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] animate-capsule-shake" style={{ animationDelay: '0.1s' }}>🐱</span>
                  <span className="text-4xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] animate-capsule-shake" style={{ animationDelay: '0.3s' }}>🧸</span>
                  <span className="text-3xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] animate-capsule-shake" style={{ animationDelay: '0.5s' }}>🐰</span>
                  <span className="text-4xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] animate-capsule-shake" style={{ animationDelay: '0.2s' }}>🦊</span>
                  <span className="text-3.5xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] animate-capsule-shake" style={{ animationDelay: '0.4s' }}>🦄</span>
                  <span className="text-3.5xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] animate-capsule-shake" style={{ animationDelay: '0.6s' }}>🦁</span>
                </div>

                {/* Mechanical Claw at the top */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none origin-top ${isSummoning ? "animate-claw-grabbing" : "animate-claw-idle"}`}>
                  {/* Metal bar/string */}
                  <div className="w-[3px] h-10 bg-gradient-to-r from-slate-400 to-slate-200 mx-auto" />
                  
                  {/* Robotic Claw joint */}
                  <div className="w-5 h-4 bg-slate-300 rounded-sm border border-slate-400 -mt-0.5 flex items-center justify-center shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  </div>

                  {/* Left Claw Prong */}
                  <svg className="absolute top-10 right-2.5 w-4 h-6 text-slate-300" viewBox="0 0 20 30" fill="currentColor">
                    <path d="M 18,0 C 12,5 6,15 10,28 L 6,28 C 2,15 8,5 18,0 Z" />
                  </svg>
                  {/* Right Claw Prong */}
                  <svg className="absolute top-10 left-2.5 w-4 h-6 text-slate-300" viewBox="0 0 20 30" fill="currentColor">
                    <path d="M 2,0 C 8,5 14,15 10,28 L 14,28 C 18,15 12,5 2,0 Z" />
                  </svg>
                </div>

                {/* State Reveal container */}
                <AnimatePresence mode="wait">
                  {isSummoning ? (
                    <motion.div
                      key="claw-gabbing-capsule"
                      initial={{ opacity: 0, scale: 0.5, y: -20 }}
                      animate={{ opacity: 1, scale: 1, y: 15 }}
                      exit={{ opacity: 0, scale: 1.5, y: 30 }}
                      className="absolute z-10 flex flex-col items-center justify-center text-center mt-6"
                    >
                      {/* Glow Gacha capsule picked up */}
                      <div className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-400/80 to-cyan-400/80 border-2 border-white flex items-center justify-center animate-bounce shadow-[0_0_20px_#22d3ee]">
                        <span className="text-2xl animate-spin" style={{ animationDuration: '3s' }}>🎁</span>
                      </div>
                      <span className="text-[10px] uppercase font-black tracking-wider animate-led-blink-neon mt-4 font-sans text-center">
                        🧸 ĐANG GẮP NHÂN DUYÊN...
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="gacha-character-avatar"
                      initial={{ opacity: 0, scale: 0.6, y: 30 }}
                      animate={{ opacity: 1, scale: 1, y: 12 }}
                      transition={{ type: "spring", damping: 15 }}
                      className="relative z-10 flex flex-col items-center justify-center mt-3"
                    >
                      {/* A shiny glowing bubble capsule enclosing the character's avatar */}
                      <div className="relative p-1.5 rounded-full bg-gradient-to-tr from-pink-500 via-yellow-400 to-cyan-400 shadow-[0_12px_30px_rgba(34,211,238,0.5),0_0_20px_rgba(244,63,94,0.3)] animate-slow-swim">
                        <div className="w-20 h-20 md:w-22 md:h-22 rounded-full bg-[#0a0f1d] border-[3px] border-white flex items-center justify-center text-5xl relative group overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-transparent to-pink-500/20 pointer-events-none" />
                          <span className="select-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">{gachaResult.avatar}</span>
                          
                          {/* Neon capsule top/bottom separation line representing gacha bubble halves */}
                          <div className="absolute inset-x-0 top-1/2 h-[2px] bg-white/80 shadow-[0_0_5px_rgba(255,255,255,1)]" />
                        </div>
                        
                        {/* Floating sparkles around the bubble */}
                        <span className="absolute -top-1 -right-1 text-base animate-pulse">✨</span>
                        <span className="absolute -bottom-1 -left-1 text-sm animate-bounce" style={{ animationDelay: '0.5s' }}>⭐️</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Character Details in beautiful Serif, fading in */}
              <AnimatePresence mode="wait">
                {!isSummoning && (
                  <motion.div
                    key="character-info"
                    initial={{ opacity: 0, y: 15, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                    className="w-full text-center z-10"
                  >
                    <div className="mb-3">
                      <span className="text-[10px] uppercase font-black tracking-widest font-sans text-cyan-400">
                        👾 THÚ BÔNG NHÂN DUYÊN GẮP ĐƯỢC 👾
                      </span>
                      <h2 className="text-xl md:text-2xl font-serif italic font-black text-[#FFE79A] tracking-wide drop-shadow-md mt-1">
                        Tôi là {gachaResult.name} đây !!!
                      </h2>
                    </div>

                    <div 
                      className="text-xs md:text-sm text-amber-100/90 leading-relaxed p-4 rounded-2xl border border-cyan-950/80 bg-slate-950/70 shadow-inner mb-6 max-h-40 overflow-y-auto custom-scrollbar font-serif italic text-left"
                      style={{
                        backgroundImage: "url('https://www.transparenttextures.com/patterns/dark-paths.png')"
                      }}
                    >
                      {gachaResult.description}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Re-summon Button */}
              <div className="w-full z-10 mt-auto">
                <button
                  disabled={isSummoning}
                  onClick={() => {
                    playClickSound(600, 0.1);
                    setIsSummoning(true);
                    const randomIndex = Math.floor(Math.random() * CHARACTERS.length);
                    setTimeout(() => {
                      setGachaResult(CHARACTERS[randomIndex]);
                      setIsSummoning(false);
                    }, 1200);
                  }}
                  className="w-full py-3.5 arcade-red-neon-btn text-white font-sans font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Flame className="w-4 h-4 text-white animate-pulse" />
                  🕹️ GẮP LẠI PHÁT NỮA!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
