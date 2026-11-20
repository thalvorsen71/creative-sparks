"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/** Dark by default. The toggle stores an explicit light or dark choice. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
