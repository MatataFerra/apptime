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

Icon.calendar = function ({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={17} fill="none" {...props}>
      <path
        stroke="#000"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.474 2.579V1m0 1.579v1.579m0-1.58H6.92M1 7.317v7.105C1 15.293 1.707 16 2.579 16h11.053c.872 0 1.579-.707 1.579-1.579V7.316H1ZM1 7.316V4.158c0-.872.707-1.579 1.579-1.579h1.579M4.158 1v3.158M15.21 7.316V4.158c0-.872-.706-1.579-1.578-1.579h-.395"
      />
    </svg>
  );
};

Icon.trash = function ({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="none" {...props}>
      <path
        stroke="#000"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 9v9.4a.6.6 0 0 1-.6.6H3.6a.6.6 0 0 1-.6-.6V9M8 15V9M12 15V9M19 5h-5m0 0V1.6a.6.6 0 0 0-.6-.6H6.6a.6.6 0 0 0-.6.6V5m8 0H6M1 5h5"
      />
    </svg>
  );
};

Icon.star = function ({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={16}
      height={16}
      strokeLinejoin="round"
      data-testid="geist-icon"
      style={{
        color: "currentcolor",
      }}
      {...props}
    >
      <path
        fill="currentColor"
        d="m8 .49 2.573 4.718 5.283.99-3.692 3.905.691 5.33L8 13.128l-4.855 2.305.691-5.33L.144 6.197l5.283-.989L8 .49Z"
      />
    </svg>
  );
};

Icon.eye = function ({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={16}
      height={16}
      strokeLinejoin="round"
      data-testid="geist-icon"
      style={{
        color: "currentcolor",
      }}
      {...props}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M4.022 4.77a5.25 5.25 0 0 1 7.956 0L14.76 8l-2.782 3.23a5.25 5.25 0 0 1-7.956 0L1.24 8l2.782-3.23Zm9.093-.98C10.422.664 5.578.664 2.885 3.79L-.318 7.51v.98l3.203 3.72c2.693 3.127 7.537 3.127 10.23 0l3.203-3.72v-.98l-3.203-3.72ZM6.5 8a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM8 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
        clipRule="evenodd"
      />
    </svg>
  );
};

Icon.logout = function ({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" {...props}>
      <path
        d="M256 73.825a182.18 182.18 0 0 0-182.18 182.18c0 100.617 81.567 182.17 182.18 182.17a182.175 182.175 0 1 0 0-364.35zm-18.096 86.22a18.099 18.099 0 0 1 36.197 0v53.975a18.099 18.099 0 0 1-36.197 0zM256 348.589a92.413 92.413 0 0 1-32.963-178.751v33.38a62.453 62.453 0 1 0 65.93 0v-33.38A92.415 92.415 0 0 1 256 348.588z"
        data-name="Logout"
      />
    </svg>
  );
};

export default Icon;
