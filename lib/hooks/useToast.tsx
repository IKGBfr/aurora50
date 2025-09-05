'use client';

import toast from 'react-hot-toast';

export function useToast() {
  return {
    success: (message: string) => {
      toast.success(message);
    },
    
    error: (message: string) => {
      toast.error(message);
    },
    
    info: (message: string) => {
      toast(message, {
        icon: '💡',
      });
    },
    
    loading: (message: string) => {
      return toast.loading(message);
    },
    
    dismiss: (toastId?: string) => {
      if (toastId) {
        toast.dismiss(toastId);
      } else {
        toast.dismiss();
      }
    },
    
    promise: async <T,>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string;
        error: string;
      }
    ) => {
      return toast.promise(promise, messages);
    },
  };
}
