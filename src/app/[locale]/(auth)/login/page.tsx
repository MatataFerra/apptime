//! No borrar comentarios
//! una vez hecha la imple descomentar y utilizar esa implementación

import ut from "@/services/Utilities/client";

import LoginScreen from "@/modules/login";
import ScreenDetector from "@/modules/screen-detector";

// export default async function Login({ searchParams }: { searchParams: { callbackUrl: string } }) {
//   const param = searchParams.callbackUrl.split("?")[1].split("=")[1];
//   const isMobile = ut.isTrutyValue(param);

//   if (!isMobile) {
//     return <ScreenDetector />;
//   }

//   return <LoginScreen />;
// }

export default async function Login() {
  const isMobile = true;

  if (!isMobile) {
    return <ScreenDetector />;
  }

  return <LoginScreen />;
}
