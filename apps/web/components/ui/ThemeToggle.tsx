'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="group relative flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] hover:bg-[var(--color-brand-primary)] hover:text-white transition-all duration-300"
      aria-label="Cambiar tema"
    >
      <Sun className="h-5 w-5 transition-all duration-300 group-hover:rotate-12 dark:hidden" />
      <Moon className="h-5 w-5 transition-all duration-300 group-hover:-rotate-12 hidden dark:block" />
    </button>
  );
}
