"use client";

import { useEffect, useRef, useState } from "react";

import { useOnClickOutside } from "usehooks-ts";

import TaxDialog from "@/components/structures/Track/Tax";
import FloatingActionButton from "@/components/ui/Fab";
import Icon from "@/components/ui/Icons";

import useStatus from "@/hooks/useStatus";
import useTrack from "@/hooks/useTrack";

import { useNotesStore } from "@/store/useNotesStore";

const FAB_MS_STAGER = 150;

function FabNotes() {
  const menuRef = useRef<HTMLButtonElement>(null);
  const notesRef = useRef<HTMLButtonElement>(null);
  const taxesRef = useRef<HTMLButtonElement>(null);
  const { notesToggle } = useNotesStore();
  const { isShiftActive } = useTrack();
  const status = useStatus(isShiftActive);
  const [show, setShow] = useState(false);
  useOnClickOutside([menuRef, notesRef, taxesRef], () => {
    setShow(false);
  });

  function onShowMenu() {
    setShow((prev) => !prev);
  }

  useEffect(() => {
    /*
      Toggle the position when show is true of Notes Fab Button
    */
    if (show) {
      notesRef.current?.classList.add("bottom-[10.5rem]");
      notesRef.current?.classList.remove("bottom-[6.5rem]");
    } else {
      notesRef.current?.classList.remove("bottom-[10.5rem]");
      notesRef.current?.classList.add("bottom-[6.5rem]");
    }
  }, [show]);

  useEffect(() => {
    /*
      Toggle the position when show is true and wait certain ms of Taxes Fab Button
    */
    if (show) {
      setTimeout(() => {
        taxesRef.current?.classList.add("bottom-[14rem]");
        taxesRef.current?.classList.remove("bottom-[6.5rem]");
      }, FAB_MS_STAGER);
    } else {
      setTimeout(() => {
        taxesRef.current?.classList.remove("bottom-[14rem]");
        taxesRef.current?.classList.add("bottom-[6.5rem]");
      }, FAB_MS_STAGER);
    }
  }, [show]);

  return (
    <>
      <FloatingActionButton
        ref={menuRef}
        classes="absolute bottom-24 right-2 z-50 size-16 border-none bg-gradient-to-br from-green-400 to-blue-500 active:shadow-button-inner"
        onClick={onShowMenu}
        icon={<Icon.plus />}
      />
      <FloatingActionButton
        ref={notesRef}
        disabled={!status}
        onClick={() => notesToggle()}
        classes={`absolute bottom-[6.5rem] right-4 z-10 size-12 border-none bg-gradient-to-br from-amber-200 to-yellow-300 [&>span]:text-xs ${!status ? "bg-gradient-to-br from-gray-300 to-stone-500" : "active:shadow-button-inner"}`}
        text="Notes"
      />
      <TaxDialog>
        <FloatingActionButton
          ref={taxesRef}
          disabled={!status}
          classes={`absolute bottom-[6.5rem] right-4 z-0 size-12 border-none bg-gradient-to-br from-red-200 to-violet-300 [&>span]:text-xs ${!status ? "bg-gradient-to-br from-gray-300 to-stone-500" : "active:shadow-button-inner"}`}
          text="Taxes"
        />
      </TaxDialog>
    </>
  );
}

export default FabNotes;
