import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Heart, MessageSquare, Send, Sparkles, Image as ImageIcon, Paintbrush, HeartHandshake, Eye, PlusCircle } from "lucide-react";
import { getAllArtLikes, likeArtwork, unlikeArtwork, submitArtwork, subscribeToArtworks, SubmittedArtworkData } from "../firebase";

interface ArtGalleryProps {
  playClickSound: (freq?: number, duration?: number) => void;
}

// Sample premium gallery artworks
const GALLERY_ARTWORKS = [
  {
    id: 1,
    title: "Lệ Bắc Thần",
    description: "Bé Phan aka Chỉ bán bột cafe vẽ tặng Tun, iu lém 🫶🏼",
    imageUrl: "https://cdn.phototourl.com/free/2026-07-28-d44b3429-a427-4146-8575-3532439ce5e1.png",
    artist: "Tịch Sơ Ảnh",
    likes: 0,
    tags: []
  },
  {
    id: 2,
    title: "Emoji của Tun",
    description: "Emoji bé bột vẽ cho nhìn rất ⚡️, tôi thích lắm 😭🫶🏼",
    imageUrl: "https://cdn.phototourl.com/free/2026-07-28-6d53ca8b-d760-43bb-aa5d-9b0137d98b50.png",
    artist: "Tịch Sơ Ảnh",
    likes: 0,
    tags: []
  },
  {
    id: 3,
    title: "Silas Moreau Kitty",
    description: "cục cức iu Yummi vẽ Silas",
    imageUrl: "https://i.imgur.com/jrFhrVG.png",
    artist: "Yummi",
    likes: 0,
    tags: []
  },
  {
    id: 4,
    title: "Silas Moreau vâm",
    description: "cục cức iu Yummi vẽ Silas nhưng bản này ⚡️hơn",
    imageUrl: "https://i.imgur.com/5E0kcos.png",
    artist: "Yummi",
    likes: 0,
    tags: []
  }
];

export const ArtGallery: React.FC<ArtGalleryProps> = ({ playClickSound }) => {
  // Mount guard for React Portals
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Modal states
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isCommissionOpen, setIsCommissionOpen] = useState(false);
  const [isConfessionOpen, setIsConfessionOpen] = useState(false);
  const [isSubmitArtOpen, setIsSubmitArtOpen] = useState(false);

  // Dynamic submitted artworks from Firestore
  const [dynamicArtworks, setDynamicArtworks] = useState<SubmittedArtworkData[]>([]);

  // Subscribe to real-time submitted artworks
  useEffect(() => {
    const unsubscribe = subscribeToArtworks((artworks) => {
      setDynamicArtworks(artworks);
    });
    return () => unsubscribe();
  }, []);

  // Combined artworks list: user-submitted artworks appear first (at top of grid)
  const allArtworks = [...dynamicArtworks, ...GALLERY_ARTWORKS];

  // Prevent scroll and body jumping when modal is open
  useEffect(() => {
    if (isGalleryOpen || isCommissionOpen || isConfessionOpen || isSubmitArtOpen) {
      // Save current scroll position and style body
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      return () => {
        document.body.style.overflow = originalStyle;
        document.body.style.touchAction = "";
      };
    }
  }, [isGalleryOpen, isCommissionOpen, isConfessionOpen, isSubmitArtOpen]);

  // Gallery interactive states
  const [selectedArt, setSelectedArt] = useState<any | null>(null);
  const [likedArts, setLikedArts] = useState<Record<string | number, boolean>>({});
  const [artLikes, setArtLikes] = useState<Record<string | number, number>>({
    1: 0, 2: 0, 3: 0, 4: 0
  });

  // Fetch initial likes
  useEffect(() => {
    async function fetchLikes() {
      const likes = await getAllArtLikes();
      setArtLikes(prev => ({
        ...prev,
        ...likes
      }));
    }
    fetchLikes();
  }, []);

  // Artwork submission form states
  const [submitTitle, setSubmitTitle] = useState("");
  const [submitArtist, setSubmitArtist] = useState("");
  const [submitDesc, setSubmitDesc] = useState("");
  const [submitUrl, setSubmitUrl] = useState("");
  const [isSubmittingArt, setIsSubmittingArt] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  // Commission Form states
  const [commName, setCommName] = useState("");
  const [commStyle, setCommStyle] = useState("Portrait (Chân dung)");
  const [commContact, setCommContact] = useState("");
  const [commIdea, setCommIdea] = useState("");
  const [isSubmittingComm, setIsSubmittingComm] = useState(false);

  // Confession Form states
  const [confTo, setConfTo] = useState("");
  const [confMessage, setConfMessage] = useState("");
  const [isSubmittingConf, setIsSubmittingConf] = useState(false);

  const toggleLike = async (artId: string | number) => {
    playClickSound(880, 0.05);
    const isLiked = !!likedArts[artId];
    
    // Optimistic update
    setLikedArts(prev => ({ ...prev, [artId]: !isLiked }));
    setArtLikes(prev => ({
      ...prev,
      [artId]: isLiked ? Math.max(0, (prev[artId] || 0) - 1) : (prev[artId] || 0) + 1
    }));

    // Update in Firestore
    if (isLiked) {
      await unlikeArtwork(artId.toString());
    } else {
      await likeArtwork(artId.toString());
    }
  };

  // Submit Artwork to Firestore
  const handleSubmitArtwork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitTitle.trim() || !submitArtist.trim() || !submitDesc.trim() || !submitUrl.trim()) {
      alert("Vui lòng điền đầy đủ tất cả các thông tin bắt buộc nhé! ✨");
      return;
    }

    setIsSubmittingArt(true);
    playClickSound(600, 0.12);

    try {
      await submitArtwork({
        title: submitTitle.trim(),
        artist: submitArtist.trim(),
        description: submitDesc.trim(),
        imageUrl: submitUrl.trim()
      });

      alert("Tác phẩm của bạn đã được đưa vào Triển Lãm! ✨");

      // Reset form
      setSubmitTitle("");
      setSubmitArtist("");
      setSubmitDesc("");
      setSubmitUrl("");
      setIsPreviewing(false);
      setPreviewError(false);
      setIsSubmitArtOpen(false);

      // Open gallery grid modal so user immediately sees their artwork at top
      setIsGalleryOpen(true);
    } catch (error) {
      console.error("Submit artwork error:", error);
      alert("Không thể đăng tác phẩm lúc này. Vui lòng kiểm tra lại đường link hoặc kết nối mạng!");
    } finally {
      setIsSubmittingArt(false);
    }
  };

  // Submit Commission via EmailJS API
  const handleSubmitCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commName.trim() || !commIdea.trim() || !commContact.trim()) {
      alert("Vui lòng điền đầy đủ các thông tin cần thiết nhé! ✨");
      return;
    }

    setIsSubmittingComm(true);
    playClickSound(520, 0.12);

    try {
      const messageContent = `
[YÊU CẦU COMMISSION TRANH MỚI]
-------------------------------------------
- Người gửi: ${commName.trim()}
- Thể loại: ${commStyle}
- Liên hệ: ${commContact.trim()}
- Ý tưởng vẽ: ${commIdea.trim()}
-------------------------------------------
Được gửi tự động từ Trạm vẽ tranh Commission.
      `;

      const payload = {
        service_id: 'service_2ib7s3w',
        template_id: 'template_4yhh2dl',
        user_id: 'Q-IDQSVmrzV05HbU_',
        template_params: {
          from_name: commName.trim(),
          message: messageContent,
          to_email: 'langochan.01122006@gmail.com'
        }
      };

      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Gửi email thất bại thông qua hệ thống.");
      }

      alert("🎨 Yêu cầu commission đã được gửi thành công đến hòm thư của Tun! Hãy kiên nhẫn chờ phản hồi nhé bạn ơi! ✨");
      setCommName("");
      setCommContact("");
      setCommIdea("");
      setIsCommissionOpen(false);
    } catch (error: any) {
      console.error("Commission submit error:", error);
      alert("Không thể gửi yêu cầu lúc này. Vui lòng thử lại sau hoặc gửi trực tiếp cho Tun qua gmail.");
    } finally {
      setIsSubmittingComm(false);
    }
  };

  // Submit Confession via EmailJS API
  const handleSubmitConfession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confMessage.trim()) {
      alert("Hãy viết một chút rung động tâm tư của bạn nhé! 💕");
      return;
    }

    setIsSubmittingConf(true);
    playClickSound(640, 0.15);

    try {
      const recipient = confTo.trim() || "Gửi người đặc biệt";
      const messageContent = `
[THƯ RUNG CẢM TỪ PHÒNG TRANH]
-------------------------------------------
- Gửi tới: ${recipient}
- Lời tâm sự: ${confMessage.trim()}
-------------------------------------------
Được gửi lãng mạn từ Trạm viết rung cảm.
      `;

      const payload = {
        service_id: 'service_2ib7s3w',
        template_id: 'template_4yhh2dl',
        user_id: 'Q-IDQSVmrzV05HbU_',
        template_params: {
          from_name: "Một tâm hồn rung cảm 🌸",
          message: messageContent,
          to_email: 'langochan.01122006@gmail.com'
        }
      };

      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Gửi email thất bại.");
      }

      alert("💌 Những tâm sự rung cảm ngọt ngào đã được gửi thẳng vào Gmail của Tun rồi nhé! ✨💖");
      setConfTo("");
      setConfMessage("");
      setIsConfessionOpen(false);
    } catch (error: any) {
      console.error("Confession submit error:", error);
      alert("Không thể gửi thư tâm sự lúc này. Vui lòng thử lại sau.");
    } finally {
      setIsSubmittingConf(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center my-6 px-1" id="art-gallery-root">
      {/* 1. ART GALLERY CARD - VINTAGE PICTURE FRAME */}
      <div 
        className="relative w-[92%] max-w-[450px] aspect-[16/10] rounded-lg overflow-hidden border-[12px] border-amber-950 shadow-2xl flex flex-col items-center justify-center text-center p-4 group select-none"
        style={{
          boxShadow: `
            0 10px 30px rgba(0,0,0,0.6), 
            inset 0 0 10px rgba(0,0,0,0.8), 
            0 0 0 2px #C59B27, 
            inset 0 0 0 2px #C59B27
          `
        }}
        id="art-gallery-main-card"
      >
        {/* Background Image: Classical Painting with warm overlay */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-100 group-hover:scale-105"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1580136579312-94651dfd596d?auto=format&fit=crop&w=800&q=80')",
            filter: "brightness(0.55) contrast(1.1) sepia(0.25)"
          }}
        />

        {/* Golden inner line accent */}
        <div className="absolute inset-2 border border-amber-500/40 pointer-events-none rounded" />

        {/* Content Wrapper */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full w-full py-2">
          {/* Main Title */}
          <h2 
            className="text-2xl md:text-3xl font-serif font-bold tracking-[0.25em] text-[#F5E6BE] filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-all duration-300 group-hover:tracking-[0.3em]"
            style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
          >
            TRIỂN LÃM TRANH
          </h2>

          {/* Premium Glass Button */}
          <button
            onClick={() => {
              playClickSound(440, 0.08);
              setIsGalleryOpen(true);
            }}
            className="mt-5 px-6 py-2.5 rounded-full border-2 border-amber-100 bg-black/50 text-amber-100 font-sans text-[11px] md:text-xs font-black uppercase tracking-widest hover:bg-amber-100 hover:text-black hover:border-amber-100 transition-all duration-300 transform active:scale-95 shadow-md cursor-pointer hover:shadow-amber-500/30"
            id="art-gallery-enter-btn"
          >
            𝒯𝒽𝒶𝓂 𝒬𝓊𝒶𝓃 🖼️
          </button>
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* A. GALLERY SHOWCASE MODAL (GRID SHOWCASE) */}
      {mounted && createPortal(
        <AnimatePresence>
          {isGalleryOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-3 md:p-6 bg-black/90 backdrop-blur-md overflow-hidden"
              onClick={() => setIsGalleryOpen(false)}
              id="gallery-modal"
            >
              <motion.div
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 30 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="relative w-full max-w-5xl bg-[#1a0808] border-2 border-[#e2a85c] rounded-2xl md:rounded-3xl overflow-hidden p-4 md:p-6 shadow-[0_0_50px_rgba(226,168,92,0.3)] flex flex-col gap-4 text-amber-100 max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#e2a85c]/30 pb-3.5 px-1">
                  <div className="flex items-center gap-2.5">
                    <ImageIcon className="w-5 h-5 md:w-6 md:h-6 text-[#fde047]" />
                    <div>
                      <span className="font-serif font-black tracking-widest text-sm md:text-base uppercase text-[#fde047] drop-shadow-md block">
                        PHÒNG TRIỂN LÃM TRANH
                      </span>
                      <span className="text-[10px] md:text-xs text-amber-200/70 font-sans italic">
                        Nhấp vào tranh để xem chi tiết & thả tym cho Artist nhé 🌸
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        playClickSound(520, 0.08);
                        setIsSubmitArtOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-[#e2a85c] bg-[#2a0d0d] text-[#fde047] font-sans text-[10px] md:text-xs font-bold hover:bg-[#3f1212] hover:border-[#ffd700] transition cursor-pointer flex items-center gap-1 shadow-sm shrink-0"
                    >
                      🎨 Gửi Tranh
                    </button>
                    <button
                      onClick={() => {
                        playClickSound(300, 0.08);
                        setIsGalleryOpen(false);
                      }}
                      className="p-1.5 rounded-full hover:bg-white/10 text-[#fde047] transition-colors cursor-pointer border border-[#e2a85c]/30"
                      aria-label="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Grid Showcase Body (2 cols on Mobile, 3-4 cols on PC, scrollable) */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4.5 p-1 overflow-y-auto max-h-[72vh] custom-scrollbar pr-1.5">
                  {allArtworks.map((art) => (
                    <motion.div
                      key={art.id}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => {
                        playClickSound(440, 0.05);
                        setSelectedArt(art);
                      }}
                      className="relative group rounded-xl md:rounded-2xl overflow-hidden bg-[#240c0c] border-2 border-[#e2a85c]/50 hover:border-[#ffd700] hover:-translate-y-1 hover:shadow-[0_0_22px_rgba(226,168,92,0.45)] transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-lg"
                    >
                      {/* Image Frame Container */}
                      <div className="relative w-full aspect-[4/5] bg-black/50 overflow-hidden flex items-center justify-center">
                        <img 
                          src={art.imageUrl} 
                          alt={art.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />

                        {/* Top-Right Floating Heart Badge Overlay */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(art.id);
                          }}
                          className="absolute top-2 right-2 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-[#e2a85c]/60 hover:border-[#ffd700] text-xs font-bold text-[#fde047] shadow-md transition active:scale-90 cursor-pointer"
                          title="Thả tym cho bức tranh"
                        >
                          <Heart 
                            className={`w-3.5 h-3.5 ${likedArts[art.id] ? "fill-rose-500 text-rose-500" : "text-[#fde047]"}`} 
                          />
                          <span>{artLikes[art.id] || 0}</span>
                        </button>
                      </div>

                      {/* Footer Info */}
                      <div className="p-2.5 md:p-3 bg-gradient-to-b from-[#1a0808]/90 to-[#280d0d] border-t border-[#e2a85c]/30 flex flex-col gap-1 text-left">
                        {/* Line 1: Title in Classic Gold Font */}
                        <h3 className="font-serif font-bold text-[#fde047] text-xs md:text-sm tracking-wide truncate drop-shadow-sm">
                          {art.title}
                        </h3>
                        {/* Line 2: Artist Badge */}
                        <div>
                          <span className="inline-flex items-center text-[10px] md:text-xs font-semibold text-amber-200/90 bg-black/50 px-2 py-0.5 rounded border border-[#e2a85c]/30">
                            Artist: {art.artist}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* LIGHTBOX FULLSCREEN ZOOM MODAL */}
      {mounted && createPortal(
        <AnimatePresence>
          {selectedArt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[10000] flex items-center justify-center p-3 md:p-6 bg-black/90 backdrop-blur-md overflow-hidden"
              onClick={() => setSelectedArt(null)}
              id="gallery-lightbox"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="relative w-full max-w-2xl bg-gradient-to-b from-[#280c0c] via-[#1a0808] to-[#280c0c] border-2 border-[#e2a85c] rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-[0_0_50px_rgba(226,168,92,0.4)] flex flex-col gap-4 max-h-[92vh] overflow-y-auto text-amber-100"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Lightbox Header */}
                <div className="flex items-center justify-between border-b border-[#e2a85c]/30 pb-3">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-[#fde047]" />
                    <span className="font-serif font-black tracking-widest text-sm md:text-base uppercase text-[#fde047]">
                      CHI TIẾT BỨC TRANH
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      playClickSound(300, 0.08);
                      setSelectedArt(null);
                    }}
                    className="p-1.5 rounded-full hover:bg-white/10 text-[#fde047] transition-colors cursor-pointer border border-[#e2a85c]/30"
                    aria-label="Close Lightbox"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Lightbox Artwork Image Frame */}
                <div className="relative w-full rounded-xl md:rounded-2xl overflow-hidden border-2 border-[#e2a85c]/70 bg-black/80 flex items-center justify-center max-h-[55vh] shadow-inner p-2">
                  <img 
                    src={selectedArt.imageUrl} 
                    alt={selectedArt.title} 
                    className="max-h-[50vh] w-auto h-auto object-contain rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Artwork Information in Lightbox */}
                <div className="bg-[#240c0c]/80 rounded-xl p-4 border border-[#e2a85c]/30 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-serif font-black text-[#fde047] text-lg md:text-xl">
                        {selectedArt.title}
                      </h3>
                      <span className="inline-block mt-1 text-xs font-bold px-2.5 py-0.5 rounded bg-black/60 text-amber-200 border border-[#e2a85c]/30">
                        Artist: {selectedArt.artist}
                      </span>
                    </div>

                    {/* Like interaction in Lightbox */}
                    <button
                      onClick={() => toggleLike(selectedArt.id)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/70 border border-[#e2a85c]/60 hover:border-[#ffd700] text-xs font-bold text-[#fde047] transition active:scale-95 cursor-pointer shadow-md"
                    >
                      <Heart 
                        className={`w-4 h-4 ${likedArts[selectedArt.id] ? "fill-rose-500 text-rose-500" : "text-[#fde047]"}`} 
                      />
                      <span>{artLikes[selectedArt.id] || 0} Tym</span>
                    </button>
                  </div>

                  {selectedArt.description && (
                    <p className="mt-2 text-xs md:text-sm text-amber-100/90 leading-relaxed font-sans bg-black/40 p-3 rounded-lg border border-[#e2a85c]/15 italic">
                      "{selectedArt.description}"
                    </p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* B. COMMISSION REQUEST FORM MODAL */}
      {mounted && createPortal(
        <AnimatePresence>
          {isCommissionOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto"
              onClick={() => setIsCommissionOpen(false)}
              id="commission-modal"
            >
              <motion.div
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 30 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="relative my-auto w-full max-w-md bg-gradient-to-b from-[#25131E] to-[#150A11] border-2 border-pink-500/40 rounded-2xl overflow-hidden p-5 shadow-2xl flex flex-col gap-4 text-pink-100 max-h-[90vh] overflow-y-auto custom-scrollbar"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-pink-500/20 pb-3">
                  <div className="flex items-center gap-2">
                    <Paintbrush className="w-5 h-5 text-pink-400" />
                    <span className="font-sans font-black tracking-widest text-sm uppercase text-pink-200">
                      YÊU CẦU COMMISSION TRANH
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      playClickSound(300, 0.08);
                      setIsCommissionOpen(false);
                    }}
                    className="p-1 rounded-full hover:bg-white/10 text-pink-300 transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmitCommission} className="flex flex-col gap-3">
                  <div>
                    <label className="block text-[11px] font-black uppercase text-pink-300 mb-1 tracking-wider">
                      Tên / Biệt danh của bạn *
                    </label>
                    <input
                      type="text"
                      required
                      value={commName}
                      onChange={(e) => setCommName(e.target.value)}
                      placeholder="Nhập tên hoặc biệt danh..."
                      className="w-full px-4 py-2.5 rounded-xl bg-pink-950/30 border border-pink-500/20 focus:border-pink-400 focus:outline-none text-pink-100 placeholder-pink-300/30 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase text-pink-300 mb-1 tracking-wider">
                      Thể loại tranh muốn đặt *
                    </label>
                    <select
                      value={commStyle}
                      onChange={(e) => setCommStyle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-pink-950/40 border border-pink-500/20 focus:border-pink-400 focus:outline-none text-pink-100 text-xs font-semibold cursor-pointer"
                    >
                      <option value="Portrait (Chân dung)">Chân dung (Portrait)</option>
                      <option value="Chibi / Cute style">Chibi / Cute style 🧸</option>
                      <option value="Full body Anime">Anime toàn thân (Full Body)</option>
                      <option value="Couple Drawing">Vẽ đôi lãng mạn (Couple)</option>
                      <option value="Custom concept">Concept tự chọn (Custom)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase text-pink-300 mb-1 tracking-wider">
                      Phương thức liên lạc *
                    </label>
                    <input
                      type="text"
                      required
                      value={commContact}
                      onChange={(e) => setCommContact(e.target.value)}
                      placeholder="Link Facebook, Discord ID hoặc số điện thoại..."
                      className="w-full px-4 py-2.5 rounded-xl bg-pink-950/30 border border-pink-500/20 focus:border-pink-400 focus:outline-none text-pink-100 placeholder-pink-300/30 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase text-pink-300 mb-1 tracking-wider">
                      Mô tả ý tưởng vẽ của bạn *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={commIdea}
                      onChange={(e) => setCommIdea(e.target.value)}
                      placeholder="Mô tả cụ thể về biểu cảm, bối cảnh, phục trang hoặc phụ kiện mà bạn mong muốn nhé..."
                      className="w-full px-4 py-2.5 rounded-xl bg-pink-950/30 border border-pink-500/20 focus:border-pink-400 focus:outline-none text-pink-100 placeholder-pink-300/30 text-xs font-semibold resize-none leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingComm}
                    className="mt-2 w-full py-3 bg-pink-600 hover:bg-pink-500 text-white font-sans text-xs font-black uppercase tracking-wider rounded-xl transition duration-150 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-pink-950/50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isSubmittingComm ? "Đang gửi yêu cầu..." : "Gửi yêu cầu vẽ ngay"}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* C. CONFESSION LETTER FORM MODAL */}
      {mounted && createPortal(
        <AnimatePresence>
          {isConfessionOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto"
              onClick={() => setIsConfessionOpen(false)}
              id="confession-modal"
            >
              <motion.div
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 30 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="relative my-auto w-full max-w-md bg-gradient-to-b from-[#2B1515] to-[#1A0A0A] border-2 border-rose-500/40 rounded-2xl overflow-hidden p-5 shadow-2xl flex flex-col gap-4 text-rose-100 max-h-[90vh] overflow-y-auto custom-scrollbar"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-rose-400 animate-pulse" />
                    <span className="font-sans font-black tracking-widest text-sm uppercase text-rose-200">
                      THƯ RUNG CẢM TÂM TƯ
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      playClickSound(300, 0.08);
                      setIsConfessionOpen(false);
                    }}
                    className="p-1 rounded-full hover:bg-white/10 text-rose-300 transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmitConfession} className="flex flex-col gap-3">
                  <div>
                    <label className="block text-[11px] font-black uppercase text-rose-300 mb-1 tracking-wider">
                      Gửi tới ai? (Noah, Seo-jun, Tun...)
                    </label>
                    <input
                      type="text"
                      value={confTo}
                      onChange={(e) => setConfTo(e.target.value)}
                      placeholder="Nhập tên người bạn thầm thương hoặc để trống..."
                      className="w-full px-4 py-2.5 rounded-xl bg-rose-950/30 border border-rose-500/20 focus:border-rose-400 focus:outline-none text-rose-100 placeholder-rose-300/30 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase text-rose-300 mb-1 tracking-wider">
                      Lời tâm sự ngọt ngào của bạn *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={confMessage}
                      onChange={(e) => setConfMessage(e.target.value)}
                      placeholder="Hãy để lại những rung cảm nao lòng nhất của bạn tại đây, lá thư này sẽ được gửi ẩn danh trực tiếp đến Tun nhé..."
                      className="w-full px-4 py-2.5 rounded-xl bg-rose-950/30 border border-rose-500/20 focus:border-rose-400 focus:outline-none text-rose-100 placeholder-rose-300/30 text-xs font-semibold resize-none leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingConf}
                    className="mt-2 w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-sans text-xs font-black uppercase tracking-wider rounded-xl transition duration-150 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-rose-950/50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isSubmittingConf ? "Đang bay bổng gửi thư..." : "Gửi thư rung cảm"}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* D. SUBMISSION MODAL (AUTO-PUBLISH ARTWORK) */}
      {mounted && createPortal(
        <AnimatePresence>
          {isSubmitArtOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-3 md:p-6 bg-black/90 backdrop-blur-md overflow-y-auto"
              onClick={() => setIsSubmitArtOpen(false)}
              id="submit-art-modal"
            >
              <motion.div
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 30 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="relative my-auto w-full max-w-lg bg-[#1a0808] border-2 border-[#e2a85c] rounded-2xl md:rounded-3xl overflow-hidden p-5 md:p-6 shadow-[0_0_50px_rgba(226,168,92,0.3)] flex flex-col gap-4 text-amber-100 max-h-[92vh] overflow-y-auto custom-scrollbar"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#e2a85c]/30 pb-3">
                  <div className="flex items-center gap-2">
                    <Paintbrush className="w-5 h-5 text-[#fde047]" />
                    <span className="font-serif font-black tracking-widest text-sm md:text-base uppercase text-[#fde047]">
                      GỬI TÁC PHẨM VÀO TRIỂN LÃM
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      playClickSound(300, 0.08);
                      setIsSubmitArtOpen(false);
                    }}
                    className="p-1.5 rounded-full hover:bg-white/10 text-[#fde047] transition cursor-pointer border border-[#e2a85c]/30"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmitArtwork} className="flex flex-col gap-3.5">
                  {/* 1. Link Ảnh Tranh (URL) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] md:text-xs font-black uppercase text-[#fde047] tracking-wider">
                        Link Ảnh Tranh (URL) *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          playClickSound(500, 0.05);
                          if (!submitUrl.trim()) {
                            alert("Vui lòng dán link ảnh vào trước nhé!");
                            return;
                          }
                          setIsPreviewing(!isPreviewing);
                          setPreviewError(false);
                        }}
                        className="text-[10px] md:text-xs text-amber-300 hover:text-amber-100 flex items-center gap-1 bg-amber-950/60 border border-[#e2a85c]/40 px-2 py-0.5 rounded-md cursor-pointer transition"
                      >
                        <Eye className="w-3 h-3" />
                        {isPreviewing ? "Ẩn Xem Trước" : "👁️ Xem Trước Tranh"}
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={submitUrl}
                      onChange={(e) => {
                        setSubmitUrl(e.target.value);
                        setPreviewError(false);
                      }}
                      placeholder="Dán link ảnh trực tiếp (Drive, Imgur, Discord, Catbox...)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#2b0e0e] border border-[#e2a85c]/40 focus:border-[#fde047] focus:outline-none text-amber-100 placeholder-amber-200/40 text-xs font-medium"
                    />
                    <span className="text-[10px] text-amber-200/60 italic block mt-1">
                      * Chấp nhận link ảnh trực tiếp kết thúc bằng .png, .jpg, .jpeg, .gif hoặc link từ Catbox, Imgur, Drive...
                    </span>
                  </div>

                  {/* Preview Box */}
                  {isPreviewing && (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/60 border border-[#e2a85c]/50 flex items-center justify-center p-2">
                      {submitUrl.trim() ? (
                        <img
                          src={submitUrl.trim()}
                          alt="Preview"
                          className="w-full h-full object-contain rounded"
                          onError={() => setPreviewError(true)}
                          onLoad={() => setPreviewError(false)}
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-xs text-amber-300/60 italic">
                          Chưa nhập link ảnh
                        </span>
                      )}
                      {previewError && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-3 text-center text-rose-300 text-xs gap-1">
                          <span className="font-bold">⚠️ Không thể tải ảnh từ link này!</span>
                          <span className="text-[10px] text-amber-200/70">
                            Hãy chắc chắn đó là link trực tiếp đến file ảnh (Direct Image Link).
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. Tiêu Đề Tranh */}
                  <div>
                    <label className="block text-[11px] md:text-xs font-black uppercase text-[#fde047] mb-1 tracking-wider">
                      Tiêu Đề Tranh *
                    </label>
                    <input
                      type="text"
                      required
                      value={submitTitle}
                      onChange={(e) => setSubmitTitle(e.target.value)}
                      placeholder="Nhập tên / tiêu đề tác phẩm..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#2b0e0e] border border-[#e2a85c]/40 focus:border-[#fde047] focus:outline-none text-amber-100 placeholder-amber-200/40 text-xs font-medium"
                    />
                  </div>

                  {/* 3. Tên Artist */}
                  <div>
                    <label className="block text-[11px] md:text-xs font-black uppercase text-[#fde047] mb-1 tracking-wider">
                      Tên Artist / Tác Giả *
                    </label>
                    <input
                      type="text"
                      required
                      value={submitArtist}
                      onChange={(e) => setSubmitArtist(e.target.value)}
                      placeholder="Nhập tên người vẽ / bút danh của bạn..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#2b0e0e] border border-[#e2a85c]/40 focus:border-[#fde047] focus:outline-none text-amber-100 placeholder-amber-200/40 text-xs font-medium"
                    />
                  </div>

                  {/* 4. Nội Dung / Lời Chúc */}
                  <div>
                    <label className="block text-[11px] md:text-xs font-black uppercase text-[#fde047] mb-1 tracking-wider">
                      Nội Dung / Lời Chúc *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={submitDesc}
                      onChange={(e) => setSubmitDesc(e.target.value)}
                      placeholder="Đoạn nhắn gửi dành cho Tun hoặc cảm hứng tạo nên bức tranh này..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#2b0e0e] border border-[#e2a85c]/40 focus:border-[#fde047] focus:outline-none text-amber-100 placeholder-amber-200/40 text-xs font-medium resize-none leading-relaxed"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmittingArt}
                    className="mt-2 w-full py-3 bg-[#2e0e0e] hover:bg-[#421313] border-2 border-[#e2a85c] text-[#fde047] font-sans text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(226,168,92,0.3)] hover:shadow-[0_0_25px_rgba(226,168,92,0.6)]"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmittingArt ? "Đang đưa tác phẩm vào triển lãm..." : "🚀 Đăng Tác Phẩm"}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
