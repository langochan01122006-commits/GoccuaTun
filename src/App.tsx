import { useState, useEffect, useRef, CSSProperties, FormEvent } from "react";
import { CHARACTERS, Character } from "./characters";
import { Search, Heart, Sparkles, MessageCircle, BookOpen, Volume2, VolumeX, Moon, Sun, ArrowLeft, RotateCcw, BarChart3, Gift, Check, X, Copy, ScrollText, Music, Play, Pause, SkipBack, SkipForward, ListMusic, User, Package, PackageOpen, Megaphone, Star, Info, PenTool, DoorOpen, Flame, Shield, Map, Crown, Leaf, Eye, EyeOff, Mail } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import StoryModal from "./components/StoryModal";
import ChatBox from "./components/ChatBox";
import { LetterNotice } from "./components/LetterNotice";
import { ArtGallery } from "./components/ArtGallery";
import { getAllVotes, voteForCharacter, unvoteForCharacter, subscribeToVotes, signInWithGoogle, signInWithApple, signInWithGoogleRedirect, signInWithAppleRedirect, handleRedirectResult, loginWithEmailPassword, registerWithEmailPassword, updateUserCustomProfile, logoutUser, auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

const donateQrImg = "/src/assets/images/donate_qr_code_1781767011629.jpg";

const musicPlaylists = {
  "us-uk": [
    { id: 1, title: "Young and Beautiful", playlist: "Playlist #1", url: "https://files.catbox.moe/xht7wt.mp3" },
    { id: 2, title: "Summertime Sadness", playlist: "Playlist #2", url: "https://files.catbox.moe/fb4zok.mp3" },
    { id: 3, title: "Say Yes To Heaven", playlist: "Playlist #3", url: "https://files.catbox.moe/3x9ccc.mp3" },
    { id: 4, title: "Beauty and a beat", playlist: "Playlist #4", url: "https://files.catbox.moe/fdej6i.mp3" },
    { id: 5, title: "Y Que Fue?", playlist: "Playlist #5", url: "https://files.catbox.moe/1rk4uy.mp3" },
    { id: 6, title: "Beast", playlist: "Playlist #6", url: "https://files.catbox.moe/e23z1k.mp3" },
    { id: 7, title: "Bye", playlist: "Playlist #7", url: "https://files.catbox.moe/ap4m1x.mp3" },
    { id: 8, title: "Steady", playlist: "Playlist #8", url: "https://files.catbox.moe/nagda7.mp3" },
    { id: 9, title: "Back It Up", playlist: "Playlist #9", url: "https://files.catbox.moe/9j8rg2.mp3" },
    { id: 10, title: "BIRDS OF A FEATHER", playlist: "Playlist #10", url: "https://files.catbox.moe/dlse63.mp3" }
  ],
  "v-pop": [
    { id: 11, title: "Từng Là Của Nhau", playlist: "Playlist #11", url: "https://files.catbox.moe/tsyilo.mp3" },
    { id: 12, title: "Em Đau", playlist: "Playlist #12", url: "https://files.catbox.moe/u913wi.mp3" },
    { id: 13, title: "Thành Phố Phía Đông", playlist: "Playlist #13", url: "https://files.catbox.moe/8peyzn.mp3" },
    { id: 14, title: "Tây Thi", playlist: "Playlist #14", url: "https://files.catbox.moe/pt49xb.mp3" },
    { id: 15, title: "Liệm", playlist: "Playlist #15", url: "https://files.catbox.moe/ypka6v.mp3" },
    { id: 16, title: "Cuộc Gọi Về Nhà", playlist: "Playlist #16", url: "https://www.image2url.com/r2/default/audio/1785565026249-d80f95f9-652c-48f5-8656-19e28e6bcb05.mp3" },
    { id: 17, title: "Cõi Hoang Vu", playlist: "Playlist #17", url: "https://files.catbox.moe/1fh2on.mp3" }
  ],
  "c-pop": [
    { id: 19, title: "Điên Cuồng Vì Yêu", playlist: "Playlist #19", url: "https://files.catbox.moe/726hnl.mp3" },
    { id: 20, title: "Biển, Đảo Và Em", playlist: "Playlist #20", url: "https://files.catbox.moe/kdwtw8.mp3" },
    { id: 21, title: "Người Yêu Bỏ Lỡ", playlist: "Playlist #21", url: "https://files.catbox.moe/d27dfd.mp3" },
    { id: 22, title: "Đường Màu Đỏ", playlist: "Playlist #22", url: "https://files.catbox.moe/nvs08s.mp3" }
  ],
  "phonk-funk": [
    { id: 23, title: "PALADIN", playlist: "Playlist #23", url: "https://files.catbox.moe/s7c5bf.mp3" },
    { id: 24, title: "TURAN", playlist: "Playlist #24", url: "https://files.catbox.moe/a2p242.mp3" },
    { id: 25, title: "FUNK TAKA", playlist: "Playlist #25", url: "https://files.catbox.moe/gp4pvi.mp3" },
    { id: 26, title: "FUNK SERENO", playlist: "Playlist #26", url: "https://files.catbox.moe/quotop.mp3" },
    { id: 27, title: "MONTAGEM ELDER", playlist: "Playlist #27", url: "https://files.catbox.moe/wiz7x8.mp3" },
    { id: 28, title: "MONTAGEM UNKNOWN", playlist: "Playlist #28", url: "https://files.catbox.moe/o0cing.mp3" }
  ]
};

const welcomeBgUrl = "https://i.imgur.com/ytsgDLA.jpeg";
const mainBgUrl = "https://i.imgur.com/bMFDQo1.jpeg";

function isNewCharacter(char: Character): boolean {
  const link = char.chatLink !== undefined ? char.chatLink : char.chatbotUrl;
  if (!link || link.trim() === "") {
    // TH1: Nếu char CHƯA CÓ chatLink (hoặc null/trống): -> Mặc định LUÔN HIỆN tag "NEW 🔥"
    const isNewRelease = !!char.createdTime || !!char.linkUpdatedAt || char.id === "27" || char.id === "28";
    return isNewRelease;
  }

  // TH2: Đã gắn chatLink -> Đếm ngược 48h kể từ linkUpdatedAt (hoặc createdTime làm fallback)
  const updatedAt = char.linkUpdatedAt || char.createdTime;
  if (!updatedAt) return false;

  const now = new Date();
  const releaseDate = new Date(updatedAt);
  const diffHours = (now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60);
  return diffHours >= 0 && diffHours <= 48;
}

function getRuneSymbol(tag: string): string {
  const t = tag.toLowerCase().trim();
  if (t === "tất cả") return "❂";
  if (t.includes("hiện đại")) return "⚡";
  if (t.includes("fantasy")) return "✦";
  if (t.includes("ngọt")) return "❤";
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
  if (t.includes("open world")) return "🌎";
  return "✦";
}

function getTicketColorClass(tag: string): string {
  const t = tag.toLowerCase().trim();
  if (t === "tất cả") return "ticket-cream";
  if (t === "hiện đại" || t === "txvt" || t === "bl") return "ticket-lilac";
  if (t === "fantasy" || t === "xuyên không" || t === "gl") return "ticket-blue";
  if (t === "ngọt sủng" || t === "bg" || t.includes("couple")) return "ticket-pink";
  if (t === "np" || t.includes("r18") || t.includes("dark")) return "ticket-pink";
  if (t === "hài" || t === "nhân thú" || t === "côn trùng" || t.includes("open world")) return "ticket-mint";
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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLoginErrorModal, setShowLoginErrorModal] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState("");

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authDisplayName, setAuthDisplayName] = useState('');
  const [authAvatar, setAuthAvatar] = useState('https://i.imgur.com/ALMc8Ct.jpeg');
  const [authModalError, setAuthModalError] = useState('');

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  useEffect(() => {
    // Automatically process user if returning from OAuth redirect
    handleRedirectResult().catch((err) => {
      console.error("Error processing OAuth redirect result:", err);
    });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setEditDisplayName(user.displayName || '');
        setEditAvatar(user.photoURL || '');
      }
    });
    return () => unsubscribe();
  }, []);

  const formatAuthError = (error: any) => {
    const code = error?.code || '';
    const msg = error?.message || String(error);

    if (code === 'auth/email-already-in-use') {
      return 'Email này đã được đăng ký. Vui lòng chuyển sang tab Đăng Nhập.';
    }
    if (code === 'auth/invalid-email') {
      return 'Địa chỉ Email không hợp lệ.';
    }
    if (code === 'auth/weak-password') {
      return 'Mật khẩu phải từ 6 ký tự trở lên.';
    }
    if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      return 'Email hoặc Mật khẩu chưa chính xác. Vui lòng kiểm tra lại hoặc nhấn Đăng Ký.';
    }
    if (code === 'auth/operation-not-allowed') {
      return 'Phương thức đăng nhập này chưa được bật trong Firebase. Bạn có thể sử dụng Đăng Nhập Nhanh Độc Giả!';
    }
    if (code === 'auth/popup-blocked' || code === 'auth/popup-closed-by-user' || msg.includes('popup') || msg.includes('cross-origin') || msg.includes('closed')) {
      return 'Cửa sổ bật lên bị chặn bởi trình duyệt/iframe. Đang kích hoạt chuyển hướng trang (Redirect)...';
    }
    if (code === 'auth/unauthorized-domain') {
      return 'Tên miền chưa được cấp phép trong Firebase Auth. Vui lòng mở ứng dụng trong Tab Mới hoặc chọn Đăng Nhập Nhanh!';
    }
    return msg;
  };

  const handleEmailAuthSubmit = async (e: any) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthModalError('');
    try {
      playClickSound(500, 0.1);
      if (authTab === 'login') {
        await loginWithEmailPassword(authEmail, authPassword);
      } else {
        await registerWithEmailPassword(authEmail, authPassword, authDisplayName, authAvatar);
      }
      setShowAuthModal(false);
      setAuthEmail('');
      setAuthPassword('');
      setAuthDisplayName('');
    } catch (error: any) {
      console.error("Auth error:", error);
      setAuthModalError(formatAuthError(error));
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setIsAuthLoading(true);
    setAuthModalError('');
    try {
      playClickSound(600, 0.1);
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const demoEmail = `docgia_${randomNum}@darkromance.com`;
      const demoPass = "Demo123456";
      const demoName = `Độc Giả #${randomNum}`;
      const avatars = [
        "https://i.imgur.com/ALMc8Ct.jpeg",
        "https://i.imgur.com/k9k3keR.jpeg",
        "https://i.imgur.com/O3r9UNi.jpeg",
        "https://i.imgur.com/yo72bi3.jpeg"
      ];
      const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

      try {
        await registerWithEmailPassword(demoEmail, demoPass, demoName, randomAvatar);
      } catch (err: any) {
        if (err?.code === "auth/email-already-in-use") {
          await loginWithEmailPassword(demoEmail, demoPass);
        } else {
          throw err;
        }
      }
      setShowAuthModal(false);
    } catch (error: any) {
      console.error("Quick login error:", error);
      setAuthModalError("Đăng nhập nhanh thất bại: " + formatAuthError(error));
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsAuthLoading(true);
    setAuthModalError('');
    try {
      playClickSound(600, 0.1);
      // Attempt popup or seamless redirect
      const user = await signInWithGoogle(false);
      if (user) {
        setShowAuthModal(false);
      }
    } catch (error: any) {
      console.error("Google login failed:", error);
      const code = error?.code || "";
      if (code === "auth/operation-not-allowed") {
        setLoginErrorMessage("Phương thức Google Auth chưa được bật trong Firebase Console. Bạn có thể sử dụng Đăng Nhập Nhanh Độc Giả!");
        setShowLoginErrorModal(true);
      } else if (code === "auth/unauthorized-domain") {
        setLoginErrorMessage("Tên miền chưa được cấp phép trong Firebase Auth. Bạn có thể sử dụng Đăng Nhập Nhanh Độc Giả!");
        setShowLoginErrorModal(true);
      } else if (code === "auth/popup-blocked" || code === "auth/popup-closed-by-user") {
        // Fall back directly to redirect without showing scary error modal
        try {
          await signInWithGoogleRedirect();
        } catch (rErr) {
          console.error("Redirect fallback error:", rErr);
        }
      } else {
        setLoginErrorMessage(`Đăng nhập Google: ${formatAuthError(error)}`);
        setShowLoginErrorModal(true);
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleAppleAuth = async () => {
    setIsAuthLoading(true);
    setAuthModalError('');
    try {
      playClickSound(600, 0.1);
      const user = await signInWithApple(false);
      if (user) {
        setShowAuthModal(false);
      }
    } catch (error: any) {
      console.error("Apple login failed:", error);
      const code = error?.code || "";
      if (code === "auth/operation-not-allowed" || code === "auth/invalid-provider-id") {
        setLoginErrorMessage("Đăng nhập bằng Apple ID cần được cấu hình trong Firebase Console. Bạn có thể sử dụng Đăng Nhập Nhanh Độc Giả!");
        setShowLoginErrorModal(true);
      } else if (code === "auth/popup-blocked" || code === "auth/popup-closed-by-user") {
        try {
          await signInWithAppleRedirect();
        } catch (rErr) {
          console.error("Redirect fallback error:", rErr);
        }
      } else {
        setLoginErrorMessage(`Đăng nhập Apple ID: ${formatAuthError(error)}`);
        setShowLoginErrorModal(true);
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleUpdateProfileSubmit = async (e: any) => {
    e.preventDefault();
    setIsAuthLoading(true);
    try {
      playClickSound(500, 0.1);
      await updateUserCustomProfile(editDisplayName, editAvatar);
      setIsEditProfileOpen(false);
      setIsProfileOpen(false);
      alert("Cập nhật thông tin thành công!");
    } catch (error: any) {
      alert(`Cập nhật thất bại: ${error?.message || error}`);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      playClickSound(400, 0.1);
      await logoutUser();
      setIsProfileOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const [hasEntered, setHasEntered] = useState(false);
  const [hasEnteredOrTransitioning, setHasEnteredOrTransitioning] = useState(false);
  const [showAgeVerify, setShowAgeVerify] = useState(false);
  const [showNewCharactersPopup, setShowNewCharactersPopup] = useState(false);

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
  const [passwordModalChar, setPasswordModalChar] = useState<Character | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [tunStatus, setTunStatus] = useState<"Online" | "Idle" | "Coding">("Coding");
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isPricingZoomed, setIsPricingZoomed] = useState(false);
  const [punchedTicketId, setPunchedTicketId] = useState<string | null>(null);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [isLetterNoticeModalOpen, setIsLetterNoticeModalOpen] = useState(false);
  const [isGuestbookModalOpen, setIsGuestbookModalOpen] = useState(false);
  const [guestbookName, setGuestbookName] = useState("");
  const [guestbookContent, setGuestbookContent] = useState("");
  const [isSubmittingGuestbook, setIsSubmittingGuestbook] = useState(false);
  const [isCommandModalOpen, setIsCommandModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [isCrystalActivated, setIsCrystalActivated] = useState(false);
  const [isSmokeAnimating, setIsSmokeAnimating] = useState(false);
  const [highlightedMenuIdx, setHighlightedMenuIdx] = useState<number>(-1);
  const [hoveredLandmark, setHoveredLandmark] = useState<number | null>(null);
  const [hoverOrb1, setHoverOrb1] = useState(false);
  const [hoverOrb2, setHoverOrb2] = useState(false);
  
  // Custom Arcade Dispenser states
  const [dispensedTicket, setDispensedTicket] = useState<'cam_nang' | 'ho_than' | 'chuyen_sinh_couple' | 'chuyen_sinh_world' | null>(null);
  const [isArcadeVibrating, setIsArcadeVibrating] = useState(false);
  const [isArcadeSmoke, setIsArcadeSmoke] = useState(false);

  // Portal charge loading states
  const [isPortalCharging, setIsPortalCharging] = useState(false);
  const [chargeProgress, setChargeProgress] = useState(0);

  const handleStartTicketEnter = () => {
    if (isPortalCharging || hasEnteredOrTransitioning) return;

    // Phát nhạc ngay lập tức đồng bộ khi nhấn nút để tránh trễ hoặc chặn trên điện thoại di động
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        console.log("Music started smoothly on user click!");
      }).catch(err => {
        console.warn("Autoplay block or audio not ready:", err);
      });
    }
    setIsPlaying(true);
    playClickSound(600, 0.1);

    setIsPortalCharging(true);
    setChargeProgress(0);

    const startTime = Date.now();
    const duration = 5000; // 5.0s loading animation

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setChargeProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);

        setHasEnteredOrTransitioning(true);

        setTimeout(() => {
          const welcomeEl = document.getElementById('welcome');
          if (welcomeEl) {
            welcomeEl.classList.remove('fade-in-back');
            welcomeEl.classList.add('fade-out');
          }

          const mainEl = document.getElementById('main');
          if (mainEl) {
            mainEl.classList.remove('fade-out-back');
            mainEl.classList.add('fade-in');
          }

          setTimeout(() => {
            if (welcomeEl) {
              welcomeEl.style.display = 'none';
            }
            setIsPortalCharging(false);
            setHasEntered(true);
            setShowAgeVerify(true);
          }, 800);
        }, 50);
      }
    }, 30);
  };

  // Mouse-following sparkle effect for Royal Portal frame
  const [portalSparkles, setPortalSparkles] = useState<Array<{ id: number; x: number; y: number; size: number; char: string; color: string; dx: number; dy: number }>>([]);
  const lastSparkleTimeRef = useRef<number>(0);

  // Feedback states for command cards
  const [commandFeedbacks, setCommandFeedbacks] = useState<Record<string, 'hong' | 'ngon' | 'henxui'>>(() => {
    try {
      const saved = localStorage.getItem("command_feedbacks");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleFeedback = (cardId: string, type: 'hong' | 'ngon' | 'henxui') => {
    const next = { ...commandFeedbacks, [cardId]: type };
    setCommandFeedbacks(next);
    localStorage.setItem("command_feedbacks", JSON.stringify(next));
    
    if (type === 'ngon') {
      playClickSound(800, 0.1);
    } else if (type === 'hong') {
      playClickSound(300, 0.15);
    } else {
      playClickSound(500, 0.1);
    }
  };
  
  // Custom Arcade Fountain states
  const [isCoinFalling, setIsCoinFalling] = useState(false);
  const [isWaterSplashing, setIsWaterSplashing] = useState(false);
  const [splashRipples, setSplashRipples] = useState<{ id: number }[]>([]);
  
  // Music Player states
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicProgress, setMusicProgress] = useState(0);
  const [musicDuration, setMusicDuration] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isPlaylistViewOpen, setIsPlaylistViewOpen] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  type PlaylistCategory = keyof typeof musicPlaylists;
  const [selectedPlaylist, setSelectedPlaylist] = useState<PlaylistCategory>("us-uk");
  const [activePlaylist, setActivePlaylist] = useState<PlaylistCategory>("us-uk");
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
    const unsubscribe = subscribeToVotes((votesData) => {
      setVotes(votesData);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const formatAudioUrl = (url: string | undefined): string => {
    if (!url) return "";
    let formatted = url.trim();
    if (formatted.includes("drive.google.com") || formatted.includes("drive.usercontent.google.com")) {
      const fileIdMatch = formatted.match(/\/d\/([a-zA-Z0-9_-]+)/) || formatted.match(/id=([a-zA-Z0-9_-]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        return `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`;
      }
    }
    return formatted;
  };

  const lastTrackKeyRef = useRef<string | null>(null);
  const errorAutoSkipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTimeUpdateRef = useRef<number>(0);

  // Clear auto-skip timer on unmount
  useEffect(() => {
    return () => {
      if (errorAutoSkipTimeoutRef.current) {
        clearTimeout(errorAutoSkipTimeoutRef.current);
      }
    };
  }, []);

  // Ensure currentTrackIndex is valid when activePlaylist changes
  useEffect(() => {
    const trackList = musicPlaylists[activePlaylist];
    if (trackList && currentTrackIndex >= trackList.length) {
      setCurrentTrackIndex(0);
    }
  }, [activePlaylist, currentTrackIndex]);

  const scheduleAutoNextTrack = () => {
    if (errorAutoSkipTimeoutRef.current) {
      clearTimeout(errorAutoSkipTimeoutRef.current);
    }
    errorAutoSkipTimeoutRef.current = setTimeout(() => {
      console.warn("Auto-skipping unplayable or empty track...");
      playNextTrack();
    }, 1800);
  };

  // Music Player logic with throttling (max once every 300ms) to ensure smooth 60fps UI performance
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const now = Date.now();
      if (now - lastTimeUpdateRef.current > 300) {
        lastTimeUpdateRef.current = now;
        setMusicProgress(audioRef.current.currentTime);
      }
    }
  };

  const handleDurationChange = () => {
    if (audioRef.current) {
      const dur = audioRef.current.duration;
      if (dur && !isNaN(dur) && isFinite(dur) && dur > 0) {
        setMusicDuration(dur);
        if (errorAutoSkipTimeoutRef.current) {
          clearTimeout(errorAutoSkipTimeoutRef.current);
          errorAutoSkipTimeoutRef.current = null;
        }
        setAudioError(null);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const dur = audioRef.current.duration;
      if (dur && !isNaN(dur) && isFinite(dur) && dur > 0) {
        setMusicDuration(dur);
        if (errorAutoSkipTimeoutRef.current) {
          clearTimeout(errorAutoSkipTimeoutRef.current);
          errorAutoSkipTimeoutRef.current = null;
        }
        setAudioError(null);
      } else if (dur === 0) {
        setAudioError("Tệp âm thanh trống hoặc không thể phát. Đang tự động chuyển bài...");
        scheduleAutoNextTrack();
      }
    }
  };

  const handleEnded = () => {
    console.log("Audio track ended, playing next...");
    if (errorAutoSkipTimeoutRef.current) {
      clearTimeout(errorAutoSkipTimeoutRef.current);
      errorAutoSkipTimeoutRef.current = null;
    }
    playNextTrack();
  };

  const handleAudioError = (e: any) => {
    console.error("Audio error encountered:", e, audioRef.current?.error);
    setAudioError("Link MP3 bị lỗi hoặc không thể phát. Đang tự động chuyển bài...");
    scheduleAutoNextTrack();
  };

  // Sync play/pause state and track loading of the DOM audio node
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const currentTrackKey = `${activePlaylist}_${currentTrackIndex}`;
    const currentTrack = musicPlaylists[activePlaylist]?.[currentTrackIndex];
    const targetUrl = formatAudioUrl(currentTrack?.url);

    // Only load audio when the active track (playlist + index) changes
    if (lastTrackKeyRef.current !== currentTrackKey) {
      lastTrackKeyRef.current = currentTrackKey;
      if (errorAutoSkipTimeoutRef.current) {
        clearTimeout(errorAutoSkipTimeoutRef.current);
        errorAutoSkipTimeoutRef.current = null;
      }
      setMusicProgress(0);
      setMusicDuration(0);
      setAudioError(null);

      if (targetUrl) {
        audio.src = targetUrl;
        audio.load();
      } else {
        audio.removeAttribute("src");
        setAudioError("Không tìm thấy đường dẫn bài hát.");
      }
    }

    if (isPlaying) {
      if (audio.src) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              if (audio.duration && audio.duration > 0) {
                setAudioError(null);
              }
            })
            .catch((err) => {
              console.warn("Audio play failed or prevented:", err);
              if (err.name !== "NotAllowedError" && err.name !== "AbortError") {
                setAudioError("Không thể phát bài hát này. Đang tự động chuyển bài...");
                scheduleAutoNextTrack();
              }
            });
        }
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrackIndex, activePlaylist]);

  const toggleMusicPlay = () => {
    playClickSound(300, 0.08);
    setIsPlaying(!isPlaying);
  };

  const playNextTrack = () => {
    playClickSound(300, 0.08);
    if (errorAutoSkipTimeoutRef.current) {
      clearTimeout(errorAutoSkipTimeoutRef.current);
    }
    const trackList = musicPlaylists[activePlaylist];
    if (!trackList || trackList.length === 0) return;

    setCurrentTrackIndex((prev) => {
      const nextIndex = (prev + 1) % trackList.length;
      if (nextIndex === prev && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.load();
        if (isPlaying) {
          audioRef.current.play().catch(() => {});
        }
      }
      return nextIndex;
    });
    setIsPlaying(true);
  };

  const playPrevTrack = () => {
    playClickSound(300, 0.08);
    if (errorAutoSkipTimeoutRef.current) {
      clearTimeout(errorAutoSkipTimeoutRef.current);
    }
    const trackList = musicPlaylists[activePlaylist];
    if (!trackList || trackList.length === 0) return;

    setCurrentTrackIndex((prev) => {
      const prevIndex = (prev - 1 + trackList.length) % trackList.length;
      if (prevIndex === prev && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.load();
        if (isPlaying) {
          audioRef.current.play().catch(() => {});
        }
      }
      return prevIndex;
    });
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

  const handleSubmitGuestbook = async () => {
    if (!guestbookContent.trim()) {
      alert("Bạn chưa viết gì cả! Hãy nhập lời nhắn nhé.");
      return;
    }
    
    setIsSubmittingGuestbook(true);
    try {
      const displayName = guestbookName.trim() || "Lữ khách ẩn danh 🕵️‍♂️";
      
      const payload = {
        service_id: 'service_2ib7s3w',
        template_id: 'template_4yhh2dl',
        user_id: 'Q-IDQSVmrzV05HbU_',
        template_params: {
          from_name: displayName,
          message: guestbookContent.trim(),
          to_email: 'langochan.01122006@gmail.com'
        }
      };

      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error("Hệ thống EmailJS từ chối gửi thư.");
      }
      
      setGuestbookName("");
      setGuestbookContent("");
      setIsGuestbookModalOpen(false);
      
      setTimeout(() => {
        alert("Đã lưu bút! Lời nhắn ẩn danh của bạn đã được chuyển thẳng vào Gmail của Tun rồi nhé! 💌✨");
      }, 100);
      
    } catch (error: any) {
      console.error("Guestbook Error:", error);
      alert("Có lỗi xảy ra khi gửi mail: " + error.message);
    } finally {
      setIsSubmittingGuestbook(false);
    }
  };

  const handleVote = async (characterId: string) => {
    playClickSound(620, 0.08);
    
    if (!currentUser) {
      setAuthTab('login');
      setAuthModalError('Bạn cần đăng nhập trước khi bình chọn cho nhân vật!');
      setShowAuthModal(true);
      return;
    }
    
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
  const [currentPage, setCurrentPage] = useState(1);
  const CHARACTERS_PER_PAGE = 10;
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 640;
  const itemsPerRow = isMobile ? 2 : 4;

  const chunkArray = <T,>(arr: T[], size: number): T[][] => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size)
    );
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTag]);

  // List of tags for filter menu
  const tags = [
    "Tất cả",
    "Hiện đại",
    "Fantasy",
    "Ngọt",
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
     "Việt Nam xưa",
     "OPEN WORLD",
     "Dân quốc"
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

  // Hàm tìm nhân vật có vote thấp nhất (kể cả 0) để đưa vào khu "bám bụi"
  const getLowestVotedCharacter = () => {
    let minVotes = Infinity;
    CHARACTERS.forEach(char => {
      const charVotes = votes[char.id] || 0;
      if (charVotes < minVotes) {
        minVotes = charVotes;
      }
    });

    // Lọc ra các nhân vật có số vote thấp nhất, và khác với nhân vật đang top 1
    const candidates = CHARACTERS.filter(char => {
      const charVotes = votes[char.id] || 0;
      return charVotes === minVotes && char.id !== featuredHubby?.id;
    });

    if (candidates.length === 0) return null;

    // Trả về nhân vật cuối cùng trong danh sách (để ổn định UI)
    return candidates[candidates.length - 1];
  };

  const lowestChar = getLowestVotedCharacter();

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

  // Triggers immediate chat in a new tab using the chatbotUrl or chatLink
  const handleStartChat = (character: Character, initialPrompt?: string) => {
    playClickSound(550, 0.1);
    
    if (!currentUser) {
      setAuthTab('login');
      setAuthModalError('Bạn cần đăng nhập trước khi bắt đầu trò chuyện với nhân vật!');
      setShowAuthModal(true);
      return;
    }
    
    if (character.passwordRequired) {
      setPasswordModalChar(character);
      setPasswordInput("");
      setPasswordError("");
      return;
    }
    
    setStoryCharacter(null); // Close story popup if open
    
    const link = character.chatLink !== undefined ? character.chatLink : character.chatbotUrl;
    if (link) {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = link;
      } else {
        const newWindow = window.open(link, "_blank", "noopener,noreferrer");
        if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
          window.location.href = link;
        }
      }
    }
  };

  const handlePasswordSubmit = () => {
    if (!passwordModalChar) return;
    
    // So sánh không phân biệt hoa thường và bỏ khoảng trắng để chắc chắn
    const input = passwordInput.toUpperCase().replace(/\s/g, "");
    const correctPass = passwordModalChar.password?.toUpperCase().replace(/\s/g, "");

    if (input === correctPass) {
      playClickSound(600, 0.1);
      setIsUnlocked(true);
      
      const link = passwordModalChar.chatLink !== undefined ? passwordModalChar.chatLink : passwordModalChar.chatbotUrl;
      if (link) {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
          window.location.href = link;
        } else {
          const newWindow = window.open(link, "_blank", "noopener,noreferrer");
          if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
            window.location.href = link;
          }
        }
      }
      
      setTimeout(() => {
        setPasswordModalChar(null);
        setStoryCharacter(null);
        setIsUnlocked(false);
      }, 800);
    } else {
      playClickSound(300, 0.1);
      setPasswordError("Mật khẩu không đúng. Vui lòng thử lại!");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
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

  const currentSong = musicPlaylists[activePlaylist][currentTrackIndex];

  return (
    <div 
      className={`min-h-screen ${getBackgroundStyles()} transition-all duration-700 font-sans flex flex-col items-center select-none relative overflow-x-hidden ${hasEntered ? "p-4 md:p-6" : "justify-center p-6"}`}
    >
      {/* Fixed background div behind everything for visual continuity and mobile compatibility */}
      {(hasEntered || hasEnteredOrTransitioning) && (
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
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={handleAudioError}
      />



      {/* GIAO ĐOẠN 1: MÀN HÌNH WELCOME (KHI VỪA MỞ WEB) */}
      {!hasEntered && (
        <div
          id="welcome"
          className={`welcome-screen flex flex-col items-center justify-center p-6 fixed inset-0 z-[9999] overflow-hidden ${!hasEnteredOrTransitioning ? "fade-in-back" : ""}`}
          style={{
            backgroundImage: `url('${welcomeBgUrl}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundColor: "#06010B",
          }}
        >
          {/* Ambient Cosmic Background Sparkle Particles & Twinkling Stars */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {/* Floating Twinkling Star Field */}
            {[
              { top: "10%", left: "15%", delay: 0, size: "text-xs", char: "✦" },
              { top: "18%", left: "80%", delay: 0.5, size: "text-sm", char: "✨" },
              { top: "25%", left: "30%", delay: 1.2, size: "text-xs", char: "⭐" },
              { top: "35%", left: "88%", delay: 0.8, size: "text-xs", char: "✦" },
              { top: "45%", left: "10%", delay: 1.5, size: "text-sm", char: "✨" },
              { top: "60%", left: "82%", delay: 0.3, size: "text-xs", char: "⭐" },
              { top: "72%", left: "20%", delay: 1.8, size: "text-sm", char: "✦" },
              { top: "80%", left: "75%", delay: 1.0, size: "text-xs", char: "✨" },
              { top: "15%", left: "55%", delay: 2.1, size: "text-xs", char: "✦" },
              { top: "68%", left: "48%", delay: 1.4, size: "text-xs", char: "⭐" },
            ].map((star, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0.2, scale: 0.8 }}
                animate={{
                  opacity: [0.2, 0.9, 0.2],
                  scale: [0.8, 1.2, 0.8],
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3 + (idx % 3),
                  repeat: Infinity,
                  delay: star.delay,
                  ease: "easeInOut",
                }}
                className={`absolute ${star.size} text-[#FFE79A]/60 select-none filter drop-shadow-[0_0_6px_rgba(255,231,154,0.6)]`}
                style={{ top: star.top, left: star.left }}
              >
                {star.char}
              </motion.div>
            ))}
          </div>

          <div
            className="w-full max-w-xl flex flex-col items-center justify-center min-h-[85vh] px-4 py-8 z-10 text-center relative font-sans my-auto mt-16 md:mt-24"
          >
            {/* Archway Portal Royal Badge Container - Dark Wine & Gold Glassmorphism */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              onMouseMove={(e) => {
                const now = Date.now();
                if (now - lastSparkleTimeRef.current < 40) return;
                lastSparkleTimeRef.current = now;

                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const chars = ["✨", "✦", "⭐", "💫", "⋆", "✧"];
                const colors = ["#FFD700", "#FFF8C4", "#FFAE34", "#FFE79A", "#FFFFFF"];
                const size = Math.floor(Math.random() * 8) + 12;
                const char = chars[Math.floor(Math.random() * chars.length)];
                const color = colors[Math.floor(Math.random() * colors.length)];
                const dx = (Math.random() - 0.5) * 24;
                const dy = -15 - Math.random() * 20;

                const newParticle = {
                  id: now + Math.random(),
                  x,
                  y,
                  size,
                  char,
                  color,
                  dx,
                  dy,
                };

                setPortalSparkles((prev) => [...prev.slice(-20), newParticle]);
              }}
              className="w-full max-w-md border-2 border-[#FFD700] px-6 py-10 md:px-10 md:py-14 rounded-t-[120px] md:rounded-t-[160px] rounded-b-[40px] shadow-[0_30px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(255,215,0,0.25)] flex flex-col items-center relative overflow-visible border-t-[#FFF8C4]"
              style={{
                background: "linear-gradient(180deg, rgba(80, 20, 32, 0.78) 0%, rgba(45, 10, 18, 0.85) 100%)",
                backgroundColor: "rgba(60, 15, 25, 0.78)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
              }}
            >
              {/* Mouse-following Ephemeral Glowing Star Particles Overlay */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-t-[120px] md:rounded-t-[160px] rounded-b-[40px] z-20">
                <AnimatePresence>
                  {portalSparkles.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 1, scale: 0.5, x: p.x - p.size / 2, y: p.y - p.size / 2 }}
                      animate={{
                        opacity: 0,
                        scale: 1.4,
                        x: p.x - p.size / 2 + p.dx,
                        y: p.y - p.size / 2 + p.dy,
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.75, ease: "easeOut" }}
                      className="absolute font-bold select-none pointer-events-none"
                      style={{
                        fontSize: `${p.size}px`,
                        color: p.color,
                        filter: `drop-shadow(0 0 8px ${p.color})`,
                      }}
                      onAnimationComplete={() => {
                        setPortalSparkles((prev) => prev.filter((item) => item.id !== p.id));
                      }}
                    >
                      {p.char}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* One-time Magical Barrier Activation Shimmer Sweep */}
              <div className="absolute inset-0 rounded-t-[120px] md:rounded-t-[160px] rounded-b-[40px] overflow-hidden pointer-events-none z-10">
                <motion.div
                  initial={{ x: "-120%", opacity: 0 }}
                  animate={{ x: "180%", opacity: [0, 0.9, 0.9, 0] }}
                  transition={{ duration: 1.8, delay: 0.8, ease: "easeInOut" }}
                  className="w-full h-full absolute inset-0"
                  style={{
                    background: "linear-gradient(115deg, transparent 20%, rgba(255, 248, 196, 0.2) 40%, rgba(255, 215, 0, 0.85) 49%, rgba(255, 255, 255, 0.95) 50%, rgba(255, 215, 0, 0.85) 51%, rgba(255, 248, 196, 0.2) 60%, transparent 80%)",
                    filter: "drop-shadow(0 0 15px rgba(255, 215, 0, 0.85))",
                  }}
                />
              </div>

              {/* Inner Archway Bright Gold Filigree Accent Outline */}
              <div className="absolute inset-2.5 border border-[#FFD700]/40 rounded-t-[110px] md:rounded-t-[150px] rounded-b-[32px] pointer-events-none" />
              <div className="absolute inset-3.5 border border-[#FFF5B8]/20 rounded-t-[105px] md:rounded-t-[145px] rounded-b-[28px] pointer-events-none" />

              {/* 1. Phần trên cùng: Logo hình tròn 3D với vương miện hoàng gia đặt đội lệch chéo nghiêng sang BÊN TRÁI của vành avatar */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative flex items-center justify-center mb-5 z-20 mt-4"
              >
                {/* Vòng hào quang sáng lấp lánh rực rỡ xung quanh logo */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FFD700] via-[#FFAE34] to-[#FFF6C5] blur-xl opacity-90 animate-pulse" />
                
                {/* Tilted Royal Crown hovering delicately over TOP-LEFT rim of the circular logo */}
                <motion.div 
                  animate={{ 
                    y: [0, -7, 0],
                    rotate: [-20, -23, -18, -20],
                    scale: [1, 1.03, 0.99, 1]
                  }}
                  transition={{ 
                    duration: 3.5, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="absolute -top-7 -left-3 sm:-top-9 sm:-left-4 z-30 pointer-events-none select-none filter drop-shadow-[0_6px_16px_rgba(0,0,0,0.85)]"
                >
                  <svg 
                    viewBox="0 0 100 65" 
                    className="w-16 h-12 sm:w-20 sm:h-16 overflow-visible"
                    style={{ filter: "drop-shadow(0 0 10px rgba(255, 215, 0, 0.95))" }}
                  >
                    <defs>
                      <linearGradient id="avatarGoldCrownLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFF9C4" />
                        <stop offset="40%" stopColor="#FFD700" />
                        <stop offset="100%" stopColor="#FF9800" />
                      </linearGradient>
                      <linearGradient id="avatarCrownBaseLeft" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FFEE58" />
                        <stop offset="100%" stopColor="#F57C00" />
                      </linearGradient>
                    </defs>

                    {/* Masking backing */}
                    <path
                      d="M 12 43 L 22 18 L 38 36 L 50 10 L 62 36 L 78 18 L 88 43 L 85 50 L 15 50 Z"
                      fill="rgba(40, 10, 18, 0.9)"
                    />

                    {/* Crown Main Body */}
                    <path
                      d="M 15 50 L 12 43 L 22 18 L 38 36 L 50 10 L 62 36 L 78 18 L 88 43 L 85 50 Z"
                      fill="url(#avatarGoldCrownLeft)"
                      stroke="#FFFDF0"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    
                    {/* Crown Base */}
                    <path
                      d="M 8 50 L 92 50 L 88 56 L 12 56 Z"
                      fill="url(#avatarCrownBaseLeft)"
                      stroke="#FFFDF0"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                    
                    {/* Royal Inner Lines */}
                    <path d="M 14 46 L 86 46" stroke="#FFFFFF" strokeWidth="1.8" opacity="0.95" strokeLinecap="round" />
                    <path d="M 16 53 L 84 53" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.85" strokeLinecap="round" />
                    <path d="M 22 18 L 26 43 M 38 36 L 38 45 M 50 10 L 50 45 M 62 36 L 62 45 M 78 18 L 74 43" stroke="#FFF9C4" strokeWidth="1.5" opacity="0.8" strokeLinecap="round" />
                    
                    {/* Jewels */}
                    <circle cx="22" cy="18" r="3.5" fill="#FFFFFF" stroke="#FFD700" strokeWidth="1.2" />
                    <circle cx="50" cy="10" r="4.8" fill="#FFFFFF" stroke="#FFD700" strokeWidth="1.5" />
                    <circle cx="78" cy="18" r="3.5" fill="#FFFFFF" stroke="#FFD700" strokeWidth="1.2" />
                    <path d="M 50 24 L 44 32 L 50 40 L 56 32 Z" fill="#FFFFFF" stroke="#FFB300" strokeWidth="1" />
                    <circle cx="34" cy="36" r="2.5" fill="#FFFFFF" />
                    <circle cx="66" cy="36" r="2.5" fill="#FFFFFF" />
                  </svg>
                </motion.div>

                {/* Floating sparkles particles around avatar */}
                <motion.div 
                  animate={{ y: [-4, 4, -4], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-3 -right-3 text-[#FFD700] font-bold text-lg select-none filter drop-shadow-[0_0_8px_#FFD700]"
                >
                  ✨
                </motion.div>
                <motion.div 
                  animate={{ y: [3, -3, 3], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                  className="absolute -bottom-2 -left-3 text-[#FFD700] font-bold text-base select-none filter drop-shadow-[0_0_8px_#FFD700]"
                >
                  ✦
                </motion.div>
                <motion.div 
                  animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                  className="absolute top-1/2 -right-5 text-[#FFE79A] font-bold text-sm select-none filter drop-shadow-[0_0_8px_#FFD700]"
                >
                  ⭐
                </motion.div>

                {/* Khung viền vàng kim 3D lộng lẫy */}
                <div className="relative p-1.5 rounded-full bg-gradient-to-b from-[#FFFDF0] via-[#FFD700] to-[#B8860B] shadow-[0_15px_35px_rgba(0,0,0,0.85),0_0_30px_rgba(255,215,0,0.85)] border-2 border-[#FFFFFF]">
                  <img
                    src="https://i.imgur.com/8bkSIex.png"
                    alt="Góc của Tun Logo"
                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover shadow-inner block select-none pointer-events-none"
                  />
                </div>
              </motion.div>

              <div className="absolute top-6 left-6 text-[#FFD700]/40 animate-pulse">✦</div>
              <div className="absolute top-6 right-6 text-[#FFD700]/40 animate-pulse">✦</div>
              <div className="absolute top-1/3 right-8 text-amber-300/30 animate-pulse">✨</div>
              <div className="absolute bottom-1/3 left-8 text-amber-300/30 animate-pulse">✨</div>

              {/* 2. Phần giữa khung: Tiêu đề WONDER WORLD thanh mảnh, nghệ thuật, thon gọn */}
              <h1 
                className="text-2xl sm:text-3xl md:text-4xl font-serif italic font-bold tracking-[0.2em] md:tracking-[0.25em] drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] mt-1 mb-8 uppercase select-none text-center leading-snug"
                style={{
                  color: "#FFE79A",
                  textShadow: "0 0 14px #FFAE34, 0 0 28px rgba(255, 215, 0, 0.6)",
                }}
              >
                WONDER WORLD
              </h1>

              {/* 3. Đáy khung: Nút bấm "Xé vé vào cổng" với hiệu ứng sáng bóng */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{ boxShadow: ["0 0 15px rgba(255,174,52,0.5)", "0 0 32px rgba(255,215,0,0.9)", "0 0 15px rgba(255,174,52,0.5)"] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                onClick={handleStartTicketEnter}
                className="relative w-full max-w-xs py-4 px-8 font-serif font-black text-[#4A1208] rounded-xl hover:brightness-110 active:scale-95 duration-150 cursor-pointer overflow-visible group tracking-[0.2em] text-xs uppercase ticket-enter-btn mb-2 border border-[#FFFDF0]"
                style={{
                  background: "linear-gradient(135deg, #FFB300, #FFF59D, #FFA000)",
                }}
              >
                {/* Left ticket cutout notch */}
                <div 
                  className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-r border-[#FFD700]/70 z-10"
                  style={{ backgroundColor: "rgba(60, 15, 25, 1)" }}
                />
                {/* Right ticket cutout notch */}
                <div 
                  className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-l border-[#FFD700]/70 z-10"
                  style={{ backgroundColor: "rgba(60, 15, 25, 1)" }}
                />

                <span className="relative z-10 flex items-center justify-center gap-1.5 font-bold drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
                  XÉ VÉ VÀO CỔNG 🎟️
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
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
          </div>

          {/* Magical Portal Charging Loading Screen Modal Overlay */}
          <AnimatePresence>
            {isPortalCharging && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[#F3E5AB]/95 backdrop-blur-md overflow-hidden"
              >
                {/* Bối cảnh nền: Giấy da cổ (Parchment Paper) */}
                <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-60">
                  <div 
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `
                        radial-gradient(circle at 20% 30%, rgba(139, 69, 19, 0.05) 0%, transparent 50%),
                        radial-gradient(circle at 80% 70%, rgba(139, 69, 19, 0.05) 0%, transparent 50%),
                        linear-gradient(to right, rgba(210, 180, 140, 0.1) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(210, 180, 140, 0.1) 1px, transparent 1px)
                      `,
                      backgroundSize: '100% 100%, 100% 100%, 20px 20px, 20px 20px',
                    }}
                  />
                  {/* Hoa văn chìm hoàng gia */}
                  <div className="absolute top-1/4 left-1/4 text-9xl opacity-5 text-[#8B4513] filter blur-[1px] transform -rotate-12 select-none">⚜️</div>
                  <div className="absolute bottom-1/4 right-1/4 text-9xl opacity-5 text-[#8B4513] filter blur-[1px] transform rotate-12 select-none">👑</div>
                </div>

                {/* Khung chứa nội dung (Container Modal) - Bọc kim loại vàng đồng */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="w-full max-w-sm border-[6px] border-[#B8860B] p-8 md:p-10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_0_30px_rgba(139,69,19,0.3)] flex flex-col items-center bg-[#E6D5B8] relative text-center"
                  style={{
                    backgroundImage: 'radial-gradient(circle, #E6D5B8 60%, #D4C3A3 100%)'
                  }}
                >
                  
                  {/* Trang trí viền kim loại vàng đồng chạm trổ */}
                  <div className="absolute top-0 left-0 w-full h-full pointer-events-none rounded-xl overflow-hidden">
                    <div className="absolute top-0 left-0 border-t-[8px] border-l-[8px] border-[#DAA520] w-12 h-12 rounded-tl-xl shadow-[2px_2px_4px_rgba(0,0,0,0.3)]"></div>
                    <div className="absolute top-0 right-0 border-t-[8px] border-r-[8px] border-[#DAA520] w-12 h-12 rounded-tr-xl shadow-[-2px_2px_4px_rgba(0,0,0,0.3)]"></div>
                    <div className="absolute bottom-0 left-0 border-b-[8px] border-l-[8px] border-[#DAA520] w-12 h-12 rounded-bl-xl shadow-[2px_-2px_4px_rgba(0,0,0,0.3)]"></div>
                    <div className="absolute bottom-0 right-0 border-b-[8px] border-r-[8px] border-[#DAA520] w-12 h-12 rounded-br-xl shadow-[-2px_-2px_4px_rgba(0,0,0,0.3)]"></div>
                  </div>

                  {/* Logo trung tâm với hoa văn dây leo và con dấu sáp */}
                  <div className="relative mb-12 flex items-center justify-center mt-4">
                    {/* Dây leo vàng nhỏ xung quanh */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 -m-8 rounded-full flex items-center justify-center"
                    >
                      <svg className="w-full h-full text-[#B8860B] opacity-80" viewBox="0 0 100 100">
                        <path id="circlePath" d="M 50, 50 m -40, 0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="5,5" />
                        <text className="text-[10px] font-serif fill-[#B8860B]">
                          <textPath href="#circlePath" startOffset="0%">✧ Royal Seal ✧ Imperial Decree ✧</textPath>
                          <textPath href="#circlePath" startOffset="50%">✧ Royal Seal ✧ Imperial Decree ✧</textPath>
                        </text>
                      </svg>
                    </motion.div>
                    
                    <motion.div
                      animate={{ scale: [0.98, 1.02, 0.98] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="w-24 h-24 rounded-full overflow-hidden border-[3px] border-[#FFD700] shadow-[0_0_20px_rgba(184,134,11,0.5)] relative z-10"
                    >
                      <img 
                        src="https://i.imgur.com/UBryS3E.jpeg" 
                        alt="Loading Avatar" 
                        className="w-full h-full object-cover"
                      />
                    </motion.div>

                    {/* Con dấu sáp đỏ hoàng gia (Wax Seal) */}
                    <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-[#8B0000] rounded-full flex items-center justify-center z-20 shadow-[2px_4px_8px_rgba(0,0,0,0.6),inset_0_0_8px_rgba(255,215,0,0.4)] border border-[#DAA520]" style={{ background: 'radial-gradient(circle at 30% 30%, #A52A2A, #800000)' }}>
                      <span className="text-[#FFD700] text-xl font-serif font-black" style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.5)' }}>⚜</span>
                    </div>
                  </div>

                  {/* Chữ và Thanh Loading (Nâu đồng cổ điển / Đỏ trầm) */}
                  <h3 
                    className="text-[#5C4033] text-2xl sm:text-3xl mb-4 drop-shadow-sm tracking-wide"
                    style={{ fontFamily: "'Dancing Script', 'Caveat', 'Great Vibes', 'Brush Script MT', cursive" }}
                  >
                    Đang xé vé vào cổng...
                  </h3>
                  
                  <p className="text-sm text-[#8B0000] mb-6 flex items-center gap-2 justify-center tracking-wide" style={{ fontFamily: "'Dancing Script', 'Caveat', 'Great Vibes', 'Brush Script MT', cursive" }}>
                    <span>Đang tiến vào lâu đài....</span>
                    <span className="font-bold text-[#5C4033] text-lg">{Math.floor(chargeProgress)}%</span>
                  </p>

                  {/* Energy Bar Container (Đỏ trầm / Nâu) */}
                  <div className="w-full h-3 bg-[#D2B48C] rounded-full border border-[#8B4513] p-[1.5px] overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] relative">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[#8B0000] via-[#A52A2A] to-[#8B4513] shadow-[0_0_8px_rgba(139,0,0,0.6)]"
                      style={{ width: `${chargeProgress}%` }}
                    />
                  </div>

                  {/* Decorative Elements at bottom */}
                  <div className="flex items-center gap-3 mt-6 text-[#8B4513] text-lg opacity-80" style={{ fontFamily: "'Dancing Script', 'Caveat', 'Great Vibes', 'Brush Script MT', cursive" }}>
                    <span className="text-[#DAA520]">~</span>
                    <span>Thư đã niêm phong</span>
                    <span className="text-[#DAA520]">~</span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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




      {/* Main website content renders when entered */}
      {(hasEntered || hasEnteredOrTransitioning) && (
        <div
          id="main"
          className={`main-content w-full max-w-4xl z-10 flex flex-col gap-5 ${hasEntered ? "fade-in" : ""}`}
        >
            {/* Top Navigation Row */}
            <div className="flex justify-between items-center">
              {/* Back button to Welcome Portal */}
              <button
                onClick={() => {
                  playClickSound(500, 0.1);
                  
                  // Set hasEntered to false, which immediately mounts the welcome screen
                  setHasEntered(false);
                  
                  // Wait for the next tick to ensure 'welcome' is mounted in the DOM, then remove fade-out
                  setTimeout(() => {
                    // Bật lại Welcome lên màn hình
                    const welcomeEl = document.getElementById('welcome');
                    if (welcomeEl) {
                      welcomeEl.style.display = 'flex';
                      // Thêm hiệu ứng hiện hình rõ nét cho Welcome
                      welcomeEl.classList.add('fade-in-back');
                      welcomeEl.classList.remove('fade-out'); // Xóa class ẩn cũ của welcome
                    }
                    
                    // Thêm hiệu ứng nhòe sương tan biến cho trang chính
                    const mainEl = document.getElementById('main');
                    if (mainEl) {
                      mainEl.classList.add('fade-out-back');
                      mainEl.classList.remove('fade-in'); // Xóa class hiện cũ của main
                    }
                    
                    // Đợi sương mù bao phủ xong (0.8 giây), mới ẩn hẳn Main đi
                    setTimeout(() => {
                      const mainElAfter = document.getElementById('main');
                      if (mainElAfter) {
                        mainElAfter.style.display = 'none';
                      }
                      setHasEnteredOrTransitioning(false);
                    }, 800);
                  }, 50);
                }}
                className="portal-back-btn group"
              >
                <DoorOpen className="w-4 h-4 portal-back-icon" />
                <span>Trở Về Cổng Chính</span>
              </button>

              {/* Minimalist round login/profile button and Multi-task Menu at the top right */}
              <div className="flex items-center gap-2">
                {/* Small round login/profile button to the left of the multi-task menu */}
                <div className="relative">
                  {currentUser ? (
                    <button
                      onClick={() => {
                        playClickSound(400, 0.08);
                        setIsProfileOpen(!isProfileOpen);
                      }}
                      className="w-10 h-10 rounded-full border-2 border-amber-400 overflow-hidden shadow-[0_0_12px_rgba(255,215,0,0.4)] hover:scale-105 active:scale-95 transition cursor-pointer flex items-center justify-center bg-[#2a1010]"
                      title="Xem Profile & Đăng xuất"
                    >
                      {currentUser.photoURL ? (
                        <img src={currentUser.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-amber-300" />
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        playClickSound(400, 0.08);
                        setShowAuthModal(true);
                      }}
                      disabled={isAuthLoading}
                      className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-[#4A1208] shadow-[0_0_12px_rgba(255,215,0,0.4)] hover:scale-105 active:scale-95 transition cursor-pointer flex items-center justify-center border border-[#FFFDF0]"
                      title="Đăng Nhập / Đăng Ký"
                    >
                      <span className="text-base">{isAuthLoading ? "⏳" : "🔑"}</span>
                    </button>
                  )}

                  {/* Profile Dropdown Popup */}
                  <AnimatePresence>
                    {isProfileOpen && currentUser && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsProfileOpen(false)} 
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -15 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -15 }}
                          transition={{ type: "spring", damping: 22, stiffness: 150 }}
                          className="absolute right-0 mt-3 w-64 bg-[#1a0808] border-2 border-[#e2a85c] rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.9)] p-4 z-50 text-white select-none"
                        >
                          <div className="absolute -top-[7px] right-[20px] w-3 h-3 bg-[#1a0808] border-t-2 border-l-2 border-[#e2a85c] rotate-45" />

                          <div className="flex items-center gap-3 mb-3 pb-3 border-b border-amber-500/30">
                            {currentUser.photoURL ? (
                              <img src={currentUser.photoURL} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 shadow-md" />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-amber-900/60 border-2 border-amber-400 flex items-center justify-center text-amber-300">
                                <User className="w-6 h-6" />
                              </div>
                            )}
                            <div className="overflow-hidden">
                              <h4 className="font-bold text-sm text-amber-200 truncate">{currentUser.displayName || "Khách hàng"}</h4>
                              <p className="text-[11px] text-amber-300/70 truncate">{currentUser.email}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setIsProfileOpen(false);
                              setIsEditProfileOpen(true);
                            }}
                            className="w-full bg-[#3a0a0a] hover:bg-[#4a1010] text-amber-200 border border-amber-500/40 py-2 px-3 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md cursor-pointer mb-2"
                          >
                            <span>✏️ Chỉnh Sửa Hồ Sơ</span>
                          </button>

                          <button
                            onClick={() => {
                              setIsProfileOpen(false);
                              handleLogout();
                            }}
                            className="w-full bg-gradient-to-r from-red-950 to-red-900 hover:from-red-900 hover:to-red-800 text-red-200 border border-red-500/50 py-2 px-3 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
                          >
                            <span>🚪 Đăng Xuất</span>
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Multi-task Menu Button (formerly flame) */}
                <div className="relative">
                  <button
                    onClick={() => {
                      playClickSound(400, 0.08);
                      setIsOpenMenu(!isOpenMenu);
                    }}
                    id="top-multitask-menu"
                    className="royal-menu-btn"
                    title="Menu Đa Nhiệm (Bảng Giá, Profile Tun)"
                  >
                    <span>Menu</span>
                    <span className="text-xs text-amber-300">▾</span>
                    <span className="text-base text-amber-300">⚜️</span>
                    <span className="royal-sparkle" style={{ top: '-4px', left: '20%' }} />
                    <span className="royal-sparkle" style={{ bottom: '-4px', right: '25%', animationDelay: '1s' }} />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isOpenMenu && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsOpenMenu(false)} 
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -15 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -15 }}
                          transition={{ type: "spring", damping: 22, stiffness: 150 }}
                          className="absolute right-0 mt-3 w-64 bg-[#1a0808] border-2 border-[#e2a85c] rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.9)] p-2.5 z-50 text-white select-none"
                        >
                          {/* Top Pointer */}
                          <div className="absolute -top-[7px] right-[30px] w-3 h-3 bg-[#1a0808] border-t-2 border-l-2 border-[#e2a85c] rotate-45" />

                          <button
                            onClick={() => {
                              playClickSound(500, 0.08);
                              setIsOpenMenu(false);
                              setIsPricingModalOpen(true);
                            }}
                            className="w-full text-left bg-[#2a1010]/80 border border-[#e2a85c]/40 p-3 flex items-center gap-2.5 transition-all duration-300 hover:bg-[#3a1515] hover:border-[#e2a85c] hover:translate-x-1 cursor-pointer rounded-t-lg rounded-b-sm"
                          >
                            <span className="text-base drop-shadow-md">🏷️</span>
                            <span className="text-[11px] font-bold text-[#e2a85c] tracking-wide uppercase">Bảng Giá Book Character</span>
                          </button>

                          <div className="border-b border-[#e2a85c]/20 mx-1 my-1.5" />

                          <button
                            onClick={() => {
                              playClickSound(500, 0.08);
                              setIsOpenMenu(false);
                              setIsProfileModalOpen(true);
                            }}
                            className="w-full text-left bg-[#2a1010]/80 border border-[#e2a85c]/40 p-3 flex items-center gap-2.5 transition-all duration-300 hover:shadow-[0_0_15px_rgba(226,168,92,0.4)] hover:bg-[#3a1515] hover:border-[#e2a85c]/60 cursor-pointer rounded-b-lg rounded-t-sm"
                          >
                            <span className="text-base drop-shadow-md">👤</span>
                            <span className="text-[11px] font-bold text-[#e2a85c] tracking-wide uppercase">Profile Của Tun</span>
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

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
                  <span className="px-4">Chào mừng đến trung tâm giải trí của Tun, Hãy đến quầy hưỡng dẫn để lấy vẽ vào khu vui chơi nhé 🌟</span>
                  <span className="px-4" aria-hidden="true">Chào mừng đến trung tâm giải trí của Tun, Hãy đến quầy hưỡng dẫn để lấy vẽ vào khu vui chơi nhé 🌟</span>
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
                  {/* Banner Image above the 4 function buttons */}
                  <div className="w-full flex justify-center overflow-hidden rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] border-2 border-[#C59B27]/40 hover:border-[#FFD700]/70 transition-all duration-300">
                    <img
                      src="https://i.imgur.com/husmW2U.jpeg"
                      alt="Banner"
                      className="w-full h-auto object-cover rounded-2xl select-none pointer-events-none"
                    />
                  </div>

                  {/* Interactive Option Buttons panel - Single straight horizontal row with clean card layout */}
                  <div className="grid grid-cols-4 gap-1 sm:gap-2 md:gap-3 w-full">
                    {/* Pink sen button (Góc trái) */}
                    <button
                      onClick={() => {
                        playClickSound(500, 0.1);
                        setIsVoteModalOpen(true);
                        setIsDonateModalOpen(false);
                        setIsCommandModalOpen(false);
                      }}
                      id="welcome-vote-btn"
                      className={`w-full flex items-center justify-center py-2.5 sm:py-3 px-1 sm:px-2 rounded-lg font-bold royal-card-btn compact-row shadow-md active:scale-95 transform hover:-translate-y-0.5 text-[10px] min-[360px]:text-[11px] sm:text-xs lg:text-sm cursor-pointer text-center relative whitespace-nowrap overflow-hidden ${highlightedMenuIdx === 0 ? "shimmer-sweep-active" : ""}`}
                    >
                      <span className="relative z-10 leading-none">⭐️𝓥𝓸𝓽𝓮</span>
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
                      className={`w-full flex items-center justify-center py-2.5 sm:py-3 px-1 sm:px-2 rounded-lg font-bold royal-card-btn compact-row shadow-md active:scale-95 transform hover:-translate-y-0.5 text-[10px] min-[360px]:text-[11px] sm:text-xs lg:text-sm cursor-pointer text-center relative whitespace-nowrap overflow-hidden ${highlightedMenuIdx === 1 ? "shimmer-sweep-active" : ""}`}
                    >
                      <span className="relative z-10 leading-none">⛲️𝓖𝓲𝓮̂́𝓷𝓰 𝓤̛𝓸̛́𝓬</span>
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
                      className={`w-full flex items-center justify-center py-2.5 sm:py-3 px-1 sm:px-2 rounded-lg font-bold royal-card-btn compact-row shadow-md active:scale-95 transform hover:-translate-y-0.5 text-[10px] min-[360px]:text-[11px] sm:text-xs lg:text-sm cursor-pointer text-center relative whitespace-nowrap overflow-hidden ${highlightedMenuIdx === 2 ? "shimmer-sweep-active" : ""}`}
                    >
                      <span className="relative z-10 leading-none">🎪𝓗𝓾̛𝓸̛̃𝓷𝓰 𝓓𝓪̂̃𝓷</span>
                    </button>

                    {/* Feedback button */}
                    <button
                      onClick={() => {
                        playClickSound(500, 0.1);
                        setIsGuestbookModalOpen(true);
                      }}
                      id="welcome-feedback-btn"
                      className={`w-full flex items-center justify-center py-2.5 sm:py-3 px-1 sm:px-2 rounded-lg font-bold royal-card-btn compact-row shadow-md active:scale-95 transform hover:-translate-y-0.5 text-[10px] min-[360px]:text-[11px] sm:text-xs lg:text-sm cursor-pointer text-center relative whitespace-nowrap overflow-hidden border-none ${highlightedMenuIdx === 3 ? "shimmer-sweep-active" : ""}`}
                    >
                      <span className="relative z-10 leading-none">📜𝓛𝓾̛𝓾 𝓑𝓾́𝓽</span>
                    </button>
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
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-[16px] md:text-sm magic-search-input shadow-sm"
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
                      className="golden-ticket-pass-card pl-4 pr-3 py-3 md:pl-8 md:pr-6 md:py-4 flex flex-col md:flex-row items-center gap-3 md:gap-5 justify-between transition-all duration-300 group"
                    >
                      {/* Ambient background decoration */}
                      <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-yellow-500/10 transition-all duration-500" />
                      
                      <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-5 text-center sm:text-left w-full relative z-10 pl-2 lg:pl-4">
                        {/* Avatar container with Royal Gacha Sphere & LIMITED tag */}
                        <div className="relative shrink-0 flex items-center justify-center">
                          <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
                            {/* Glowing effect around royal capsule */}
                            <div className="absolute inset-x-0 inset-y-0 bg-yellow-400/25 rounded-full blur-[6px] opacity-80 animate-pulse pointer-events-none" />
                            <div className="absolute -inset-1 bg-gradient-to-tr from-amber-500 via-yellow-200 to-amber-300 rounded-full blur-[3px] opacity-70" />
                            
                            {/* Gold capsule border edge */}
                            <div className="absolute inset-0 bg-gradient-to-b from-amber-400 via-yellow-200 to-amber-600 rounded-full p-[2.5px] shadow-lg">
                              <div className="w-full h-full rounded-full bg-stone-950 flex items-center justify-center overflow-hidden relative">
                                {/* Soft warm light source behind plushie */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/20 via-amber-400/25 to-yellow-300/30 animate-pulse" />
                                
                                {/* The featured plushie */}
                                <span className="text-4xl md:text-5xl drop-shadow-[0_6px_12px_rgba(0,0,0,0.3)] z-10 select-none animate-bounce-slow">
                                  {featuredHubby.avatar}
                                </span>
                                
                                {/* 3D Glossy curved glare layer */}
                                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.6)_0%,rgba(255,255,255,0.25)_25%,rgba(0,0,0,0.25)_85%,rgba(255,255,255,0.35)_100%)] z-20 pointer-events-none">
                                  <div className="absolute top-0.5 left-2.5 w-6 h-2 md:w-8 md:h-3 bg-gradient-to-b from-white/70 to-transparent rounded-full rotate-[-25deg]" />
                                  <div className="absolute bottom-1 right-2.5 w-2 h-1 md:w-3 md:h-1.5 bg-white/40 rounded-full blur-[0.5px]" />
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Secret/Limited Ribbon */}
                          <span className="absolute -bottom-2 bg-gradient-to-r from-red-600 via-amber-500 to-yellow-500 text-white font-black text-[7px] md:text-[8px] px-2 py-0.5 md:px-3 md:py-1 rounded-full shadow-[0_4px_10px_rgba(239,68,68,0.5)] border border-amber-200 flex items-center gap-0.5 uppercase tracking-widest select-none z-30 animate-bounce-slow whitespace-nowrap" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
                            🔖 SECRET RARE
                          </span>
                        </div>

                        {/* Name & descriptive details */}
                        <div className="space-y-1 w-full">
                          <div className="flex flex-wrap items-center gap-1.5 justify-center sm:justify-start">
                            <span className="px-2 py-1 md:px-3 md:py-1.5 font-sans text-[8px] md:text-[9px] tracking-wider bg-gradient-to-r from-[#4a370e] to-[#78350f] border-2 border-yellow-400 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.45)] text-yellow-300 font-black uppercase flex items-center gap-1 select-none whitespace-nowrap">
                              🧸 SIÊU THÚ BÔNG <span className="hidden md:inline">HUYỀN THOẠI</span> 🧸
                            </span>
                            <h4 className="text-lg md:text-xl font-black text-[#FAF9F6] tracking-tight group-hover:text-amber-200 transition animate-pulse">
                              {featuredHubby.name}
                            </h4>
                          </div>

                          {/* Rank categories list & dynamic values */}
                          <div className="flex flex-wrap items-center gap-1 md:gap-1.5 justify-center sm:justify-start mt-0.5 lg:mt-1">
                            <span className="px-1.5 py-0.5 md:px-2 md:py-1 text-[7px] md:text-[8px] font-black bg-gradient-to-r from-yellow-400 to-amber-500 text-stone-950 rounded border border-yellow-200 uppercase tracking-wider select-none shadow-[0_0_8px_rgba(250,204,21,0.5)]">
                              🔖 VÉ VÀNG VIP
                            </span>
                            {featuredHubby.tags.map((t, idx) => {
                              const symbol = getRuneSymbol(t);
                              return (
                                <span
                                  key={idx}
                                  className={`mini-ticket-stub ticket-sm ${getTicketColorClass(t)} select-none scale-[0.85] md:scale-100 origin-left`}
                                >
                                  <span className="rune-prefix-icon">{symbol}</span>
                                  <span>{t}</span>
                                </span>
                              );
                            })}
                            
                            {/* Unique Gacha gold priority votes */}
                            <span className="px-2 py-0.5 text-[8px] md:text-[9px] font-black text-yellow-100 bg-gradient-to-r from-[#7c2d12] to-[#b45309] border border-yellow-500/30 rounded-full flex items-center gap-0.5 shadow-sm uppercase tracking-wider select-none whitespace-nowrap">
                              <span>🎟️ {(votes[featuredHubby.id] || 0).toLocaleString()} LƯỢT ƯU TIÊN VÀNG</span>
                            </span>
                          </div>

                          <p className="text-[10px] md:text-[12px] text-slate-300 max-w-xl line-clamp-1 md:line-clamp-2 mt-0.5 md:mt-1 leading-snug lg:leading-relaxed">
                            {featuredHubby.description}
                          </p>
                        </div>
                      </div>

                      {/* Clickable Actions block */}
                      <div className="flex items-center gap-1.5 md:gap-2 w-full md:w-auto shrink-0 mt-2 md:mt-0 relative z-10 border-t md:border-t-0 border-white/10 pt-2.5 md:pt-0">
                        {/* Interactive Chat Trigger */}
                        {!(featuredHubby.chatbotUrl || featuredHubby.chatLink) ? (
                          <button
                            disabled
                            id={`featured-chat-btn-${featuredHubby.id}`}
                            className="flex-1 md:w-28 flex items-center justify-center gap-1 px-2 py-1.5 md:px-3 md:py-2.5 bg-[#555555]/85 text-white/80 font-black text-[9px] md:text-[10px] rounded-[10px] md:rounded-xl shadow-md cursor-not-allowed opacity-90 border border-transparent whitespace-nowrap"
                          >
                            <MessageCircle className="w-3 h-3 md:w-3.5 md:h-3.5" />
                            Sắp ra mắt
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartChat(featuredHubby)}
                            id={`featured-chat-btn-${featuredHubby.id}`}
                            className="flex-1 md:w-28 flex items-center justify-center gap-1 px-2 py-1.5 md:px-3 md:py-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-yellow-950 font-black text-[9px] md:text-[10px] rounded-[10px] md:rounded-xl shadow-md transition duration-150 active:scale-95 cursor-pointer border border-yellow-300/40 whitespace-nowrap"
                          >
                            <MessageCircle className="w-3 h-3 md:w-3.5 md:h-3.5 text-yellow-950" />
                            Chat
                          </button>
                        )}

                        {/* Interactive Story Trigger */}
                        <button
                          onClick={() => {
                            playClickSound(480, 0.08);
                            setStoryCharacter(featuredHubby);
                          }}
                          id={`featured-story-btn-${featuredHubby.id}`}
                          className="flex-1 md:w-28 flex items-center justify-center gap-1 px-2 py-1.5 md:px-3 md:py-2.5 text-amber-200 bg-amber-950/50 hover:bg-amber-900/40 border border-amber-500/30 text-[9px] md:text-[10px] font-black rounded-[10px] md:rounded-xl transition duration-150 active:scale-95 cursor-pointer whitespace-nowrap"
                        >
                          <BookOpen className="w-3 h-3 md:w-3.5 md:h-3.5" />
                          <span className="hidden sm:inline">Cốt truyện</span>
                          <span className="sm:hidden">Truyện</span>
                        </button>

                        {/* Profile Button */}
                        <a
                          href={featuredHubby.profileUrl || "#"}
                          target={featuredHubby.profileUrl ? "_blank" : undefined}
                          rel={featuredHubby.profileUrl ? "noopener noreferrer" : undefined}
                          id={`featured-profile-btn-${featuredHubby.id}`}
                          className="flex-1 md:w-28 flex items-center justify-center gap-1 px-2 py-1.5 md:px-3 md:py-2.5 text-amber-200 bg-amber-950/50 hover:bg-amber-900/40 border border-amber-500/30 text-[9px] md:text-[10px] font-black rounded-[10px] md:rounded-xl transition duration-150 active:scale-95 cursor-pointer whitespace-nowrap"
                        >
                          <User className="w-3 h-3 md:w-3.5 md:h-3.5" />
                          <span className="hidden sm:inline">Profile</span>
                          <span className="sm:hidden">Hồ sơ</span>
                        </a>
                      </div>
                    </motion.div>
                  )}

                  {/* Lowest Voted Character Rescue Banner/Section */}
                  {lowestChar && featuredHubby && lowestChar.id !== featuredHubby.id && (
                    <div className="loser-ticket-dark-version">
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.15 }}
                        id="lowest-hubby-banner"
                        className="golden-ticket-pass-card pl-4 pr-3 py-3 md:pl-8 md:pr-6 md:py-4 flex flex-col md:flex-row items-center gap-3 md:gap-5 justify-between transition-all duration-300 group"
                      >
                        {/* Ambient background decoration */}
                        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 bg-slate-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-slate-500/10 transition-all duration-500" />
                        
                        <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-5 text-center sm:text-left w-full relative z-10 pl-2 lg:pl-4">
                          {/* Avatar container with Silver/Slate Gacha Sphere */}
                          <div className="relative shrink-0 flex items-center justify-center">
                            <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
                              {/* Glowing effect around royal capsule */}
                              <div className="absolute inset-x-0 inset-y-0 bg-slate-400/20 rounded-full blur-[6px] opacity-80 animate-pulse pointer-events-none" />
                              <div className="absolute -inset-1 bg-gradient-to-tr from-slate-500 via-slate-200 to-slate-400 rounded-full blur-[3px] opacity-70" />
                              
                              {/* Silver capsule border edge */}
                              <div className="absolute inset-0 bg-gradient-to-b from-slate-300 via-slate-100 to-slate-500 rounded-full p-[2.5px] shadow-lg">
                                <div className="w-full h-full rounded-full bg-stone-950 flex items-center justify-center overflow-hidden relative">
                                  {/* Soft ambient light source behind plushie */}
                                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-slate-400/15 to-slate-300/20 animate-pulse" />
                                  
                                  {/* The featured plushie */}
                                  <span className="text-4xl md:text-5xl drop-shadow-[0_6px_12px_rgba(0,0,0,0.3)] z-10 select-none">
                                    {lowestChar.avatar}
                                  </span>
                                  
                                  {/* 3D Glossy curved glare layer */}
                                  <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.6)_0%,rgba(255,255,255,0.25)_25%,rgba(0,0,0,0.25)_85%,rgba(255,255,255,0.35)_100%)] z-20 pointer-events-none">
                                    <div className="absolute top-0.5 left-2.5 w-6 h-2 md:w-8 md:h-3 bg-gradient-to-b from-white/70 to-transparent rounded-full rotate-[-25deg]" />
                                    <div className="absolute bottom-1 right-2.5 w-2 h-1 md:w-3 md:h-1.5 bg-white/40 rounded-full blur-[0.5px]" />
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Dust/Forgotten Ribbon */}
                            <span className="absolute -bottom-2 bg-gradient-to-r from-slate-600 via-stone-500 to-slate-500 text-white font-black text-[7px] md:text-[8px] px-2 py-0.5 md:px-3 md:py-1 rounded-full shadow-[0_4px_10px_rgba(100,116,139,0.5)] border border-slate-400 flex items-center gap-0.5 uppercase tracking-widest select-none z-30 whitespace-nowrap" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
                              ⚠️ BÁM BỤI ⚠️
                            </span>
                          </div>

                          {/* Name & descriptive details */}
                          <div className="space-y-1 w-full">
                            <div className="flex flex-wrap items-center gap-1.5 justify-center sm:justify-start">
                              <span className="px-2 py-1 md:px-3 md:py-1.5 font-sans text-[8px] md:text-[9px] tracking-wider bg-gradient-to-r from-[#2a2b2f] to-[#4b4d52] border-2 border-slate-400 rounded-full shadow-[0_0_15px_rgba(100,116,139,0.4)] text-slate-300 font-black uppercase flex items-center gap-1 select-none whitespace-nowrap">
                                🧸 GẤU BÔNG BỊ BỎ QUÊN 🧸
                              </span>
                              <h4 className="text-lg md:text-xl font-black text-[#FAF9F6] tracking-tight group-hover:text-slate-200 transition">
                                {lowestChar.name}
                              </h4>
                            </div>

                            {/* Rank categories list & dynamic values */}
                            <div className="flex flex-wrap items-center gap-1 md:gap-1.5 justify-center sm:justify-start mt-0.5 lg:mt-1">
                              <span className="px-1.5 py-0.5 md:px-2 md:py-1 text-[7px] md:text-[8px] font-black bg-gradient-to-r from-red-500 to-rose-600 text-white rounded border border-rose-300 uppercase tracking-wider select-none shadow-[0_0_8px_rgba(244,63,94,0.5)] whitespace-nowrap">
                                📉 {votes[lowestChar.id] || 0} VOTE
                              </span>
                              {lowestChar.tags.map((t, idx) => {
                                const symbol = getRuneSymbol(t);
                                return (
                                  <span
                                    key={idx}
                                    className={`mini-ticket-stub ticket-sm ${getTicketColorClass(t)} select-none scale-[0.85] md:scale-100 origin-left`}
                                  >
                                    <span className="rune-prefix-icon">{symbol}</span>
                                    <span>{t}</span>
                                  </span>
                                );
                              })}
                              
                            {/* Unique Gacha priority votes */}
                            <span className="px-2 py-0.5 text-[8px] md:text-[9px] font-black text-slate-100 bg-gradient-to-r from-slate-700 to-slate-900 border border-slate-500/30 rounded-full flex items-center gap-0.5 shadow-sm uppercase tracking-wider select-none whitespace-nowrap">
                              <span>🎟️ {(votes[lowestChar.id] || 0).toLocaleString()} LƯỢT ƯU TIÊN THẤP NHẤT</span>
                            </span>
                            </div>

                            <p className="text-[10px] md:text-[12px] text-slate-300 max-w-xl line-clamp-1 md:line-clamp-2 mt-0.5 md:mt-1 leading-snug lg:leading-relaxed">
                              "Đang tạm thời bị bỏ lại trong góc tủ bám bụi... Mau gắp hoặc vote để giải cứu em ấy ra ngoài với Lệ Bắc Thần nào!"
                            </p>
                          </div>
                        </div>

                        {/* Clickable Actions block */}
                        <div className="flex items-center gap-1.5 md:gap-2 w-full md:w-auto shrink-0 mt-2 md:mt-0 relative z-10 border-t md:border-t-0 border-white/10 pt-2.5 md:pt-0">
                          {/* Rescue action button (instead of Chat) */}
                          <button
                            onClick={() => handleVote(lowestChar.id)}
                            className="flex-1 md:w-28 flex items-center justify-center gap-1 px-2 py-1.5 md:px-3 md:py-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-yellow-950 font-black text-[9px] md:text-[10px] rounded-[10px] md:rounded-xl shadow-md transition duration-150 active:scale-95 cursor-pointer border border-yellow-300/40 btn-chat primary btn-orange-style whitespace-nowrap"
                          >
                            <span>🆘 {userVotedIds.includes(lowestChar.id) ? "Đã cứu" : "Giải Cứu"}</span>
                          </button>

                          {/* Interactive Story Trigger */}
                          <button
                            onClick={() => {
                              playClickSound(480, 0.08);
                              setStoryCharacter(lowestChar);
                            }}
                            className="flex-1 md:w-28 flex items-center justify-center gap-1 px-2 py-1.5 md:px-3 md:py-2.5 text-amber-200 bg-amber-950/50 hover:bg-amber-900/40 border border-amber-500/30 text-[9px] md:text-[10px] font-black rounded-[10px] md:rounded-xl transition duration-150 active:scale-95 cursor-pointer whitespace-nowrap"
                          >
                            <BookOpen className="w-3 h-3 md:w-3.5 md:h-3.5" />
                            <span className="hidden sm:inline">Cốt truyện</span>
                            <span className="sm:hidden">Truyện</span>
                          </button>

                          {/* Profile Button */}
                          <a
                            href={lowestChar.profileUrl || "#"}
                            target={lowestChar.profileUrl ? "_blank" : undefined}
                            rel={lowestChar.profileUrl ? "noopener noreferrer" : undefined}
                            onClick={() => playClickSound(480, 0.08)}
                            className="flex-1 md:w-28 flex items-center justify-center gap-1 px-2 py-1.5 md:px-3 md:py-2.5 text-amber-200 bg-amber-950/50 hover:bg-amber-900/40 border border-amber-500/30 text-[9px] md:text-[10px] font-black rounded-[10px] md:rounded-xl transition duration-150 active:scale-95 cursor-pointer whitespace-nowrap"
                          >
                            <User className="w-3 h-3 md:w-3.5 md:h-3.5" />
                            <span className="hidden sm:inline">Profile</span>
                            <span className="sm:hidden">Hồ sơ</span>
                          </a>
                        </div>
                      </motion.div>
                    </div>
                  )}

                  {/* Art Gallery & Commission Station */}
                  <ArtGallery
                    playClickSound={playClickSound}
                    currentUser={currentUser}
                    onPromptLogin={(message: string) => {
                      setAuthTab('login');
                      setAuthModalError(message);
                      setShowAuthModal(true);
                    }}
                  />

                  {/* Characters scrollable vertical listing: "Bộ sưu tập thú bông lưu niệm" */}
                  <div className="space-y-4" id="character-list-section">
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
                    ) : (() => {
                      const totalPages = Math.ceil(filteredCharacters.length / CHARACTERS_PER_PAGE);
                      const paginatedCharacters = filteredCharacters.slice(
                        (currentPage - 1) * CHARACTERS_PER_PAGE,
                        currentPage * CHARACTERS_PER_PAGE
                      );
                      return (
                        <div className="arcade-outer-frame">
                          <div className="big-cabinet">
                          {/* MÁI VÒM & DECOR TRÊN ĐỈNH TỦ */}
                          <div className="cabinet-header">
                            <span className="ribbon-decor left">🎀</span>
                            <h2 className="cabinet-title">✦ BỘ SƯU TẬP ✦</h2>
                            <span className="ribbon-decor right">🎀</span>
                          </div>

                          {/* THÂN TỦ: CHỨA CÁC NGĂN KỆ VÀ THẺ BÀI */}
                          <div id="character-grid" className="cabinet-body character-grid px-2 py-4 sm:py-8">
                            {chunkArray(paginatedCharacters, itemsPerRow).map((rowCharacters, rowIndex) => (
                              <div key={rowIndex} className="shelf-row justify-items-center justify-center">
                                {rowCharacters.map((char, index) => {
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
                                      transition={{ duration: 0.5, delay: (index % CHARACTERS_PER_PAGE) * 0.05 }}
                                      style={{ 
                                        transform: `rotate(${rotationAngle}deg)`,
                                      }}
                                      className={`plushie-card-container relative select-none ${isFlipped ? "flipped" : ""}`}
                                      onClick={() => {
                                        playClickSound(350, 0.08);
                                        setFlippedCardIds(prev => ({
                                          ...prev,
                                          [char.id]: !prev[char.id]
                                        }));
                                      }}
                                    >
                                      <div className="plushie-card-inner">
                                        {/* Front Side */}
                                        <div 
                                          className={`plushie-card-front ${plushTheme.bg} ${plushTheme.border} ${plushTheme.shadow} flex flex-col justify-between h-full relative items-center`}
                                          style={{ 
                                            WebkitBackfaceVisibility: 'hidden', 
                                            backfaceVisibility: 'hidden', 
                                            transform: 'rotateY(0deg)',
                                            padding: '15px 10px'
                                          }}
                                        >
                                          {isNewCharacter(char) && (
                                            <div 
                                              className="absolute font-black pointer-events-none tracking-widest uppercase font-sans animate-pulse"
                                              style={{ 
                                                top: '12px', 
                                                right: '12px', 
                                                zIndex: 10,
                                                color: '#ff4b2b',
                                                fontSize: '11px',
                                                textShadow: '0 0 6px rgba(255, 75, 43, 0.5)',
                                              }}
                                            >
                                              NEW 🔥
                                            </div>
                                          )}
                                          <div className="plushie-inner-border"></div>
                                          
                                          {/* Top header of the plushie gacha certification card */}
                                          <div className={`flex justify-between items-center text-[7px] sm:text-[9px] font-sans font-black uppercase tracking-wider ${plushTheme.textColor} z-10 w-full`}>
                                            <span>🎈 № 0{char.id} 🎈</span>
                                          </div>
                                          
                                          {/* Square 3D embossed picture frame */}
                                          <div className="flex flex-col items-center justify-center my-auto z-10 w-full">
                                            <div 
                                              className="relative flex items-center justify-center z-10 bg-white"
                                              style={{
                                                width: '120px',
                                                height: '120px',
                                                borderRadius: '14px',
                                                border: '3px solid #d1d5db',
                                                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15), inset 0 -4px 6px rgba(0, 0, 0, 0.05)',
                                                margin: '15px auto'
                                              }}
                                            >
                                              {char.image || char.avatar.startsWith('http') ? (
                                                <img 
                                                  src={char.image || char.avatar} 
                                                  alt={char.name}
                                                  style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    borderRadius: '12px'
                                                  }}
                                                />
                                              ) : (
                                                <div style={{
                                                  width: '100%',
                                                  height: '100%',
                                                  borderRadius: '12px',
                                                  background: '#f3f4f6',
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  justifyContent: 'center',
                                                  fontSize: '3.5rem'
                                                }}>
                                                  {char.avatar}
                                                </div>
                                              )}
                                            </div>
                                            
                                            {/* Name & Title */}
                                            <h4 className={`text-xs sm:text-base md:text-lg font-black mt-1 sm:mt-2 ${plushTheme.textColor} text-center font-sans tracking-wide leading-[1.2]`}>
                                              {char.name}
                                            </h4>
                                            
                                            {/* Tags */}
                                            <div className="plushie-tags-scroll flex flex-wrap gap-0.5 sm:gap-1 justify-center mt-1 sm:mt-2 max-w-full pb-1 sm:pb-2">
                                              {char.tags.map((t, idx) => {
                                                const symbol = getRuneSymbol(t);
                                                return (
                                                  <span
                                                    key={idx}
                                                    className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full border text-[6px] sm:text-[9px] font-black uppercase font-sans tracking-tight transition-transform active:scale-95 ${plushTheme.tagBg}`}
                                                  >
                                                    <span>{symbol}</span>
                                                    <span>{t}</span>
                                                  </span>
                                                );
                                              })}
                                            </div>
                                          </div>
                                          
                                          {/* Footer of the Card front */}
                                          <div className={`text-center text-[7px] sm:text-[9px] ${plushTheme.noteText} font-sans font-bold tracking-wider pt-1 sm:pt-2 border-t border-black/5 z-10 flex items-center justify-center gap-1 sm:gap-1.5 w-full`}>
                                            <span>✨ Nhấn lật xem ✨</span>
                                          </div>
                                        </div>

                                        {/* Back Side */}
                                        <div 
                                          className={`plushie-card-back ${plushTheme.bg} ${plushTheme.border} ${plushTheme.shadow} flex flex-col justify-between h-full relative`}
                                          style={{ WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                        >
                                          <div className="plushie-inner-border"></div>
                                          
                                          {/* Back Header */}
                                          <div className={`flex justify-between items-center text-[7px] sm:text-[9px] font-sans font-black uppercase tracking-wider ${plushTheme.textColor} z-10 w-full`}>
                                            <span className="hidden sm:inline">📜 CHỨNG NHẬN BẢO HÀNH 📜</span>
                                            <span className="sm:hidden">📜 CHỨNG NHẬN 📜</span>
                                            <span>#{char.id}</span>
                                          </div>
                                          
                                          {/* Back Content scroll/description body */}
                                          <div className="my-auto flex flex-col gap-1.5 sm:gap-2.5 z-10 px-0.5 sm:px-1 overflow-y-auto max-h-[110px] sm:max-h-[190px] custom-scrollbar scroll-smooth">
                                            <h5 className={`text-xs sm:text-md font-bold ${plushTheme.textColor} text-center mt-1 font-sans`}>
                                              {char.name}
                                            </h5>
                                            
                                            <p className={`text-[8px] sm:text-[11.5px] leading-tight sm:leading-relaxed ${plushTheme.textColor} opacity-90 text-justify italic font-serif px-1.5 sm:px-2 bg-white/40 p-1.5 sm:p-2.5 rounded-[10px] sm:rounded-2xl border border-white/60 shadow-sm`}>
                                              "{char.description}"
                                            </p>
                                          </div>
                                          
                                          {/* Back Action buttons themed beautifully */}
                                          <div className="flex flex-col gap-1.5 sm:gap-2 z-10 mt-auto pt-1.5 sm:pt-3 border-t border-black/5 w-full">
                                            {/* Row of buttons */}
                                            <div className="flex gap-2">
                                              {/* Chat Button */}
                                              {!(char.chatbotUrl || char.chatLink) ? (
                                                <button
                                                  disabled
                                                  onClick={(e) => e.stopPropagation()}
                                                  className="flex-1 select-none flex items-center justify-center gap-1 px-1.5 sm:px-2.5 py-1 sm:py-1.5 bg-[#444]/10 text-slate-400 font-bold text-[8px] sm:text-[10px] rounded-[10px] sm:rounded-xl border border-slate-300 cursor-not-allowed opacity-50"
                                                >
                                                  <MessageCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                  <span className="hidden sm:inline">Sắp ra mắt</span>
                                                  <span className="sm:hidden">Sắp tới</span>
                                                </button>
                                              ) : (
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStartChat(char);
                                                  }}
                                                  className="flex-1 select-none flex items-center justify-center gap-1 px-1.5 sm:px-2.5 py-1 sm:py-1.5 bg-gradient-to-r from-emerald-500/20 to-teal-600/30 text-emerald-800 hover:from-emerald-500/35 hover:to-teal-600/45 border border-emerald-500/30 font-bold text-[8px] sm:text-[10px] rounded-[10px] sm:rounded-xl transition duration-150 active:scale-95"
                                                >
                                                  <MessageCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                  Chat
                                                </button>
                                              )}

                                              {/* Plot Button */}
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  playClickSound(480, 0.08);
                                                  setStoryCharacter(char);
                                                }}
                                                className="flex-1 select-none flex items-center justify-center gap-1 px-1.5 sm:px-2.5 py-1 sm:py-1.5 bg-gradient-to-r from-purple-500/10 to-violet-600/20 text-purple-800 hover:from-purple-500/20 hover:to-violet-600/30 border border-purple-500/20 font-bold text-[8px] sm:text-[10px] rounded-[10px] sm:rounded-xl transition duration-150 active:scale-95"
                                              >
                                                <BookOpen className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                Tiểu sử
                                              </button>
                                            </div>

                                            {/* Profile Anchor Button */}
                                            <a
                                              href={char.profileUrl || "#"}
                                              target={char.profileUrl ? "_blank" : undefined}
                                              rel={char.profileUrl ? "noopener noreferrer" : undefined}
                                              onClick={(e) => e.stopPropagation()}
                                              className="select-none flex items-center justify-center gap-1 px-1.5 sm:px-2.5 py-1 sm:py-1.5 bg-gradient-to-r from-blue-500/10 to-cyan-600/20 text-blue-800 hover:from-blue-500/20 hover:to-cyan-600/30 border border-blue-500/20 font-bold text-[8px] sm:text-[10px] rounded-[10px] sm:rounded-xl transition duration-150 active:scale-95 text-center"
                                            >
                                              <User className="w-2.5 h-2.5 sm:w-3 sm:h-3 inline-block" />
                                              <span className="hidden sm:inline">Xem Hồ sơ chi tiết</span>
                                              <span className="sm:hidden">Hồ sơ</span>
                                            </a>
                                          </div>
                                        </div>
                                      </div>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            ))}
                          </div>

                          {/* ĐÁY TỦ (NGĂN KÉO CHỨA NÚT PHÂN TRANG) */}
                          <div className="cabinet-drawer">
                            <div className="drawer-handle"></div> {/* Tay nắm ngăn kéo */}
                            {totalPages > 1 && (
                              <div id="pagination" className="pagination-container flex items-center justify-center gap-1.5 sm:gap-2 mt-1 sm:mt-1 py-1 flex-wrap">
                                <button
                                  onClick={() => {
                                    if (currentPage > 1) {
                                      playClickSound(300, 0.08);
                                      setCurrentPage(prev => prev - 1);
                                      setTimeout(() => {
                                        const target = document.getElementById('character-list-section');
                                        if (target) {
                                          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        }
                                      }, 50);
                                    }
                                  }}
                                  disabled={currentPage === 1}
                                  className="page-btn font-sans text-[10px] sm:text-xs flex items-center gap-1 select-none"
                                >
                                  «
                                </button>
                                
                                <div className="flex items-center gap-1 flex-wrap">
                                  {Array.from({ length: totalPages }, (_, idx) => {
                                    const pageNum = idx + 1;
                                    const isActive = pageNum === currentPage;
                                    return (
                                      <button
                                        key={pageNum}
                                        onClick={() => {
                                          playClickSound(300 + pageNum * 20, 0.08);
                                          setCurrentPage(pageNum);
                                          setTimeout(() => {
                                            const target = document.getElementById('character-list-section');
                                            if (target) {
                                              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                            }
                                          }, 50);
                                        }}
                                        className={`page-btn w-7 h-7 sm:w-8 sm:h-8 font-sans text-[10px] sm:text-xs flex items-center justify-center select-none ${
                                          isActive ? "active" : ""
                                        }`}
                                      >
                                        {pageNum}
                                      </button>
                                    );
                                  })}
                                </div>

                                <button
                                  onClick={() => {
                                    if (currentPage < totalPages) {
                                      playClickSound(300, 0.08);
                                      setCurrentPage(prev => prev + 1);
                                      setTimeout(() => {
                                        const target = document.getElementById('character-list-section');
                                        if (target) {
                                          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        }
                                      }, 50);
                                    }
                                  }}
                                  disabled={currentPage === totalPages}
                                  className="page-btn font-sans text-[10px] sm:text-xs flex items-center gap-1 select-none"
                                >
                                  »
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        </div>
                      );
                    })()}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
      )}

      {/* Character Voting Modal */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out ${
          isVoteModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        style={{ willChange: 'opacity, visibility' }}
      >
        {/* Backdrop */}
        <div
          onClick={() => {
            playClickSound(300, 0.08);
            setIsVoteModalOpen(false);
          }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300"
        />
        
        {/* Modal Body */}
        <div
          style={{ 
            willChange: 'transform, opacity',
            transform: isVoteModalOpen ? 'translate3d(0, 0, 0) scale(1)' : 'translate3d(0, 30px, 0) scale(0.95)',
            transition: 'transform 0.3s ease-out, opacity 0.3s ease-out'
          }}
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
        </div>
      </div>

      {/* Guestbook Modal */}
      <AnimatePresence>
        {isGuestbookModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                playClickSound(300, 0.08);
                setIsGuestbookModalOpen(false);
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            
            {/* Modal Body - Sunshine & Sky Theme */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="relative w-full max-w-md bg-gradient-to-br from-sky-300 via-blue-200 to-amber-100 rounded-3xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.3)] border-4 border-white/60 z-10 flex flex-col items-center text-center overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-yellow-300/40 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -ml-6 -mb-6 w-32 h-32 bg-sky-400/30 rounded-full blur-2xl pointer-events-none" />

              <div className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center shadow-md mb-4 relative z-10">
                <span className="text-3xl filter drop-shadow-sm">💌</span>
              </div>

              <h3 className="text-lg md:text-xl font-black text-sky-900 mb-6 relative z-10 px-4 leading-tight">
                Hãy lưu lại một chút yêu thương cho Tun nhá 🌟💞
              </h3>

              <div className="w-full space-y-4 relative z-10">
                <input
                  type="text"
                  value={guestbookName}
                  onChange={(e) => setGuestbookName(e.target.value)}
                  placeholder="Tên của bạn (để trống nếu muốn ẩn danh)..."
                  className="w-full px-4 py-3 rounded-xl bg-white/90 border-2 border-sky-100 focus:border-yellow-400 focus:outline-none text-sky-900 placeholder-sky-700/50 shadow-sm transition-colors text-[16px] md:text-sm font-medium"
                />

                <textarea
                  value={guestbookContent}
                  onChange={(e) => setGuestbookContent(e.target.value)}
                  placeholder="Viết lưu bút hoặc góp ý của bạn tại đây..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/90 border-2 border-sky-100 focus:border-yellow-400 focus:outline-none text-sky-900 placeholder-sky-700/50 shadow-sm transition-colors text-[16px] md:text-sm resize-none"
                />

                <button
                  onClick={handleSubmitGuestbook}
                  disabled={isSubmittingGuestbook}
                  className="w-full py-3.5 bg-gradient-to-r from-yellow-300 to-amber-400 hover:from-yellow-400 hover:to-amber-500 text-sky-950 font-black text-sm md:text-base rounded-xl shadow-[0_4px_15px_rgba(251,191,36,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2 border-2 border-yellow-200"
                >
                  {isSubmittingGuestbook ? (
                    <span className="animate-pulse">Đang gửi...</span>
                  ) : (
                    <>
                      <span>Lưu Bút</span>
                      <PenTool className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={() => {
                  playClickSound(300, 0.08);
                  setIsGuestbookModalOpen(false);
                }}
                className="mt-4 text-xs font-bold text-sky-800/60 hover:text-sky-900 uppercase tracking-widest relative z-10"
              >
                Đóng
              </button>
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
              className="relative w-full max-w-[500px] mx-auto select-none z-10 flex flex-col bg-[#F8FAFC] rounded-[32px] p-6 pb-8 shadow-[0_20px_50px_rgba(25,118,210,0.3)] border-4 border-[#1976D2] overflow-hidden"
            >
              {/* Header/Title */}
              <div className="text-center pb-4 relative border-b border-[#1976D2]/10 mb-4 flex flex-col items-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl">🎪</span>
                  <h3 className="font-serif italic font-extrabold text-[#1976D2] text-lg md:text-xl tracking-wider uppercase">
                    QUẦY VÉ HƯỚNG DẪN 🎰
                  </h3>
                </div>
                <p className="text-[10px] font-sans text-slate-500 font-bold uppercase tracking-widest mt-1">
                  Bản Đồ Chỉ Dẫn & Lệnh Bài Chuyển Sinh
                </p>

                {/* Close Button */}
                <button
                  onClick={() => {
                    playClickSound(300, 0.08);
                    setIsCommandModalOpen(false);
                  }}
                  title="Đóng Hướng Dẫn"
                  className="absolute top-0 right-0 bg-[#FFD600] hover:brightness-110 border-2 border-[#1976D2] rounded-full w-8 h-8 flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer group"
                >
                  <X className="w-4 h-4 text-[#1976D2]" />
                </button>
              </div>

              {/* Scrollable list of 4 elegant command cards */}
              <div className="w-full max-h-[60vh] overflow-y-auto pr-1 space-y-4 no-scrollbar">
                {[
                  {
                    id: "cam_nang",
                    title: "Hướng dẫn chơi bằng Prompt",
                    desc: "hướng dẫn chơi bằng cách share prompt cho người mới",
                    author: "Tun",
                    code: "https://drive.google.com/file/d/1FbS0dXfDJwHHSwsxdLcDCviFPZgMUe53/view?usp=drivesdk"
                  },
                  {
                    id: "ho_than",
                    title: "Cách vượt rào khi chat ⚡️",
                    desc: "Tổng hợp các cách chống bị block khi chat ⚡️",
                    author: "Tun",
                    code: "https://docs.google.com/document/d/1BmyFxW6a22cV5mKHOGCFzRj3v-nmujSd0-J-qCOfEOQ/edit?usp=drivesdk"
                  },
                  {
                    id: "chuyen_sinh_couple",
                    title: "Lệnh Chuyển Sinh 2 Couple",
                    desc: "Lệnh chuyển sinh cho thể loại 2 couple",
                    author: "Tun",
                    code: "https://docs.google.com/document/d/1GoYMiUppvg8-r5NXlNjP_Y9Ezx_pJ4TpVxshk0V_SlE/edit?usp=drivesdk"
                  },
                  {
                    id: "chuyen_sinh_world",
                    title: "Lệnh Chuyển Sinh Open World",
                    desc: "Lệnh chuyển sinh dành cho thể loại open world",
                    author: "Tun",
                    code: "https://docs.google.com/document/d/1L7RTy8GNWXyPvKuuTp6Qd7Eenl9LyalPPNTNdozH_r8/edit?usp=drivesdk"
                  }
                ].map((card) => (
                  <div key={card.id} className="bg-white rounded-2xl p-4 border-2 border-[#1976D2]/20 hover:border-[#1976D2]/50 shadow-sm transition-all flex flex-col space-y-3 relative text-left">
                    {/* Header */}
                    <div className="flex flex-col">
                      <h4 className="font-serif font-black text-[#1976D2] text-sm md:text-base leading-tight">
                        #{card.title}
                      </h4>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-[10px] text-slate-500 font-medium">
                          {card.desc}
                        </p>
                        <span className="text-[9px] bg-[#1976D2]/10 text-[#1976D2] px-1.5 py-0.5 rounded font-bold shrink-0 ml-2">
                          Tác giả: {card.author}
                        </span>
                      </div>
                    </div>

                    {/* Core (Khung nền đen xám) */}
                    <div className="bg-[#1e293b] rounded-xl p-3 relative flex flex-col min-h-[50px] justify-center border border-slate-700/50 shadow-inner group/code">
                      {/* Copy Button */}
                      <button
                        onClick={() => {
                          handleCopy(card.code, card.id);
                          playClickSound(600, 0.08);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition active:scale-90 border border-slate-700 cursor-pointer"
                        title="Copy toàn bộ"
                      >
                        {copiedField === card.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      
                      {/* Code area */}
                      <div className="pr-10 overflow-x-auto whitespace-pre-wrap break-all font-mono text-[10px] md:text-xs text-slate-300 leading-relaxed font-semibold">
                        {card.code}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                    Chào mừng đến trung tâm giải trí của Tun, Hãy đến quầy hưỡng dẫn để lấy vẽ vào khu vui chơi nhé 🌟
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

      {/* Bảng Giá / Pricing Modal */}
      <AnimatePresence>
        {isPricingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                playClickSound(300, 0.08);
                setIsPricingModalOpen(false);
                setIsPricingZoomed(false);
              }}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 35 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 35 }}
              transition={{ type: "spring", damping: 22, stiffness: 150 }}
              className="relative w-full max-w-md mx-auto bg-gradient-to-b from-[#2a1010] via-[#1a0808] to-[#2a1010] border-2 border-[#e2a85c] rounded-2xl shadow-[0_0_35px_rgba(226,168,92,0.35)] z-10 text-slate-200 overflow-hidden"
            >
              {/* Header Title Bar */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-[#1a0808]/90 border-b border-[#e2a85c]/40">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚜️</span>
                  <h3 className="font-sans font-black text-sm text-[#e2a85c] uppercase tracking-wider">
                    BẢNG GIÁ BOOK CHARACTER
                  </h3>
                </div>
                <button
                  onClick={() => {
                    playClickSound(300, 0.08);
                    setIsPricingModalOpen(false);
                    setIsPricingZoomed(false);
                  }}
                  className="p-1.5 rounded-lg hover:bg-[#e2a85c]/20 text-[#e2a85c] transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body Content */}
              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Royal Frame for Pricing Image */}
                <div 
                  onClick={() => {
                    playClickSound(400, 0.08);
                    setIsPricingZoomed(true);
                  }}
                  className="relative rounded-xl overflow-hidden border-2 border-[#e2a85c] shadow-[0_0_25px_rgba(226,168,92,0.3)] bg-[#1a0808] cursor-pointer group transition-transform duration-200 hover:scale-[1.01]"
                >
                  <img
                    src="https://cdn.phototourl.com/free/2026-07-28-4cc70a7c-d443-44db-b715-d4ff84fc43d3.jpg"
                    alt="Bảng Giá"
                    className="w-full h-auto object-cover max-h-[420px] transition duration-300 group-hover:brightness-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <span className="bg-[#1a0808]/95 text-[#fde047] border border-[#e2a85c] px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg">
                      🔍 Bấm để phóng to ảnh
                    </span>
                  </div>
                </div>

                {/* Quote Box for Contact Note */}
                <div className="bg-[#1f0b0b]/90 border border-dashed border-[#e2a85c]/60 rounded-xl p-3.5 text-left shadow-inner relative">
                  <p className="text-xs text-slate-300 font-medium leading-relaxed flex items-start gap-2">
                    <span className="text-[#e2a85c] text-sm shrink-0">⚜️</span>
                    <span>Nếu có nhu cầu book character hãy liên hệ qua page hoặc acc Discord chính của Tun nhé ! 🍰</span>
                  </p>
                </div>
              </div>

              {/* Footer Button */}
              <div className="px-5 py-3.5 bg-[#1a0808]/90 border-t border-[#e2a85c]/40 flex justify-end">
                <button
                  onClick={() => {
                    playClickSound(400, 0.08);
                    setIsPricingModalOpen(false);
                    setIsPricingZoomed(false);
                    setIsDonateModalOpen(true);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#5c1c1c] to-[#3a0f0f] hover:from-[#7a2525] hover:to-[#4a1414] border border-[#e2a85c] text-[#fde047] font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(226,168,92,0.25)] transition-all duration-200 cursor-pointer flex items-center gap-2 hover:shadow-[0_0_20px_rgba(226,168,92,0.5)] active:scale-95"
                >
                  <span>🛎️ Ting Ting</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox Zoom Modal for Pricing */}
      <AnimatePresence>
        {isPricingZoomed && (
          <div 
            onClick={() => setIsPricingZoomed(false)}
            className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src="https://cdn.phototourl.com/free/2026-07-28-4cc70a7c-d443-44db-b715-d4ff84fc43d3.jpg"
                alt="Bảng Giá Phóng To"
                className="max-w-full max-h-[85vh] object-contain rounded-xl border-2 border-[#e2a85c] shadow-[0_0_50px_rgba(226,168,92,0.5)] bg-[#1a0808]"
                referrerPolicy="no-referrer"
              />
              <button 
                onClick={() => setIsPricingZoomed(false)}
                className="absolute top-4 right-4 bg-[#1a0808] border border-[#e2a85c] text-[#e2a85c] p-2 rounded-full hover:bg-[#e2a85c]/20 transition cursor-pointer shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile của Tun Modal */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                playClickSound(300, 0.08);
                setIsProfileModalOpen(false);
              }}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 35 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 35 }}
              transition={{ type: "spring", damping: 22, stiffness: 150 }}
              className="relative w-full max-w-md mx-auto bg-gradient-to-b from-[#2a1010] via-[#1a0808] to-[#2a1010] border-2 border-[#e2a85c] rounded-2xl shadow-[0_0_35px_rgba(226,168,92,0.35)] z-10 text-slate-200 overflow-hidden"
            >
              {/* Header Title Bar */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-[#1a0808]/90 border-b border-[#e2a85c]/40">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  <h3 className="font-sans font-black text-sm text-[#e2a85c] uppercase tracking-wider">
                    Profile của Tun 👑
                  </h3>
                </div>
                <button
                  onClick={() => {
                    playClickSound(300, 0.08);
                    setIsProfileModalOpen(false);
                  }}
                  className="p-1.5 rounded-lg hover:bg-[#e2a85c]/20 text-[#e2a85c] transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Cover Banner */}
              <div className="relative h-28 w-full overflow-hidden border-b border-[#e2a85c]/30">
                <img
                  src="https://cdn.phototourl.com/free/2026-07-29-1d3d62e2-3422-4aae-b7d9-7317244d7d27.jpg"
                  alt="Gothic Banner"
                  className="w-full h-full object-cover opacity-75 filter saturate-125"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a0808] via-transparent to-black/30" />
              </div>

              {/* Modal Body Content */}
              <div className="px-6 pb-6 pt-0 flex flex-col items-center text-center relative">
                {/* Floating Avatar */}
                <div className="-mt-12 w-20 h-20 rounded-full border-2 border-[#e2a85c] shadow-[0_0_20px_rgba(226,168,92,0.6)] bg-[#2a1010] p-0.5 relative z-10 overflow-hidden">
                  <img
                    src="https://cdn.phototourl.com/free/2026-07-29-6d3afbfd-9d1d-4eba-83f6-79c0a1cbb77b.jpg"
                    alt="Profile Avatar"
                    className="w-full h-full rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="mt-2.5 flex flex-col items-center">
                  <h4 className="font-bold text-base text-[#fef08a] tracking-wide">Trịnh Thư Ý - Tun 👑</h4>
                  <div className="mt-1 inline-block bg-[#e2a85c]/20 border border-[#e2a85c]/80 text-[#e2a85c] px-3 py-0.5 rounded-full text-[11px] font-semibold tracking-wider shadow">
                    ✨ Roleplay Creator ✨
                  </div>
                  <button
                    onClick={() => {
                      playClickSound(500, 0.08);
                      setTunStatus(prev => prev === "Coding" ? "Online" : prev === "Online" ? "Idle" : "Coding");
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-[#1f0b0b] border border-[#e2a85c]/60 rounded-full text-[11px] text-[#fde047] hover:bg-[#e2a85c]/20 transition cursor-pointer shadow-sm"
                    title="Click để đổi trạng thái"
                  >
                    <span className={`w-2 h-2 rounded-full animate-pulse ${tunStatus === "Online" ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : tunStatus === "Coding" ? "bg-amber-400 shadow-[0_0_8px_#fbbf24]" : "bg-purple-400 shadow-[0_0_8px_#c084fc]"}`} />
                    <span className="font-medium">
                      {tunStatus === "Online" ? "🟢 Đang hoạt động (Online)" : tunStatus === "Coding" ? "💻 Đang cày Deadline" : "💤 Đang chill / Idle"}
                    </span>
                  </button>
                </div>

                {/* Quick Info Badges (Row 1) */}
                <div className="grid grid-cols-3 gap-2 w-full mt-4">
                  <div className="bg-[#1f0b0b] border border-[#e2a85c]/40 rounded-xl p-2 text-center shadow-sm">
                    <span className="block text-[10px] text-[#e2a85c]/80 uppercase tracking-wider font-bold">Cung Hoàng Đạo</span>
                    <span className="text-xs font-bold text-[#fde047] mt-0.5 block">Sagittarius ♐︎</span>
                  </div>
                  <div className="bg-[#1f0b0b] border border-[#e2a85c]/40 rounded-xl p-2 text-center shadow-sm">
                    <span className="block text-[10px] text-[#e2a85c]/80 uppercase tracking-wider font-bold">MBTI</span>
                    <span className="text-xs font-bold text-[#fde047] mt-0.5 block">INFP 🧠</span>
                  </div>
                  <div className="bg-[#1f0b0b] border border-[#e2a85c]/40 rounded-xl p-2 text-center shadow-sm">
                    <span className="block text-[10px] text-[#e2a85c]/80 uppercase tracking-wider font-bold">Platform</span>
                    <span className="text-xs font-bold text-[#fde047] mt-0.5 block">ONLY GGAI 📍</span>
                  </div>
                </div>

                {/* Quote Box (Row 2) */}
                <div className="w-full mt-3 bg-[#1f0b0b]/90 border border-[#e2a85c]/50 rounded-xl p-3 text-left shadow-inner relative">
                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    "★ Tui là Tun aka Trịnh Thư Ý (mn gọi như nào cũng được hihi). Tun rất dễ tính với chill nên là cứ chill nha, Tun rep tin nhắn lâu hoặc tự nhiên đang nhắn xong mất tích là Tun đang chạy deadline hoặc đang suy nghĩ nên rep gì cho ngầu á 🙉, Tun SIÊU HƯỚNG NỘI rất muốn kết bạn mà nhưng ngại 😭."
                  </p>
                </div>

                {/* Additional Notes with Star Icons */}
                <div className="w-full mt-3 text-xs text-slate-300 text-left space-y-2 bg-[#1f0b0b]/60 border border-[#e2a85c]/20 p-3 rounded-xl">
                  <div className="flex items-start gap-2">
                    <span className="text-[#e2a85c] text-sm shrink-0">🌟</span>
                    <span>Nên đọc Plot và Hồ sơ NV rùi hãng chơi để hiểu hơn về Character và nội dung.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#e2a85c] text-sm shrink-0">🌟</span>
                    <span>Một số char ko có link là Tun share prompt á (zô quầy hướng dẫn xem cách chơi hoặc ib Tun chỉ nha).</span>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex items-center justify-center gap-3 w-full mt-4 pt-3 border-t border-[#e2a85c]/30">
                  <a
                    href="https://www.facebook.com/share/18yG86eq1t/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-[#e2a85c]/15 hover:bg-[#e2a85c]/30 border border-[#e2a85c]/60 text-[#fde047] text-xs font-bold rounded-xl shadow transition text-center flex items-center justify-center gap-1.5"
                  >
                    <span>Facebook</span> 🌐
                  </a>
                  <a
                    href="https://discord.gg/UXYJmxXBY"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-[#e2a85c]/15 hover:bg-[#e2a85c]/30 border border-[#e2a85c]/60 text-[#fde047] text-xs font-bold rounded-xl shadow transition text-center flex items-center justify-center gap-1.5"
                  >
                    <span>Discord</span> 💬
                  </a>
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

      {/* Hidden Audio Element for Background & Gramophone Music */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleDurationChange}
        onEnded={handleEnded}
        onError={handleAudioError}
        preload="auto"
        className="hidden"
      />

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
            className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-[#2a1010] via-[#3a1515] to-[#1a0808] border-2 border-[#7f1d1d] shadow-[0_4px_20px_rgba(0,0,0,0.6),inset_0_0_8px_rgba(127,29,29,0.4)] flex items-center justify-center hover:scale-105 hover:shadow-[0_0_20px_rgba(127,29,29,0.8)] active:scale-95 transition-all group cursor-pointer overflow-hidden"
            title="Trình Phát Nhạc Đĩa Than"
          >
            {/* Vinyl grooves rings */}
            <div className="absolute inset-1 rounded-full border border-red-950/40 pointer-events-none" />
            <div className="absolute inset-2.5 rounded-full border border-red-950/30 pointer-events-none" />
            <div className="absolute inset-4 rounded-full border border-red-950/20 pointer-events-none" />

            {/* Rotating vinyl disk container */}
            <div 
              className="w-full h-full rounded-full flex items-center justify-center relative overflow-hidden"
              style={{
                animation: 'gramophone-rotate 6s linear infinite',
                animationPlayState: isPlaying ? 'running' : 'paused'
              }}
            >
              <img
                src="https://i.imgur.com/akkolzf.jpeg"
                alt="Vinyl Cover"
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Shine highlight */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none rounded-full" />
          </button>
        </div>
      )}

      {/* Floating Letter Notice Button (Bottom Left) */}
      {hasEntered && (
        <div className="fixed bottom-6 left-6 z-40">
          <button
            onClick={() => {
              playClickSound(300, 0.08);
              setIsLetterNoticeModalOpen(true);
            }}
            className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-[#3a2522] via-[#5c3a2e] to-[#2b1810] border-2 border-[#c59b27] shadow-[0_4px_20px_rgba(0,0,0,0.6),inset_0_0_8px_rgba(255,215,0,0.3)] flex items-center justify-center hover:scale-105 hover:shadow-[0_0_20px_rgba(197,155,39,0.8)] active:scale-95 transition-all group cursor-pointer overflow-hidden"
            title="Thư Thông Báo Cập Nhật ✉️"
            id="floating-letter-notice-btn"
          >
            {/* Notification badge pulse */}
            <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-[#2b1810] animate-pulse z-10" />
            <Mail className="w-6 h-6 text-[#f3e5ab] group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
            {/* Shine highlight */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none rounded-full" />
          </button>
        </div>
      )}

      {/* Letter Notice Popup Modal */}
      <AnimatePresence>
        {isLetterNoticeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => {
                playClickSound(300, 0.08);
                setIsLetterNoticeModalOpen(false);
              }}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-[460px] mx-auto z-10 flex flex-col"
            >
              <div className="relative">
                <button
                  onClick={() => {
                    playClickSound(300, 0.08);
                    setIsLetterNoticeModalOpen(false);
                  }}
                  className="absolute -top-3 -right-3 z-20 w-8 h-8 rounded-full bg-[#3A2522] border-2 border-[#C59B27] text-[#F3E5AB] hover:text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                  title="Đóng"
                >
                  <X className="w-4 h-4" />
                </button>
                <LetterNotice playClickSound={playClickSound} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                              <div className="w-full h-full opacity-70 scale-90 rounded-full bg-cover bg-center" style={{ backgroundImage: "url('https://i.imgur.com/akkolzf.jpeg')" }} />
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
                      <div className="text-center mb-3 px-2 relative z-10">
                        <h4 className="text-base md:text-lg font-serif italic text-[#FFE79A] text-center tracking-wide line-clamp-1 drop-shadow-md pr-1">
                          {currentSong?.title || "No track selected"}
                        </h4>
                        <p className="text-[11px] font-serif italic text-amber-300/60 mt-0.5 tracking-wider">
                          {currentSong?.playlist || `Album #${currentTrackIndex + 1}`}
                        </p>
                        {audioError && (
                          <div className="mt-2 px-2.5 py-1 rounded-lg bg-rose-950/80 border border-rose-500/50 text-[10px] text-rose-200 font-sans font-medium">
                            ⚠️ {audioError}
                          </div>
                        )}
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
                      {/* Playlist Select Dropdown */}
                      <div className="mb-3">
                        <select
                          id="playlist-select"
                          value={selectedPlaylist}
                          onChange={(e) => {
                            playClickSound(300, 0.08);
                            setSelectedPlaylist(e.target.value as PlaylistCategory);
                          }}
                          className="w-full bg-[#291202] border border-amber-500/40 text-[#ffd175] text-xs font-serif rounded-xl p-2.5 outline-none focus:border-amber-400/80 transition cursor-pointer"
                        >
                          <option value="us-uk">US - UK</option>
                          <option value="v-pop">V-POP</option>
                          <option value="c-pop">C-POP</option>
                          <option value="phonk-funk">Phonk - Funk</option>
                        </select>
                      </div>
                      {/* Current Playlist */}
                      <div className="flex-1 overflow-y-auto mb-4 pr-1 space-y-2 no-scrollbar custom-scrollbar">
                        {musicPlaylists[selectedPlaylist].map((track, index) => {
                          const isCurrentPlaying = selectedPlaylist === activePlaylist && index === currentTrackIndex;
                          return (
                            <button
                              key={index}
                              onClick={() => {
                                playClickSound(300, 0.08);
                                setActivePlaylist(selectedPlaylist);
                                setCurrentTrackIndex(index);
                                setIsPlaying(true);
                              }}
                              className={`w-full text-left p-2.5 rounded-xl transition flex justify-between items-center border ${
                                isCurrentPlaying 
                                  ? 'bg-[#5c3012]/80 text-[#ffd175] border-[#ffd175]/60 shadow-[0_0_10px_rgba(255,174,52,0.3)] font-bold' 
                                  : 'bg-[#291202]/55 border-[#8a5d30]/20 text-amber-100/85 hover:bg-[#522b10]/40 hover:text-amber-100'
                              }`}
                            >
                              <span className="font-serif italic text-xs truncate mr-2 flex items-center gap-1">
                                <span className="text-amber-300/80 mr-1 font-sans font-semibold">{track.id}.</span>
                                <span className="truncate">{track.title}</span>
                              </span>
                              {isCurrentPlaying && isPlaying && (
                                <Music className="w-3.5 h-3.5 animate-pulse shrink-0 text-[#ffd175]" />
                              )}
                            </button>
                          );
                        })}
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

              {/* Character Info reveal below the glass chamber */}
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

      {showAgeVerify && (
        <div className="age-verify-overlay">
                    <div className="age-verify-card">
            {/* Icon Đôi mắt bí ẩn hoặc Con bài/Vòng quay thay cho 18+ nếu muốn, ở đây giữ 🔞 cho an toàn pháp lý nhưng đổi text */}
            <div className="age-icon">👁️‍🗨️ 🔞</div>
            
            <h2>SẢNH CHỜ VUI CHƠI</h2>
            
            {/* Khung Quy Định -> VÉ THÔNG HÀNH */}
            <div className="rules-box">
              <h3>TẤM VÉ THÔNG HÀNH</h3>
              <p>Khu vực phía sau chứa những trò chơi và "vòng quay" mang nội dung nhạy cảm, chỉ dành riêng cho người lớn. Nghiêm cấm trẻ vị thành niên dưới 18 tuổi bước vào rìa ranh giới dưới mọi hình thức.</p>
            </div>
            
            {/* Khung Điều Khoản -> LUẬT CHƠI ĐÊM */}
            <div className="rules-box">
              <h3>LUẬT CHƠI ĐÊM</h3>
              <p>Yêu cầu "du khách" phải từ đủ 18 tuổi. Bằng việc nhấn nút bước qua cánh cửa này, bạn xác nhận mình đã đủ bản lĩnh nhận vé và tự chịu mọi trách nhiệm trước các "vòng quay định mệnh" phía sau.</p>
            </div>
            
            {/* Khung Lưu Ý -> KHẾ ƯỚC PHÙ HOA */}
            <div className="rules-box">
              <h3>KHẾ ƯỚC PHÙ HOA</h3>
              <p>Mọi câu chuyện, nhân vật và sòng bài tại đây hoàn toàn là sản phẩm hư cấu 100%. Không cổ xúy, không đả kích đời thực. Tất cả chỉ là một giấc mộng giải trí tiêu khiển trong trí tưởng tượng.</p>
            </div>
            
            {/* Nút Xác Nhận -> Đổi chữ thành Nút Nhận Vé */}
            <button className="age-confirm-btn ticket-enter-btn" onClick={() => {
              if (audioRef.current) {
                audioRef.current.play().then(() => {
                  console.log("Music continues/starts smoothly on age confirm!");
                }).catch(err => {
                  console.warn("Audio play failed on age confirm:", err);
                });
              }
              setIsPlaying(true);
              playClickSound(600, 0.1);
              setShowAgeVerify(false);
              const hasNewChars = CHARACTERS.some(isNewCharacter);
              if (hasNewChars) {
                setShowNewCharactersPopup(true);
              }
            }}>
              Tôi đã đủ 18 tuổi — Nhận vé vào cửa
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showNewCharactersPopup && (
          <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-gradient-to-b from-[#2a1010] via-[#1a0808] to-[#2a1010] border-2 border-[#e2a85c] rounded-3xl p-5 md:p-6 shadow-[0_0_40px_rgba(226,168,92,0.3)] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="text-center mb-5 border-b border-[#e2a85c]/30 pb-4 relative z-10">
                <h2 className="text-xl md:text-2xl font-black text-[#e2a85c] tracking-widest uppercase flex items-center justify-center gap-2 drop-shadow-md">
                  <span>🔥</span> 
                  GẤU BÔNG MỚI 
                  <span>🔥</span>
                </h2>
                <div className="text-[#fde047] text-xs font-semibold tracking-wider mt-1 opacity-90">
                  🎁 Vote cho em bé mới nha 🎁
                </div>
              </div>

              {/* DANH SÁCH NHÂN VẬT - PHẦN NÀY LƯỚT ĐƯỢC */}
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[50vh] pr-1 scrollbar-hide relative z-10">
                {CHARACTERS.filter(isNewCharacter).map((char) => {
                  const link = char.chatLink !== undefined ? char.chatLink : char.chatbotUrl;
                  const hasLink = link && link.trim() !== "";
                  
                  return (
                    <div key={char.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#1a0808]/80 border border-[#e2a85c]/50 rounded-2xl p-3 shadow-inner">
                      <div className="flex items-center gap-3.5">
                        <div className="relative shrink-0">
                          <img 
                            src={char.image || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"} 
                            alt={char.name}
                            className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-[#e2a85c] object-cover shadow-[0_0_15px_rgba(226,168,92,0.4)]"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute -bottom-2 -right-2 bg-gradient-to-r from-red-800 to-rose-900 border border-[#e2a85c] text-[#fde047] text-[9px] md:text-[10px] font-black px-2 py-0.5 rounded shadow-[0_2px_5px_rgba(0,0,0,0.5)] rotate-[-8deg] uppercase tracking-wider">
                            No {char.no || char.id}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <div className="font-bold text-[#fef08a] text-sm md:text-base">{char.name}</div>
                          <div className="flex flex-wrap gap-1.5">
                            {char.tags.slice(0, 3).map((tag, i) => (
                              <span key={i} className="text-[9px] bg-[#e2a85c]/10 text-[#fde047]/90 border border-[#e2a85c]/40 px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="shrink-0 self-end sm:self-auto w-full sm:w-auto flex justify-end mt-2 sm:mt-0">
                        {hasLink ? (
                          <button
                            onClick={() => handleStartChat(char)}
                            className="bg-gradient-to-r from-[#e2a85c] to-[#b8860b] hover:from-[#b8860b] hover:to-[#e2a85c] border-2 border-[#fffacd] text-red-950 font-black text-[10px] md:text-xs px-3 py-1.5 rounded-xl shadow-[0_0_15px_rgba(226,168,92,0.6)] flex items-center justify-center gap-1.5 min-w-[100px] transition-all active:scale-95 cursor-pointer"
                          >
                            <span className="text-pink-100 animate-pulse drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">🌸</span> ĐÃ MỞ
                          </button>
                        ) : (
                          <div className="bg-stone-800/80 border border-dashed border-[#e2a85c]/60 text-[#e2a85c]/80 font-bold text-[10px] md:text-xs px-3 py-1.5 rounded-xl shadow-inner flex items-center justify-center gap-1.5 min-w-[100px]">
                            <span>⏳</span> CHỜ LINK
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Nút Main Gắp Thú */}
              <button 
                onClick={() => {
                  playClickSound(500, 0.1);
                  setShowNewCharactersPopup(false);
                }}
                className="mt-6 w-full bg-gradient-to-b from-[#7a2525] to-[#4a1414] hover:from-[#8c2a2a] hover:to-[#5c1c1c] border-2 border-[#e2a85c] text-[#fde047] font-black text-sm md:text-base uppercase py-4 rounded-xl shadow-[0_0_25px_rgba(226,168,92,0.5)] hover:shadow-[0_0_35px_rgba(226,168,92,0.8)] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out skew-x-12" />
                <span className="group-hover:animate-bounce">🕹️</span> ✨ 𝓖𝓪̆́𝓹 𝓣𝓱𝓾́ ✨
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Password Modal */}
      <AnimatePresence>
        {passwordModalChar && (
          <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                y: 0,
                x: isShaking ? [-10, 10, -10, 10, -5, 5, 0] : 0 
              }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ x: { duration: 0.4 } }}
              className="relative w-full max-w-md bg-gradient-to-b from-[#2a1010] via-[#1a0808] to-[#2a1010] border-2 border-[#e2a85c] rounded-3xl p-5 md:p-6 shadow-[0_0_40px_rgba(226,168,92,0.3)] flex flex-col overflow-hidden"
            >
              <div className="absolute top-4 right-4 z-50">
                <button
                  onClick={() => {
                    playClickSound(300, 0.1);
                    setPasswordModalChar(null);
                    setPasswordError("");
                    setPasswordInput("");
                    setIsUnlocked(false);
                    setShowPassword(false);
                  }}
                  className="p-1.5 rounded-lg hover:bg-[#e2a85c]/20 text-[#e2a85c] transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center mb-5 border-b border-[#e2a85c]/30 pb-4 relative z-10 flex flex-col items-center">
                <motion.div 
                  className="text-4xl mb-2 drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]"
                  animate={isUnlocked ? { scale: [1, 1.2, 1], rotate: [0, 15, -15, 0] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {isUnlocked ? "🔓" : "🔐"}
                </motion.div>
                <h2 className="text-xl md:text-2xl font-black text-[#e2a85c] tracking-widest uppercase drop-shadow-[0_0_8px_rgba(226,168,92,0.5)]">
                  XÁC NHẬN MẬT KHẨU
                </h2>
                <div className="mt-2.5 inline-block bg-[#3a0a0a] border border-[#e2a85c]/40 text-[#fde047] px-4 py-1 rounded-full text-xs font-bold tracking-wider shadow-inner">
                  {passwordModalChar.name}
                </div>
              </div>

              <div className="flex flex-col gap-4 relative z-10 text-[#fef08a] text-sm">
                {passwordModalChar.passwordQuestion && (
                  <div className="font-bold text-center text-base">
                    <span className="text-[#e2a85c] block text-xs mb-1">CÂU HỎI BẢO MẬT:</span>
                    {passwordModalChar.passwordQuestion}
                  </div>
                )}
                
                {passwordModalChar.passwordHint && (
                  <div className="italic text-center text-xs opacity-90">
                    <span className="text-[#e2a85c] font-bold">GỢI Ý: </span>
                    {passwordModalChar.passwordHint}
                  </div>
                )}
                
                {passwordModalChar.passwordNote && (
                  <div className="text-xs whitespace-pre-wrap opacity-95 bg-[#4a0a0a] p-3 rounded-xl border border-dashed border-[#e2a85c] text-red-200 shadow-inner">
                    {passwordModalChar.passwordNote}
                  </div>
                )}

                <div className="mt-2 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value.toUpperCase().replace(/\s/g, ""))}
                    placeholder="NHẬP MẬT KHẨU..."
                    className={`w-full bg-[#110505] border-2 ${passwordError ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'border-[#b8860b] focus:border-[#ffd700] focus:shadow-[0_0_15px_rgba(255,215,0,0.6)]'} text-[#fde047] placeholder:text-[#fde047]/30 px-4 py-3.5 rounded-xl outline-none transition-all font-bold text-center uppercase tracking-widest`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handlePasswordSubmit();
                      }
                    }}
                  />
                  <button 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 p-1 text-[#e2a85c] hover:text-[#ffd700] transition-colors cursor-pointer"
                    title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  {passwordError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className="text-red-400 text-xs text-center mt-2 font-bold drop-shadow-md"
                    >
                      {passwordError}
                    </motion.div>
                  )}
                </div>

                <button 
                  onClick={handlePasswordSubmit}
                  className="mt-3 w-full relative group overflow-hidden bg-gradient-to-b from-[#7a1515] to-[#4a0a0a] border-2 border-[#ffd700] text-[#ffd700] font-black text-sm md:text-base uppercase py-3.5 rounded-xl shadow-[0_4px_0_#b8860b,0_0_15px_rgba(255,215,0,0.4)] hover:shadow-[0_2px_0_#b8860b,0_0_25px_rgba(255,215,0,0.6)] hover:-translate-y-[2px] transition-all active:scale-95 active:translate-y-[2px] active:shadow-[0_0px_0_#b8860b,0_0_10px_rgba(255,215,0,0.4)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] skew-x-12 transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
                  XÁC NHẬN
                </button>
              </div>
            </motion.div>
          </div>
        )}
            </AnimatePresence>

      {/* Login Error / Iframe Redirect Guidance Modal */}
      <AnimatePresence>
        {showLoginErrorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#250808] border-2 border-[#e2a85c] rounded-2xl shadow-[0_0_50px_rgba(122,21,21,0.8)] p-6 text-white text-center"
            >
              <div className="text-4xl mb-3">⚠️</div>
              <h3 className="text-xl font-black text-[#e2a85c] mb-2 uppercase tracking-wider">Thông Báo Đăng Nhập</h3>
              <p className="text-sm text-amber-100/90 mb-6 leading-relaxed">
                {loginErrorMessage}
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    window.open(window.location.href, '_blank');
                  }}
                  className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-[#4A1208] font-black text-xs uppercase py-3 rounded-xl shadow-md hover:brightness-110 transition cursor-pointer"
                >
                  🚀 Mở Ứng Dụng Trong Tab Mới (Khuyên Dùng)
                </button>
                <button
                  onClick={() => setShowLoginErrorModal(false)}
                  className="w-full bg-[#3a0a0a] text-amber-200 border border-amber-500/30 text-xs font-bold py-2.5 rounded-xl hover:bg-[#4a0a0a] transition cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Comprehensive Authentication Modal (Google, Apple, Email/Password Login & Register) */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#250808] border-2 border-[#e2a85c] rounded-2xl shadow-[0_0_50px_rgba(122,21,21,0.9)] p-6 md:p-8 text-white"
            >
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-amber-300 hover:text-white bg-amber-950/60 p-2 rounded-full border border-amber-500/40 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-serif font-black text-amber-300 mb-1 tracking-wide">
                  {authTab === 'login' ? 'ĐĂNG NHẬP TÀI KHOẢN' : 'ĐĂNG KÝ TÀI KHOẢN MỚI'}
                </h3>
                <p className="text-xs text-amber-100/70 italic">Thế giới tiểu thuyết Dark Romance & Bình Chọn Nhân Vật</p>
              </div>

              {/* Tabs */}
              <div className="grid grid-cols-2 gap-2 mb-6 bg-[#180505] p-1.5 rounded-xl border border-amber-500/30">
                <button
                  type="button"
                  onClick={() => { setAuthTab('login'); setAuthModalError(''); }}
                  className={`py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition cursor-pointer ${authTab === 'login' ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-[#4A1208] shadow-md' : 'text-amber-300/70 hover:text-white'}`}
                >
                  Đăng Nhập
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthTab('register'); setAuthModalError(''); }}
                  className={`py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition cursor-pointer ${authTab === 'register' ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-[#4A1208] shadow-md' : 'text-amber-300/70 hover:text-white'}`}
                >
                  Đăng Ký
                </button>
              </div>

              {/* Social Logins */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={isAuthLoading}
                  className="flex items-center justify-center gap-2 bg-white text-gray-800 hover:bg-gray-100 font-bold text-xs py-2.5 px-3 rounded-xl border border-gray-300 shadow transition cursor-pointer"
                  title="Đăng nhập bằng Google"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  onClick={handleAppleAuth}
                  disabled={isAuthLoading}
                  className="flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-900 font-bold text-xs py-2.5 px-3 rounded-xl border border-gray-700 shadow transition cursor-pointer"
                  title="Đăng nhập bằng Apple ID"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 5.75c.62-.75 1.04-1.79.93-2.83-.92.04-2.03.62-2.68 1.37-.58.67-1.09 1.74-.95 2.76 1.03.08 2.08-.55 2.7-1.3z"/>
                  </svg>
                  <span>Apple ID</span>
                </button>
              </div>

              {/* Quick Guest Login Button */}
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                disabled={isAuthLoading}
                className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:brightness-110 text-[#3a0808] font-black text-xs uppercase py-2.5 px-3 rounded-xl shadow-md transition cursor-pointer mb-3 flex items-center justify-center gap-2"
              >
                <span>⚡ Đăng Nhập Nhanh Dành Cho Độc Giả (Khách)</span>
              </button>

              <div className="bg-[#180505] p-2.5 rounded-xl border border-amber-500/20 mb-4 text-[11px] text-amber-200/80 leading-relaxed text-center">
                💡 <span className="font-bold text-amber-300">Gợi ý môi trường Iframe:</span> Nếu cửa sổ pop-up bị trình duyệt chặn, ứng dụng sẽ tự động thử <span className="text-amber-200 font-bold">Redirect</span> hoặc bạn có thể chọn <span className="text-amber-200 underline font-bold">Đăng Nhập Nhanh</span> / <span className="text-amber-200 underline font-bold cursor-pointer" onClick={() => window.open(window.location.href, '_blank')}>Mở trang trong Tab Mới</span>.
              </div>

              <div className="relative flex items-center justify-center mb-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-amber-500/30" /></div>
                <span className="relative px-3 bg-[#250808] text-xs text-amber-300/70 uppercase">Hoặc tài khoản & mật khẩu</span>
              </div>

              <form onSubmit={handleEmailAuthSubmit} className="space-y-4">
                {authTab === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-amber-200 mb-1">Tên Hiển Thị (Display Name)</label>
                    <input
                      type="text"
                      required
                      value={authDisplayName}
                      onChange={(e) => setAuthDisplayName(e.target.value)}
                      placeholder="Nhập tên hiển thị của bạn..."
                      className="w-full bg-[#180505] border border-amber-500/40 rounded-xl px-3 py-2 text-sm text-white placeholder-amber-300/30 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-amber-200 mb-1">Email / Tên tài khoản</label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="example@domain.com"
                    className="w-full bg-[#180505] border border-amber-500/40 rounded-xl px-3 py-2 text-sm text-white placeholder-amber-300/30 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-200 mb-1">Mật Khẩu</label>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#180505] border border-amber-500/40 rounded-xl px-3 py-2 text-sm text-white placeholder-amber-300/30 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {authTab === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-amber-200 mb-1">Chọn Ảnh Đại Diện (Avatar)</label>
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      {[
                        "https://i.imgur.com/ALMc8Ct.jpeg",
                        "https://i.imgur.com/k9k3keR.jpeg",
                        "https://i.imgur.com/O3r9UNi.jpeg",
                        "https://i.imgur.com/yo72bi3.jpeg"
                      ].map((url, i) => (
                        <button
                          type="button"
                          key={i}
                          onClick={() => setAuthAvatar(url)}
                          className={`w-12 h-12 rounded-full overflow-hidden border-2 transition cursor-pointer mx-auto ${authAvatar === url ? 'border-amber-400 scale-105 shadow-[0_0_10px_rgba(255,215,0,0.6)]' : 'border-amber-900 opacity-60'}`}
                        >
                          <img src={url} alt="preset" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                    <input
                      type="url"
                      value={authAvatar}
                      onChange={(e) => setAuthAvatar(e.target.value)}
                      placeholder="Hoặc nhập link ảnh avatar tùy ý..."
                      className="w-full bg-[#180505] border border-amber-500/40 rounded-xl px-3 py-1.5 text-xs text-white placeholder-amber-300/30 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                )}

                {authModalError && (
                  <p className="text-red-400 text-xs text-center font-bold">{authModalError}</p>
                )}

                <button
                  type="submit"
                  disabled={isAuthLoading}
                  className="w-full bg-gradient-to-r from-red-950 via-red-900 to-red-950 hover:from-red-900 hover:to-red-900 text-amber-200 border-2 border-amber-500/60 font-black text-xs uppercase py-3 rounded-xl shadow-[0_0_15px_rgba(122,21,21,0.6)] transition cursor-pointer"
                >
                  {isAuthLoading ? "⏳ Đang xử lý..." : (authTab === 'login' ? "Đăng Nhập Ngay" : "Hoàn Tất Đăng Ký")}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditProfileOpen && currentUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#250808] border-2 border-[#e2a85c] rounded-2xl shadow-[0_0_50px_rgba(122,21,21,0.9)] p-6 text-white"
            >
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="absolute top-4 right-4 text-amber-300 hover:text-white bg-amber-950/60 p-2 rounded-full border border-amber-500/40 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-serif font-black text-amber-300 mb-4 uppercase tracking-wide text-center">
                Chỉnh Sửa Hồ Sơ Khách Hàng
              </h3>

              <form onSubmit={handleUpdateProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-amber-200 mb-1">Tên Hiển Thị</label>
                  <input
                    type="text"
                    required
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                    className="w-full bg-[#180505] border border-amber-500/40 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-200 mb-1">Link Ảnh Avatar</label>
                  <input
                    type="url"
                    required
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    className="w-full bg-[#180505] border border-amber-500/40 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditProfileOpen(false)}
                    className="w-1/2 bg-[#3a0a0a] text-amber-200 border border-amber-500/30 text-xs font-bold py-2.5 rounded-xl hover:bg-[#4a0a0a] transition cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className="w-1/2 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-[#4A1208] font-black text-xs uppercase py-2.5 rounded-xl shadow-md hover:brightness-110 transition cursor-pointer"
                  >
                    {isAuthLoading ? "⏳ Đang lưu..." : "Lưu Thay Đổi"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
