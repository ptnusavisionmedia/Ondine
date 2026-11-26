"use client";

import { useEffect } from "react";

/* Menambahkan kelas ke <body> selama komponen terpasang (mis. is-home, has-bar). */
export function BodyClass({ name }: { name: string }) {
  useEffect(() => {
    document.body.classList.add(name);
    return () => document.body.classList.remove(name);
  }, [name]);
  return null;
}
