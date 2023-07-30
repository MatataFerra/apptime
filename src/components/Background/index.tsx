import { CSSClassNames } from "@/types";
import { cm } from "@/utils/helpers";

interface Props {
  img?: string;
  backgroundImage?: string;
  classes?: CSSClassNames;
}

/**
 * @component Background
 * @param {string} img - Optional
 * @param {string} backgroundImage - Optional
 * @param {TailwindCSS} classes - HTML class attribute
 */

function Background({ img, backgroundImage, classes = "w-96 h-96" }: Props) {
  return (
    <>
      {img && (
        <picture className={cm(classes)}>
          <source srcSet={img} type="image/webp" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt="Background app" />
        </picture>
      )}

      {backgroundImage && <section className={cm(classes, backgroundImage)} />}
    </>
  );
}

export default Background;
