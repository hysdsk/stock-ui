import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
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
    modules: [
        '@element-plus/nuxt'
    ],
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
