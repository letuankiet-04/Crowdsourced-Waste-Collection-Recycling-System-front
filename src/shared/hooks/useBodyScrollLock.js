import { useEffect } from "react";
import { lockBodyScroll, unlockBodyScroll } from "../lib/lockBodyScroll.js";

export default function useBodyScrollLock(locked) {
  useEffect(() => {
    if (!locked) return;
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [locked]);
}

