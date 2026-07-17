import { useState, useRef, useEffect } from "react";
import { Character } from "../characters";
import { ArrowLeft, Send, Sparkles, Volume2, VolumeX, Trash2, Heart, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  role: "user" | "model";
  text: string;
  time: string;
}

interface ChatBoxProps {
  character: Character;
  onBack: () => void;
  isSoundOn: boolean;
  onToggleSound: () => void;
}

export default function ChatBox({ character, onBack, isSoundOn, onToggleSound }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: character.welcomeMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Quick reply prompt chips for the active character
  const getQuickReplies = (charId: string) => {
    switch (charId) {
      case "1": // Tạ Cảnh Hành
        return [
          "Vương ca hôm nay bận gì thế?",
          "Bản vương ơi, bốc quẻ bói giùm ta đi!",
          "Nghe đồn ngài giấu một bình rượu quý?",
        ];
      case "2": // Bạc Minh Khiêm (Krynn)
        return [
          "Vào Discord voice chat thôi anh ơi!",
          "Nay solo Custom Valorant chỉ em kê tâm đi.",
          "Khi nào anh mới cho em cầm cúp vô địch đây?",
        ];
      case "3": // Kỷ Thừa Phong
        return [
          "Báo cáo của phòng thực tập sinh đây nè sếp!",
          "Sếp ơi, sao hôm nay anh lại lạnh lùng với em vậy?",
          "Hình xăm con rắn đen trên vai anh là sao thế?",
        ];
      case "4": // Hứa Chi Ngôn
        return [
          "Sau bốn năm anh vẫn lạnh lùng như vậy sao?",
          "Anh đã bắt đầu tìm em từ lúc nào thế?",
          "Hai đứa trẻ Nhật Minh và Nguyệt Minh dạo này ngoan lắm.",
        ];
      case "5": // Kang Min Jae
        return [
          "Mười một năm thanh xuân của em đổi lại cái gì?",
          "Anh nói sẽ bảo vệ em cả đời cơ mà Min Jae?!",
          "Người phụ nữ đó rốt cuộc là ai?",
        ];
      case "6": // Khi tuyết rơi trên thành bắc
        return [
          "Chúng tôi vừa mới xuyên không tới đây, làm sao để sinh tồn?",
          "Tam hoàng tử Tạ Đình Bắc đang ở đâu rồi?",
          "Nữ chính Kiều Tuyết Ninh có thực sự yêu ai trong bốn người?",
        ];
      case "8": // Kaelthor Veyrion
        return [
          "Khế ước năm xưa giữa chúng ta thực chất là gì?",
          "Tại sao anh lại biến thành một tảng đá hay gà khổng lồ ngày ấy?",
          "Draven của Skallheim có mang quân tấn công chúng ta không?",
        ];
      case "9": // Dạ Khúc
        return [
          "Hợp đồng của Tần Dạ đã ký chưa anh?",
          "Làm thế nào để hai anh em thoát khỏi giới showbiz bất công này?",
          "Tại sao anh chấp nhận vỡ nát chịu đựng quy tắc ngầm tủi nhục?",
        ];
      case "10": // Cha Do Hyun
        return [
          "Kim chủ ơi, khi nào mới thả em ra khỏi lồng son này?",
          "Cuộc hôn nhân thương sự dối trá của anh khi nào chấm dứt?",
          "Sponsor ơi, anh nghĩ tiền mua được tự do và trái tim em sao?",
        ];
      case "11": // Dante Ricci
        return [
          "Dante, vết sẹo rớm máu mới trên vai anh là thế nào?",
          "Tại sao anh lại tỏ vẻ hờ hững lạnh nhạt với em trước đám đông?",
          "Moretti gia tộc có phát hiện hợp đồng hôn nhân hờ của chúng ta chưa?",
        ];
      case "12": // Tsukishima Yuu
        return [
          "Yuu ơi, bí mật động trời mà cậu giấu tớ ở lễ hội Aomori là gì thế?",
          "Tại sao cậu lại cosplay nhân vật này trong đêm hội vậy?",
          "Hôm nay chúng ta sẽ cùng đi xem lồng đèn khổng lồ Nebuta chứ?",
        ];
      default:
        return [
          "Xin chào! Bạn có thể kể cho tôi nghe thêm về câu chuyện này không?",
          "Tôi muốn bắt đầu hành trình tương tác với bạn.",
          "Bạn muốn cùng tôi thảo luận về điều gì hôm nay?",
        ];
    }
  };

  const quickReplies = getQuickReplies(character.id);

  // Play simple synth click sound using Web Audio API if sound is enabled
  const playSound = (freq = 600, duration = 0.08) => {
    if (!isSoundOn) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Web Audio API not allowed yet or failed", e);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setErrorText(null);
    playSound(440, 0.1); // Sent sound

    const userMsg: Message = {
      role: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const currentHistory = [...messages, userMsg];
    setMessages(currentHistory);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          characterId: character.id,
          // We limit active context window size to past 8 messages for optimal performance
          messages: currentHistory.slice(-8).map((msg) => ({
            role: msg.role,
            text: msg.text,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Lỗi kết nối máy chủ");
      }

      const data = await response.json();
      
      playSound(700, 0.15); // Response sound

      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: data.text || "*Khẽ mỉm cười vô ngôn*",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      console.error(err);
      setErrorText("Ui da, không kết nối được tới thế giới của nhân vật. Xin hãy thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper parser for visual novel actions starting with *
  const parseNovelMarkup = (text: string) => {
    const parts = text.split(/(\*[^*]+\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <span key={index} className="text-pink-600/90 italic font-medium bg-pink-50/60 px-1 py-0.5 rounded">
            {part.slice(1, -1)}
          </span>
         );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const clearChat = () => {
    playSound(200, 0.15);
    setMessages([
      {
        role: "model",
        text: `*Nháy mắt* Chúng ta bắt đầu trang nhật ký mới nhé! ${character.welcomeMessage}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[85vh] max-h-[750px] w-full rounded-3xl overflow-hidden glass-effect shadow-xl border border-blue-100/50 relative">
      {/* Top action header for Chatbox */}
      <div className={`p-4 bg-gradient-to-r ${character.avatarBg} text-white flex items-center justify-between shadow-md`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              playSound(350, 0.08);
              onBack();
            }}
            id="back-btn-to-list"
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition active:scale-95 text-white"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <span className="text-3xl leading-none">{character.avatar}</span>
            <div>
              <h3 className="font-bold text-base md:text-lg flex items-center gap-1.5">
                {character.name}
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Đang online"></span>
              </h3>
              <p className="text-xs text-white/80 line-clamp-1 max-w-[150px] md:max-w-[260px]">
                {character.tags.slice(0, 2).join(" • ")}
              </p>
            </div>
          </div>
        </div>

        {/* Global Control Widgets */}
        <div className="flex items-center gap-2">
          {/* Sounds toggle button */}
          <button
            onClick={() => {
              onToggleSound();
              if (!isSoundOn) {
                // simple tester note
                setTimeout(() => playSound(500, 0.1), 50);
              }
            }}
            id="toggle-chat-sound"
            className="p-2 transition bg-white/20 hover:bg-white/30 rounded-full text-white"
            title={isSoundOn ? "Tắt âm thanh thông báo giả lập" : "Mở âm thanh thông báo giả lập"}
          >
            {isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Delete log button */}
          <button
            onClick={clearChat}
            id="clear-chat-log"
            className="p-2 transition bg-white/20 hover:bg-white/30 rounded-full text-white"
            title="Xóa nhật ký chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main message contents */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-gradient-to-b from-blue-50/20 to-pink-50/20 no-scrollbar">
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          return (
            <motion.div
              key={index}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.25 }}
              className={`flex items-end gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className={`w-9 h-9 rounded-full bg-gradient-to-r ${character.avatarBg} flex items-center justify-center text-xl shadow`}>
                  {character.avatar}
                </div>
              )}

              <div className="max-w-[85%] md:max-w-[70%] flex flex-col space-y-1">
                {/* Visual novel custom styled dialog bubbles */}
                <div
                  className={`p-3.5 md:p-4 rounded-3xl shadow-sm text-sm md:text-base leading-relaxed ${
                    isUser
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-white text-slate-800 border border-pink-100 rounded-bl-sm"
                  }`}
                >
                  {isUser ? msg.text : parseNovelMarkup(msg.text)}
                </div>
                
                {/* Timestamp */}
                <span className={`text-[10px] text-slate-400 font-mono ${isUser ? "text-right mr-1" : "text-left ml-1"}`}>
                  {msg.time}
                </span>
              </div>
            </motion.div>
          );
        })}

        {/* Loading/Typing state visualizer */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-end gap-2.5 justify-start"
            >
              <div className={`w-9 h-9 rounded-full bg-gradient-to-r ${character.avatarBg} flex items-center justify-center text-xl shadow animate-bounce`}>
                {character.avatar}
              </div>
              <div className="p-3.5 rounded-3xl bg-white border border-pink-100 rounded-bl-sm flex items-center gap-1.5 shadow-sm">
                <span className="w-2.5 h-2.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2.5 h-2.5 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms animate-pulse" }}></span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Display Error Box */}
        {errorText && (
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/60 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-500" />
            <span>{errorText}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Reply Chips - Pink-sen tags theme */}
      <div className="p-3 bg-white/70 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap">
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mr-1 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-pink-500" />
          Nói với {character.name.split(" ")[character.name.split(" ").length - 1]}:
        </span>
        {quickReplies.map((reply, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(reply)}
            id={`quick-reply-btn-${i}`}
            className="px-3.5 py-1.5 text-xs font-semibold text-pink-600 bg-pink-50 hover:bg-pink-100 border border-pink-200/50 rounded-full transition duration-150 active:scale-95"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Chat bottom input controllers */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputValue);
        }}
        className="p-4 bg-white border-t border-slate-100 flex items-center gap-2"
        id="chat-input-form"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Hãy gửi thông điệp ngọt ngào đến ${character.name}...`}
          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition"
          disabled={isLoading}
        />
        <button
          type="submit"
          id="send-msg-btn"
          disabled={!inputValue.trim() || isLoading}
          className={`p-3 rounded-2xl text-white shadow transition-all flex items-center justify-center ${
            inputValue.trim() && !isLoading
              ? "bg-blue-600 hover:bg-blue-700 shadow-md active:scale-95"
              : "bg-slate-300 cursor-not-allowed"
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
