import { useEffect, useRef } from "react";

import type { SavedEmployer } from "@/types";

import useEmployers from "@/hooks/useEmployers";
import useUser from "@/hooks/useUser";

/**
 * Prefills the employer chosen in Settings, once, when the form opens with
 * none picked. `apply` is the same thing picking it by hand does (it also
 * brings the employer's rate and currency). An archived or deleted employer
 * is skipped.
 */
function useDefaultEmployer(
  current: number | null | undefined,
  apply: (employer: SavedEmployer) => void
) {
  const { data: user } = useUser();
  const { byId, isLoading } = useEmployers();
  const id = user?.config?.defaultEmployerId;
  const done = useRef(false);
  const applyRef = useRef(apply);

  useEffect(() => {
    applyRef.current = apply;
  });

  useEffect(() => {
    if (done.current || isLoading || !user) return;
    done.current = true;
    if (id == null || current != null) return;
    const employer = byId.get(id);
    if (employer && !employer.archived) applyRef.current(employer);
  }, [byId, current, id, isLoading, user]);
}

export default useDefaultEmployer;
