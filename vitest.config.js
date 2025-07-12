import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.mjs';
import * as path from 'path';

const baseConfig = viteConfig();
console.log('Base config resolve:', baseConfig.resolve);

export default mergeConfig(
	baseConfig,
	defineConfig({
		root: '.', // Override the root for tests to be project root, not src/
		resolve: {
			conditions: ['import', 'browser'],
			alias: {
				'~': path.resolve(__dirname),
				// Add any other aliases you need
			},
		},
		test: {
			environment: 'node',
			globals: true,
			setupFiles: ['./src/tests/setup.js'],
			env: {
				NODE_ENV: 'test',
			},
		},
	})
);