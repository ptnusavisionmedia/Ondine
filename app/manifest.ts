import type { MetadataRoute } from "next";
import { STORE } from "@/lib/data";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${STORE.name}: toko aquascape`,
    short_name: STORE.name,
    description: STORE.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#00323e",
    theme_color: "#00323e",
    lang: "id",
    icons: [{ src: "/icon.png", sizes: "192x192", type: "image/png" }],
  };
}
