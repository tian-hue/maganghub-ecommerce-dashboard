// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss"],
  css: ["~/app/assets/css/tailwind.css"],
  tailwindcss: {
    cssPath: "~/app/assets/css/tailwind.css",
    configPath: "tailwind.config.js",
  },
  dir: {
    assets: "app/assets",
    layouts: "app/layouts",
    middleware: "app/middleware",
    pages: "app/pages",
  },
});
