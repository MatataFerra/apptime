import FooterLogin from "@/components/FooterLogin";
import FormLogin from "@/components/FormLogin";

export default async function Login() {
  return (
    <>
      <FormLogin />
      <FooterLogin idForm="formLogin" />
    </>
  );
}
