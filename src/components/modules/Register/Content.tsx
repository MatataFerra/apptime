import Footer from "@/components/structures/Register/Footer";
import Form from "@/components/structures/Register/Form";

import PasswordValidProvider from "@/providers/PasswordValidProvider";

function Content() {
  return (
    <>
      <PasswordValidProvider>
        <Form />
        <Footer idForm="registerForm" />
      </PasswordValidProvider>
    </>
  );
}

export default Content;
