import * as React from "react";

function Yellow(props: React.HTMLProps<HTMLDivElement>) {
  return (
    <div
      className="h-32 w-32 rounded-full bg-light-gold blur-[15px] filter"
      {...props}
    ></div>
  );
}
export default Yellow;
