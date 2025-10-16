import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  const isProduction = mode === 'production'
  const isDevelopment = mode === 'development'

  return {
    plugins: [
      react({
        babel: {
          plugins: [
            ['@babel/plugin-proposal-decorators', { legacy: true }],
            ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
          ]
        }
      }),
      
      // PWA Configuration
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'EduCore Ultra',
          short_name: 'EduCore',
          description: 'AI-Powered School Management System',
          theme_color: '#3B82F6',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          categories: ['education', 'productivity', 'business'],
          lang: 'en',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/api\./i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 // 24 hours
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
                }
              }
            }
          ]
        },
        devOptions: {
          enabled: true
        }
      })
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@components': resolve(__dirname, './src/components'),
        '@pages': resolve(__dirname, './src/pages'),
        '@hooks': resolve(__dirname, './src/hooks'),
        '@utils': resolve(__dirname, './src/utils'),
        '@types': resolve(__dirname, './src/types'),
        '@services': resolve(__dirname, './src/services'),
        '@store': resolve(__dirname, './src/store'),
        '@assets': resolve(__dirname, './src/assets'),
        '@styles': resolve(__dirname, './src/styles'),
        '@constants': resolve(__dirname, './src/constants')
      }
    },
    server: {
      port: 3000,
      host: true,
      cors: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
        },
        '/ws': {
          target: env.VITE_WS_URL || 'ws://localhost:8000',
          ws: true,
          changeOrigin: true,
        },
        '/admin': {
          target: env.VITE_API_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
        '/static': {
          target: env.VITE_API_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
        '/media': {
          target: env.VITE_API_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: isDevelopment,
      minify: isProduction ? 'terser' : false,
      target: 'esnext',
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Vendor chunks
            if (id.includes('node_modules')) {
              // React ecosystem
              if (id.includes('react') || id.includes('react-dom')) {
                return 'react-vendor'
              }
              // Router
              if (id.includes('react-router')) {
                return 'router'
              }
              // UI libraries
              if (id.includes('@headlessui') || id.includes('@heroicons') || id.includes('lucide-react')) {
                return 'ui-vendor'
              }
              // Forms
              if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
                return 'forms-vendor'
              }
              // Charts
              if (id.includes('recharts')) {
                return 'charts-vendor'
              }
              // State management
              if (id.includes('zustand') || id.includes('@tanstack/react-query')) {
                return 'state-vendor'
              }
              // Utils
              if (id.includes('date-fns') || id.includes('clsx') || id.includes('class-variance-authority')) {
                return 'utils-vendor'
              }
              // Animation
              if (id.includes('framer-motion')) {
                return 'animation-vendor'
              }
              // Other vendors
              return 'vendor'
            }
            // App chunks
            if (id.includes('/src/pages/')) {
              return 'pages'
            }
            if (id.includes('/src/components/')) {
              return 'components'
            }
          },
          // Optimize chunk names
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId
            if (facadeModuleId) {
              const fileName = facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '')
              return `js/[name]-[hash].js`
            }
            return 'js/[name]-[hash].js'
          },
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.')
            const ext = info[info.length - 1]
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `images/[name]-[hash].${ext}`
            }
            if (/woff2?|eot|ttf|otf/i.test(ext)) {
              return `fonts/[name]-[hash].${ext}`
            }
            return `assets/[name]-[hash].${ext}`
          }
        }
      },
      terserOptions: isProduction ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
          passes: 2
        },
        mangle: {
          safari10: true
        },
        format: {
          comments: false
        }
      } : undefined,
      chunkSizeWarningLimit: 1000,
      reportCompressedSize: false, // Disable to speed up build
      cssCodeSplit: true,
      assetsInlineLimit: 4096 // 4kb
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@headlessui/react',
        '@heroicons/react',
        'lucide-react',
        'react-hook-form',
        '@hookform/resolvers',
        'zod',
        'recharts',
        'date-fns',
        'clsx',
        'class-variance-authority',
        'tailwind-merge',
        'zustand',
        '@tanstack/react-query',
        'axios',
        'js-cookie',
        'jwt-decode',
        'socket.io-client',
        'react-hot-toast',
        'react-error-boundary'
      ],
      exclude: ['@vite/client', '@vite/env']
    },
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
    css: {
      devSourcemap: isDevelopment,
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@styles/utils/variables.scss";`,
          charset: false
        }
      },
      postcss: {
        plugins: [
          require('autoprefixer'),
          require('tailwindcss'),
          ...(isProduction ? [
            require('cssnano')({
              preset: ['default', {
                discardComments: {
                  removeAll: true,
                },
              }]
            })
          ] : [])
        ]
      }
    },
    
    // Performance optimizations
    esbuild: {
      target: 'esnext',
      drop: isProduction ? ['console', 'debugger'] : [],
      pure: isProduction ? ['console.log'] : []
    }
  }
})
