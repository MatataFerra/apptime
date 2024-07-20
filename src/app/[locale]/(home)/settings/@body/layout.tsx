import type { ReactNode } from "react";

import Stack from "@/components/ui/Stack";

interface LayoutProps {
  children: ReactNode;
  form: ReactNode;
}

export default async function Layout({ children, form }: LayoutProps) {
  return (
    <Stack orientation="vertical" spacing={4}>
      {children}
      {form}
    </Stack>
  );
}
