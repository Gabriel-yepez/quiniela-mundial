import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Quiniela Mundial",
    short_name: "Quiniela",
    description:
      "Predice los resultados del Mundial de Fútbol y compite contra amigos.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f8f8",
    theme_color: "#111111",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
