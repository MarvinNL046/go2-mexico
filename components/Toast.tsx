import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
  exiting?: boolean;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const VARIANT_CONFIG: Record<ToastVariant, { borderColor: string; icon: React.ReactNode }> = {
  success: {
    borderColor: 'border-l-green-500',
    icon: <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />,
  },
  error: {
    borderColor: 'border-l-red-500',
    icon: <XCircle className="w-5 h-5 text-red-500 shrink-0" />,
  },
  info: {
    borderColor: 'border-l-blue-500',
    icon: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
  },
};

function ToastMessage({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }) {
  const { borderColor, icon } = VARIANT_CONFIG[toast.variant];

  return (
    <div
      className={`${toast.exiting ? 'animate-toast-exit' : 'animate-slide-down'} flex items-center gap-3 bg-white border-l-4 ${borderColor} rounded-lg shadow-lg px-4 py-3 min-w-[280px] max-w-[400px]`}
      role="alert"
    >
      {icon}
      <p className="text-sm text-gray-800 flex-1">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-gray-400 hover:text-gray-600 shrink-0"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 200);
  }, []);

  const add = useCallback((message: string, variant: ToastVariant) => {
    const id = nextId.current++;
    setToasts(prev => [...prev, { id, message, variant }]);
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  const contextValue = React.useMemo<ToastContextValue>(() => ({
    success: (msg: string) => add(msg, 'success'),
    error: (msg: string) => add(msg, 'error'),
    info: (msg: string) => add(msg, 'info'),
  }), [add]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Container: top-right on desktop, top-center on mobile */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 items-end max-sm:right-1/2 max-sm:translate-x-1/2 max-sm:items-center">
        {toasts.map(toast => (
          <ToastMessage key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
