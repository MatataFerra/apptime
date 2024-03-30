import Button from "@/components/ui/Button";
import Img from "@/components/ui/Image";
import Text from "@/components/ui/Text";

interface Props {
  onGoogleAuth: () => void;
  disabled?: boolean;
}

function GoogleButton({ onGoogleAuth, ...props }: Props) {
  return (
    <Button
      type="button"
      variant={props.disabled ? "disabled" : "google"}
      classes="mx-0 my-auto grid w-full grid-cols-1 items-center"
      onClick={onGoogleAuth}
      {...props}
    >
      <Img
        classes="col-start-1 col-end-2 row-start-1 row-end-2"
        src="/assets/google-logo.webp"
        alt="Google logo"
        width={30}
        height={30}
      />
      <Text as="span" classes="col-start-1 col-end-2 row-start-1 row-end-2 text-2xl">
        Google
      </Text>
    </Button>
  );
}

export default GoogleButton;
