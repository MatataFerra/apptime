"use client";

import { useTranslations } from "next-intl";

import Toast from "@/services/Toast";

import { useTaxesHandlerDelete } from "@/components/structures/Dashboard/Table/Dialog/store/taxesHandlerDelete";
import Button from "@/components/ui/Button";
import { DialogFooter } from "@/components/ui/Dialog";

import { useTableStore } from "@/store/useTableStore";

function Footer() {
  const { setStep } = useTableStore((state) => state);
  const { reset } = useTaxesHandlerDelete((state) => state);
  const t = useTranslations("dashboard.dialog");

  return (
    <DialogFooter className="grid w-full grid-cols-2 gap-2.5 sm:space-x-0">
      <Button
        type="button"
        size="lg"
        variant="outline"
        classes="w-full"
        onClick={() => {
          Toast({
            type: "warning",
            message: t("not_saved"),
            duration: 2000,
          });
          reset();
          setStep("info");
        }}
      >
        {t("back")}
      </Button>
      <Button type="submit" size="lg" variant="primary" classes="w-full">
        {t("save_changes")}
      </Button>
    </DialogFooter>
  );
}

export default Footer;
