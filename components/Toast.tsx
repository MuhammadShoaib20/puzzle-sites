'use client';

import { useEffect, useState, useCallback } from 'react';

type ToastType = 'success' | 'error';

type ToastMessage = {
  id: string;
  type: ToastType;
  message: string;
};

type Props = {
  toast: ToastMessage;
  onClose: (id: string) => void;
};

export function Toast({ toast, onClose }: Props) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(toast.id), 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const bgColor = toast.type === 'success' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div
      className={`fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      role="alert"
    >
      <div className="flex items-center gap-2">
        <span>{toast.type === 'success' ? '✓' : '✕'}</span>
        <span className="font-medium">{toast.message}</span>
      </div>
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((message: string) => addToast('success', message), [addToast]);
  const error = useCallback((message: string) => addToast('error', message), [addToast]);

  return { toasts, addToast, removeToast, success, error };
}
