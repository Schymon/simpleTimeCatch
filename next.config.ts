import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root explicitly: an unrelated package-lock.json in a
  // parent directory (outside this project's own git repo) would otherwise
  // make Turbopack guess the wrong root.
  turbopack: {
    root: __dirname,
  },
  // Next.js 16 blockiert im Dev-Modus (`npm run dev`) standardmäßig
  // Cross-Origin-Zugriffe auf interne Dev-Ressourcen (JS-Chunks, HMR) von
  // jedem Host außer localhost – das bricht Klicks/Interaktivität, wenn man
  // während der Entwicklung per LAN-IP testet (z.B. vom Handy). Betrifft nur
  // `next dev`, nicht `next start`/Produktion. Bei geänderter LAN-IP hier
  // anpassen (z.B. per `ipconfig getifaddr en0` unter macOS ermitteln).
  allowedDevOrigins: ["192.168.1.22"],
};

export default nextConfig;
