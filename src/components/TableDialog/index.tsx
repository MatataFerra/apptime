import { PropsWithChildren } from "react";

import Button from "@/components/ui/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";

type Props = PropsWithChildren<{
  title: string;
  content: React.ReactNode;
}>;

function TableDialog({ title, content, children }: Props) {
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle className="border-b border-gray-800 py-2">{title}</DialogTitle>
          </DialogHeader>
          <DialogDescription asChild>{content}</DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default TableDialog;
