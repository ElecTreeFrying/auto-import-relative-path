interface AvatarProps {
  src: string;
  alt: string;
  size?: number;
}

export const Avatar = ({ src, alt, size = 40 }: AvatarProps) => (
  <img className="avatar" src={src} alt={alt} width={size} height={size} />
);
