import React from "react";
import { Calendar, Tag, Sparkles, Bell } from "lucide-react";

interface NoticeItem {
  id: number;
  title: string;
  content: string;
  date: string;
  tag: string;
  tagType: "new" | "update" | "event";
  isNewest?: boolean;
}

const letterNotices: NoticeItem[] = [
  {
    id: 1,
    title: "Thông Báo Từ Tun",
    content: "Tạm thời Tun đang chưa ổn định nên hẹn link hai con mã mới lâu một chút 💐",
    date: "05/08/2026",
    tag: "MỚI NHẤT",
    tagType: "new",
    isNewest: true,
  },
  {
    id: 2,
    title: "Nâng Cấp Giao Diện Website",
    content: "Cập nhật giao diện mới cho web, thiết kế thẻ bài thanh thoát và tối ưu không gian hiển thị 🎁",
    date: "03/08/2026",
    tag: "CẬP NHẬT",
    tagType: "update",
  },
  {
    id: 3,
    title: "Triển Lãm Tranh Nghệ Thuật",
    content: "Mở triển lãm tranh cả nhà vào tym ủng hộ các Artist nhá 🌸🖼️",
    date: "01/08/2026",
    tag: "SỰ KIỆN",
    tagType: "event",
  },
];

interface LetterNoticeProps {
  playClickSound?: (freq?: number, duration?: number) => void;
}

export const LetterNotice: React.FC<LetterNoticeProps> = ({ playClickSound }) => {
  return (
    <div className="letter-notice-container" id="letter-notice-box">
      {/* Đầu bức thư & Tiêu đề */}
      <div className="letter-header" id="letter-header-section">
        <span className="letter-stamp">✉️</span>
        <span className="letter-title">THƯ THÔNG BÁO CẬP NHẬT</span>
        <span className="letter-badge">{letterNotices.length} THƯ</span>
      </div>

      {/* Thân bức thư - Danh sách cuộn dọc */}
      <div className="letter-vertical-body space-y-3 max-h-[380px] overflow-y-auto pr-1 py-1" id="letter-vertical-list">
        {letterNotices.map((notice) => (
          <div
            key={notice.id}
            className={`letter-card-item relative transition-all duration-200 hover:-translate-y-0.5 ${
              notice.isNewest ? "letter-card-newest" : ""
            }`}
            onClick={() => playClickSound && playClickSound(500, 0.05)}
          >
            {/* Thẻ Tiêu Đề & Thời Gian */}
            <div className="flex items-center justify-between gap-2 mb-1.5 border-b border-[#D4B87C]/60 pb-1.5">
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shadow-sm ${
                    notice.tagType === "new"
                      ? "bg-[#A83232] text-white border-[#FFD700]"
                      : notice.tagType === "update"
                      ? "bg-[#2563EB] text-white border-[#93C5FD]"
                      : "bg-[#D97706] text-white border-[#FDE68A]"
                  }`}
                >
                  {notice.tag}
                </span>
                <span className="font-bold text-[#4A2E13] text-xs sm:text-sm">
                  {notice.title}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-[#8C6239] font-semibold shrink-0">
                <Calendar className="w-3 h-3 text-[#A87B4F]" />
                <span>{notice.date}</span>
              </div>
            </div>

            {/* Nội Dung Thông Báo */}
            <p className="text-[#3d240f] text-xs sm:text-[13px] leading-relaxed font-medium pl-1">
              {notice.content}
            </p>
          </div>
        ))}
      </div>

      {/* Chân bức thư */}
      <div className="letter-footer flex items-center justify-between pt-2 border-t border-[#C59B27]/30 mt-2 text-[10px] text-[#C59B27] font-semibold">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#FFD700]" /> Danh sách thông báo mới nhất
        </span>
        <span>Tổng {letterNotices.length} thư</span>
      </div>
    </div>
  );
};

