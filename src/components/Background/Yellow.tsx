import * as React from "react";

function Yellow(props: React.HTMLProps<HTMLDivElement>) {
  return (
    <div
      className="w-32 h-32 rounded-full bg-light-gold filter blur-[15px]"
      {...props}
    ></div>
  );
}
export default Yellow;
