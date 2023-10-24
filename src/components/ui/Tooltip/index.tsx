import { Tooltip as TooltipComponent, TooltipProvider } from "@/components/ui/Tooltip/tooltip";

type Props = {
  children: React.ReactElement | string | React.ReactElement[] | string[];
};

function Tooltip({ children }: Props) {
  return (
    <TooltipProvider>
      <TooltipComponent>{children}</TooltipComponent>
    </TooltipProvider>
  );
}

export default Tooltip;
