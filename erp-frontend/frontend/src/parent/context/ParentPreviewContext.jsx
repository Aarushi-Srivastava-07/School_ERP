import { createContext, useContext, useMemo, useState } from "react";
import { useERP } from "../../context/ERPContext.jsx";

const ParentPreviewContext = createContext(undefined);

export function ParentPreviewProvider({ children }) {
  const { parents, students } = useERP();

  // Only active parent records are eligible to preview.
  const activeParents = useMemo(
    () => parents.filter((p) => p.active !== false),
    [parents]
  );

  const [selectedId, setSelectedId] = useState(null);

  const parent = useMemo(() => {
    if (activeParents.length === 0) return null;

    const found =
      selectedId &&
      activeParents.find((p) => p.id === selectedId);

    return found || activeParents[0];
  }, [activeParents, selectedId]);

  // Students are linked using phone number.
  const linkedStudents = useMemo(() => {
    if (!parent) return [];

    return students.filter((s) => s.phone === parent.phone);
  }, [students, parent]);

  const child = useMemo(() => {
    if (linkedStudents.length === 0) return null;

    return (
      linkedStudents.find((s) => s.status === "Active") ||
      linkedStudents[0]
    );
  }, [linkedStudents]);

  const selectParent = (id) => setSelectedId(id);

  const value = {
    activeParents,
    parent,
    linkedStudents,
    child,
    selectParent,
  };

  return (
    <ParentPreviewContext.Provider value={value}>
      {children}
    </ParentPreviewContext.Provider>
  );
}

export function useParentPreview() {
  const ctx = useContext(ParentPreviewContext);

  if (ctx === undefined) {
    throw new Error(
      "useParentPreview must be used within a ParentPreviewProvider"
    );
  }

  return ctx;
}
