// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/leaflet'
  ],

  app: {
    head: {
      title: 'HydroHorizon - Groundwater Insights',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Visualizing groundwater data for Ghana, Kenya, and India' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  css: [
    'bootstrap-icons/font/bootstrap-icons.css'
  ],

  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.js',
    exposeConfig: false,
    injectPosition: 0,
    viewer: true,
  },

  leaflet: {
    // Leaflet options
  },

  runtimeConfig: {
    // Server-side environment variables
    nasaApiToken: process.env.NASA_API_TOKEN,
    
    // Public variables that are exposed to the client
    public: {
      mapTileProvider: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    }
  },

  compatibilityDate: '2025-04-26'
})
