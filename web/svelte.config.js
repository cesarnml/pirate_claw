import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	onwarn(warning, defaultHandler) {
		if (warning.code === 'custom_element_props_identifier') return;
		defaultHandler(warning);
	},
	kit: {
		adapter: adapter()
	}
};

export default config;
