'use client';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

type ToastState = { title: string; message: string; error?: boolean } | null;
type ShowToast = (title: string, message: string, error?: boolean) => void;

const ToastContext = createContext<ShowToast>(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [t, setT] = useState<ToastState>(null);

  const show = useCallback<ShowToast>((title, message, error) => {
    setT({ title, message, error });
    setTimeout(() => setT(null), 3500);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        className={`fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-5 py-3.5 rounded-2xl bg-dark-card border shadow-2xl pointer-events-none transition-all duration-300 ${
          t?.error ? 'border-red-400/40' : 'border-brand-emerald/40'
        } ${t ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
      >
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm ${
            t?.error ? 'bg-red-400/20 text-red-400' : 'bg-brand-emerald/20 text-brand-emerald'
          }`}
        >
          <i className={`fa-solid ${t?.error ? 'fa-xmark' : 'fa-check'}`} />
        </div>
        <div>
          <h5 className="font-heading font-bold text-xs text-white">{t?.title}</h5>
          <p className="text-[11px] text-slate-300">{t?.message}</p>
        </div>
      </div>
    </ToastContext.Provider>
  );
}