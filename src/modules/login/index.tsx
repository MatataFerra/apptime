import FormLogin from "./Form";

function LoginScreen() {
  return (
    <>
      <main className="flex h-full flex-col gap-4 self-center">
        <FormLogin />
      </main>
      <div className="bg-login" />
    </>
  );
}

export default LoginScreen;
