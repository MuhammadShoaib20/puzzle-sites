'use client';

import { useToast } from './Toast';
import { Toast } from './Toast';

type Props = {
  children: React.ReactNode;
};

export default function AdminToastProvider({ children }: Props) {
  const { toasts, removeToast } = useToast();

  return (
    <>
      {children}
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </>
  );
}
