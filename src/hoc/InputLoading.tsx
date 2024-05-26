import Skeleton from "@/components/ui/Skeleton";

function inputLoading<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P & { isLoading: boolean }> {
  function WithLoading({ isLoading, ...props }: { isLoading: boolean } & P) {
    if (isLoading) {
      return <Skeleton classes="h-10 w-full" />;
    }

    return <WrappedComponent {...(props as P)} />;
  }

  return WithLoading;
}

export default inputLoading;
