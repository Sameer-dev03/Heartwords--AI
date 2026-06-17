import React, { useEffect } from "react";
import { ToastMessage } from "../types";
import { X, CheckCircle, Info, AlertTriangle } from "lucide-react";

interface ToastProps {
  key?: string;
  toast: ToastMessage;
  onClose: (id: string) => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-500 shrink-0" />,
    error: <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />,
  };

  const bgStyles = {
    success: "bg-white/95 dark:bg-slate-900/95 border border-emerald-500/20 shadow-lg shadow-emerald-500/5",
    info: "bg-white/95 dark:bg-slate-900/95 border border-sky-500/20 shadow-lg shadow-sky-500/5",
    error: "bg-white/95 dark:bg-slate-900/95 border border-rose-500/20 shadow-lg shadow-rose-500/5",
  };

  return (
    <div
      className={`flex items-center gap-3 p-3.5 rounded-2xl ${bgStyles[toast.type]} backdrop-blur-md transition-all duration-300 max-w-sm w-full animate-[slideIn_0.3s_ease-out]`}
    >
      <div className="shrink-0">{icons[toast.type]}</div>
      <p className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">
        {toast.message}
      </p>
      <button
        onClick={() => onClose(toast.id)}
        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 w-full max-w-sm px-4 md:px-0 pointer-events-auto">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onClose={onRemove} />
      ))}
    </div>
  );
}
