import { useEffect, useState } from "react";

interface TypingTextProps {
  key?: string | number;
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export default function TypingText({ text, speed = 8, onComplete }: TypingTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let index = 0;
    setDisplayedText("");
    setIsFinished(false);

    if (!text) return;

    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
        setIsFinished(true);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  const handleSkip = () => {
    if (isFinished) return;
    setDisplayedText(text);
    setIsFinished(true);
    if (onComplete) onComplete();
  };

  return (
    <div 
      onClick={handleSkip} 
      className="cursor-pointer group relative font-sans leading-relaxed text-sm lg:text-base whitespace-pre-wrap select-text"
      title="Click to display full text instantly"
    >
      <p className="text-slate-700 dark:text-slate-200 transition-colors duration-200">
        {displayedText}
        {!isFinished && <span className="inline-block w-2 h-4 ml-1 bg-pink-500 animate-pulse" />}
      </p>

      {!isFinished && (
        <span className="absolute right-0 bottom-[-18px] opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-pink-500/80 uppercase tracking-widest leading-none">
          Click text to skip typing...
        </span>
      )}
    </div>
  );
}
