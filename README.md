# Northstar Access Control Frontend

React and Vite frontend for the Northstar access-control assignment demo.

## Run locally

Run `npm install` then `npm run dev`. The Vite server proxies `/api` to `http://127.0.0.1:4000`.

## Deploy

Build with `npm run build` and publish the `dist` directory as a static site. Set `VITE_API_BASE_URL` at build time to the backend API URL ending in `/api`. Set the backend `APP_ORIGINS` to the exact deployed frontend origin. Use HTTPS; for reliable cookie sessions, use custom frontend and API subdomains of the same site.
