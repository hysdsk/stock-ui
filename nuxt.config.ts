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
        "@vuestic/nuxt"
    ],
    vuestic: {
        config: {
          colors: {
            variables: {
                textPrimary: "rgb(38, 50, 56)"
            }
          }
        }
    },
    runtimeConfig: {
        dbHost: process.env.DB_HOST,
        dbPost: process.env.DB_PORT,
        dbUser: process.env.DB_USER,
        dbPswd: process.env.DB_PSWD,
        dbName: process.env.DB_NAME
    }
})
