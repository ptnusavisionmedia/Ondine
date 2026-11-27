import Image from "next/image";

export function BrandLogo({ inHeader = false }: { inHeader?: boolean }) {
  return (
    <Image
      className="brand-logo"
      src="/brand/ondine.webp"
      alt={inHeader ? "" : "Ondine"}
      width={450}
      height={100}
      loading={inHeader ? "eager" : "lazy"}
      unoptimized
    />
  );
}
