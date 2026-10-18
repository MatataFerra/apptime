import Button from "@/components/ui/Button";

type Props = {
  handleLogin: () => void;
};

function Login({ handleLogin }: Props) {
  return (
    <Button
      type="button"
      variant="primary"
      size="lg"
      classes="w-full rounded-2xl"
      onClick={handleLogin}
    >
      Log in
    </Button>
  );
}

export default Login;
