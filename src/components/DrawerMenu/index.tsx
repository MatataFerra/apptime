"use client";

import Button from "@/components/ui/Button";
import Drawer from "@/components/ui/Drawer";
import Icon from "@/components/ui/Icons";
import Image from "@/components/ui/Image";
import Line from "@/components/ui/Line";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { GRADIENTS } from "@/utils/constants/tailwind";
import useQueryUser from "@/hooks/useQueryUser";

import { useDrawerStore } from "@/store/useDrawerStore";

function DrawerMenu() {
  const user = useQueryUser();
  const isOpen = useDrawerStore((state) => state.isOpen);
  const toggle = useDrawerStore((state) => state.toggle);

  return (
    <>
      <Drawer isOpen={isOpen} handleOutsideClick={() => toggle()}>
        <Stack justifyContent="between" classes="w-full">
          <Stack>
            {user?.image && (
              <Image classes="rounded-full" src={user.image} alt="logo" width={50} height={50} />
            )}
            <Stack orientation="vertical" spacing={0}>
              <Text
                variant="gradient"
                classes={`${GRADIENTS.gradient_1} font-bold tracking-widest`}
              >
                {user?.name}
              </Text>
              <Text classes="w-full tracking-widest">menú</Text>
            </Stack>
          </Stack>
          <Button
            type="button"
            variant="outlined"
            classes="w-fit bg-transparent"
            onClick={() => toggle()}
          >
            <Icon.cancel />
          </Button>
        </Stack>
        <Stack orientation="vertical" classes="my-2 w-full">
          <Line color="bg-black" />
        </Stack>
        <Stack orientation="vertical" classes="w-full">
          <Stack
            as="button"
            grid
            cols="20% 1fr"
            spacing={4}
            alignItems="center"
            classes="relative h-full w-full px-1 py-2 text-left active:after:absolute active:after:inset-0 active:after:-z-10 active:after:rounded-xl active:after:bg-slate-100"
          >
            <Icon.lightning className="justify-self-center" />
            <Text classes="select-none font-bold">Fast charge</Text>
          </Stack>
          <Stack
            as="button"
            grid
            cols="20% 1fr"
            spacing={4}
            alignItems="center"
            classes="relative h-full w-full px-1 py-2 text-left active:after:absolute active:after:inset-0 active:after:-z-10 active:after:rounded-xl active:after:bg-slate-100"
          >
            <Icon.clock className="justify-self-center" />
            <Text classes="select-none font-bold">History of shifts</Text>
          </Stack>
          <Stack
            as="button"
            grid
            cols="20% 1fr"
            spacing={4}
            alignItems="center"
            classes="relative h-full w-full px-1 py-2 text-left active:after:absolute active:after:inset-0 active:after:-z-10 active:after:rounded-xl active:after:bg-slate-100"
          >
            <Icon.calculator className="justify-self-center" />
            <Text classes="select-none font-bold">Estimate income</Text>
          </Stack>
        </Stack>
      </Drawer>
    </>
  );
}

export default DrawerMenu;
