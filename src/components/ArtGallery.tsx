import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Heart, MessageSquare, Send, Sparkles, Image as ImageIcon, Paintbrush, HeartHandshake, Eye } from "lucide-react";

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

  // Prevent scroll and body jumping when modal is open
  useEffect(() => {
    if (isGalleryOpen || isCommissionOpen || isConfessionOpen) {
      // Save current scroll position and style body
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      return () => {
        document.body.style.overflow = originalStyle;
        document.body.style.touchAction = "";
      };
    }
  }, [isGalleryOpen, isCommissionOpen, isConfessionOpen]);

  // Gallery interactive states
  const [activeArtIdx, setActiveArtIdx] = useState(0);
  const [likedArts, setLikedArts] = useState<Record<number, boolean>>({});
  const [artLikes, setArtLikes] = useState<Record<number, number>>({
    1: 0, 2: 0
  });

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

  const toggleLike = (artId: number) => {
    playClickSound(880, 0.05);
    const isLiked = !!likedArts[artId];
    setLikedArts(prev => ({ ...prev, [artId]: !isLiked }));
    setArtLikes(prev => ({
      ...prev,
      [artId]: isLiked ? prev[artId] - 1 : prev[artId] + 1
    }));
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
            BẢO TÀNG TRANH
          </h2>

          {/* Premium Glass Button */}
          {/* Premium Glass Button */}
          <button
            onClick={() => {
              playClickSound(440, 0.08);
              setIsGalleryOpen(true);
            }}
            className="mt-5 px-5 py-2 rounded-full border-2 border-amber-100 bg-black/40 text-amber-100 font-sans text-[11px] md:text-xs font-black uppercase tracking-widest hover:bg-amber-100 hover:text-black hover:border-amber-100 transition-all duration-300 transform active:scale-95 shadow-md cursor-pointer hover:shadow-amber-500/20"
            id="art-gallery-enter-btn"
          >
            Tham Quan 🖼️
          </button>
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* A. GALLERY SHOWCASE MODAL */}
      {mounted && createPortal(
        <AnimatePresence>
          {isGalleryOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-hidden touch-none"
              onClick={() => setIsGalleryOpen(false)}
              id="gallery-modal"
            >
              <motion.div
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 30 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="relative w-full max-w-lg bg-gradient-to-b from-[#2E1A16] to-[#1F100D] border-2 border-amber-500/50 rounded-2xl overflow-hidden p-5 shadow-2xl flex flex-col gap-4 text-amber-100"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-amber-400" />
                    <span className="font-serif font-black tracking-widest text-sm uppercase text-amber-200">
                      PHÒNG TRIỂN LÃM TRANH
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      playClickSound(300, 0.08);
                      setIsGalleryOpen(false);
                    }}
                    className="p-1 rounded-full hover:bg-white/10 text-amber-300 transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Main Artwork Frame */}
                <div className="relative w-full rounded-xl overflow-hidden border-4 border-amber-950/80 bg-black/30 shadow-inner group flex items-center justify-center bg-[#130908]">
                  <img 
                    src={GALLERY_ARTWORKS[activeArtIdx].imageUrl} 
                    alt={GALLERY_ARTWORKS[activeArtIdx].title} 
                    className="w-full h-auto max-h-[60vh] object-contain transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Artist Tag */}
                  <span className="absolute top-3 left-3 bg-black/70 text-amber-300 text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded border border-amber-500/30">
                    {GALLERY_ARTWORKS[activeArtIdx].artist}
                  </span>

                  {/* Left/Right floating controls */}
                  <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playClickSound(480, 0.05);
                        setActiveArtIdx((prev) => (prev - 1 + GALLERY_ARTWORKS.length) % GALLERY_ARTWORKS.length);
                      }}
                      className="p-2 rounded-full bg-black/60 text-white pointer-events-auto hover:bg-black/80 transition active:scale-90 border border-amber-500/20 cursor-pointer"
                      aria-label="Prev"
                    >
                      ❮
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playClickSound(480, 0.05);
                        setActiveArtIdx((prev) => (prev + 1) % GALLERY_ARTWORKS.length);
                      }}
                      className="p-2 rounded-full bg-black/60 text-white pointer-events-auto hover:bg-black/80 transition active:scale-90 border border-amber-500/20 cursor-pointer"
                      aria-label="Next"
                    >
                      ❯
                    </button>
                  </div>
                </div>

                {/* Artwork Information */}
                <div className="bg-[#1C0E0B]/80 rounded-xl p-4 border border-amber-500/10">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-serif font-black text-amber-200 text-base">
                        {GALLERY_ARTWORKS[activeArtIdx].title}
                      </h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/10">
                          Artist : Tịch Sơ Ảnh
                        </span>
                      </div>
                    </div>

                    {/* Like interaction */}
                    <button
                      onClick={() => toggleLike(GALLERY_ARTWORKS[activeArtIdx].id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2E1612] border border-amber-500/30 hover:border-amber-400 text-xs font-bold transition active:scale-90 cursor-pointer"
                    >
                      <Heart 
                        className={`w-3.5 h-3.5 ${likedArts[GALLERY_ARTWORKS[activeArtIdx].id] ? "fill-rose-500 text-rose-500" : "text-amber-400"}`} 
                      />
                      <span>{artLikes[GALLERY_ARTWORKS[activeArtIdx].id]}</span>
                    </button>
                  </div>

                  <p className="mt-3 text-xs text-amber-100/80 leading-relaxed font-sans">
                    {GALLERY_ARTWORKS[activeArtIdx].description}
                  </p>
                </div>

                {/* Carousel Indicators */}
                <div className="flex justify-center gap-2 mt-1">
                  {GALLERY_ARTWORKS.map((art, idx) => (
                    <button
                      key={art.id}
                      onClick={() => {
                        playClickSound(400, 0.05);
                        setActiveArtIdx(idx);
                      }}
                      className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${idx === activeArtIdx ? "bg-amber-400 scale-125" : "bg-amber-900 hover:bg-amber-700"}`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* B. COMMISSION REQUEST FORM MODAL */}
      <AnimatePresence>
        {isCommissionOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
            onClick={() => setIsCommissionOpen(false)}
            id="commission-modal"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-md bg-gradient-to-b from-[#25131E] to-[#150A11] border-2 border-pink-500/40 rounded-2xl overflow-hidden p-5 shadow-2xl flex flex-col gap-4 text-pink-100"
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
      </AnimatePresence>

      {/* C. CONFESSION LETTER FORM MODAL */}
      <AnimatePresence>
        {isConfessionOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
            onClick={() => setIsConfessionOpen(false)}
            id="confession-modal"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-md bg-gradient-to-b from-[#2B1515] to-[#1A0A0A] border-2 border-rose-500/40 rounded-2xl overflow-hidden p-5 shadow-2xl flex flex-col gap-4 text-rose-100"
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
      </AnimatePresence>
    </div>
  );
};
