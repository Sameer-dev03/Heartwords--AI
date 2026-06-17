import React from "react";
import { FavoriteItem } from "../types";
import { STYLES_DATA } from "../stylesData";
import { X, Copy, Trash2, Heart, MessageSquare } from "lucide-react";

interface FavoritesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: FavoriteItem[];
  onRemove: (id: string) => void;
  onCopy: (text: string) => void;
}

export default function FavoritesPanel({
  isOpen,
  onClose,
  favorites,
  onRemove,
  onCopy,
}: FavoritesPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10 md:pl-0">
        <div className="w-screen max-w-md bg-white/95 dark:bg-slate-950/95 border-l border-pink-500/10 dark:border-pink-500/5 backdrop-blur-xl shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500 fill-pink-500 animate-pulse" />
              <h2 className="text-xl font-bold font-display text-slate-800 dark:text-slate-100">
                Saved HeartWords
              </h2>
              <span className="bg-pink-100 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 text-xs font-bold px-2 py-0.5 rounded-full inline-block">
                {favorites.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List content */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-custom space-y-4">
            {favorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 bg-pink-50 dark:bg-pink-950/20 rounded-full flex items-center justify-center mb-4">
                  <Heart className="w-7 h-7 text-pink-400 dark:text-pink-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No love letters saved yet
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[240px] mt-1">
                  Click the heart icon on any generated rewrite to store your favorite couple messages here!
                </p>
              </div>
            ) : (
              favorites.map((fav) => {
                const styleObj = STYLES_DATA.find((s) => s.id === fav.styleId);

                return (
                  <div
                    key={fav.id}
                    className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-900 hover:border-pink-500/15 dark:hover:border-pink-500/10 transition-all flex flex-col gap-3 group relative"
                  >
                    {/* Meta section */}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-lg bg-pink-100/60 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400">
                        <span>{styleObj?.icon || "❤️"}</span>
                        <span>{styleObj?.name || fav.styleId}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {fav.vibe || "Smooth Vibe"}
                      </span>
                    </div>

                    {/* Original Message Quote */}
                    {fav.originalText && (
                      <div className="flex gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 italic bg-white/40 dark:bg-black/10 p-2 rounded-lg border border-slate-100/50 dark:border-slate-800/20">
                        <MessageSquare className="w-3.5 h-3.5 shrink-0 text-slate-300 dark:text-slate-600" />
                        <span className="line-clamp-1">{fav.originalText}</span>
                      </div>
                    )}

                    {/* Rewritten Message */}
                    <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {fav.rewrittenText}
                    </p>

                    {/* Bottom Utility items */}
                    <div className="flex items-center justify-end gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onCopy(fav.rewrittenText)}
                        className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200/50 dark:hover:border-slate-700 text-slate-500 hover:text-pink-500 dark:text-slate-400 dark:hover:text-pink-400 transition-all"
                        title="Copy HeartWord"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onRemove(fav.id)}
                        className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200/50 dark:hover:border-slate-700 text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition-all"
                        title="Delete from Favorites"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/20">
            <p className="text-[10px] text-center text-slate-400 font-medium">
              Saved offline on your browser’s Local Storage. Only visible to you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
