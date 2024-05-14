import Button from "@/components/ui/Button";

type Props = {
  handleLogin: () => void;
};

function Login({ handleLogin }: Props) {
  return (
    <Button as="button" size="sm" variant="black" classes="cursor-pointer" onClick={handleLogin}>
      Login
    </Button>
  );
}

export default Login;
