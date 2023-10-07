import LoginFooter from "@/components/Footer/login";
import FormLogin from "@/components/Form/login";

export default async function Login() {
  return (
    <>
      <FormLogin />
      <LoginFooter idForm="formLogin" />
    </>
  );
}
