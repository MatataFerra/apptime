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
      classes="relative mx-0 my-auto flex w-full items-center"
      onClick={onGoogleAuth}
      {...props}
    >
      <Img
        src="/assets/google-logo.webp"
        alt=""
        classes="absolute left-0 ml-4"
        width={30}
        height={30}
      />
      <Text as="span" classes="mx-auto my-0 text-lg">
        Google
      </Text>
    </Button>
  );
}

export default GoogleButton;
