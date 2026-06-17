import React, { useState, useEffect } from "react";
import { StyleOption, RewriteResult, FavoriteItem, ToastMessage } from "./types";
import { STYLES_DATA } from "./stylesData";
import DecorativeParticles from "./components/DecorativeParticles";
import TypingText from "./components/TypingText";
import ToastContainer from "./components/Toast";
import FavoritesPanel from "./components/FavoritesPanel";
import {
  Heart,
  Sparkles,
  Copy,
  RotateCcw,
  Sun,
  Moon,
  Share2,
  Trash2,
  Bookmark,
  Shuffle,
  ChevronRight,
  Clipboard,
  Eraser,
  HeartCrack,
  PenTool,
  Send,
  MessageCircle,
  LayoutGrid,
} from "lucide-react";

const SUGGESTED_PROMPTS = [
  "I miss you so much.",
  "I'm sorry I forgot to call you last night.",
  "Goodnight sweetie, sleep tight.",
  "Happy 1st anniversary to us!",
  "Are you free to grab coffee today?",
];

const LOADING_MESSAGES = [
  "Dipping our quill in pink romantic ink...",
  "Whispering sweet syllables to the stars...",
  "Consulting Cupid's secret guidelines...",
  "Weaving your feelings into golden phrases...",
  "Rhyming your thoughts to the beat of love...",
];

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("heartwords_theme");
    return saved === "dark";
  });

  // Data states
  const [originalText, setOriginalText] = useState<string>("");
  const [selectedStyle, setSelectedStyle] = useState<StyleOption>(STYLES_DATA[0]);
  const [results, setResults] = useState<RewriteResult[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationKey, setGenerationKey] = useState<number>(0); // helps resetting typing components
  const [loadingMsgIdx, setLoadingMsgIdx] = useState<number>(0);

  // Persistence states
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    const saved = localStorage.getItem("heartwords_favorites");
    return saved ? JSON.parse(saved) : [];
  });
  const [isFavoritesOpen, setIsFavoritesOpen] = useState<boolean>(false);

  // Interactivity states
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toggle dark mode classes on root element
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("heartwords_theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("heartwords_theme", "light");
    }
  }, [isDarkMode]);

  // Sync favorites with local storage
  useEffect(() => {
    localStorage.setItem("heartwords_favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Loop through cute loading messages when active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setLoadingMsgIdx(0);
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Toast notifications helpers
  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    const newToast: ToastMessage = {
      id: Date.now().toString(),
      message,
      type,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Clipboard copy helper
  const copyToClipboard = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => showToast("Copied safely to clipboard! 💕", "success"))
        .catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  };

  const fallbackCopy = (text: string) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.top = "0";
      textArea.style.left = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      showToast("Copied safely to clipboard! 💕", "success");
    } catch (err) {
      showToast("Failed to copy. Please select and copy manually.", "error");
    }
  };

  // Paste from clipboard helper
  const handlePaste = async () => {
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setOriginalText((prev) => (prev + " " + text).trim().substring(0, 500));
          showToast("Pasted successfully! 📋", "info");
        } else {
          showToast("No content found on clipboard.", "info");
        }
      } else {
        showToast("Clipboard pasting not fully supported in this viewport mode.", "error");
      }
    } catch (err) {
      showToast("Please tap to typed message or paste using Ctrl+V / Cmd+V.", "info");
    }
  };

  // Clear original text field
  const handleClear = () => {
    setOriginalText("");
    showToast("Cleared original message. Let's make an update!", "info");
  };

  // Quick prompt filler
  const handleUsePrompt = (prompt: string) => {
    setOriginalText(prompt);
    showToast(`Loaded suggestion: "${prompt}"`, "success");
  };

  // Shuffle prompts to get random one
  const handleShufflePrompt = () => {
    const idx = Math.floor(Math.random() * SUGGESTED_PROMPTS.length);
    setOriginalText(SUGGESTED_PROMPTS[idx]);
    showToast("Loaded a random idea of love! 🎲", "success");
  };

  // Generate rewrites from Backend API
  const handleGenerate = async () => {
    if (!originalText.trim()) {
      showToast("Please fill in a message before generating. 🌸", "error");
      return;
    }

    setIsGenerating(true);
    setResults([]);

    try {
      const response = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: originalText,
          style: selectedStyle.id,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "An unexpected issue occurred inside core model servers.");
      }

      setResults(data.results);
      setGenerationKey((prev) => prev + 1);
      showToast("Successfully generated three beautiful variations! ✨", "success");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to contact Gemini. Is your API key configured?", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle items on Favorite list
  const handleToggleFavorite = (rewrittenText: string, vibe: string) => {
    const exists = favorites.find((f) => f.rewrittenText === rewrittenText);

    if (exists) {
      setFavorites((prev) => prev.filter((f) => f.rewrittenText !== rewrittenText));
      showToast("Removed from Saved Collection.", "info");
    } else {
      const newItem: FavoriteItem = {
        id: Date.now().toString(),
        originalText: originalText,
        rewrittenText,
        styleId: selectedStyle.id,
        vibe,
        timestamp: new Date().toLocaleDateString(),
      };
      setFavorites((prev) => [...prev, newItem]);
      showToast("Saved into your Saved Collection! ❤️", "success");
    }
  };

  // Shared trigger
  const handleShare = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Message shared via HeartWords AI",
          text: text,
        });
        showToast("Successfully triggered sharing dialog!", "success");
      } catch (err) {
        copyToClipboard(text);
      }
    } else {
      copyToClipboard(text);
      showToast("No direct Web Share support. Copied message for easy forwarding! 📲", "info");
    }
  };

  // Check if text is currently on favorites
  const isFavorited = (text: string) => {
    return favorites.some((f) => f.rewrittenText === text);
  };

  return (
    <div className="min-h-screen relative flex flex-col transition-colors duration-500 bg-[#FFF5F8] dark:bg-[#110D12] text-[#2D2D2D] dark:text-slate-100 lg:border-8 border-white dark:border-[#1E1920] selection:bg-[#FF4D8D]/20 selection:text-[#FF4D8D]">
      
      {/* Decorative Particles tailored for high-end Editorial background */}
      <DecorativeParticles />

      {/* Subtle decorative glow overlays */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-[#FF4D8D]/10 dark:bg-pink-900/5 rounded-full filter blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-[#8B5CF6]/15 dark:bg-purple-950/5 rounded-full filter blur-3xl pointer-events-none z-0" />

      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-[#1A151C]/75 border-b border-[#FF4D8D]/10 dark:border-pink-500/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
          
          {/* Logo element matching Editorial guidelines */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF4D8D] to-[#8B5CF6] flex items-center justify-center">
              <span className="text-white text-xs font-bold font-serif italic">H</span>
            </div>
            <span className="text-lg font-semibold tracking-tight text-[#FF4D8D]">
              HeartWords <span className="font-light text-[#8B5CF6]">AI</span>
            </span>
          </div>

          {/* Quick Nav simulation of Editorial concept */}
          <nav className="hidden md:flex gap-8 text-[11px] font-medium uppercase tracking-[0.2em] select-none text-slate-500 dark:text-slate-400">
            <a href="#rewriter" className="text-[#FF4D8D] transition-colors font-bold">Rewrite</a>
            <button onClick={() => setIsFavoritesOpen(true)} className="hover:text-[#FF4D8D] transition-colors">History</button>
            <span className="opacity-30">Shayari</span>
            <span className="opacity-30">About</span>
          </nav>

          {/* Action Row */}
          <div className="flex items-center gap-3">
            {/* Saved drawer trigger */}
            <button
              onClick={() => setIsFavoritesOpen(true)}
              className="relative p-2 rounded-full border border-[#FF4D8D]/10 hover:border-pink-500/20 bg-white/60 dark:bg-slate-900/40 text-[#FF4D8D] hover:bg-[#FFF5F8] dark:hover:bg-pink-950/20 transition-all flex items-center gap-2 text-xs font-semibold"
              title="Open saved bookmarks"
            >
              <Heart className="w-4 h-4 text-[#FF4D8D] fill-[#FF4D8D]/20 animate-pulse" />
              {favorites.length > 0 && (
                <span className="bg-[#FF4D8D] text-white font-bold text-[9px] w-5 h-5 rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Dark Mode toggle */}
            <button
              onClick={() => setIsDarkMode((prev) => !prev)}
              className="p-2 rounded-full border border-slate-200/50 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* CORE WRAPPERS */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-8 py-10 relative z-10 flex flex-col gap-10">
        
        {/* WORKSPACE AREA - Split layout style of Editorial blueprint */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* L.H.S: TEXT INPUT AREA (5 Cols) - Editorial theme */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="flex flex-col h-full justify-between">
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif italic tracking-tight leading-none mb-4 text-[#1F1F1F] dark:text-white">
                  Elegance in <br />
                  <span className="text-[#FF4D8D]">Every Word.</span>
                </h1>
                
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-[340px] leading-relaxed">
                  Transform simple messages into refined, poetic expressions of love and emotion with our AI engine.
                </p>

                {/* Main Textarea enclosing glass-card block */}
                <div className="relative group flex-1">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#FF4D8D] to-[#8B5CF6] rounded-2xl blur opacity-5 group-focus-within:opacity-15 transition" />
                  
                  <div className="relative bg-white dark:bg-[#1C161E]/80 rounded-2xl border border-[#FF4D8D]/10 dark:border-slate-800/80 shadow-sm flex flex-col">
                    <textarea
                      value={originalText}
                      onChange={(e) => setOriginalText(e.target.value.substring(0, 500))}
                      placeholder="Type or paste your message here... (e.g., 'I miss you' or select a fast starter template below)"
                      className="w-full h-48 p-5 text-base sm:text-lg font-light bg-transparent focus:outline-none resize-none placeholder:text-slate-300 dark:placeholder:text-slate-600 text-slate-700 dark:text-slate-200 scrollbar-custom"
                    />
                    
                    <div className="p-4 flex items-center justify-between border-t border-slate-50 dark:border-slate-900">
                      <span className="text-[10px] uppercase tracking-tighter text-slate-400 font-bold font-mono">
                        {originalText.length} / 500 characters
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={handleShufflePrompt}
                          className="p-1 px-2.5 text-[9px] uppercase font-bold tracking-widest text-slate-400 hover:text-[#FF4D8D] border border-slate-100 dark:border-slate-800 rounded-md transition-colors"
                          title="Generate a random concept"
                        >
                          Idea
                        </button>
                        <button
                          onClick={handleClear}
                          disabled={!originalText}
                          className="p-1 px-2.5 text-[9px] uppercase font-bold tracking-widest text-[#FF4D8D] hover:text-[#8B5CF6] dark:text-[#EC4899] border border-slate-100 dark:border-slate-800 rounded-md transition-colors disabled:opacity-40 disabled:pointer-events-none"
                        >
                          Clear
                        </button>
                        <button
                          onClick={handlePaste}
                          className="p-1 px-2.5 text-[9px] uppercase font-bold tracking-widest text-[#FF4D8D] bg-[#FFF5F8] dark:bg-pink-950/20 border border-[#FF4D8D]/20 rounded-md hover:brightness-95 transition-all"
                        >
                          Paste
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Starter template blocks for easy couple ideas */}
              <div className="mt-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8B5CF6] dark:text-purple-400 mb-2.5">
                  Need a spark? Try a message template:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_PROMPTS.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => handleUsePrompt(p)}
                      className="text-left text-xs bg-white/40 dark:bg-slate-900/10 hover:bg-[#FFF5F8] dark:hover:bg-purple-950/20 border border-slate-200/40 dark:border-slate-800/20 hover:border-[#FF4D8D]/30 text-slate-600 dark:text-slate-400 hover:text-[#FF4D8D] py-1.5 px-3 rounded-xl transition-all max-w-full truncate font-serif italic"
                    >
                      "{p}"
                    </button>
                  ))}
                </div>
              </div>

              {/* GENERATION TRIGGER */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !originalText.trim()}
                className={`mt-8 w-full py-4 rounded-xl font-bold uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 relative overflow-hidden ${
                  originalText.trim()
                    ? "bg-[#FF4D8D] text-white shadow-[#FF4D8D]/20 hover:brightness-105 active:scale-[0.99] cursor-pointer"
                    : "bg-slate-200 dark:bg-[#1E1920] text-slate-400 cursor-not-allowed shadow-none border border-slate-200/50 dark:border-slate-800/80"
                }`}
              >
                {isGenerating ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5.5 h-5.5 rounded-full border-2 border-white/50 border-t-white animate-spin" />
                    <span className="animate-pulse tracking-wide font-medium">{LOADING_MESSAGES[loadingMsgIdx]}</span>
                  </div>
                ) : (
                  <>
                    <span>Generate Magic ✨</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* R.H.S: STYLE SELECTOR & REFINED OUTPUTS (7 Cols) */}
          <div className="lg:col-span-7 space-y-8 bg-white dark:bg-[#181219] p-6 sm:p-8 rounded-2xl border border-[#FF4D8D]/10 dark:border-slate-800/60 shadow-sm">
            
            {/* Header for selector */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#8B5CF6] dark:text-[#A78BFA] mb-4">
                Select Your Vibe
              </h2>
              
              {/* Responsive Grid of Style Selectors */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[220px] overflow-y-auto pr-1 scrollbar-custom">
                {STYLES_DATA.map((style) => {
                  const isActive = selectedStyle.id === style.id;
                  return (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style)}
                      className={`p-3 flex flex-col items-center gap-1.5 rounded-xl border transition-all duration-300 text-center select-none ${
                        isActive
                          ? "border-2 border-[#FF4D8D] bg-[#FFF5F8] dark:bg-pink-950/20 text-[#FF4D8D] font-bold"
                          : "border-slate-100 dark:border-slate-900 hover:border-[#FF4D8D]/30 hover:bg-slate-50 dark:hover:bg-[#1F1920] transition group bg-transparent text-slate-400"
                      }`}
                    >
                      <span className="text-xl">{style.icon}</span>
                      <span className={`text-[10px] uppercase font-bold tracking-wider ${isActive ? "text-[#FF4D8D] dark:text-pink-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`}>
                        {style.name === "Deep Emotional" ? "Deep" : style.name === "Good Morning" ? "Morning" : style.name === "Good Night" ? "Night" : style.name === "Long Distance" ? "LDR" : style.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* REFINED OUTPUTS AREA */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#8B5CF6] dark:text-[#A78BFA]">
                  Refined Versions
                </h2>
                {results.length > 0 && (
                  <button
                    onClick={handleGenerate}
                    className="text-[10px] uppercase font-bold tracking-widest text-[#FF4D8D] bg-[#FFF5F8] dark:bg-pink-950/10 px-2.5 py-1 rounded-md border border-[#FF4D8D]/10 hover:brightness-95 flex items-center gap-1.5 transition-all"
                  >
                    <RotateCcw className="w-3 h-3 animate-spin-slow" />
                    <span>Regenerate</span>
                  </button>
                )}
              </div>

              {/* Outputs box */}
              {isGenerating ? (
                <div className="p-12 text-center flex flex-col items-center justify-center bg-[#FFF5F8]/40 dark:bg-pink-950/10 border border-[#FF4D8D]/5 rounded-2xl min-h-[220px]">
                  <div className="w-12 h-12 bg-[#FFF5F8] dark:bg-[#1E1920] rounded-full flex items-center justify-center mb-3">
                    <Heart className="w-6 h-6 text-[#FF4D8D] fill-[#FF4D8D]/20 animate-pulse" />
                  </div>
                  <h3 className="text-sm font-bold tracking-wide text-slate-700 dark:text-slate-200">
                    Applying AI Poetic Finish...
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 animate-pulse italic">
                    {LOADING_MESSAGES[loadingMsgIdx]}
                  </p>
                </div>
              ) : results.length > 0 ? (
                <div className="flex flex-col gap-4 max-h-[460px] overflow-y-auto pr-1 scrollbar-custom">
                  {results.map((item, idx) => {
                    const isSaved = isFavorited(item.text);
                    const isPurpleTheme = idx === 1;

                    return (
                      <div
                        key={idx}
                        className={`p-6 rounded-2xl shadow-sm relative group transition-all border ${
                          isPurpleTheme
                            ? "bg-[#F8F7FF] dark:bg-[#12111E] border-[#8B5CF6]/10"
                            : "bg-gradient-to-br from-white to-[#FFF5F8] dark:from-[#110D12] dark:to-[#1A1118] border-[#FF4D8D]/10"
                        }`}
                      >
                        {/* Interactive floating control tools only visible on hover (transparent/faded by default) */}
                        <div className="absolute top-4 right-4 flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition duration-200 z-10">
                          <button
                            onClick={() => copyToClipboard(item.text)}
                            className="p-2 bg-white dark:bg-slate-900 text-slate-500 hover:text-[#FF4D8D] dark:hover:text-[#FF4D8D] rounded-full shadow-sm hover:scale-105 transition border border-slate-100 dark:border-slate-800"
                            title="Copy text"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            onClick={() => handleToggleFavorite(item.text, item.explanation)}
                            className={`p-2 bg-white dark:bg-slate-900 rounded-full shadow-sm hover:scale-105 transition border border-slate-100 dark:border-slate-800 ${
                              isSaved ? "text-[#FF4D8D]" : "text-slate-300 dark:text-slate-600 hover:text-rose-500"
                            }`}
                            title={isSaved ? "Saved" : "Save favorite"}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-[#FF4D8D]" : ""}`} />
                          </button>

                          <button
                            onClick={() => handleShare(item.text)}
                            className="p-2 bg-white dark:bg-slate-900 text-slate-300 dark:text-slate-600 hover:text-[#8B5CF6] hover:scale-105 rounded-full shadow-sm transition border border-slate-100 dark:border-slate-800"
                            title="Share/Forward"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Text explanation node */}
                        <div className="mb-2">
                          <span className="text-[9px] uppercase tracking-widest font-extrabold text-[#8B5CF6]/60 dark:text-[#A78BFA]/60">
                            ✨ {item.explanation || "Refined Option"}
                          </span>
                        </div>

                        {/* Text output using beautiful typeface matching template style */}
                        <div className="pr-12">
                          <TypingText
                            key={`${generationKey}-${idx}`}
                            text={item.text}
                            speed={8 + idx * 3}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Blank state card matching editorial look */
                <div className="p-8 text-center bg-[#FFF5F8]/30 dark:bg-pink-950/5 border border-dashed border-[#FF4D8D]/25 dark:border-pink-500/10 rounded-2xl py-12 flex flex-col items-center">
                  <span className="text-3xl mb-3 select-none">✏️</span>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 font-serif">
                    Waiting for your inspiration
                  </h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mt-1.5 leading-relaxed italic">
                    Type a plain concept or message on the left panel, choose your exact vibe, and click \"Generate Magic\" to begin.
                  </p>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* EDUCATIONAL BENTO GRID ROW */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-[#FF4D8D]/10 dark:border-slate-900">
          <div className="p-5 rounded-xl bg-white/40 dark:bg-purple-950/10 border border-[#FF4D8D]/5 flex gap-4">
            <span className="text-xl shrink-0 select-none">💌</span>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">14 Tailored Expressions</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                Choose between Apologies, Long Distance poetry, playfulness, celebration or morning wishes instantly.
              </p>
            </div>
          </div>
          <div className="p-5 rounded-xl bg-white/40 dark:bg-purple-950/10 border border-[#FF4D8D]/5 flex gap-4">
            <span className="text-xl shrink-0 select-none">🌹</span>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Shayari Mode</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                Draft raw inputs to Urdu/Hindi sher couplets featuring rich poetic subtext of genuine deep feeling.
              </p>
            </div>
          </div>
          <div className="p-5 rounded-xl bg-white/40 dark:bg-purple-950/10 border border-[#FF4D8D]/5 flex gap-4">
            <span className="text-xl shrink-0 select-none">🔒</span>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Local Validation</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                Your bookmarks are protected locally on your browser cache. We never track or compromise your feelings.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="mt-auto h-16 px-6 sm:px-8 border-t border-[#FF4D8D]/10 dark:border-slate-900 bg-white/40 dark:bg-[#1A151C]/40 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
        <div className="flex gap-4 sm:gap-8">
          <span>&copy; {new Date().getFullYear()} HeartWords AI</span>
          <span className="hidden sm:inline hover:text-[#FF4D8D] cursor-pointer">Privacy Policy</span>
          <span className="hidden sm:inline hover:text-[#FF4D8D] cursor-pointer">Terms of Service</span>
        </div>
        <div className="flex gap-4 sm:gap-6 items-center">
          <span className="text-[#FF4D8D]">Follow the love</span>
          <div className="flex gap-2">
            <div className="w-4 h-4 rounded bg-[#FF4D8D]/25" />
            <div className="w-4 h-4 rounded bg-[#8B5CF6]/25" />
            <div className="w-4 h-4 rounded bg-pink-500/20" />
          </div>
        </div>
      </footer>

      {/* PERSISTENT TOAST NOTIFICATIONS */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* SLIDE OUT FAVORITES SIDE PANEL */}
      <FavoritesPanel
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        onRemove={(id) => {
          setFavorites((prev) => prev.filter((f) => f.id !== id));
          showToast("Deleted item from Saved collections.", "info");
        }}
        onCopy={copyToClipboard}
      />
    </div>
  );
}
