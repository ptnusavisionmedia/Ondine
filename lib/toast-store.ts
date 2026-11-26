"use client";

import { create } from "zustand";

interface ToastState {
  msg: string;
  on: boolean;
  show: (msg: string) => void;
}

let timer: ReturnType<typeof setTimeout> | undefined;

export const useToast = create<ToastState>()((set) => ({
  msg: "",
  on: false,
  show: (msg) => {
    set({ msg, on: true });
    clearTimeout(timer);
    timer = setTimeout(() => set({ on: false }), 2600);
  },
}));

export const toast = (msg: string) => useToast.getState().show(msg);
