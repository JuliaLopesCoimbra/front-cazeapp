"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface MobileMenuContextValue {
  isMenuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

const MobileMenuContext = createContext<MobileMenuContextValue | null>(null);

export function MobileMenuProvider({ children }: { children: ReactNode }) {
  const [isMenuOpen, setMenuOpen] = useState(false);

  const setMenuOpenStable = useCallback((open: boolean) => {
    setMenuOpen(open);
  }, []);

  const value = useMemo(
    () => ({ isMenuOpen, setMenuOpen: setMenuOpenStable }),
    [isMenuOpen, setMenuOpenStable]
  );

  return (
    <MobileMenuContext.Provider value={value}>
      {children}
    </MobileMenuContext.Provider>
  );
}

export function useMobileMenu(): MobileMenuContextValue {
  const ctx = useContext(MobileMenuContext);
  if (!ctx) {
    return {
      isMenuOpen: false,
      setMenuOpen: () => {},
    };
  }
  return ctx;
}
