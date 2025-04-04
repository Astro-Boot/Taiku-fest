import { defineConfig } from 'vite';
import UnoCSS from '@unocss/vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		UnoCSS(), 
		react({
			// Explicitly enable Fast Refresh
			fastRefresh: true
		})
	],
	server: {
		// Enable hot module replacement
		hmr: {
			overlay: true
		},
		proxy: {
			'/api': {
				target: 'http://localhost:4000',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, ''),
			},
		},
		// Add these for better development experience
		strictPort: true,
		port: 2710
	},
});
