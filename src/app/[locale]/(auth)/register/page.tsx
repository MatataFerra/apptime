import RegisterFooter from "@/components/FooterRegister";
import RegisterForm from "@/components/FormRegister";

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
