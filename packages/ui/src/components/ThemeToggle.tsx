"use client";
import { Monitor, Moon, Sun } from "lucide-react";

import { useTheme } from "./ThemeProvider";
import { Button } from "./button";

const CYCLE = ["light", "dark", "system"] as const;

const ICONS = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;

const LABELS = {
  light: "Sáng",
  dark: "Tối",
  system: "Hệ thống",
} as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const next = CYCLE[(CYCLE.indexOf(theme) + 1) % CYCLE.length];
  const Icon = ICONS[theme];

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(next)}
      title={`Chủ đề: ${LABELS[theme]}`}
      aria-label="Toggle theme"
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}
