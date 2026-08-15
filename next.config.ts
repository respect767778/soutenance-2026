import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Autorise la prévisualisation (proxy e2b.app) à charger les ressources dev.
  allowedDevOrigins: ["*.e2b.app"],
  experimental: {
    serverActions: {
      // Les uploads de fichiers vont jusqu'à 50 Mo (couv. 5 Mo + marge multipart).
      bodySizeLimit: "55mb",
      // Autorise l'invocation des actions serveur depuis la prévisualisation.
      allowedOrigins: ["*.e2b.app", "localhost:3000"],
    },
  },
};

export default nextConfig;
