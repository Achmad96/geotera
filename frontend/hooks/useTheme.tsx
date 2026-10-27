import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { THEMES } from "@/constants/Themes";

type ThemeContextType = [
  Record<string, string>,
  Dispatch<SetStateAction<"dark" | "light">>,
];

const ThemeContext = createContext<ThemeContextType | null>(null);
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentTheme, setCurrentTheme] = useState<"dark" | "light">("dark");
  return (
    <ThemeContext.Provider value={[THEMES[currentTheme], setCurrentTheme]}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext) as ThemeContextType;
