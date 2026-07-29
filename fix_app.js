import fs from 'fs';
const content = fs.readFileSync('src/App.tsx', 'utf-8');

const originalAgeVerify = `          <div className="age-verify-card">
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
`;

const newCharactersPopup = `
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
                          <div className="bg-gradient-to-r from-[#e2a85c] to-[#b8860b] border-2 border-[#fffacd] text-red-950 font-black text-[10px] md:text-xs px-3 py-1.5 rounded-xl shadow-[0_0_15px_rgba(226,168,92,0.6)] flex items-center justify-center gap-1.5 min-w-[100px]">
                            <span className="text-pink-100 animate-pulse drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">🌸</span> ĐÃ MỞ
                          </div>
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
    </div>
  );
}

export default App;
`;

const marker = '<div className="age-verify-car';
const index = content.indexOf(marker);
if (index !== -1) {
    const newContent = content.substring(0, index) + originalAgeVerify + newCharactersPopup;
    fs.writeFileSync('src/App.tsx', newContent, 'utf-8');
    console.log('Fixed successfully');
} else {
    console.log('Marker not found');
}
