import RegisterFooter from "@/components/Footer/register";
import RegisterForm from "@/components/Form/register";

import PasswordValidProvider from "@/providers/PasswordValid";

export default async function Register() {
  return (
    <>
      <PasswordValidProvider>
        <RegisterForm />
        <RegisterFooter idForm="registerForm" />
      </PasswordValidProvider>
    </>
  );
}
