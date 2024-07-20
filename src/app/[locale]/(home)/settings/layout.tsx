import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  body: ReactNode;
}

export default async function Layout({ children, body }: LayoutProps) {
  return (
    <>
      {body}
      {children}
    </>
  );
}
