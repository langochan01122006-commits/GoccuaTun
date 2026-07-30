import React, { useState, useEffect, useRef } from "react";

const letterNotices = [
  "1. Ra char Silas có gắn pass, pass rất dễ nên mn chill chill thôi đừng bully tun 😭",
  "2. Cập nhật giao diện mới cho wed 🎁",
  "3. Mở triển lãm tranh cả nhà vào tym cho Artist nhá 🌸🖼️"
];

interface LetterNoticeProps {
  playClickSound?: (freq?: number, duration?: number) => void;
}

export const LetterNotice: React.FC<LetterNoticeProps> = ({ playClickSound }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [displayText, setDisplayText] = useState(letterNotices[0]);
  const [fadeState, setFadeState] = useState<"idle" | "fade-out" | "fade-in-prepare">("idle");
  const autoSlideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerChange = (newIdx: number) => {
    setFadeState("fade-out");
    setTimeout(() => {
      setCurrentIdx(newIdx);
      setDisplayText(letterNotices[newIdx]);
      setFadeState("fade-in-prepare");
      setTimeout(() => {
        setFadeState("idle");
      }, 50);
    }, 300);
  };

  const handleNext = () => {
    if (playClickSound) {
      playClickSound(600, 0.08);
    }
    const nextIdx = (currentIdx + 1) % letterNotices.length;
    triggerChange(nextIdx);
  };

  const handlePrev = () => {
    if (playClickSound) {
      playClickSound(600, 0.08);
    }
    const prevIdx = (currentIdx - 1 + letterNotices.length) % letterNotices.length;
    triggerChange(prevIdx);
  };

  useEffect(() => {
    // Start sliding timer
    autoSlideTimerRef.current = setInterval(() => {
      const nextIdx = (currentIdx + 1) % letterNotices.length;
      triggerChange(nextIdx);
    }, 6000);

    return () => {
      if (autoSlideTimerRef.current) {
        clearInterval(autoSlideTimerRef.current);
      }
    };
  }, [currentIdx]);

  return (
    <div className="letter-notice-container" id="letter-notice-box">
      {/* Đầu bức thư & Tiêu đề */}
      <div className="letter-header" id="letter-header-section">
        <span className="letter-stamp">✉️</span>
        <span className="letter-title">THƯ THÔNG BÁO CẬP NHẬT</span>
        <span className="letter-badge">MỚI</span>
      </div>

      {/* Thân bức thư (Nền giấy cổ & Chứa nội dung đổi liên tục) */}
      <div className="letter-body" id="letter-body-section">
        <button 
          className="letter-nav-btn" 
          onClick={handlePrev}
          aria-label="Previous Notice"
          id="letter-prev-btn"
        >
          ❮
        </button>
        
        <div className="letter-content-wrapper" id="letter-wrapper">
          <div className={`letter-text ${fadeState === "fade-out" ? "fade-out" : fadeState === "fade-in-prepare" ? "fade-in-prepare" : ""}`} id="letter-notice-text">
            {displayText}
          </div>
        </div>

        <button 
          className="letter-nav-btn" 
          onClick={handleNext}
          aria-label="Next Notice"
          id="letter-next-btn"
        >
          ❯
        </button>
      </div>

      {/* Chân bức thư (Ghi chú số trang) */}
      <div className="letter-footer" id="letter-footer-section">
        <span id="letter-counter">Tin {currentIdx + 1} / {letterNotices.length}</span>
      </div>
    </div>
  );
};
