"use client";

import { useRef, useState } from "react";

import { Plus, Receipt, StickyNote } from "lucide-react";
import dynamic from "next/dynamic";
import { useOnClickOutside } from "usehooks-ts";

import { useDrawerTaxFromDB, useTaxDialog } from "@/components/structures/Track/Tax";
import FloatingActionButton from "@/components/ui/Fab";

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
            aria-label={show ? "Close shift tools" : "Open shift tools"}
            aria-expanded={show}
            classes="absolute bottom-24 right-2 z-50 size-14 animate-fade-in border-none bg-primary text-primary-foreground shadow-float hover:bg-primary"
            onClick={onShowMenu}
            icon={
              <Plus
                className={`size-6 transition-transform duration-200 ${show ? "rotate-45" : ""}`}
                aria-hidden="true"
              />
            }
          />
          {showDelayed ? (
            <>
              <Notes>
                <FloatingActionButton
                  ref={notesRef}
                  disabled={!status}
                  classes={`absolute bottom-40 right-3 z-10 size-12 gap-0 border border-border bg-surface p-0 text-ink shadow-float [&>span]:text-[0.625rem] ${show ? "show_up" : "show_down"}`}
                  icon={<StickyNote className="size-4" aria-hidden="true" />}
                  text="Notes"
                />
              </Notes>
              <TaxDialog>
                <FloatingActionButton
                  ref={taxesRef}
                  disabled={!status}
                  classes={`absolute bottom-56 right-3 z-0 size-12 gap-0 border border-border bg-surface p-0 text-ink shadow-float [&>span]:text-[0.625rem] ${show ? "show_up_dialog" : "show_down_dialog"}`}
                  icon={<Receipt className="size-4" aria-hidden="true" />}
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
