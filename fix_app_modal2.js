import fs from 'fs';
const content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add Eye, EyeOff to lucide-react imports
let newContent = content.replace(
  'import { Search, Heart, Sparkles, MessageCircle, BookOpen, Volume2, VolumeX, Moon, Sun, ArrowLeft, RotateCcw, BarChart3, Gift, Check, X, Copy, ScrollText, Music, Play, Pause, SkipBack, SkipForward, ListMusic, User, Package, PackageOpen, Megaphone, Star, Info, PenTool, DoorOpen, Flame, Shield, Map, Crown, Leaf } from "lucide-react";',
  'import { Search, Heart, Sparkles, MessageCircle, BookOpen, Volume2, VolumeX, Moon, Sun, ArrowLeft, RotateCcw, BarChart3, Gift, Check, X, Copy, ScrollText, Music, Play, Pause, SkipBack, SkipForward, ListMusic, User, Package, PackageOpen, Megaphone, Star, Info, PenTool, DoorOpen, Flame, Shield, Map, Crown, Leaf, Eye, EyeOff } from "lucide-react";'
);

// 2. Add states
const statesSearch = `  const [passwordModalChar, setPasswordModalChar] = useState<Character | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");`;
const statesReplacement = `  const [passwordModalChar, setPasswordModalChar] = useState<Character | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);`;
newContent = newContent.replace(statesSearch, statesReplacement);

// 3. Update handlePasswordSubmit
const submitSearch = `  const handlePasswordSubmit = () => {
    if (!passwordModalChar) return;
    
    if (passwordInput === passwordModalChar.password) {
      playClickSound(600, 0.1);
      const link = passwordModalChar.chatLink !== undefined ? passwordModalChar.chatLink : passwordModalChar.chatbotUrl;
      setPasswordModalChar(null);
      setStoryCharacter(null);
      if (link) {
        window.open(link, "_blank", "noopener,noreferrer");
      }
    } else {
      playClickSound(300, 0.1);
      setPasswordError("Mật khẩu không đúng. Vui lòng thử lại!");
    }
  };`;
const submitReplacement = `  const handlePasswordSubmit = () => {
    if (!passwordModalChar) return;
    
    if (passwordInput === passwordModalChar.password) {
      playClickSound(600, 0.1);
      setIsUnlocked(true);
      setTimeout(() => {
        const link = passwordModalChar.chatLink !== undefined ? passwordModalChar.chatLink : passwordModalChar.chatbotUrl;
        setPasswordModalChar(null);
        setStoryCharacter(null);
        setIsUnlocked(false);
        if (link) {
          window.open(link, "_blank", "noopener,noreferrer");
        }
      }, 800);
    } else {
      playClickSound(300, 0.1);
      setPasswordError("Mật khẩu không đúng. Vui lòng thử lại!");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };`;
newContent = newContent.replace(submitSearch, submitReplacement);

const indexStart = newContent.indexOf('{/* Password Modal */}');
const indexEnd = newContent.indexOf('    </div>', indexStart);

const modalReplacement = `{/* Password Modal */}
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
                    onChange={(e) => setPasswordInput(e.target.value.toUpperCase().replace(/\\s/g, ""))}
                    placeholder="NHẬP MẬT KHẨU..."
                    className={\`w-full bg-[#110505] border-2 \${passwordError ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'border-[#b8860b] focus:border-[#ffd700] focus:shadow-[0_0_15px_rgba(255,215,0,0.6)]'} text-[#fde047] placeholder:text-[#fde047]/30 px-4 py-3.5 rounded-xl outline-none transition-all font-bold text-center uppercase tracking-widest\`}
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
`;

newContent = newContent.substring(0, indexStart) + modalReplacement + newContent.substring(indexEnd);
fs.writeFileSync('src/App.tsx', newContent, 'utf-8');
