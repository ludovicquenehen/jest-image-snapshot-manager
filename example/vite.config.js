import { defineConfig } from 'vite'

export default defineConfig({
	test: {
		include: ["tests/**/*.{test,spec}.js"],
		globals: true,
		environment: "jsdom",
	},
})
