import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Heart, Sparkles, PenTool, Check, X, Play, Pause, Trash2, MessageSquare, Send, AlertCircle, BookOpen, Clock, ImageIcon, Flame, Star } from "lucide-react";
import { CHARACTERS, Character } from "../characters";
import { 
  auth, 
  createBlogPost, 
  getAllBlogPosts, 
  toggleLikeBlogPost,
  createGalleryPost,
  getAllGalleryPosts,
  GalleryPost,
  deleteBlogPost,
  createBlogComment,
  getBlogComments,
  deleteBlogComment,
  BlogComment
} from "../firebase";
import { 
  onAuthStateChanged, 
  User as FirebaseUser, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider 
} from "firebase/auth";

export const blogBgUrl = "https://cdn.phototourl.com/free/2026-07-17-b5edb9a1-1f78-4b38-8eea-1e51f30246e1.jpg";

import { customAlert, customConfirm } from "../customAlert";

interface BlogSectionProps {
  isBlogOpen: boolean;
  onBack: () => void;
  playClickSound: (freq?: number, duration?: number) => void;
  onStorySelect: (char: Character) => void;
}

export default function BlogSection({
  isBlogOpen,
  onBack,
  playClickSound,
  onStorySelect
}: BlogSectionProps) {
  // Blog / Diary / Tâm Sự states
  const [blogActiveTab, setBlogActiveTab] = useState<"BLOG" | "DIARY" | "TÂM SỰ" | "GALLERY">("BLOG");
  const [blogCharacterFilter, setBlogCharacterFilter] = useState("Tất cả");
  const [blogSortFilter, setBlogSortFilter] = useState<"newest" | "top_week" | "reactions">("newest");
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostAuthor, setNewPostAuthor] = useState("");
  const [newPostCharacter, setNewPostCharacter] = useState("Trác Cẩn Xuyên");
  const [newPostCategory, setNewPostCategory] = useState<"BLOG" | "DIARY" | "TÂM SỰ">("TÂM SỰ");
  const [readPostModalContent, setReadPostModalContent] = useState<any>(null);
  const [newPostImageUrl, setNewPostImageUrl] = useState("");
  const [newPostAudioUrl, setNewPostAudioUrl] = useState("");
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const blogAudioRef = React.useRef<HTMLAudioElement | null>(null);
  
  // Real database & Auth states
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authIsSignUp, setAuthIsSignUp] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [isBlogLoading, setIsBlogLoading] = useState(false);
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [showLoginWarning, setShowLoginWarning] = useState(false);

  // Custom posts state (loaded from Firestore)
  const [blogPosts, setBlogPosts] = useState<any[]>([]);

  // Comments states
  const [postComments, setPostComments] = useState<Record<string, BlogComment[]>>({});
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, { author: string; content: string }>>({});
  const [submittingCommentPostId, setSubmittingCommentPostId] = useState<string | null>(null);

  // Gallery states
  const [galleryPosts, setGalleryPosts] = useState<GalleryPost[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryImageUrl, setGalleryImageUrl] = useState("");
  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryDescription, setGalleryDescription] = useState("");
  const [gallerySubmitLoading, setGallerySubmitLoading] = useState(false);
  const [galleryError, setGalleryError] = useState("");
  const [activeLightboxImage, setActiveLightboxImage] = useState<GalleryPost | null>(null);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  const loadCommentsForPosts = async (postsList: any[]) => {
    try {
      const commentsMap: Record<string, BlogComment[]> = {};
      await Promise.all(postsList.map(async (post) => {
        try {
          const comments = await getBlogComments(post.id);
          commentsMap[post.id] = comments;
        } catch (err) {
          console.error(`Error fetching comments for post ${post.id}:`, err);
        }
      }));
      setPostComments(prev => ({ ...prev, ...commentsMap }));
    } catch (err) {
      console.error("Failed to load comments for posts:", err);
    }
  };

  // Fetch real blog posts from Firestore database
  const loadBlogPosts = async (categoryTab?: string) => {
    setIsBlogLoading(true);
    try {
      const posts = await getAllBlogPosts(categoryTab);
      // Filter out post-1 "Thanh Thanh yêu dấu~" completely
      const filteredDbPosts = posts ? posts.filter((p: any) => p.id !== "post-1") : [];
      
      let postsToUse = filteredDbPosts;
      
      // We only want to seed if the ENTIRE database is empty, not just this category
      const checkAllPosts = await getAllBlogPosts();
      const allPostsFiltered = checkAllPosts ? checkAllPosts.filter((p: any) => p.id !== "post-1") : [];
      
      if (!allPostsFiltered || allPostsFiltered.length === 0) {
        // If Firestore is completely empty, seed it with the default posts (excluding post-1) so it remains pre-populated elegantly
        const defaults = [];

        for (const item of defaults) {
          try {
            await createBlogPost({
              id: item.id,
              author: item.author,
              content: item.content,
              userId: "system-seed",
              title: item.title,
              character: item.character,
              category: item.category
            });
          } catch (err) {
            console.error("Seeding error for post:", item.id, err);
          }
        }
        const freshPosts = await getAllBlogPosts();
        postsToUse = freshPosts ? freshPosts.filter((p: any) => p.id !== "post-1") : [];
      }
      setBlogPosts(postsToUse);
      await loadCommentsForPosts(postsToUse);
    } catch (err) {
      console.error("Failed to load blog posts from Firestore:", err);
    } finally {
      setIsBlogLoading(false);
    }
  };

  const handleDeletePost = async (postId: string, postUserId: string) => {
    if (!currentUser) {
      customAlert("Lỗi: Bạn chưa đăng nhập tài khoản!");
      return;
    }
    
    // In ra console để kiểm tra xem hai ID có khớp nhau không
    console.log("ID người dùng hiện tại:", currentUser.uid);
    console.log("ID chủ bài viết:", postUserId);

    customConfirm("Bạn có chắc chắn muốn xoá bài viết này vĩnh viễn không?", async () => {
      playClickSound(200, 0.15);
      try {
        await deleteBlogPost(postId);
        // Remove from state immediately
        setBlogPosts(prev => prev.filter(p => p.id !== postId));
        customAlert("Xóa bài viết thành công!");
      } catch (error: any) {
        console.error("Lỗi xóa bài cụ thể:", error);
        customAlert("KHÔNG XÓA ĐƯỢC BÀI VIẾT! Lỗi hệ thống: " + error.message);
      }
    });
  };

  const handlePostComment = async (postId: string) => {
    if (!currentUser) {
      alert("Vui lòng đăng nhập để bình luận!");
      return;
    }
    const input = commentInputs[postId];
    const content = input?.content?.trim();
    if (!content) {
      alert("Vui lòng nhập nội dung bình luận!");
      return;
    }
    const author = input?.author?.trim() || "Người ẩn danh";
    playClickSound(1000, 0.1);
    setSubmittingCommentPostId(postId);
    try {
      const commentId = `comment-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newComment = await createBlogComment(postId, {
        id: commentId,
        author,
        content,
        userId: currentUser.uid
      });
      // Update local comments state
      setPostComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment]
      }));
      // Reset input content (keep author name for convenience)
      setCommentInputs(prev => ({
        ...prev,
        [postId]: { author, content: "" }
      }));
    } catch (err) {
      console.error("Failed to save comment:", err);
      alert("Có lỗi xảy ra khi gửi bình luận. Vui lòng thử lại!");
    } finally {
      setSubmittingCommentPostId(null);
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    customConfirm("Bạn có chắc chắn muốn xoá bình luận này không?", async () => {
      playClickSound(200, 0.15);
      try {
        await deleteBlogComment(postId, commentId);
        setPostComments(prev => ({
          ...prev,
          [postId]: (prev[postId] || []).filter(c => c.id !== commentId)
        }));
      } catch (error) {
        console.error("Failed to delete comment:", error);
        customAlert("Không thể xoá bình luận này. Vui lòng thử lại!");
      }
    });
  };

  // Fetch gallery posts from Firestore
  const loadGalleryPosts = async () => {
    setGalleryLoading(true);
    try {
      const posts = await getAllGalleryPosts();
      setGalleryPosts(posts || []);
    } catch (err) {
      console.error("Failed to load gallery posts from Firestore:", err);
    } finally {
      setGalleryLoading(false);
    }
  };

  const handleShareGalleryPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setGalleryError("Vui lòng đăng nhập để đăng tranh/ảnh!");
      return;
    }
    if (!galleryImageUrl.trim()) {
      setGalleryError("Vui lòng nhập link ảnh!");
      return;
    }
    setGallerySubmitLoading(true);
    setGalleryError("");
    try {
      const postId = `gallery-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await createGalleryPost({
        id: postId,
        image_url: galleryImageUrl.trim(),
        title: galleryTitle.trim() || "Bức tranh không tên",
        description: galleryDescription.trim(),
        user_id: currentUser.uid,
        author: currentUser.email || "Người dùng ẩn danh"
      });
      setGalleryImageUrl("");
      setGalleryTitle("");
      setGalleryDescription("");
      await loadGalleryPosts();
      setShowWriteForm(false);
      playClickSound(800, 0.1);
    } catch (err: any) {
      console.error("Failed to share gallery post:", err);
      setGalleryError("Không thể chia sẻ tranh lên Gallery. Vui lòng thử lại.");
    } finally {
      setGallerySubmitLoading(false);
    }
  };



  useEffect(() => {
    if (blogActiveTab === "GALLERY") {
      loadGalleryPosts();
    } else {
      loadBlogPosts(blogActiveTab);
    }
  }, [blogActiveTab]);

  const handleLikeClick = async (post: any) => {
    if (!currentUser) {
      playClickSound(200, 0.15);
      alert("Vui lòng đăng nhập để gửi tim cảm xúc nhé! 💖");
      return;
    }
    playClickSound(650, 0.08);
    try {
      const result = await toggleLikeBlogPost(post.id, currentUser.uid);
      setBlogPosts(prev => prev.map(p => {
        if (p.id === post.id) {
          return {
            ...p,
            reactions: result.reactions,
            reactedUsers: result.reactedUsers
          };
        }
        return p;
      }));
      if (readPostModalContent && readPostModalContent.id === post.id) {
        setReadPostModalContent((prev: any) => {
          if (!prev) return null;
          return {
            ...prev,
            reactions: result.reactions,
            reactedUsers: result.reactedUsers
          };
        });
      }
    } catch (error) {
      console.error("Failed to toggle reaction in Firestore:", error);
    }
  };

  const toggleBlogAudio = (postId: string, url: string) => {
    if (!url) return;
    playClickSound(500, 0.05);

    if (playingAudioId === postId) {
      if (blogAudioRef.current) {
        blogAudioRef.current.pause();
      }
      setPlayingAudioId(null);
    } else {
      // Pause all other audio tags on the page to prevent overlap
      try {
        const audios = document.querySelectorAll("audio");
        audios.forEach((aud) => {
          if (aud !== blogAudioRef.current) {
            aud.pause();
          }
        });
      } catch (e) {
        console.error("Failed to pause other audios:", e);
      }

      if (!blogAudioRef.current) {
        blogAudioRef.current = new Audio(url);
        blogAudioRef.current.loop = true;
      } else {
        blogAudioRef.current.src = url;
      }

      blogAudioRef.current.play()
        .then(() => {
          setPlayingAudioId(postId);
        })
        .catch((err) => {
          console.error("Audio playback failed:", err);
          alert("Không thể phát nhạc từ liên kết này. Vui lòng kiểm tra lại liên kết nhạc .mp3!");
          setPlayingAudioId(null);
        });
    }
  };

  useEffect(() => {
    return () => {
      if (blogAudioRef.current) {
        blogAudioRef.current.pause();
        blogAudioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isBlogOpen) {
      if (blogAudioRef.current) {
        blogAudioRef.current.pause();
      }
      setPlayingAudioId(null);
    }
  }, [isBlogOpen]);

  return (
    <>
      <style>{`
        .blog-container-wrapper {
          background-color: #110c08 !important;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          overflow-y: auto !important;
          -webkit-overflow-scrolling: touch;
          z-index: 9998;
        }
      `}</style>
      <div 
        className="blog-container-wrapper relative" 
        style={{
          display: isBlogOpen ? 'block' : 'none',
          backgroundImage: blogBgUrl ? `url(${blogBgUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed', /* Giúp ảnh nền cố định khi lướt */
          minHeight: '100vh',
          width: '100%',
          position: 'fixed',
          top: 0,
          left: 0,
          overflowY: 'auto',
          zIndex: 9998,
          backgroundColor: '#110c08'
        }}
      >


        <div className="flex flex-col items-center justify-start p-4 md:p-8 min-h-screen w-full">
          <div
            id="blog"
            className={`blog-content w-full max-w-xl z-10 flex flex-col gap-6 ${isBlogOpen ? "fade-in" : "fade-out-back"}`}
            style={{ display: isBlogOpen ? 'flex' : 'none' }}
          >
        {/* Navigation and Login buttons outside card */}
        <div className="flex justify-between items-center w-full px-4 mb-4 z-20">
          <button
            onClick={() => {
              playClickSound(300, 0.08);
              onBack();
            }}
            className="flex items-center gap-1.5 font-serif tracking-[0.1em] text-[11px] font-bold text-[#dfb074] bg-[#4a3e3d] border border-[#dfb074]/60 rounded-full px-4 py-1.5 uppercase shadow-md transition-all duration-300 hover:bg-[#5c4d4c] hover:scale-105 focus:outline-none cursor-pointer"
          >
            <span>🏰 TRANG CHỦ</span>
          </button>

          {!currentUser ? (
            <button
              onClick={async () => {
                playClickSound(300, 0.08);
                try {
                  const provider = new GoogleAuthProvider();
                  await signInWithPopup(auth, provider);
                } catch (err: any) {
                  console.error("Google Sign-In failed:", err);
                  alert("Không thể đăng nhập bằng Google. Vui lòng thử lại!");
                }
              }}
              className="flex items-center gap-1.5 font-serif tracking-[0.1em] text-[11px] font-bold text-[#dfb074] bg-[#4a3e3d] border border-[#dfb074]/60 rounded-full px-4 py-1.5 uppercase shadow-md transition-all duration-300 hover:bg-[#5c4d4c] hover:scale-105 focus:outline-none cursor-pointer"
            >
              <span>🔑 ĐĂNG NHẬP</span>
            </button>
          ) : (
            <div className="flex items-center gap-3 font-serif text-[10px] tracking-widest uppercase bg-[#4a3e3d] border border-[#dfb074]/60 rounded-full px-4 py-1.5 shadow-md">
              <span className="text-[#dfb074] font-bold">👤 {currentUser.email?.split('@')[0] || "User"}</span>
              <div className="w-[1px] h-3 bg-[#dfb074]/30" />
              <button
                onClick={async () => {
                  playClickSound(300, 0.1);
                  await signOut(auth);
                }}
                className="text-[#dfb074]/80 hover:text-[#f5dab1] cursor-pointer transition-all duration-300 focus:outline-none"
              >
                Thoát
              </button>
            </div>
          )}
        </div>

        {/* Header section: Warm Ivory Wedding Card design */}
        <div className="relative pt-8 pb-8 px-8 rounded-[32px] bg-[#faf6f0] shadow-2xl shadow-black/25 flex flex-col items-center text-center overflow-visible">
          {/* Golden Inner Border: Gold Foil effect */}
          <div className="absolute inset-2 rounded-[24px] border border-[#dfb074]/60 pointer-events-none" />
          
          {/* Top Decorative Element: Golden Mail/Envelope icon */}
          <div className="relative mb-6">
            <div className="absolute -inset-4 bg-[#dfb074]/5 blur-xl rounded-full" />
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#b88e58" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 opacity-90">
              <path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H17.5C20 5 22 7 22 9.5V17Z" />
              <path d="M2 9.5L12 15L22 9.5" />
              {/* Decorative flourish representing a leaf branch or ribbon tie */}
              <path d="M12 15c-2-2-5-1-4 2s3 3 4 0" fill="#b88e58" fillOpacity="0.2" />
              <path d="M12 15c2-2 5-1 4 2s-3 3-4 0" fill="#b88e58" fillOpacity="0.2" />
              <circle cx="12" cy="15" r="1.5" fill="#b88e58" />
            </svg>
          </div>

          <h1 className="font-serif italic font-medium text-2xl md:text-4xl text-[#4a3e3d] tracking-wide select-none leading-relaxed max-w-lg">
            written in the stars, sealed with a kiss
          </h1>
          
          <div className="w-16 h-[1px] bg-[#dfb074]/40 my-5" />
          
          <p className="font-sans font-semibold text-[#b88e58] text-xs md:text-sm uppercase tracking-[0.25em] select-none">
            A LOVE STORY FOR THE AGES
          </p>
        </div>

        {/* Tab Bar: Gửi Người Tình | Nhật Ký | Lời Chưa Nói | Nét Họa */}
        <div className="flex justify-center items-center gap-2 bg-[#4a3e3d]/90 border border-[#dfb074]/30 rounded-lg p-1.5 max-w-2xl mx-auto shadow-lg shadow-black/40 backdrop-blur-sm">
          {(["BLOG", "DIARY", "TÂM SỰ", "GALLERY"] as const).map((tab) => {
            const isActive = blogActiveTab === tab;
            const label = tab === "BLOG" ? "Gửi Người Tình" : 
                         tab === "DIARY" ? "Nhật Ký" : 
                         tab === "TÂM SỰ" ? "Lời Chưa Nói" : "Nét Họa";
            return (
              <button
                key={tab}
                onClick={() => {
                  playClickSound(450, 0.05);
                  setBlogActiveTab(tab);
                }}
                className={`font-serif tracking-[0.15em] text-xs transition-all duration-300 rounded-md px-6 py-2.5 uppercase cursor-pointer ${
                  isActive 
                    ? "font-bold text-[#4a3e3d] bg-[#faf6f0]" 
                    : "font-medium text-[#dfb074]/70 bg-transparent hover:text-[#dfb074] hover:bg-[#faf6f0]/10"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Content display based on active tab */}
        <div className="w-full flex flex-col gap-4">
          {/* Unified Posting Form (shown across all tabs when triggered) */}
          {showWriteForm && (
            <div id="auth-panel" className="relative w-full p-5 md:p-6 rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 shadow-lg border border-amber-500/15 shadow-2xl space-y-4 scroll-mt-6">
              <button
                type="button"
                onClick={() => {
                  playClickSound(300, 0.08);
                  setShowWriteForm(false);
                }}
                className="absolute top-4 right-4 text-[#dfb074]/60 hover:text-[#dfb074] hover:bg-[#dfb074]/5 p-1.5 rounded-full transition-all duration-300 cursor-pointer"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>

              {!currentUser ? (
                <div className="space-y-4 text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                    <div>
                      <h3 className="font-serif font-black text-sm md:text-base text-[#FFE79A] tracking-wider flex items-center gap-1.5">
                        <span>🔒</span> {authIsSignUp ? "TẠO TÀI KHOẢN MỚI" : "ĐĂNG NHẬP VIẾT BÀI"}
                      </h3>
                      <p className="text-[10px] md:text-[11px] text-slate-400 mt-0.5 font-serif italic">
                        Hệ thống lưu trữ tâm sự ẩn danh vĩnh viễn
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        playClickSound(400, 0.05);
                        setAuthIsSignUp(!authIsSignUp);
                        setAuthError("");
                      }}
                      className="text-xs text-[#dfb074] hover:underline font-bold tracking-wide text-left cursor-pointer mr-6 sm:mr-0"
                    >
                      {authIsSignUp ? "Đã có tài khoản? Đăng nhập" : "Chưa có tài khoản? Đăng ký"}
                    </button>
                  </div>

                  {authError && (
                    <div className="p-3 bg-red-950/50 border border-red-500/30 rounded-xl text-xs text-red-400 font-sans leading-relaxed">
                      ⚠️ {authError}
                    </div>
                  )}

                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!authEmail.trim() || !authPassword.trim()) {
                        setAuthError("Vui lòng điền đầy đủ Email và Mật khẩu!");
                        return;
                      }
                      setAuthLoading(true);
                      setAuthError("");
                      playClickSound(800, 0.1);
                      try {
                        if (authIsSignUp) {
                          await createUserWithEmailAndPassword(auth, authEmail.trim(), authPassword.trim());
                        } else {
                          await signInWithEmailAndPassword(auth, authEmail.trim(), authPassword.trim());
                        }
                        setAuthEmail("");
                        setAuthPassword("");
                      } catch (err: any) {
                        console.error("Auth action failed:", err);
                        let friendlyMsg = err.message;
                        if (err.code === "auth/invalid-credential") {
                          friendlyMsg = "Email hoặc Mật khẩu không chính xác.";
                        } else if (err.code === "auth/email-already-in-use") {
                          friendlyMsg = "Địa chỉ Email này đã được đăng ký sử dụng.";
                        } else if (err.code === "auth/weak-password") {
                          friendlyMsg = "Mật khẩu quá yếu (yêu cầu tối thiểu 6 ký tự).";
                        } else if (err.code === "auth/invalid-email") {
                          friendlyMsg = "Địa chỉ Email không đúng định dạng.";
                        }
                        setAuthError(friendlyMsg);
                      } finally {
                        setAuthLoading(false);
                      }
                    }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Địa chỉ Email:</label>
                      <input
                        type="email"
                        required
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="ten@viethuong.com"
                        className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-base text-amber-100 focus:outline-none focus:ring-1 focus:ring-[#dfb074] transition"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Mật khẩu:</label>
                      <input
                        type="password"
                        required
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-base text-amber-100 focus:outline-none focus:ring-1 focus:ring-[#dfb074] transition"
                      />
                    </div>
                    <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={authLoading}
                        className="flex-1 py-3 px-4 rounded-lg font-serif font-bold text-xs uppercase tracking-[0.15em] text-[#dfb074] bg-[#4a3e3d] border border-[#dfb074]/60 hover:bg-[#5c4d4c] hover:scale-[1.02] disabled:opacity-50 cursor-pointer shadow-lg transition-all duration-300 flex items-center justify-center gap-1.5"
                      >
                        <span>{authLoading ? "Đang xử lý..." : (authIsSignUp ? "Đăng ký tài khoản ✍️" : "Đăng nhập ngay 🚪")}</span>
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          playClickSound(600, 0.1);
                          setAuthLoading(true);
                          setAuthError("");
                          try {
                            const provider = new GoogleAuthProvider();
                            await signInWithPopup(auth, provider);
                          } catch (err: any) {
                            console.error("Google Sign-In failed:", err);
                            setAuthError("Không thể đăng nhập bằng Google. Vui lòng thử lại!");
                          } finally {
                            setAuthLoading(false);
                          }
                        }}
                        disabled={authLoading}
                        className="py-3 px-4 rounded-lg font-serif font-bold text-xs uppercase tracking-[0.15em] text-[#dfb074] bg-transparent border border-[#dfb074]/40 hover:bg-[#dfb074]/10 disabled:opacity-50 cursor-pointer transition-all duration-300 flex items-center justify-center gap-1.5 flex-1"
                      >
                        <span>Đăng nhập Google 🚀</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          playClickSound(300, 0.08);
                          setShowWriteForm(false);
                        }}
                        className="py-3 px-4 rounded-lg font-serif font-medium text-xs uppercase tracking-[0.15em] text-[#dfb074]/60 bg-transparent border border-white/10 hover:border-[#dfb074]/40 hover:text-[#dfb074] cursor-pointer transition-all duration-300 flex items-center justify-center gap-1.5 flex-1"
                      >
                        <span>Hủy bỏ ✖</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="space-y-4 text-left">
                  {blogActiveTab === "GALLERY" ? (
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handleShareGalleryPost(e);
                    }} className="w-full space-y-4 text-left">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div>
                          <h3 className="font-serif font-black text-sm md:text-base text-[#FFE79A] tracking-wider flex items-center gap-1.5">
                            <span>🎨</span> CHIA SẺ TRANH/ẢNH LÊN NÉT HỌA
                          </h3>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            <p className="text-[10px] text-slate-400 font-sans">
                              Tài khoản: <span className="text-amber-100/95 font-semibold font-mono">{currentUser?.email || "Google User"}</span>
                            </p>
                            <span className="text-slate-600 text-xs">•</span>
                            <button
                              type="button"
                              onClick={async () => {
                                playClickSound(300, 0.1);
                                await signOut(auth);
                              }}
                              className="text-[10px] text-red-400 hover:underline font-bold cursor-pointer"
                            >
                              Đăng xuất 🚪
                            </button>
                          </div>
                        </div>
                      </div>

                      {galleryError && (
                        <div className="p-3 bg-red-950/50 border border-red-500/30 rounded-xl text-xs text-red-400 font-sans">
                          ⚠️ {galleryError}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Đường dẫn hình ảnh (URL):</label>
                          <input
                            type="url"
                            required
                            value={galleryImageUrl}
                            onChange={(e) => setGalleryImageUrl(e.target.value)}
                            placeholder="https://example.com/buc-tranh-cua-ban.jpg"
                            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-base text-amber-100 focus:outline-none focus:ring-1 focus:ring-[#dfb074] transition w-full"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tên tác phẩm / Tiêu đề:</label>
                          <input
                            type="text"
                            value={galleryTitle}
                            onChange={(e) => setGalleryTitle(e.target.value)}
                            placeholder="Tên bức tranh (nếu có)..."
                            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-base text-amber-100 focus:outline-none focus:ring-1 focus:ring-[#dfb074] transition w-full"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Nội dung / Mô tả tác phẩm:</label>
                        <textarea
                          rows={3}
                          value={galleryDescription}
                          onChange={(e) => setGalleryDescription(e.target.value)}
                          placeholder="Viết câu chuyện hoặc mô tả chi tiết cho bức tranh này..."
                          className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-base text-amber-100 focus:outline-none focus:ring-1 focus:ring-[#dfb074] transition w-full custom-scrollbar resize-none"
                        />
                      </div>

                      <div className="flex justify-end pt-1 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            playClickSound(300, 0.08);
                            setShowWriteForm(false);
                          }}
                          className="px-4 py-2 border border-[#dfb074]/30 text-[#dfb074]/60 hover:text-[#dfb074] hover:border-[#dfb074]/60 hover:bg-[#dfb074]/5 transition-all duration-300 rounded-lg text-xs font-serif font-bold uppercase tracking-[0.15em] cursor-pointer"
                        >
                          Hủy bỏ
                        </button>
                        <button
                          type="submit"
                          disabled={gallerySubmitLoading}
                          className="px-5 py-2 rounded-lg font-serif font-bold text-xs uppercase tracking-[0.15em] text-[#dfb074] bg-[#4a3e3d] border border-[#dfb074]/80 hover:bg-[#5c4d4c] hover:scale-105 disabled:opacity-50 cursor-pointer shadow-lg transition-all duration-300 flex items-center gap-1.5"
                        >
                          <span>{gallerySubmitLoading ? "Đang gửi..." : "Chia sẻ tranh lên Gallery 🚀"}</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="w-full">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div>
                          <h3 className="font-serif font-black text-sm md:text-base text-[#FFE79A] tracking-wider flex items-center gap-1.5">
                            <span>✍️</span> CHIA SẺ TÂM SỰ ẨN DANH
                          </h3>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            <p className="text-[10px] text-slate-400 font-sans">
                              Tài khoản: <span className="text-amber-100/95 font-semibold font-mono">{currentUser.email || "Google User"}</span>
                            </p>
                            <span className="text-slate-600 text-xs">•</span>
                            <button
                              onClick={async () => {
                                playClickSound(300, 0.1);
                                await signOut(auth);
                              }}
                              className="text-[10px] text-red-400 hover:underline font-bold cursor-pointer"
                            >
                              Đăng xuất 🚪
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            playClickSound(500, 0.1);
                            setIsNewPostModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-amber-100 font-serif text-[10px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1 mr-6"
                        >
                          <Sparkles className="w-3 h-3 text-[#FFAE34]" />
                          <span>Mở rộng form</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <input
                            type="text"
                            value={newPostTitle}
                            onChange={(e) => setNewPostTitle(e.target.value)}
                            placeholder="Nhập tiêu đề câu chuyện..."
                            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-base text-amber-100 focus:outline-none focus:ring-1 focus:ring-[#dfb074] transition"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <select
                            value={newPostCharacter}
                            onChange={(e) => setNewPostCharacter(e.target.value)}
                            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-base text-amber-100 focus:outline-none focus:ring-1 focus:ring-[#dfb074] transition cursor-pointer"
                          >
                            {CHARACTERS.map((char) => (
                              <option key={char.id} value={char.name}>{char.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 pt-3">
                        <textarea
                          rows={3}
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          placeholder="Hôm nay bạn thế nào? Hãy chia sẻ ẩn danh nhé..."
                          className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-base text-amber-100 focus:outline-none focus:ring-1 focus:ring-[#dfb074] transition custom-scrollbar"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                        <div className="flex flex-col gap-1">
                          <input
                            type="text"
                            value={newPostAuthor}
                            onChange={(e) => setNewPostAuthor(e.target.value)}
                            placeholder="Biệt danh (để trống nếu ẩn danh)..."
                            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-base text-amber-100 focus:outline-none focus:ring-1 focus:ring-[#dfb074] transition"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <input
                            type="text"
                            value={newPostImageUrl}
                            onChange={(e) => setNewPostImageUrl(e.target.value)}
                            placeholder="Dán link ảnh tại đây (nếu có)..."
                            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-base text-amber-100 focus:outline-none focus:ring-1 focus:ring-[#dfb074] transition"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <input
                            type="text"
                            value={newPostAudioUrl}
                            onChange={(e) => setNewPostAudioUrl(e.target.value)}
                            placeholder="Dán link nhạc .mp3 tại đây (nếu có)..."
                            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-base text-amber-100 focus:outline-none focus:ring-1 focus:ring-[#dfb074] transition"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-white/5 mt-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400 font-sans">Chuyên mục:</span>
                          <div className="flex gap-1 p-0.5 bg-slate-900 rounded-lg border border-white/5">
                            {(["BLOG", "DIARY", "TÂM SỰ"] as const).map((cat) => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => {
                                  playClickSound(400, 0.05);
                                  setNewPostCategory(cat);
                                }}
                                className={`px-2.5 py-1 rounded-md text-[9px] font-bold tracking-wider transition uppercase cursor-pointer ${
                                  newPostCategory === cat
                                    ? "bg-[#c5965a] text-white"
                                    : "text-slate-400 hover:text-white"
                                }`}
                              >
                                {cat === "BLOG" ? "Gửi Người Tình" : cat === "DIARY" ? "Nhật Ký" : "Lời Chưa Nói"}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 justify-end">
                          <span className="text-[10px] text-emerald-400 font-sans italic flex items-center gap-1 select-none">
                            <span>🔒</span> Tên hiển thị: {newPostAuthor.trim() || "Người ẩn danh"}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              playClickSound(300, 0.08);
                              setShowWriteForm(false);
                            }}
                            className="px-4 py-2 border border-[#dfb074]/30 text-[#dfb074]/60 hover:text-[#dfb074] hover:border-[#dfb074]/60 hover:bg-[#dfb074]/5 transition-all duration-300 rounded-lg text-xs font-serif font-bold uppercase tracking-[0.15em] cursor-pointer"
                          >
                            Hủy bỏ
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!newPostTitle.trim() || !newPostContent.trim()) {
                                playClickSound(200, 0.15);
                                alert("Vui lòng nhập đầy đủ tiêu đề và nội dung tâm sự!");
                                return;
                              }
                              playClickSound(1100, 0.1);
                              const newId = `post-${Date.now()}`;
                              const postAuthor = newPostAuthor.trim() || "Người ẩn danh";
                              try {
                                await createBlogPost({
                                  id: newId,
                                  author: postAuthor,
                                  content: newPostContent.trim(),
                                  userId: currentUser.uid,
                                  title: newPostTitle.trim(),
                                  character: newPostCharacter,
                                  category: newPostCategory,
                                  image_url: newPostImageUrl.trim(),
                                  audio_url: newPostAudioUrl.trim()
                                });
                                await loadBlogPosts(blogActiveTab);
                                setNewPostTitle("");
                                setNewPostContent("");
                                setNewPostImageUrl("");
                                setNewPostAudioUrl("");
                                setNewPostAuthor("");
                                setShowWriteForm(false);
                              } catch (error) {
                                console.error("Failed to submit quick post:", error);
                                alert("Có lỗi xảy ra khi lưu bài viết. Vui lòng thử lại!");
                              }
                            }}
                            className="px-5 py-2 rounded-lg font-serif font-bold text-xs uppercase tracking-[0.15em] text-[#dfb074] bg-[#4a3e3d] border border-[#dfb074]/80 hover:bg-[#5c4d4c] hover:scale-105 shadow-md transition-all duration-300 cursor-pointer flex items-center gap-1"
                          >
                            <PenTool className="w-3 h-3" />
                            <span>Đăng Bài ✨</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
            )}
          </div>
        )}
          {blogActiveTab === "GALLERY" ? (
            /* --- GALLERY TAB --- */
            <div className="space-y-6 w-full text-left">
              {/* --- FAN ART SUBMISSIONS LIST --- */}
              <div className="space-y-3 pt-2">
                <div 
                  className="text-[#4a3e3d] font-serif text-lg font-bold tracking-[0.15em] flex items-center justify-start gap-2 uppercase mb-4 px-2"
                  style={{ textShadow: '1px 1px 0 #dfb074, -1px -1px 0 #dfb074, 1px -1px 0 #dfb074, -1px 1px 0 #dfb074' }}
                >
                  🪷 VƯỜN HỌA GỬI TRAO
                </div>
                {galleryLoading ? (
                  <div className="text-center py-8 text-xs text-slate-400 font-mono">Đang tải tranh ảnh... 🎨</div>
                ) : galleryPosts.length === 0 ? (
                  <div className="w-full max-w-lg mx-auto bg-[#2d2524]/70 border border-[#dfb074]/30 rounded-xl p-8 shadow-2xl flex flex-col items-center justify-center text-center will-change-transform">
                    <span className="text-3xl mb-4 opacity-80">🎨</span>
                    <p className="text-[#faf6f0] font-serif italic text-lg tracking-wide">
                      Hiện chưa có tâm tư nào được ghi lại tại đây...
                    </p>
                    <p className="text-[#faf6f0]/60 font-serif italic text-xs mt-2 tracking-widest uppercase">
                      Hãy là người đầu tiên chia sẻ nhé 🌿
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {galleryPosts.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => {
                          playClickSound(480, 0.08);
                          setActiveLightboxImage(post);
                        }}
                        className="relative rounded-2xl border border-white/10 overflow-hidden bg-black/30 backdrop-blur-md border border-white/10 shadow-lg group cursor-pointer hover:border-[#dfb074] transition-all duration-300 shadow-lg aspect-[3/4] flex flex-col"
                      >
                        <div className="flex-1 relative overflow-hidden bg-slate-900">
                          <img
                            src={post.image_url}
                            alt={post.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 text-left">
                            <p className="text-[10px] text-amber-100/60 truncate">Bởi {post.author.split('@')[0]}</p>
                          </div>
                        </div>
                        <div className="p-3 bg-slate-900 border-t border-white/5 text-center">
                          <h4 className="font-serif font-black text-amber-100 text-xs sm:text-sm tracking-wide line-clamp-1">
                            {post.title}
                          </h4>
                          <p className="text-[9px] font-mono text-[#dfb074] uppercase tracking-wider mt-0.5 truncate">
                            {post.author.split('@')[0]}
                          </p>
                          {post.description && (
                            <p className="text-[10px] text-slate-400 mt-1.5 line-clamp-2 italic font-serif leading-relaxed px-1">
                              "{post.description}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* --- POSTS LISTS --- */
            <>
              <div 
                className="text-[#4a3e3d] font-serif text-lg font-bold tracking-[0.15em] flex items-center justify-start gap-2 uppercase mb-4 px-2"
                style={{ textShadow: '1px 1px 0 #dfb074, -1px -1px 0 #dfb074, 1px -1px 0 #dfb074, -1px 1px 0 #dfb074' }}
              >
                {blogActiveTab === "BLOG" ? "💌 THƯ GỬI NGƯỜI THƯƠNG" : 
                 blogActiveTab === "DIARY" ? "🖋️ CHUYỆN NGÀY THƯỜNG" : 
                 "🥀 GÓC NỖI LÒNG"}
              </div>
              {/* Filter and display actual custom posts list */}
              <div className="bg-[#fdfaf6]/90 p-4 md:p-8 rounded-3xl shadow-inner">
                {(() => {
                const hasAnyRealPost = blogPosts.some(post => post.userId !== 'system-seed');
                if (!hasAnyRealPost) {
                  return (
                    <div className="w-full max-w-lg mx-auto bg-[#2d2524]/70 border border-[#dfb074]/30 rounded-xl p-8 shadow-2xl flex flex-col items-center justify-center text-center will-change-transform">
                      <span className="text-3xl mb-4 opacity-80">🖋️</span>
                      <p className="text-[#faf6f0] font-serif italic text-lg tracking-wide">
                        Hiện chưa có tâm tư nào được ghi lại tại đây...
                      </p>
                      <p className="text-[#faf6f0]/60 font-serif italic text-xs mt-2 tracking-widest uppercase">
                        Hãy là người đầu tiên chia sẻ nhé 🌿
                      </p>
                    </div>
                  );
                }

                let filteredPosts = blogPosts.filter(post => {
                  const matchesTab = post.category === blogActiveTab;
                  const matchesChar = blogCharacterFilter === "Tất cả" || post.character === blogCharacterFilter;
                  return matchesTab && matchesChar;
                });

                if (blogSortFilter === "reactions") {
                  filteredPosts = [...filteredPosts].sort((a, b) => b.reactions - a.reactions);
                } else {
                  // default newest
                  filteredPosts = [...filteredPosts].sort((a, b) => b.id.localeCompare(a.id));
                }

                if (filteredPosts.length === 0) {
                  return (
                    <div className="w-full max-w-lg mx-auto bg-[#2d2524]/70 border border-[#dfb074]/30 rounded-xl p-8 shadow-2xl flex flex-col items-center justify-center text-center will-change-transform">
                      <span className="text-3xl mb-4 opacity-80">🌿</span>
                      <p className="text-[#faf6f0] font-serif italic text-lg tracking-wide">
                        Hiện chưa có tâm tư nào được ghi lại tại đây...
                      </p>
                      <p className="text-[#faf6f0]/60 font-serif italic text-xs mt-2 tracking-widest uppercase">
                        Hãy là người đầu tiên chia sẻ nhé 🌿
                      </p>
                    </div>
                  );
                }

                return filteredPosts.map((post) => {
                  const matchedCharObj = CHARACTERS.find(c => c.name === post.character);
                  return (
                    <div
                      key={post.id}
                      className="bg-white p-6 mb-6 rounded-2xl border border-[#e0d0c0] shadow-lg flex flex-col gap-4 text-left transition-all duration-300 hover:shadow-xl"
                    >
                      {/* Post Header: Avatar, Name, Date, Targeted Character */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#fdfaf6] border border-[#e0d0c0] flex items-center justify-center text-lg select-none">
                            {matchedCharObj?.avatar || "👤"}
                          </div>
                          <div>
                            <h4 className="font-serif font-black text-xs md:text-sm text-[#4a3e3d] flex items-center gap-1.5">
                              <span>{post.author}</span>
                              <span className="px-1.5 py-0.5 rounded bg-[#dfb074]/10 border border-[#dfb074]/20 text-[8px] font-mono text-[#dfb074] uppercase tracking-wider">{post.category}</span>
                            </h4>
                            <p className="text-[10px] text-[#4a3e3d]/60 mt-0.5">{post.date || (post.createdAt ? new Date(post.createdAt).toLocaleDateString("vi-VN") : "Hôm nay")}</p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                          {/* Targeted Character pill */}
                          <div className="px-3 py-1 bg-[#fdfaf6] border border-[#e0d0c0] rounded-full text-[10px] font-bold text-[#4a3e3d]/80 flex items-center gap-1 font-serif select-none">
                            <span>Gửi:</span>
                            <span className="text-[#dfb074] font-black">{post.character}</span>
                          </div>

                          {/* Delete Button (only if owned) */}
                          {currentUser && currentUser.uid === post.userId && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePost(post.id, post.userId);
                              }}
                              className="font-serif text-[10px] tracking-widest text-red-500/60 bg-transparent pb-0.5 border-b border-red-500/10 hover:border-red-500/50 hover:text-red-400 uppercase transition-all duration-300 cursor-pointer flex items-center gap-1"
                              title="Xoá bài viết"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                              <span>Xoá</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Post Body: Title and Content excerpt */}
                      <div className="flex flex-col gap-1.5">
                        <h3 className="font-serif font-black text-sm md:text-base text-[#4a3e3d] tracking-wide hover:text-[#dfb074] transition cursor-pointer" onClick={() => setReadPostModalContent(post)}>
                          {post.title}
                        </h3>
                        <p className="text-xs md:text-sm text-[#4a3e3d]/80 leading-relaxed font-serif italic line-clamp-3">
                          {post.content}
                        </p>

                        {/* Image Attachment */}
                        {post.image_url && (
                          <div className="mt-1 mb-2 rounded-xl overflow-hidden border border-[#e0d0c0]/50 shadow-inner max-h-72 w-full flex items-center justify-center bg-[#fdfaf6]">
                            <img
                              src={post.image_url}
                              alt={post.title}
                              referrerPolicy="no-referrer"
                              className="w-full max-h-72 object-cover hover:scale-[1.02] transition-transform duration-300 rounded-xl cursor-pointer"
                              onClick={() => setReadPostModalContent(post)}
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}

                        {/* Background Music Player */}
                        {post.audio_url && (
                          <div className="flex items-center gap-2 mt-1 self-start p-1.5 px-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleBlogAudio(post.id, post.audio_url);
                              }}
                              className="flex items-center gap-2 font-serif text-[10px] tracking-widest text-[#dfb074] bg-transparent pb-0.5 border-b border-[#dfb074]/20 hover:border-[#dfb074] transition-all duration-300 cursor-pointer"
                            >
                              {playingAudioId === post.id ? (
                                <>
                                  <Pause className="w-3 h-3 text-[#dfb074] animate-pulse" />
                                  <span>TẠM DỪNG NHẠC</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-3 h-3 text-[#dfb074]/80" />
                                  <span>PHÁT NHẠC NỀN</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Post Footer: Reaction buttons, Comment buttons and Read More */}
                      <div className="flex items-center justify-between border-t border-[#e0d0c0] pt-3 mt-1">
                        <div className="flex items-center gap-2">
                          {/* Heart reaction button */}
                          {(() => {
                            const isReacted = !!(currentUser && post.reactedUsers && post.reactedUsers.includes(currentUser.uid));
                            return (
                              <button
                                onClick={() => handleLikeClick(post)}
                                className={`flex items-center gap-1.5 font-serif text-[10px] tracking-widest pb-0.5 border-b transition-all duration-300 cursor-pointer uppercase ${
                                  isReacted
                                    ? "text-pink-400 border-pink-500/50"
                                    : "text-[#4a3e3d]/50 border-[#4a3e3d]/10 hover:text-pink-500/80 hover:border-pink-500/30"
                                }}`}
                              >
                                <Heart className={`w-3 h-3 ${isReacted ? "fill-pink-500 text-pink-500" : ""}`} />
                                <span>{post.reactions || 0} REACTION</span>
                              </button>
                            );
                          })()}

                          {/* Comment Button */}
                          {(() => {
                            const commentsCount = postComments[post.id]?.length || 0;
                            const isExpanded = expandedCommentsPostId === post.id;
                            return (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedCommentsPostId(isExpanded ? null : post.id);
                                }}
                                className={`flex items-center gap-1.5 font-serif text-[10px] tracking-widest pb-0.5 border-b transition-all duration-300 cursor-pointer uppercase ${
                                  isExpanded
                                    ? "text-[#dfb074] border-[#dfb074]/60"
                                    : "text-[#4a3e3d]/50 border-[#4a3e3d]/10 hover:text-[#dfb074]/80 hover:border-[#dfb074]/30"
                                }}`}
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>BÌNH LUẬN ({commentsCount})</span>
                              </button>
                            );
                          })()}
                        </div>

                        {/* ĐỌC TIẾP Button */}
                        <button
                          onClick={() => {
                            playClickSound(500, 0.08);
                            setReadPostModalContent(post);
                          }}
                          className="px-4 py-1.5 rounded-xl border border-[#dfb074]/30 text-[#dfb074] font-serif text-[10px] font-black uppercase tracking-widest hover:bg-[#dfb074] hover:text-white transition duration-150 cursor-pointer"
                        >
                          Đọc tiếp
                        </button>
                      </div>

                      {/* Comments Section */}
                      {expandedCommentsPostId === post.id && (
                        <div className="border-t border-[#e0d0c0] pt-4 mt-2 flex flex-col gap-3">
                          <h5 className="font-serif font-bold text-xs text-[#4a3e3d]/70 flex items-center gap-1.5">
                            <span>Danh sách bình luận</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          </h5>

                          {/* Comments List */}
                          <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1">
                            {postComments[post.id] && postComments[post.id].length > 0 ? (
                              postComments[post.id].map((comm) => (
                                <div key={comm.id} className="p-2.5 rounded-xl bg-[#fdfaf6] border border-[#e0d0c0]/50 flex flex-col gap-1">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold font-serif text-[#4a3e3d]">
                                      {comm.author}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[9px] text-[#4a3e3d]/50">
                                        {new Date(comm.createdAt).toLocaleString("vi-VN", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          day: "2-digit",
                                          month: "2-digit"
                                        })}
                                      </span>
                                      {currentUser && currentUser.uid === comm.userId && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteComment(post.id, comm.id);
                                          }}
                                          className="text-red-500/50 hover:text-red-400 transition-all duration-300 cursor-pointer"
                                          title="Xoá bình luận"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-xs text-[#4a3e3d]/90 leading-relaxed">
                                    {comm.content}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs italic text-[#4a3e3d]/40 py-2 text-center">Chưa có bình luận nào. Hãy là người đầu tiên để lại ý kiến! ✨</p>
                            )}
                          </div>

                          {/* Add Comment Form */}
                          {currentUser ? (
                            <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-[#e0d0c0]">
                              {/* Row 1: Nickname input */}
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-[#4a3e3d]/60 font-serif whitespace-nowrap">Biệt danh:</span>
                                <input
                                  type="text"
                                  placeholder="Người ẩn danh..."
                                  value={commentInputs[post.id]?.author || ""}
                                  onChange={(e) => {
                                    setCommentInputs(prev => ({
                                      ...prev,
                                      [post.id]: {
                                        author: e.target.value,
                                        content: prev[post.id]?.content || ""
                                      }
                                    }));
                                  }}
                                  className="bg-[#fdfaf6] border border-[#e0d0c0] rounded-lg px-2 py-1 text-[10px] text-[#4a3e3d] focus:outline-none focus:border-[#dfb074] w-full"
                                />
                              </div>

                              {/* Row 2: Textarea input and submit button */}
                              <div className="flex gap-2 items-end">
                                <textarea
                                  placeholder="Viết bình luận của bạn..."
                                  value={commentInputs[post.id]?.content || ""}
                                  rows={1}
                                  onChange={(e) => {
                                    setCommentInputs(prev => ({
                                      ...prev,
                                      [post.id]: {
                                        author: prev[post.id]?.author || "",
                                        content: e.target.value
                                      }
                                    }));
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handlePostComment(post.id);
                                    }
                                  }}
                                  className="flex-1 px-3 py-1.5 bg-[#fdfaf6] border border-[#e0d0c0] rounded-xl text-base text-[#4a3e3d] placeholder:text-[#4a3e3d]/40 focus:outline-none focus:border-[#dfb074]/50 resize-none max-h-24"
                                />
                                <button
                                  type="button"
                                  disabled={submittingCommentPostId === post.id}
                                  onClick={() => handlePostComment(post.id)}
                                  className="p-2 rounded-xl bg-gradient-to-r from-[#c5965a] to-[#dfb074] hover:brightness-110 text-white shadow-md disabled:opacity-50 transition cursor-pointer flex items-center justify-center min-w-[36px]"
                                >
                                  {submittingCommentPostId === post.id ? (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                  ) : (
                                    <Send className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-xl bg-[#fdfaf6] border border-dashed border-[#e0d0c0] text-center">
                              <p className="text-[11px] text-[#4a3e3d]/50">
                                Vui lòng đăng nhập ở đầu trang để viết bình luận! 💬
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  </div>

      {/* Write New Post Modal */}
      <AnimatePresence>
        {isNewPostModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
              onClick={() => {
                playClickSound(300, 0.08);
                setIsNewPostModalOpen(false);
              }}
            />
            
            {/* Pannel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-black/30 backdrop-blur-md p-6 md:p-8 shadow-2xl z-10 text-left flex flex-col gap-5 max-h-[90vh] overflow-y-auto no-scrollbar"
              style={{
                backgroundImage: "url('https://i.pinimg.com/1200x/79/63/31/7963318b3e76fd8b3e9281c58ab51fd2.jpg')"
              }}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl animate-pulse">🌸</span>
                  <h3 className="font-serif font-black text-base md:text-lg text-[#FFE79A] tracking-wider uppercase">
                    VIẾT TÂM SỰ MỚI
                  </h3>
                </div>
                <button
                  onClick={() => {
                    playClickSound(300, 0.08);
                    setIsNewPostModalOpen(false);
                  }}
                  className="p-1.5 rounded-full text-slate-400 hover:text-white cursor-pointer hover:bg-white/5 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form entries */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Author Nickname */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Bút danh / Biệt danh:</label>
                    <input
                      type="text"
                      value={newPostAuthor}
                      onChange={(e) => setNewPostAuthor(e.target.value)}
                      placeholder="Người ẩn danh (để trống)"
                      className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-base text-amber-100 focus:outline-none focus:ring-1 focus:ring-[#dfb074] transition"
                    />
                  </div>

                  {/* Character selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Gửi tới nhân vật:</label>
                    <select
                      value={newPostCharacter}
                      onChange={(e) => setNewPostCharacter(e.target.value)}
                      className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-base text-amber-100 focus:outline-none focus:ring-1 focus:ring-[#dfb074] transition cursor-pointer"
                    >
                      {CHARACTERS.map((char) => (
                        <option key={char.id} value={char.name}>{char.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title of the entry */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tiêu đề tâm sự:</label>
                    <input
                      type="text"
                      required
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      placeholder="Hôm nay trời đổ cơn mưa..."
                      className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-base text-amber-100 focus:outline-none focus:ring-1 focus:ring-[#dfb074] transition"
                    />
                  </div>

                  {/* Category select */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Lưu trữ chuyên mục:</label>
                    <div className="flex gap-1.5 p-1 bg-slate-900 rounded-xl border border-white/10 h-full items-center">
                      {(["BLOG", "DIARY", "TÂM SỰ"] as const).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            playClickSound(400, 0.05);
                            setNewPostCategory(cat);
                          }}
                          className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold tracking-wider transition uppercase cursor-pointer ${
                            newPostCategory === cat
                              ? "bg-[#c5965a] text-white"
                              : "text-slate-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {cat === "BLOG" ? "Gửi Người Tình" : cat === "DIARY" ? "Nhật Ký" : "Lời Chưa Nói"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Content body input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Nội dung câu chuyện:</label>
                  <textarea
                    required
                    rows={6}
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Hãy viết ra mọi điều lồng ngực đang ấp ủ tại đây..."
                    className="bg-slate-900 border border-white/10 rounded-xl px-3.5 py-3 text-base text-amber-100 focus:outline-none focus:ring-1 focus:ring-[#dfb074] transition custom-scrollbar leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Image link */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Đính kèm ảnh (Dán link ảnh):</label>
                    <input
                      type="text"
                      value={newPostImageUrl}
                      onChange={(e) => setNewPostImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-base text-amber-100 focus:outline-none focus:ring-1 focus:ring-[#dfb074] transition"
                    />
                  </div>

                  {/* Audio link */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Nhạc nền (Dán link nhạc .mp3):</label>
                    <input
                      type="text"
                      value={newPostAudioUrl}
                      onChange={(e) => setNewPostAudioUrl(e.target.value)}
                      placeholder="https://example.com/audio.mp3"
                      className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-base text-amber-100 focus:outline-none focus:ring-1 focus:ring-[#dfb074] transition"
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  onClick={() => {
                    playClickSound(300, 0.08);
                    setIsNewPostModalOpen(false);
                  }}
                  className="px-4 py-2 border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={async () => {
                    if (!currentUser) {
                      playClickSound(200, 0.15);
                      alert("Vui lòng đăng nhập trước khi đăng bài nhé! 🔒");
                      return;
                    }
                    if (!newPostTitle.trim() || !newPostContent.trim()) {
                      playClickSound(200, 0.15);
                      alert("Vui lòng điền đầy đủ tiêu đề và nội dung bài viết!");
                      return;
                    }
                    playClickSound(1100, 0.1);
                    const newId = `post-${Date.now()}`;
                    // Enforce "Khách vãng lai" or "Người ẩn danh" default for absolute privacy
                    const postAuthor = newPostAuthor.trim() || "Người ẩn danh";
                    
                    try {
                      await createBlogPost({
                        id: newId,
                        author: postAuthor,
                        content: newPostContent.trim(),
                        userId: currentUser.uid,
                        title: newPostTitle.trim(),
                        character: newPostCharacter,
                        category: newPostCategory,
                        image_url: newPostImageUrl.trim(),
                        audio_url: newPostAudioUrl.trim()
                      });
                      
                      // Reload from Firestore
                      await loadBlogPosts(blogActiveTab);
                      
                      // Clear inputs
                      setNewPostTitle("");
                      setNewPostContent("");
                      setNewPostAuthor("");
                      setNewPostImageUrl("");
                      setNewPostAudioUrl("");
                      setIsNewPostModalOpen(false);
                    } catch (error) {
                      console.error("Failed to create blog post:", error);
                      alert("Có lỗi xảy ra khi lưu bài viết lên cơ sở dữ liệu. Vui lòng thử lại!");
                    }
                  }}
                  className="px-5 py-2.5 bg-[#dfb074] hover:brightness-110 text-white font-bold rounded-xl shadow-lg text-xs uppercase tracking-wider cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Đăng ngay</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Read Blog Post Modal */}
      <AnimatePresence>
        {readPostModalContent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
              onClick={() => {
                playClickSound(300, 0.08);
                setReadPostModalContent(null);
              }}
            />
            
            {/* Main view plaque */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-black/30 backdrop-blur-md p-6 md:p-8 shadow-2xl z-10 text-left flex flex-col gap-5 max-h-[85vh] overflow-y-auto no-scrollbar"
              style={{
                backgroundImage: "url('https://www.transparenttextures.com/patterns/dark-paths.png')"
              }}
            >
              {/* Header details */}
              <div className="flex flex-col gap-2.5 border-b border-white/10 pb-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl select-none">💌</span>
                    <div>
                      <h4 className="font-serif font-black text-sm text-amber-100 flex items-center gap-2">
                        <span>{readPostModalContent.author}</span>
                        <span className="px-1.5 py-0.5 rounded bg-[#dfb074]/10 border border-[#dfb074]/20 text-[8px] font-mono text-[#dfb074] uppercase tracking-wider">{readPostModalContent.category}</span>
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{readPostModalContent.date || (readPostModalContent.createdAt ? new Date(readPostModalContent.createdAt).toLocaleDateString("vi-VN") : "Hôm nay")}</p>
                    </div>
                  </div>
                  
                  {/* Close button */}
                  <button
                    onClick={() => {
                      playClickSound(300, 0.08);
                      setReadPostModalContent(null);
                    }}
                    className="p-1.5 rounded-full text-slate-400 hover:text-white cursor-pointer hover:bg-white/5 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-amber-100/80 flex items-center gap-1 font-serif select-none">
                    <span>Gửi nhân vật:</span>
                    <span className="text-[#dfb074] font-black">{readPostModalContent.character}</span>
                  </div>
                </div>
              </div>

              {/* Title & Body */}
              <div className="flex flex-col gap-4">
                <h2 className="font-serif font-black text-lg md:text-xl text-[#FFE79A] tracking-wide leading-snug">
                  {readPostModalContent.title}
                </h2>
                <div className="text-sm md:text-base text-amber-100/90 font-serif italic leading-relaxed whitespace-pre-wrap selection:bg-[#dfb074]/20">
                  {readPostModalContent.content}
                </div>

                {/* Full View Image Attachment */}
                {readPostModalContent.image_url && (
                  <div className="mt-2 rounded-2xl overflow-hidden border border-white/10 shadow-lg w-full flex justify-center bg-slate-900/50 max-h-[400px]">
                    <img
                      src={readPostModalContent.image_url}
                      alt={readPostModalContent.title}
                      referrerPolicy="no-referrer"
                      className="w-full max-h-[400px] object-contain rounded-2xl"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Full View Background Music Player */}
                {readPostModalContent.audio_url && (
                  <div className="flex items-center gap-2 mt-2 self-start p-2 px-4 rounded-xl bg-slate-900 border border-white/10 shadow-inner">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBlogAudio(readPostModalContent.id, readPostModalContent.audio_url);
                      }}
                      className="flex items-center gap-2 text-xs font-serif font-bold text-amber-100 hover:text-[#dfb074] cursor-pointer transition active:scale-95"
                    >
                      {playingAudioId === readPostModalContent.id ? (
                        <>
                          <Pause className="w-4 h-4 text-[#dfb074] animate-pulse" />
                          <span>⏸ Tạm dừng nhạc nền của thư</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 text-emerald-400" />
                          <span>🔊 Bật nhạc nền cho thư</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Footer reactions */}
              <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-2">
                {(() => {
                  const isReacted = !!(currentUser && readPostModalContent.reactedUsers && readPostModalContent.reactedUsers.includes(currentUser.uid));
                  return (
                    <button
                      onClick={() => handleLikeClick(readPostModalContent)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full border transition duration-150 text-xs font-semibold cursor-pointer ${
                        isReacted
                          ? "bg-pink-600/10 border-pink-500/30 text-pink-400"
                          : "bg-white/5 border-white/5 text-slate-400 hover:text-pink-400 hover:bg-pink-500/5"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isReacted ? "fill-pink-500 text-pink-500 animate-heart-beat" : ""}`} />
                      <span>{readPostModalContent.reactions || 0} Reaction</span>
                    </button>
                  );
                })()}

                <button
                  onClick={() => {
                    playClickSound(300, 0.08);
                    setReadPostModalContent(null);
                  }}
                  className="px-5 py-2 bg-slate-900 border border-white/10 text-amber-100 font-serif text-xs font-bold rounded-xl cursor-pointer hover:bg-white/5 transition"
                >
                  Đóng thư
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal for Gallery Images */}
      <AnimatePresence>
        {activeLightboxImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
              onClick={() => {
                playClickSound(300, 0.08);
                setActiveLightboxImage(null);
              }}
            />
            
            {/* Main Lightbox Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center z-10 text-center"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  playClickSound(300, 0.08);
                  setActiveLightboxImage(null);
                }}
                className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white cursor-pointer hover:bg-white/10 rounded-full transition"
              >
                <X className="w-8 h-8" />
              </button>

              {/* Enlarged Image */}
              <div className="rounded-2xl overflow-hidden shadow-2xl bg-black/30 backdrop-blur-md border border-white/10 flex max-h-[75vh] max-w-full justify-center items-center">
                <img
                  src={activeLightboxImage.image_url}
                  alt={activeLightboxImage.title}
                  referrerPolicy="no-referrer"
                  className="max-h-[75vh] object-contain"
                />
              </div>

              {/* Title and Author Info below */}
              <div className="mt-4 text-center">
                <h3 className="font-serif font-black text-amber-100 text-lg tracking-wide">
                  {activeLightboxImage.title}
                </h3>
                <p className="text-xs font-mono text-[#dfb074] uppercase tracking-widest mt-1">
                  Bởi {activeLightboxImage.author.split('@')[0]}
                </p>
                {activeLightboxImage.description && (
                  <p className="text-sm text-amber-100/80 font-serif italic mt-3 max-w-xl mx-auto leading-relaxed whitespace-pre-wrap">
                    {activeLightboxImage.description}
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Custom Login Warning Toast */}
        {showLoginWarning && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-8 z-[10000] max-w-xs md:max-w-sm"
          >
            <div className="bg-slate-900 border border-[#dfb074]/50 shadow-[0_0_20px_rgba(223,176,116,0.3)] rounded-2xl p-4 flex items-start gap-3">
              <div className="bg-[#dfb074]/20 p-2 rounded-xl shrink-0">
                <AlertCircle className="w-5 h-5 text-[#dfb074]" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-amber-100 font-medium leading-relaxed">
                  Bạn phải đăng nhập mới đăng được bài nhé! Hãy bấm nút <span className="text-[#dfb074] font-bold uppercase">Đăng nhập</span> ở góc trên bên phải nha! 😉
                </p>
              </div>
              <button 
                onClick={() => setShowLoginWarning(false)}
                className="text-slate-500 hover:text-white transition p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Global Action Buttons moved to end for highest priority */}
      {isBlogOpen && (
        <>
          {/* Create Post button */}
          {!showWriteForm && (
            <button
              onClick={() => {
                playClickSound(450, 0.08);
                if (!currentUser) {
                  setShowLoginWarning(true);
                  setTimeout(() => setShowLoginWarning(false), 4000);
                  return;
                }
                setShowWriteForm(true);
                if (blogActiveTab !== "GALLERY") {
                  setNewPostCategory(blogActiveTab);
                }
              }}
              className="fixed bottom-8 right-8 z-[9999] font-serif tracking-[0.15em] text-xs font-bold text-[#dfb074] bg-[#4a3e3d] border border-[#dfb074]/80 rounded-md px-6 py-3 uppercase shadow-lg shadow-black/40 transition-all duration-300 hover:bg-[#5c4d4c] hover:scale-105 hover:shadow-[0_0_20px_rgba(223,176,116,0.4)] cursor-pointer flex items-center gap-2 focus:outline-none"
            >
              <span>✍️ ĐĂNG BÀI MỚI</span>
            </button>
          )}
        </>
      )}
    </>
  );
}
