import Image from "next/image";

type PortraitImageProps = {
  src: string;
  alt: string;
  className?: string;
};

export default function PortraitImage({
  src,
  alt,
  className = "",
}: PortraitImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 1023px) 100vw, 620px"
      quality={95}
      className={[
        "object-cover",
        className,
      ].join(" ")}
    />
  );
}