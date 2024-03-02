import { useId } from "react";

import { Rectangle } from "recharts";
import type { BarRectangleItem } from "recharts/types/cartesian/Bar";

interface Props extends BarRectangleItem {
  from?: `#${string}`;
  to?: `#${string}`;
}

function BarGradient(props: Props) {
  const { from = "#21f356", to = "#ffa970" } = props;
  const id = useId();
  const gradientId = `gradient-${id}`;
  const clipPathId = `clipPath-${id}`;

  return (
    <>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="100%">
          <stop offset="40%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>

        <clipPath id={clipPathId}>
          <Rectangle {...props} />
        </clipPath>
      </defs>

      <rect
        x={props.x}
        width={props.width}
        height={props.background?.height}
        fill={`url(#${gradientId})`}
        y={props.background?.y}
        clipPath={`url(#${clipPathId})`}
      />
    </>
  );
}

export default BarGradient;
