import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  monitor: ReactNode;
};

export default function Layout({ children, monitor }: Props) {
  return (
    <>
      {children}
      {monitor}
    </>
  );
}
