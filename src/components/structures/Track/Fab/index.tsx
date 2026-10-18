"use client";

import { useRef, useState } from "react";

import dynamic from "next/dynamic";
import { useOnClickOutside } from "usehooks-ts";

import { useDrawerTaxFromDB, useTaxDialog } from "@/components/structures/Track/Tax";
import FloatingActionButton from "@/components/ui/Fab";
import Icon from "@/components/ui/Icons";

import useDelayed from "@/hooks/useDelayed";
import useStatus from "@/hooks/useStatus";
import useTrack from "@/hooks/useTrack";

import { useNotes } from "@/store/useNotesStore";

const TaxDialog = dynamic(() => import("@/components/structures/Track/Tax"), {
  ssr: false,
});

const Notes = dynamic(() => import("@/components/modules/Notes/Notes"), {
  ssr: false,
});

const FAB_MS_STAGER = 300;

function FabNotes() {
  const menuRef = useRef<HTMLButtonElement>(null);
  const notesRef = useRef<HTMLButtonElement>(null);
  const taxesRef = useRef<HTMLButtonElement>(null);
  const { isShiftActive } = useTrack();
  const { open } = useNotes();
  const { isOpen: isTaxDialogOpen } = useTaxDialog();
  const { isOpen: isDrawerTaxOpen } = useDrawerTaxFromDB((state) => state);
  const status = useStatus(isShiftActive);
  const [show, setShow] = useState(false);
  const showDelayed = useDelayed(show, FAB_MS_STAGER);

  useOnClickOutside([menuRef, notesRef, taxesRef], () => {
    if (open || isDrawerTaxOpen || isTaxDialogOpen) return;
    setShow(false);
  });

  function onShowMenu() {
    setShow((prev) => !prev);
  }

  return (
    <>
      {isShiftActive ? (
        <>
          <FloatingActionButton
            ref={menuRef}
            classes="absolute bottom-24 right-2 z-50 size-16 animate-fade-in border-none bg-linear-to-br from-green-400 to-blue-500 active:shadow-button-inner"
            onClick={onShowMenu}
            icon={<Icon.plus />}
          />
          {showDelayed ? (
            <>
              <Notes>
                <FloatingActionButton
                  ref={notesRef}
                  disabled={!status}
                  classes={`absolute bottom-42 right-4 z-10 size-12 border-none bg-linear-to-br from-amber-200 to-yellow-300 transition-all [&>span]:text-xs ${!status ? "bg-linear-to-br from-gray-300 to-stone-500" : "active:shadow-button-inner"} ${show ? "show_up" : "show_down"}`}
                  text="Notes"
                />
              </Notes>
              <TaxDialog>
                <FloatingActionButton
                  ref={taxesRef}
                  disabled={!status}
                  classes={`absolute bottom-56 right-4 z-0 size-12 border-none bg-linear-to-br from-red-200 to-violet-300 transition-all [&>span]:text-xs ${!status ? "bg-linear-to-br from-gray-300 to-stone-500" : "active:shadow-button-inner"} ${show ? "show_up_dialog" : "show_down_dialog"}`}
                  text="Taxes"
                />
              </TaxDialog>
            </>
          ) : null}
        </>
      ) : null}
    </>
  );
}

export default FabNotes;
