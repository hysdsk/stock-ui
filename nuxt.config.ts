import { defineNuxtConfig } from 'nuxt/config'
import fs from "fs";
import path from "path";

const modulesDirectory = path.join(__dirname, "modules");
const modules = fs.readdirSync(modulesDirectory)
  .filter(file => file.endsWith(".ts"))
  .map(file => require(path.resolve(modulesDirectory, file)).default);
modules.push("@element-plus/nuxt");

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    app: {
        head: {
          title: "Lorenzini",
          meta: [
            { charset: "utf-8" },
            { name: "viewport", content: "width=device-width, initial-scale=1" },
          ],
          link: [
            { rel: "icon", type: "image/png", href: "/favicon.png" },
          ]
        },
    },
    typescript: {
        strict: true
    },
    build: {
        transpile: ['vuetify'],
    },
    vite: {
        define: {
            'process.env.DEBUG': false,
        }
    },
    css: [
        "@/assets/styles/main.css"
    ],
    modules,
    elementPlus: { /** Options */ },
    runtimeConfig: {
        dbHost: process.env.DB_HOST,
        dbPost: process.env.DB_PORT,
        dbUser: process.env.DB_USER,
        dbPswd: process.env.DB_PSWD,
        dbName: process.env.DB_NAME,
        public: {
            uiOrigin: process.env.UI_ORIGIN,
            wsBaseURL: process.env.WS_BASEURL,
            wsPort: process.env.WS_PORT
        }
    }
})
