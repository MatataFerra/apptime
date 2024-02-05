import { SVGProps } from "react";

function Icon() {}

Icon.check = function ({ fill = "#1C274C", ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g id="SVGRepo_iconCarrier">
        <path
          opacity="0.5"
          d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
          fill={fill}
        ></path>
        <path
          d="M16.0303 8.96967C16.3232 9.26256 16.3232 9.73744 16.0303 10.0303L11.0303 15.0303C10.7374 15.3232 10.2626 15.3232 9.96967 15.0303L7.96967 13.0303C7.67678 12.7374 7.67678 12.2626 7.96967 11.9697C8.26256 11.6768 8.73744 11.6768 9.03033 11.9697L10.5 13.4393L12.7348 11.2045L14.9697 8.96967C15.2626 8.67678 15.7374 8.67678 16.0303 8.96967Z"
          fill="#202020"
        ></path>
      </g>
    </svg>
  );
};

Icon.mark = function ({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={props.width || "16"}
      height={props.height || "16"}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M7.91132 14.8226C11.7283 14.8226 14.8226 11.7283 14.8226 7.91132C14.8226 4.0943 11.7283 1 7.91132 1C4.0943 1 1 4.0943 1 7.91132C1 11.7283 4.0943 14.8226 7.91132 14.8226Z"
        stroke="black"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.83795 5.83793C5.83795 3.41894 9.63918 3.41896 9.63918 5.83793C9.63918 7.56576 7.91135 7.22012 7.91135 9.29352"
        stroke="black"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.91132 12.065L7.91823 12.0574"
        stroke="black"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

Icon.reset = function ({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1920" {...props}>
      <path
        fillRule="evenodd"
        d="M960 0v213.333c411.627 0 746.667 334.934 746.667 746.667S1371.627 1706.667 960 1706.667 213.333 1371.733 213.333 960c0-197.013 78.4-382.507 213.334-520.747v254.08H640V106.667H53.333V320h191.04C88.64 494.08 0 720.96 0 960c0 529.28 430.613 960 960 960s960-430.72 960-960S1489.387 0 960 0"
      />
    </svg>
  );
};

Icon.cancel = function ({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={19} height={19} fill="none" {...props}>
      <path
        stroke="#000"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m1 18.225 8.612-8.613m0 0L18.225 1M9.612 9.612 1 1m8.612 8.612 8.613 8.613"
      />
    </svg>
  );
};

Icon.lightning = function ({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={15} height={26} fill="none" {...props}>
      <path
        stroke="#000"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.546 14.418c-.077-.001-.077-.001-.154-.008-.85-.095-1.47-.936-1.384-1.88l.818-9.984C1.906 1.67 2.57 1 3.364 1h5.984c.171 0 .341.032.503.093.807.309 1.236 1.286.959 2.183L8.813 8.78h3.683c.273 0 .54.08.776.232.738.476.99 1.527.56 2.347-.555 1.093-6.14 10.48-7.946 13.51-.144.241-.511.123-.495-.157l.604-10.303-3.45.008Z"
      />
    </svg>
  );
};

Icon.clock = function ({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={26} height={26} fill="none" {...props}>
      <path stroke="#000" strokeLinecap="round" strokeLinejoin="round" d="M13 5.8V13h7.2" />
      <path
        stroke="#000"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 25c6.627 0 12-5.373 12-12S19.627 1 13 1 1 6.373 1 13s5.373 12 12 12Z"
      />
    </svg>
  );
};

Icon.calculator = function ({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={26} height={26} fill="none" {...props}>
      <path
        stroke="#000"
        d="M1 22.818V3.182C1 1.977 1.977 1 3.182 1h19.636C24.023 1 25 1.977 25 3.182v19.636A2.182 2.182 0 0 1 22.818 25H3.182A2.182 2.182 0 0 1 1 22.818Z"
      />
      <path
        stroke="#000"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.273 7.545H20.636M16.273 16.818H20.636M16.273 20.09H20.636M5.364 7.545h2.181m0 0h2.182m-2.182 0V5.364m0 2.181v2.182M6.003 19.997l1.543-1.542m0 0 1.543-1.543m-1.543 1.543-1.543-1.543m1.543 1.543 1.543 1.542"
      />
    </svg>
  );
};

Icon.home = function ({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={36} height={32} fill="none" {...props}>
      <path
        stroke="#000"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M1 11.313 17.875 1 34.75 11.313M31 17.875v12c0 .621-.504 1.125-1.125 1.125h-24a1.125 1.125 0 0 1-1.125-1.125v-12"
      />
    </svg>
  );
};

export default Icon;
