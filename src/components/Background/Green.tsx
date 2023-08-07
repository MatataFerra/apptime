import * as React from "react";

function Green(props: React.HTMLProps<HTMLDivElement>) {
  return <div className="h-80 w-80 rounded-full bg-aquatic blur-[10px] filter" {...props}></div>;
}
export default Green;
