import type { MetadataRoute } from "next";
import { STORE } from "@/lib/data";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${STORE.name}: toko aquascape`,
    short_name: STORE.name,
    description: STORE.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#0a2724",
    theme_color: "#0a2724",
    lang: "id",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
