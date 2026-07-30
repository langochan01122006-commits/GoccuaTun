import fs from 'fs';
const content = fs.readFileSync('src/App.tsx', 'utf-8');
const search = `                          <div className="bg-gradient-to-r from-[#e2a85c] to-[#b8860b] border-2 border-[#fffacd] text-red-950 font-black text-[10px] md:text-xs px-3 py-1.5 rounded-xl shadow-[0_0_15px_rgba(226,168,92,0.6)] flex items-center justify-center gap-1.5 min-w-[100px]">
                            <span className="text-pink-100 animate-pulse drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">🌸</span> ĐÃ MỞ
                          </div>`;
const replacement = `                          <button
                            onClick={() => handleStartChat(char)}
                            className="bg-gradient-to-r from-[#e2a85c] to-[#b8860b] hover:from-[#b8860b] hover:to-[#e2a85c] border-2 border-[#fffacd] text-red-950 font-black text-[10px] md:text-xs px-3 py-1.5 rounded-xl shadow-[0_0_15px_rgba(226,168,92,0.6)] flex items-center justify-center gap-1.5 min-w-[100px] transition-all active:scale-95 cursor-pointer"
                          >
                            <span className="text-pink-100 animate-pulse drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">🌸</span> ĐÃ MỞ
                          </button>`;
const newContent = content.replace(search, replacement);
fs.writeFileSync('src/App.tsx', newContent, 'utf-8');
