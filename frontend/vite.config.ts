import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import generouted from "@generouted/solid-router/plugin";
import path from "path";

export default defineConfig({
  plugins: [solid(), generouted({})],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },
});
