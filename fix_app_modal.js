import fs from 'fs';
const content = fs.readFileSync('src/App.tsx', 'utf-8');

const passwordModal = `      {/* Password Modal */}
      <AnimatePresence>
        {passwordModalChar && (
          <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-gradient-to-b from-[#2a1010] via-[#1a0808] to-[#2a1010] border-2 border-[#e2a85c] rounded-3xl p-5 md:p-6 shadow-[0_0_40px_rgba(226,168,92,0.3)] flex flex-col overflow-hidden"
            >
              <div className="absolute top-4 right-4 z-50">
                <button
                  onClick={() => {
                    playClickSound(300, 0.1);
                    setPasswordModalChar(null);
                  }}
                  className="p-1.5 rounded-lg hover:bg-[#e2a85c]/20 text-[#e2a85c] transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center mb-5 border-b border-[#e2a85c]/30 pb-4 relative z-10">
                <h2 className="text-xl md:text-2xl font-black text-[#e2a85c] tracking-widest uppercase drop-shadow-md">
                  XÁC NHẬN MẬT KHẨU
                </h2>
                <div className="text-[#fde047] text-xs font-semibold tracking-wider mt-1 opacity-90">
                  {passwordModalChar.name}
                </div>
              </div>

              <div className="flex flex-col gap-4 relative z-10 text-[#fef08a] text-sm">
                {passwordModalChar.passwordQuestion && (
                  <div className="font-bold">
                    <span className="text-[#e2a85c]">Câu hỏi: </span>
                    {passwordModalChar.passwordQuestion}
                  </div>
                )}
                
                {passwordModalChar.passwordHint && (
                  <div className="italic">
                    <span className="text-[#e2a85c]">GỢI Ý: </span>
                    {passwordModalChar.passwordHint}
                  </div>
                )}
                
                {passwordModalChar.passwordNote && (
                  <div className="text-xs whitespace-pre-wrap opacity-90 bg-black/40 p-3 rounded-xl border border-[#e2a85c]/30">
                    {passwordModalChar.passwordNote}
                  </div>
                )}

                <div className="mt-2">
                  <input
                    type="text"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full bg-[#1a0808]/80 border-2 border-[#e2a85c]/50 text-[#fde047] placeholder:text-[#fde047]/30 px-4 py-3 rounded-xl outline-none focus:border-[#e2a85c] transition-colors font-bold text-center uppercase"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handlePasswordSubmit();
                      }
                    }}
                  />
                  {passwordError && (
                    <div className="text-red-400 text-xs text-center mt-2 font-semibold">
                      {passwordError}
                    </div>
                  )}
                </div>

                <button 
                  onClick={handlePasswordSubmit}
                  className="mt-4 w-full bg-gradient-to-b from-[#7a2525] to-[#4a1414] hover:from-[#8c2a2a] hover:to-[#5c1c1c] border-2 border-[#e2a85c] text-[#fde047] font-black text-sm uppercase py-3 rounded-xl shadow-[0_0_15px_rgba(226,168,92,0.4)] transition-all active:scale-95"
                >
                  XÁC NHẬN
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}`;

const newContent = content.replace('    </div>\n  );\n}', passwordModal);
fs.writeFileSync('src/App.tsx', newContent, 'utf-8');
