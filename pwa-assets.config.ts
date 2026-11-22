import { createAppleSplashScreens, defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";

export default defineConfig({
  headLinkOptions: { preset: "2023" },
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, padding: 0 },
    apple: { ...minimal2023Preset.apple, padding: 0 },
    appleSplashScreens: createAppleSplashScreens(
      {
        padding: 0.62,
        resizeOptions: { background: "#F5F0E8", fit: "contain" },
        darkResizeOptions: { background: "#171513", fit: "contain" },
        linkMediaOptions: { log: true, addMediaScreen: true, basePath: "./splash/", xhtml: false },
        png: { compressionLevel: 9, quality: 60 },
        name: (landscape, size, dark) =>
          `splash/apple-splash-${landscape ? "landscape" : "portrait"}-${dark ? "dark-" : ""}${size.width}x${size.height}.png`,
      },
      [
        "iPad Pro 12.9\"", "iPad Pro 11\"", "iPad Air 10.9\"", "iPad 10.2\"", "iPad Mini 8.3\"",
        "iPhone 16 Pro Max", "iPhone 16 Pro", "iPhone 16", "iPhone 15 Pro Max", "iPhone 15 Pro",
        "iPhone 14 Plus", "iPhone 13", "iPhone SE 4.7\"",
      ],
    ),
  },
  images: ["public/icon.svg"],
});
