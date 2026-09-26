import { Languages, Moon, Sun } from "lucide-react";
import { usePreferences } from "../utils/i18n";

export default function ThemeLanguageControls({ compact = false }) {
  const { theme, language, setTheme, setLanguage } = usePreferences();
  const tamil = language === "ta";

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-surface text-text-secondary transition-all hover:border-coordinator/40 hover:text-text-primary"
      >
        {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
      </button>
      <button
        type="button"
        onClick={() => setLanguage(tamil ? "en" : "ta")}
        title={tamil ? "Switch to English" : "தமிழில் மாற்றவும்"}
        aria-label={tamil ? "Switch to English" : "தமிழில் மாற்றவும்"}
        className="flex h-9 items-center gap-1.5 rounded-xl border border-border bg-surface px-3 text-[11px] font-semibold text-text-secondary transition-all hover:border-cyan/40 hover:text-text-primary"
      >
        <Languages size={14} />
        <span>{tamil ? "English" : "தமிழ்"}</span>
      </button>
    </div>
  );
}
