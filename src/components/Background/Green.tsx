import * as React from "react";

function Green(props: React.HTMLProps<HTMLDivElement>) {
  return (
    <div
      className="w-80 h-80 rounded-full bg-aquatic filter blur-[10px]"
      {...props}
    ></div>
  );
}
export default Green;
