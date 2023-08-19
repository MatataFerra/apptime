"use client";

import { useTranslations } from "next-intl";
import Button from "../Button";
import Input from "../Input";
import Text from "../Text";

function Suscribe() {
  const t = useTranslations("no-mobile");

  return (
    <article className="space-y-8 rounded-lg bg-gray-700 px-8 py-4">
      <Text classes="text-lg text-white">{t("subscription.notifyMessage")}</Text>
      <div className="flex justify-between gap-2">
        <Input variants="default" placeholder="username@email.com" classes="w-full" />
        <Button variants="gradient" classes="animate-text p-1">
          <div className="items-center justify-center rounded-[inherit] bg-gray-800 px-3 py-1 transition-all hover:bg-gray-900">
            <Text classes="font-black text-white">Notify Me</Text>
          </div>
        </Button>
      </div>
    </article>
  );
}

export default Suscribe;
