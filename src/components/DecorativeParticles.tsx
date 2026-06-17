import React, { useEffect, useState } from "react";

interface Particle {
  id: number;
  emoji: string;
  left: number;
  delay: number;
  duration: number;
  scale: number;
  drift: number;
  rotation: number;
  opacity: number;
}

export default function DecorativeParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const emojis = ["❤️", "💖", "✨", "🌺", "🌸", "💕"];
    const generated: Particle[] = Array.from({ length: 16 }).map((_, i) => {
      return {
        id: i,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        left: Math.random() * 100, // percentage
        delay: Math.random() * 12, // seconds delay
        duration: 10 + Math.random() * 12, // seconds travel
        scale: 0.5 + Math.random() * 0.8,
        drift: -50 + Math.random() * 100, // px drift
        rotation: 15 + Math.random() * 60,
        opacity: 0.15 + Math.random() * 0.2,
      };
    });
    setParticles(generated);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute bottom-0 text-xl select-none animate-floating"
          style={
            {
              left: `${p.left}%`,
              "--delay": `${p.delay}s`,
              "--duration": `${p.duration}s`,
              "--max-opacity": p.opacity,
              "--drift": `${p.drift}px`,
              "--rotation": `${p.rotation}deg`,
              transform: `scale(${p.scale})`,
            } as React.CSSProperties
          }
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
