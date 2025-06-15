import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const currentEnv = loadEnv(mode, process.cwd(), ["VITE", "SENTRY", "ENABLE"]);

  return {
    define: {
      "import.meta.env.APP_VERSION": JSON.stringify(
        process.env.npm_package_version,
      ),
    },
    server: {
      port: 3000,
      proxy: {
        "/api": {
          target: "https://api-test.bridging.fi",
          changeOrigin: true,
          cookieDomainRewrite: {
            "bridging.fi": new URL(currentEnv.VITE_BASE_PATH).hostname,
          },
        },
      },
      allowedHosts: [currentEnv.VITE_BASE_PATH.replace(/https?:\/\//, "")], // useful for ngrok forwarding
    },
    plugins: [
      react(),
      tsconfigPaths(),
      // Put the Sentry vite plugin after all other plugins
      ...(currentEnv.SENTRY_AUTH_TOKEN
        ? [
            sentryVitePlugin({
              org: currentEnv.SENTRY_ORG,
              project: currentEnv.SENTRY_PROJECT,
              authToken: currentEnv.SENTRY_AUTH_TOKEN,
              sourcemaps: {
                filesToDeleteAfterUpload: "dist/**/*.js.map",
              },
            }),
          ]
        : []),
    ],
  };
});
