# Vmedia web

Next.js client for the Vmedia task platform. It uses feature-based clean architecture and reads the backend over HTTP. The browser never receives the Neon connection string.

## Run

Start the backend first, then:

```bash
npm install
npm run dev
```

Open http://localhost:3000. `npm run build` checks the production build.

Architecture and failure handling are documented in `v_media_docs`.
