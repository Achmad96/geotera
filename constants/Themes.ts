import { vars } from "nativewind";

export const THEMES: {
  dark: Record<string, string>;
  light: Record<string, string>;
} = {
  dark: vars({
    "--color-primary": "37 232 226",
    "--color-secondary": "250 250 248",
    "--color-base-100": "31 30 34",
    "--color-base-200": "49 54 63",
    "--color-base-300": "34 40 49",
    "--color-neutral": "240 230 255",
    "--color-accent": "88 163 153",
  }),
  light: vars({
    "--color-primary": "26 191 186",
    "--color-secondary": "5 5 5",
    "--color-base-100": "255 255 255",
    "--color-base-200": "247 249 242",
    "--color-base-300": "246 245 242",
    "--color-neutral": "31 30 34",
    "--color-accent": "168 205 159",
  }),
};
