import { notFound, redirect } from "next/navigation";

import UserService from "@/services/User";
import ut from "@/services/Utilities/client";

interface Props extends React.PropsWithChildren<{}> {}

async function Staging({ children }: Props) {
  const user = await UserService.getSessionUser();

  if (!user) {
    redirect("/es/login");
  }

  if ((!user?.role || user?.role !== "ADMIN") && ut.toBool(process.env.STAGING)) {
    notFound();
  }

  return <>{children}</>;
}

export default Staging;
