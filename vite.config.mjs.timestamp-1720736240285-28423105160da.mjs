// vite.config.mjs
import { svelte } from "file:///Users/noeldacosta/code/foundryvtt-actor-studio/node_modules/@sveltejs/vite-plugin-svelte/src/index.js";
import {
  postcssConfig,
  terserConfig
} from "file:///Users/noeldacosta/code/foundryvtt-actor-studio/node_modules/@typhonjs-fvtt/runtime/.rollup/remote/index.js";
import resolve from "file:///Users/noeldacosta/code/foundryvtt-actor-studio/node_modules/@rollup/plugin-node-resolve/dist/es/index.js";
import preprocess from "file:///Users/noeldacosta/code/foundryvtt-actor-studio/node_modules/svelte-preprocess/dist/index.js";
import * as path from "path";
var __vite_injected_original_dirname = "/Users/noeldacosta/code/foundryvtt-actor-studio";
var s_PACKAGE_ID = "modules/foundryvtt-actor-studio";
var s_SVELTE_HASH_ID = "gas";
var s_COMPRESS = false;
var s_SOURCEMAPS = true;
var s_RESOLVE_CONFIG = {
  browser: true,
  dedupe: ["svelte"]
};
var vite_config_default = () => {
  return {
    root: "src/",
    // Source location / esbuild root.
    base: `/${s_PACKAGE_ID}/`,
    // Base module path that 30001 / served dev directory.
    publicDir: false,
    // No public resources to copy.
    cacheDir: "../.vite-cache",
    // Relative from root directory.
    resolve: {
      conditions: ["import", "browser"],
      alias: {
        "~": path.resolve(__vite_injected_original_dirname)
      }
    },
    esbuild: {
      target: ["es2022"]
    },
    css: {
      // Creates a standard configuration for PostCSS with autoprefixer & postcss-preset-env.
      postcss: postcssConfig({ compress: s_COMPRESS, sourceMap: s_SOURCEMAPS })
    },
    // About server options:
    // - Set to `open` to boolean `false` to not open a browser window automatically. This is useful if you set up a
    // debugger instance in your IDE and launch it with the URL: 'http://localhost:30001/game'.
    //
    // - The top proxy entry redirects requests under the module path for `style.css` and following standard static
    // directories: `assets`, `lang`, and `packs` and will pull those resources from the main Foundry / 30000 server.
    // This is necessary to reference the dev resources as the root is `/src` and there is no public / static
    // resources served with this particular Vite configuration. Modify the proxy rule as necessary for your
    // static resources / project.
    server: {
      port: 30001,
      open: "/game",
      proxy: {
        // Serves static files from main Foundry server.
        [`^(/${s_PACKAGE_ID}/(assets|lang|packs|dist/style.css))`]: "http://localhost:30000",
        // All other paths besides package ID path are served from main Foundry server.
        [`^(?!/${s_PACKAGE_ID}/)`]: "http://localhost:30000",
        // Enable socket.io from main Foundry server.
        "/socket.io": { target: "ws://localhost:30000", ws: true }
      }
    },
    build: {
      outDir: __vite_injected_original_dirname + "/dist",
      emptyOutDir: false,
      sourcemap: s_SOURCEMAPS,
      brotliSize: true,
      minify: s_COMPRESS ? "terser" : false,
      target: ["es2022"],
      terserOptions: s_COMPRESS ? { ...terserConfig(), ecma: 2022 } : void 0,
      lib: {
        entry: "./index.js",
        formats: ["es"],
        fileName: "index"
      }
    },
    // Necessary when using the dev server for top-level await usage inside TRL.
    optimizeDeps: {
      esbuildOptions: {
        target: "es2022"
      }
    },
    plugins: [
      svelte({
        compilerOptions: {
          // Provides a custom hash adding the string defined in `s_SVELTE_HASH_ID` to scoped Svelte styles;
          // This is reasonable to do as the framework styles in TRL compiled across `n` different packages will
          // be the same. Slightly modifying the hash ensures that your package has uniquely scoped styles for all
          // TRL components and makes it easier to review styles in the browser debugger.
          cssHash: ({ hash, css }) => `svelte-${s_SVELTE_HASH_ID}-${hash(css)}`
        },
        preprocess: preprocess()
      }),
      resolve(s_RESOLVE_CONFIG)
      // Necessary when bundling npm-linked packages.
    ]
  };
};
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL25vZWxkYWNvc3RhL2NvZGUvZm91bmRyeXZ0dC1hY3Rvci1zdHVkaW9cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9ub2VsZGFjb3N0YS9jb2RlL2ZvdW5kcnl2dHQtYWN0b3Itc3R1ZGlvL3ZpdGUuY29uZmlnLm1qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvbm9lbGRhY29zdGEvY29kZS9mb3VuZHJ5dnR0LWFjdG9yLXN0dWRpby92aXRlLmNvbmZpZy5tanNcIjsvKiBlc2xpbnQtZW52IG5vZGUgKi9cbmltcG9ydCB7IHN2ZWx0ZSB9IGZyb20gJ0BzdmVsdGVqcy92aXRlLXBsdWdpbi1zdmVsdGUnO1xuaW1wb3J0IHtcbiAgIHBvc3Rjc3NDb25maWcsXG4gICB0ZXJzZXJDb25maWdcbn0gZnJvbSAnQHR5cGhvbmpzLWZ2dHQvcnVudGltZS9yb2xsdXAnO1xuaW1wb3J0IHJlc29sdmUgZnJvbSAnQHJvbGx1cC9wbHVnaW4tbm9kZS1yZXNvbHZlJzsgLy8gVGhpcyByZXNvbHZlcyBOUE0gbW9kdWxlcyBmcm9tIG5vZGVfbW9kdWxlcy5cbmltcG9ydCBwcmVwcm9jZXNzIGZyb20gJ3N2ZWx0ZS1wcmVwcm9jZXNzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcblxuLy8gQVRURU5USU9OIVxuLy8gUGxlYXNlIG1vZGlmeSB0aGUgYmVsb3cgdmFyaWFibGVzOiBzX1BBQ0tBR0VfSUQgYW5kIHNfU1ZFTFRFX0hBU0hfSUQgYXBwcm9wcmlhdGVseS5cblxuLy8gRm9yIGNvbnZlbmllbmNlLCB5b3UganVzdCBuZWVkIHRvIG1vZGlmeSB0aGUgcGFja2FnZSBJRCBiZWxvdyBhcyBpdCBpcyB1c2VkIHRvIGZpbGwgaW4gZGVmYXVsdCBwcm94eSBzZXR0aW5ncyBmb3Jcbi8vIHRoZSBkZXYgc2VydmVyLlxuY29uc3Qgc19QQUNLQUdFX0lEID0gJ21vZHVsZXMvZm91bmRyeXZ0dC1hY3Rvci1zdHVkaW8nO1xuXG4vLyBBIHNob3J0IGFkZGl0aW9uYWwgc3RyaW5nIHRvIGFkZCB0byBTdmVsdGUgQ1NTIGhhc2ggdmFsdWVzIHRvIG1ha2UgeW91cnMgdW5pcXVlLiBUaGlzIHJlZHVjZXMgdGhlIGFtb3VudCBvZlxuLy8gZHVwbGljYXRlZCBmcmFtZXdvcmsgQ1NTIG92ZXJsYXAgYmV0d2VlbiBtYW55IFRSTCBwYWNrYWdlcyBlbmFibGVkIG9uIEZvdW5kcnkgVlRUIGF0IHRoZSBzYW1lIHRpbWUuICd0c2UnIGlzIGNob3NlblxuLy8gYnkgc2hvcnRlbmluZyAnZm91bmRyeXZ0dC1hY3Rvci1zdHVkaW8nLlxuY29uc3Qgc19TVkVMVEVfSEFTSF9JRCA9ICdnYXMnO1xuXG5jb25zdCBzX0NPTVBSRVNTID0gZmFsc2U7ICAvLyBTZXQgdG8gdHJ1ZSB0byBjb21wcmVzcyB0aGUgbW9kdWxlIGJ1bmRsZS5cbmNvbnN0IHNfU09VUkNFTUFQUyA9IHRydWU7IC8vIEdlbmVyYXRlIHNvdXJjZW1hcHMgZm9yIHRoZSBidW5kbGUgKHJlY29tbWVuZGVkKS5cblxuLy8gVXNlZCBpbiBidW5kbGluZyBwYXJ0aWN1bGFybHkgZHVyaW5nIGRldmVsb3BtZW50LiBJZiB5b3UgbnBtLWxpbmsgcGFja2FnZXMgdG8geW91ciBwcm9qZWN0IGFkZCB0aGVtIGhlcmUuXG5jb25zdCBzX1JFU09MVkVfQ09ORklHID0ge1xuICAgYnJvd3NlcjogdHJ1ZSxcbiAgIGRlZHVwZTogWydzdmVsdGUnXSxcblxufTtcblxuZXhwb3J0IGRlZmF1bHQgKCkgPT4ge1xuICAgLyoqIEB0eXBlIHtpbXBvcnQoJ3ZpdGUnKS5Vc2VyQ29uZmlnfSAqL1xuICAgcmV0dXJuIHtcbiAgICAgIHJvb3Q6ICdzcmMvJywgICAgICAgICAgICAgICAgIC8vIFNvdXJjZSBsb2NhdGlvbiAvIGVzYnVpbGQgcm9vdC5cbiAgICAgIGJhc2U6IGAvJHtzX1BBQ0tBR0VfSUR9L2AsICAgIC8vIEJhc2UgbW9kdWxlIHBhdGggdGhhdCAzMDAwMSAvIHNlcnZlZCBkZXYgZGlyZWN0b3J5LlxuICAgICAgcHVibGljRGlyOiBmYWxzZSwgICAgICAgICAgICAgLy8gTm8gcHVibGljIHJlc291cmNlcyB0byBjb3B5LlxuICAgICAgY2FjaGVEaXI6ICcuLi8udml0ZS1jYWNoZScsICAgLy8gUmVsYXRpdmUgZnJvbSByb290IGRpcmVjdG9yeS5cblxuICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgY29uZGl0aW9uczogW1wiaW1wb3J0XCIsIFwiYnJvd3NlclwiXSxcbiAgICAgICAgIGFsaWFzOiB7XG4gICAgICAgICAgICBcIn5cIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSksXG4gICAgICAgICB9LFxuICAgICAgfSxcblxuICAgICAgZXNidWlsZDoge1xuICAgICAgICAgdGFyZ2V0OiBbJ2VzMjAyMiddXG4gICAgICB9LFxuXG4gICAgICBjc3M6IHtcbiAgICAgICAgIC8vIENyZWF0ZXMgYSBzdGFuZGFyZCBjb25maWd1cmF0aW9uIGZvciBQb3N0Q1NTIHdpdGggYXV0b3ByZWZpeGVyICYgcG9zdGNzcy1wcmVzZXQtZW52LlxuICAgICAgICAgcG9zdGNzczogcG9zdGNzc0NvbmZpZyh7IGNvbXByZXNzOiBzX0NPTVBSRVNTLCBzb3VyY2VNYXA6IHNfU09VUkNFTUFQUyB9KVxuICAgICAgfSxcblxuICAgICAgLy8gQWJvdXQgc2VydmVyIG9wdGlvbnM6XG4gICAgICAvLyAtIFNldCB0byBgb3BlbmAgdG8gYm9vbGVhbiBgZmFsc2VgIHRvIG5vdCBvcGVuIGEgYnJvd3NlciB3aW5kb3cgYXV0b21hdGljYWxseS4gVGhpcyBpcyB1c2VmdWwgaWYgeW91IHNldCB1cCBhXG4gICAgICAvLyBkZWJ1Z2dlciBpbnN0YW5jZSBpbiB5b3VyIElERSBhbmQgbGF1bmNoIGl0IHdpdGggdGhlIFVSTDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMDEvZ2FtZScuXG4gICAgICAvL1xuICAgICAgLy8gLSBUaGUgdG9wIHByb3h5IGVudHJ5IHJlZGlyZWN0cyByZXF1ZXN0cyB1bmRlciB0aGUgbW9kdWxlIHBhdGggZm9yIGBzdHlsZS5jc3NgIGFuZCBmb2xsb3dpbmcgc3RhbmRhcmQgc3RhdGljXG4gICAgICAvLyBkaXJlY3RvcmllczogYGFzc2V0c2AsIGBsYW5nYCwgYW5kIGBwYWNrc2AgYW5kIHdpbGwgcHVsbCB0aG9zZSByZXNvdXJjZXMgZnJvbSB0aGUgbWFpbiBGb3VuZHJ5IC8gMzAwMDAgc2VydmVyLlxuICAgICAgLy8gVGhpcyBpcyBuZWNlc3NhcnkgdG8gcmVmZXJlbmNlIHRoZSBkZXYgcmVzb3VyY2VzIGFzIHRoZSByb290IGlzIGAvc3JjYCBhbmQgdGhlcmUgaXMgbm8gcHVibGljIC8gc3RhdGljXG4gICAgICAvLyByZXNvdXJjZXMgc2VydmVkIHdpdGggdGhpcyBwYXJ0aWN1bGFyIFZpdGUgY29uZmlndXJhdGlvbi4gTW9kaWZ5IHRoZSBwcm94eSBydWxlIGFzIG5lY2Vzc2FyeSBmb3IgeW91clxuICAgICAgLy8gc3RhdGljIHJlc291cmNlcyAvIHByb2plY3QuXG4gICAgICBzZXJ2ZXI6IHtcbiAgICAgICAgIHBvcnQ6IDMwMDAxLFxuICAgICAgICAgb3BlbjogJy9nYW1lJyxcbiAgICAgICAgIHByb3h5OiB7XG4gICAgICAgICAgICAvLyBTZXJ2ZXMgc3RhdGljIGZpbGVzIGZyb20gbWFpbiBGb3VuZHJ5IHNlcnZlci5cbiAgICAgICAgICAgIFtgXigvJHtzX1BBQ0tBR0VfSUR9Lyhhc3NldHN8bGFuZ3xwYWNrc3xkaXN0L3N0eWxlLmNzcykpYF06ICdodHRwOi8vbG9jYWxob3N0OjMwMDAwJyxcblxuICAgICAgICAgICAgLy8gQWxsIG90aGVyIHBhdGhzIGJlc2lkZXMgcGFja2FnZSBJRCBwYXRoIGFyZSBzZXJ2ZWQgZnJvbSBtYWluIEZvdW5kcnkgc2VydmVyLlxuICAgICAgICAgICAgW2BeKD8hLyR7c19QQUNLQUdFX0lEfS8pYF06ICdodHRwOi8vbG9jYWxob3N0OjMwMDAwJyxcblxuICAgICAgICAgICAgLy8gRW5hYmxlIHNvY2tldC5pbyBmcm9tIG1haW4gRm91bmRyeSBzZXJ2ZXIuXG4gICAgICAgICAgICAnL3NvY2tldC5pbyc6IHsgdGFyZ2V0OiAnd3M6Ly9sb2NhbGhvc3Q6MzAwMDAnLCB3czogdHJ1ZSB9XG4gICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBidWlsZDoge1xuICAgICAgICAgb3V0RGlyOiBfX2Rpcm5hbWUrJy9kaXN0JyxcbiAgICAgICAgIGVtcHR5T3V0RGlyOiBmYWxzZSxcbiAgICAgICAgIHNvdXJjZW1hcDogc19TT1VSQ0VNQVBTLFxuICAgICAgICAgYnJvdGxpU2l6ZTogdHJ1ZSxcbiAgICAgICAgIG1pbmlmeTogc19DT01QUkVTUyA/ICd0ZXJzZXInIDogZmFsc2UsXG4gICAgICAgICB0YXJnZXQ6IFsnZXMyMDIyJ10sXG4gICAgICAgICB0ZXJzZXJPcHRpb25zOiBzX0NPTVBSRVNTID8geyAuLi50ZXJzZXJDb25maWcoKSwgZWNtYTogMjAyMiB9IDogdm9pZCAwLFxuICAgICAgICAgbGliOiB7XG4gICAgICAgICAgICBlbnRyeTogJy4vaW5kZXguanMnLFxuICAgICAgICAgICAgZm9ybWF0czogWydlcyddLFxuICAgICAgICAgICAgZmlsZU5hbWU6ICdpbmRleCdcbiAgICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIC8vIE5lY2Vzc2FyeSB3aGVuIHVzaW5nIHRoZSBkZXYgc2VydmVyIGZvciB0b3AtbGV2ZWwgYXdhaXQgdXNhZ2UgaW5zaWRlIFRSTC5cbiAgICAgIG9wdGltaXplRGVwczoge1xuICAgICAgICAgZXNidWlsZE9wdGlvbnM6IHtcbiAgICAgICAgICAgIHRhcmdldDogJ2VzMjAyMidcbiAgICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAgIHN2ZWx0ZSh7XG4gICAgICAgICAgICBjb21waWxlck9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgIC8vIFByb3ZpZGVzIGEgY3VzdG9tIGhhc2ggYWRkaW5nIHRoZSBzdHJpbmcgZGVmaW5lZCBpbiBgc19TVkVMVEVfSEFTSF9JRGAgdG8gc2NvcGVkIFN2ZWx0ZSBzdHlsZXM7XG4gICAgICAgICAgICAgICAvLyBUaGlzIGlzIHJlYXNvbmFibGUgdG8gZG8gYXMgdGhlIGZyYW1ld29yayBzdHlsZXMgaW4gVFJMIGNvbXBpbGVkIGFjcm9zcyBgbmAgZGlmZmVyZW50IHBhY2thZ2VzIHdpbGxcbiAgICAgICAgICAgICAgIC8vIGJlIHRoZSBzYW1lLiBTbGlnaHRseSBtb2RpZnlpbmcgdGhlIGhhc2ggZW5zdXJlcyB0aGF0IHlvdXIgcGFja2FnZSBoYXMgdW5pcXVlbHkgc2NvcGVkIHN0eWxlcyBmb3IgYWxsXG4gICAgICAgICAgICAgICAvLyBUUkwgY29tcG9uZW50cyBhbmQgbWFrZXMgaXQgZWFzaWVyIHRvIHJldmlldyBzdHlsZXMgaW4gdGhlIGJyb3dzZXIgZGVidWdnZXIuXG4gICAgICAgICAgICAgICBjc3NIYXNoOiAoeyBoYXNoLCBjc3MgfSkgPT4gYHN2ZWx0ZS0ke3NfU1ZFTFRFX0hBU0hfSUR9LSR7aGFzaChjc3MpfWBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwcmVwcm9jZXNzOiBwcmVwcm9jZXNzKClcbiAgICAgICAgIH0pLFxuXG4gICAgICAgICByZXNvbHZlKHNfUkVTT0xWRV9DT05GSUcpICAvLyBOZWNlc3Nhcnkgd2hlbiBidW5kbGluZyBucG0tbGlua2VkIHBhY2thZ2VzLlxuICAgICAgXVxuICAgfTtcbn07XG5cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFDQSxTQUFTLGNBQWM7QUFDdkI7QUFBQSxFQUNHO0FBQUEsRUFDQTtBQUFBLE9BQ0k7QUFDUCxPQUFPLGFBQWE7QUFDcEIsT0FBTyxnQkFBZ0I7QUFDdkIsWUFBWSxVQUFVO0FBUnRCLElBQU0sbUNBQW1DO0FBZXpDLElBQU0sZUFBZTtBQUtyQixJQUFNLG1CQUFtQjtBQUV6QixJQUFNLGFBQWE7QUFDbkIsSUFBTSxlQUFlO0FBR3JCLElBQU0sbUJBQW1CO0FBQUEsRUFDdEIsU0FBUztBQUFBLEVBQ1QsUUFBUSxDQUFDLFFBQVE7QUFFcEI7QUFFQSxJQUFPLHNCQUFRLE1BQU07QUFFbEIsU0FBTztBQUFBLElBQ0osTUFBTTtBQUFBO0FBQUEsSUFDTixNQUFNLElBQUksWUFBWTtBQUFBO0FBQUEsSUFDdEIsV0FBVztBQUFBO0FBQUEsSUFDWCxVQUFVO0FBQUE7QUFBQSxJQUVWLFNBQVM7QUFBQSxNQUNOLFlBQVksQ0FBQyxVQUFVLFNBQVM7QUFBQSxNQUNoQyxPQUFPO0FBQUEsUUFDSixLQUFVLGFBQVEsZ0NBQVM7QUFBQSxNQUM5QjtBQUFBLElBQ0g7QUFBQSxJQUVBLFNBQVM7QUFBQSxNQUNOLFFBQVEsQ0FBQyxRQUFRO0FBQUEsSUFDcEI7QUFBQSxJQUVBLEtBQUs7QUFBQTtBQUFBLE1BRUYsU0FBUyxjQUFjLEVBQUUsVUFBVSxZQUFZLFdBQVcsYUFBYSxDQUFDO0FBQUEsSUFDM0U7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQVdBLFFBQVE7QUFBQSxNQUNMLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE9BQU87QUFBQTtBQUFBLFFBRUosQ0FBQyxNQUFNLFlBQVksc0NBQXNDLEdBQUc7QUFBQTtBQUFBLFFBRzVELENBQUMsUUFBUSxZQUFZLElBQUksR0FBRztBQUFBO0FBQUEsUUFHNUIsY0FBYyxFQUFFLFFBQVEsd0JBQXdCLElBQUksS0FBSztBQUFBLE1BQzVEO0FBQUEsSUFDSDtBQUFBLElBRUEsT0FBTztBQUFBLE1BQ0osUUFBUSxtQ0FBVTtBQUFBLE1BQ2xCLGFBQWE7QUFBQSxNQUNiLFdBQVc7QUFBQSxNQUNYLFlBQVk7QUFBQSxNQUNaLFFBQVEsYUFBYSxXQUFXO0FBQUEsTUFDaEMsUUFBUSxDQUFDLFFBQVE7QUFBQSxNQUNqQixlQUFlLGFBQWEsRUFBRSxHQUFHLGFBQWEsR0FBRyxNQUFNLEtBQUssSUFBSTtBQUFBLE1BQ2hFLEtBQUs7QUFBQSxRQUNGLE9BQU87QUFBQSxRQUNQLFNBQVMsQ0FBQyxJQUFJO0FBQUEsUUFDZCxVQUFVO0FBQUEsTUFDYjtBQUFBLElBQ0g7QUFBQTtBQUFBLElBR0EsY0FBYztBQUFBLE1BQ1gsZ0JBQWdCO0FBQUEsUUFDYixRQUFRO0FBQUEsTUFDWDtBQUFBLElBQ0g7QUFBQSxJQUVBLFNBQVM7QUFBQSxNQUNOLE9BQU87QUFBQSxRQUNKLGlCQUFpQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsVUFLZCxTQUFTLENBQUMsRUFBRSxNQUFNLElBQUksTUFBTSxVQUFVLGdCQUFnQixJQUFJLEtBQUssR0FBRyxDQUFDO0FBQUEsUUFDdEU7QUFBQSxRQUNBLFlBQVksV0FBVztBQUFBLE1BQzFCLENBQUM7QUFBQSxNQUVELFFBQVEsZ0JBQWdCO0FBQUE7QUFBQSxJQUMzQjtBQUFBLEVBQ0g7QUFDSDsiLAogICJuYW1lcyI6IFtdCn0K
