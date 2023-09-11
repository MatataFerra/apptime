import Image from "next/image";

import { cm } from "@/utils/helpers";

interface ImgProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  priority?: boolean;
  fill?: boolean;
  classes?: string;
  onClick?: () => void;
}

function Img({ alt = "App time, control your time", ...props }: Omit<ImgProps, "className">) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <Image alt={alt} className={cm(props.classes)} {...props} />
  );
}

export default Img;
