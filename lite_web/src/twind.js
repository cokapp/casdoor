import {defineConfig} from "@twind/core";
import presetAutoprefix from "@twind/preset-autoprefix";
import presetTailwind from "@twind/preset-tailwind";

export const twindConfig = defineConfig({
  presets: [presetAutoprefix(), presetTailwind()],
  preflight: true,
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f7ff",
          100: "#e9edff",
          500: "#4f6df5",
          600: "#3f5be0",
          700: "#334ac0",
        },
      },
      boxShadow: {
        card: "0 12px 32px rgba(15, 23, 42, 0.08)",
      },
    },
  },
});
