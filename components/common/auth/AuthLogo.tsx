import Image from "next/image";
import logoDark from "@/assets/logo/logoDark.png";

type AuthLogoProps = {
  className?: string;
  width?: number;
};

const AuthLogo = ({ className = "", width = 132 }: AuthLogoProps) => {
  return (
    <Image
      src={logoDark}
      alt="Hoizr"
      width={width}
      priority
      className={`h-auto w-auto ${className}`}
    />
  );
};

export default AuthLogo;
