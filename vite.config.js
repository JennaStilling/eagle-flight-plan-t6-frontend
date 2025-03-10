import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from 'path';
import vuetify from "vite-plugin-vuetify";
import dns from "dns";

dns.setDefaultResultOrder("verbatim");

export default defineConfig({
  plugins: [vue(), vuetify({ autoImport: true })],
  //assetsInclude: ['**/*.JPG', '**/*.jpg', '**/*.png', '**/*.svg'],

  server: {
    host: "localhost",
    port: 8081,
  },

  base: process.env.APP_ENV === "development" ? "/" : "/2025/flight-plan/t6/",

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
  },
});
