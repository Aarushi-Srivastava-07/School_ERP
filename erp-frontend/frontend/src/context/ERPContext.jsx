/**
 * ERPContext.jsx — School ERP | Shared State Layer
 * Single source of truth for students, teachers, parents, and activities.
 * Provides typed action helpers so every module logs activities automatically.
 */

import { createContext, useContext, useState, useEffect, useCallback } from "react";

// ─── Storage keys ────────────────────────────────────────────────────────────
const STUDENTS_STORAGE_KEY  = "erp_students_v1";
const STUDENTS_COUNTER_KEY  = "erp_students_counter_v1";
const TEACHERS_STORAGE_KEY  = "erp_teachers_v1";
const PARENTS_STORAGE_KEY   = "erp_parents_v1";
const ACTIVITIES_STORAGE_KEY = "erp_activities_v1";

// ─── localStorage helpers ────────────────────────────────────────────────────
// The ERP starts with a completely empty database. Every record (students,
// teachers, parents, activities) is created by the user through the CRUD
// forms — nothing is preloaded or randomly generated.
const studentStorage = {
  getStudents: () => { try { return JSON.parse(localStorage.getItem(STUDENTS_STORAGE_KEY)) || []; } catch { return []; } },
  setStudents: (d) => localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(d)),
  getCounter:  () => { try { return parseInt(localStorage.getItem(STUDENTS_COUNTER_KEY), 10) || 1; } catch { return 1; } },
  setCounter:  (v) => localStorage.setItem(STUDENTS_COUNTER_KEY, String(v)),
};

const teacherStorage = {
  get: () => { try { return JSON.parse(localStorage.getItem(TEACHERS_STORAGE_KEY)) || []; } catch { return []; } },
  set: (d) => localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(d)),
};

const parentStorage = {
  get: () => { try { return JSON.parse(localStorage.getItem(PARENTS_STORAGE_KEY)) || []; } catch { return []; } },
  set: (d) => localStorage.setItem(PARENTS_STORAGE_KEY, JSON.stringify(d)),
};

const activityStorage = {
  get: () => { try { return JSON.parse(localStorage.getItem(ACTIVITIES_STORAGE_KEY)) || []; } catch { return []; } },
  set: (d) => localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(d)),
};

// ─── Activity ID generator ────────────────────────────────────────────────────
const generateActivityId = (existingActivities) => {
  const year = new Date().getFullYear();
  const prefix = `ACT${year}`;
  const taken = existingActivities
    .map((a) => a.id)
    .filter((id) => id && id.startsWith(prefix))
    .map((id) => parseInt(id.replace(prefix, ""), 10))
    .filter((n) => !isNaN(n));
  const next = taken.length > 0 ? Math.max(...taken) + 1 : 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
};

// ─── Activity message templates ──────────────────────────────────────────────
// Same Recent Activity feature, same data shape, same UI — only the generated
// `description` text is made more readable. Each entry takes the record's
// display name and ID and returns one human-readable sentence.
const ACTIVITY_MESSAGE_TEMPLATES = {
  "Student Added":        (name, id) => `New student ${name} (${id}) was admitted and added to the system.`,
  "Student Updated":      (name, id) => `Student ${name} (${id}) details were updated.`,
  "Student Deactivated":  (name, id) => `Student ${name} (${id}) was marked inactive.`,
  "Student Restored":     (name, id) => `Student ${name} (${id}) was restored to active status.`,
  "Student Deleted":      (name, id) => `Student ${name} (${id}) was removed from the system.`,

  "Teacher Added":        (name, id) => `New teacher ${name} (${id}) was added to the system.`,
  "Teacher Updated":      (name, id) => `Teacher ${name} (${id}) details were updated.`,
  "Teacher Deactivated":  (name, id) => `Teacher ${name} (${id}) was marked inactive.`,
  "Teacher Restored":     (name, id) => `Teacher ${name} (${id}) was restored to active status.`,

  "Parent Created":       (name, id) => `Parent record for ${name} (${id}) was automatically created from student admission.`,
  "Parent Updated":       (name, id) => `Parent ${name} (${id}) details were synchronized with student records.`,
  "Parent Deactivated":   (name, id) => `Parent ${name} (${id}) was moved to inactive — no active children remain.`,
  "Parent Restored":      (name, id) => `Parent ${name} (${id}) was restored to active status.`,
};

const buildActivityDescription = (type, name, id) => {
  const template = ACTIVITY_MESSAGE_TEMPLATES[type];
  return template ? template(name, id) : `${type}: ${name} (${id})`;
};

// ─── Student ↔ Parent sync helpers ───────────────────────────────────────────
const generateParentId = (allParents) => {
  const year = new Date().getFullYear();
  const prefix = `PAR${year}`;
  const taken = allParents
    .map((p) => p.id)
    .filter((id) => id.startsWith(prefix))
    .map((id) => parseInt(id.replace(prefix, ""), 10))
    .filter((n) => !isNaN(n));
  const next = taken.length > 0 ? Math.max(...taken) + 1 : 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
};

// ─── Context ─────────────────────────────────────────────────────────────────
const ERPContext = createContext(undefined);

export function ERPProvider({ children }) {
  const [students, setStudents]             = useState(() => studentStorage.getStudents());
  const [studentCounter, setStudentCounter] = useState(() => studentStorage.getCounter());
  const [teachers, setTeachers]             = useState(() => teacherStorage.get());
  const [parents, setParents]               = useState(() => parentStorage.get());
  const [activities, setActivities]         = useState(() => activityStorage.get());

  // ── Persist every module so ERPContext remains the single source of truth ──
  useEffect(() => { studentStorage.setStudents(students); }, [students]);
  useEffect(() => { studentStorage.setCounter(studentCounter); }, [studentCounter]);
  useEffect(() => { teacherStorage.set(teachers); }, [teachers]);
  useEffect(() => { parentStorage.set(parents); }, [parents]);
  useEffect(() => { activityStorage.set(activities); }, [activities]);

  // ── Activity logger ───────────────────────────────────────────────────────
  const addActivity = useCallback((type, name, id) => {
    setActivities((prev) => {
      const newActivity = {
        id: generateActivityId(prev),
        type,
        description: buildActivityDescription(type, name, id),
        date: new Date().toISOString().split("T")[0],
        timestamp: new Date().toISOString(),
        module: type.startsWith("Student") ? "Students" : type.startsWith("Teacher") ? "Teachers" : "Parents",
        recordName: name,
        recordId: id,
        status: "Completed",
      };
      return [newActivity, ...prev];
    });
  }, []);

  // ── Student actions ───────────────────────────────────────────────────────

  const addStudent = useCallback((studentData, counter) => {
    const year = new Date().getFullYear();
    const seq  = String(counter).padStart(4, "0");
    const newId = `STD${year}${seq}`;
    const newStudent = {
      id: `internal_${Date.now()}`,
      studentId: newId,
      ...studentData,
      status: "Active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setStudents((prev) => [...prev, newStudent]);
    setStudentCounter((c) => c + 1);

    // ── Auto-create or update parent record (never created manually) ──
    let parentEvent = null; // { type, name, id } — logged after this render commits

    setParents((prevParents) => {
      const normalizedPhone = studentData.phone.trim();
      const normalizedName  = studentData.parentName.trim();
      // Match by phone (primary key for parent identity)
      const existingIdx = prevParents.findIndex(
        (p) => p.phone === normalizedPhone
      );
      if (existingIdx !== -1) {
        // Parent already exists — attach this child instead of creating a duplicate
        const existing = prevParents[existingIdx];
        const children = existing.children || [existing.studentName].filter(Boolean);
        if (!children.includes(studentData.name.trim())) {
          children.push(studentData.name.trim());
        }
        const updated = {
          ...existing,
          children,
          studentName: children.join(", "),
          numberOfChildren: children.length,
          active: true,
          parentStatus: "Active",
        };
        parentEvent = { type: "Parent Updated", name: updated.name, id: existing.id };
        const next = [...prevParents];
        next[existingIdx] = updated;
        return next;
      } else {
        // No matching parent — create one automatically from admission data
        const newParentId = generateParentId(prevParents);
        const newParent = {
          id: newParentId,
          name: normalizedName,
          studentName: studentData.name.trim(),
          children: [studentData.name.trim()],
          numberOfChildren: 1,
          relationship: studentData.relationship || "",
          occupation: "",
          phone: normalizedPhone,
          altPhone: "",
          email: studentData.email.trim(),
          address: studentData.address.trim(),
          parentStatus: "Active",
          active: true,
        };
        parentEvent = { type: "Parent Created", name: newParent.name, id: newParentId };
        return [...prevParents, newParent];
      }
    });

    addActivity("Student Added", studentData.name.trim(), newId);
    if (parentEvent) {
      setTimeout(() => addActivity(parentEvent.type, parentEvent.name, parentEvent.id), 0);
    }
    return newId;
  }, [addActivity]);

  const updateStudent = useCallback((id, updatedData) => {
    let studentName  = "";
    let studentId    = "";
    let originalPhone = "";
    let originalName  = "";

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          studentName   = updatedData.name?.trim() || s.name;
          studentId     = s.studentId;
          originalPhone = s.phone;
          originalName  = s.name;
          return { ...s, ...updatedData, updatedAt: new Date().toISOString() };
        }
        return s;
      })
    );

    // Sync parent: any parent-related field change (name, phone, email,
    // address, relationship) flows straight through to the Parent record.
    // The parent is located by the student's PREVIOUS phone, since phone is
    // the parent's identity key — this also lets the child's entry in the
    // parent's children list be renamed in place if the student's own name
    // changed at the same time.
    let syncedParent = null;
    setParents((prevParents) => {
      if (!originalPhone) return prevParents;
      return prevParents.map((p) => {
        if (p.phone !== originalPhone) return p;

        const oldChildren = p.children || [p.studentName].filter(Boolean);
        const children = oldChildren.map((c) => (c === originalName ? studentName : c));

        const updated = {
          ...p,
          name:         updatedData.parentName?.trim() || p.name,
          relationship: updatedData.relationship || p.relationship,
          phone:        updatedData.phone?.trim() || p.phone,
          email:        updatedData.email?.trim() || p.email,
          address:      updatedData.address?.trim() || p.address,
          children,
          studentName: children.join(", "),
        };
        syncedParent = updated;
        return updated;
      });
    });

    setTimeout(() => {
      if (studentName && studentId) {
        addActivity("Student Updated", studentName, studentId);
      }
      if (syncedParent) {
        addActivity("Parent Updated", syncedParent.name, syncedParent.id);
      }
    }, 0);
  }, [addActivity]);

  const deleteStudent = useCallback((id) => {
    let deletedName  = "";
    let deletedId    = "";
    let deletedPhone = "";

    setStudents((prev) => {
      const found = prev.find((s) => s.id === id);
      if (found) { deletedName = found.name; deletedId = found.studentId; deletedPhone = found.phone; }
      return prev.filter((s) => s.id !== id);
    });

    // Remove child reference from parent.
    // The parent must never remain Active with zero (active) children, but it
    // must also stay Active as long as at least one active child remains.
    // Consistent with the rest of the ERP's soft-delete architecture, an
    // emptied-out parent is moved to Inactive rather than removed outright.
    let parentEvent = null;
    setParents((prevParents) =>
      prevParents.map((p) => {
        if (p.phone !== deletedPhone) return p;
        const children = (p.children || [p.studentName].filter(Boolean)).filter(
          (name) => name !== deletedName
        );
        const hasChildren = children.length > 0;
        const updated = {
          ...p,
          children,
          studentName: children.join(", "),
          numberOfChildren: children.length,
          active: hasChildren,
          parentStatus: hasChildren ? "Active" : "Inactive",
          cascadedStudentIds: (p.cascadedStudentIds || []).filter((sid) => sid !== id),
        };
        parentEvent = {
          type: hasChildren ? "Parent Updated" : "Parent Deactivated",
          name: p.name,
          id: p.id,
        };
        return updated;
      })
    );

    setTimeout(() => {
      if (deletedName && deletedId) {
        addActivity("Student Deleted", deletedName, deletedId);
      }
      if (parentEvent) {
        addActivity(parentEvent.type, parentEvent.name, parentEvent.id);
      }
    }, 0);
  }, [addActivity]);

  const toggleStudentStatus = useCallback((id) => {
    let name   = "";
    let stdId  = "";
    let action = "";
    let studentPhone = "";
    let studentFullName = "";
    let willBeActive = false;

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          name   = s.name;
          stdId  = s.studentId;
          studentPhone = s.phone;
          studentFullName = s.name;
          willBeActive = s.status !== "Active";
          action = s.status === "Active" ? "Student Deactivated" : "Student Restored";
          return { ...s, status: willBeActive ? "Active" : "Inactive", updatedAt: new Date().toISOString() };
        }
        return s;
      })
    );

    // Keep the matching parent's active status in sync with their children.
    // A parent must never stay Active with zero active children, and must
    // not be deactivated while at least one active child remains.
    let parentEvent = null;
    setParents((prevParents) => {
      const idx = prevParents.findIndex((p) => p.phone === studentPhone);
      if (idx === -1) return prevParents;

      const existing = prevParents[idx];
      const inactiveChildren = (existing.inactiveChildren || []).filter(
        (n) => n !== studentFullName
      );
      if (!willBeActive) inactiveChildren.push(studentFullName);

      const allChildren = existing.children || [existing.studentName].filter(Boolean);
      const hasActiveChild = allChildren.some((c) => !inactiveChildren.includes(c));

      const updated = {
        ...existing,
        inactiveChildren,
        active: hasActiveChild,
        parentStatus: hasActiveChild ? "Active" : "Inactive",
        // This student's status just changed directly — it's no longer a
        // "pending cascade restore" candidate either way, so drop it from
        // the bookkeeping list to avoid stale resurrection on parent restore.
        cascadedStudentIds: (existing.cascadedStudentIds || []).filter((sid) => sid !== id),
      };

      if (updated.active !== existing.active) {
        parentEvent = {
          type: updated.active ? "Parent Restored" : "Parent Deactivated",
          name: updated.name,
          id: updated.id,
        };
      }

      const next = [...prevParents];
      next[idx] = updated;
      return next;
    });

    setTimeout(() => {
      if (name && stdId) addActivity(action, name, stdId);
      if (parentEvent) addActivity(parentEvent.type, parentEvent.name, parentEvent.id);
    }, 0);
  }, [addActivity]);

  // ── Teacher actions ───────────────────────────────────────────────────────

  const addTeacher = useCallback((teacherData, newId) => {
    setTeachers((prev) => [...prev, { id: newId, ...teacherData, active: true }]);
    addActivity("Teacher Added", teacherData.name, newId);
  }, [addActivity]);

  const updateTeacher = useCallback((id, updatedData) => {
    let name = "";
    setTeachers((prev) =>
      prev.map((t) => {
        if (t.id === id) { name = updatedData.name || t.name; return { ...t, ...updatedData }; }
        return t;
      })
    );
    setTimeout(() => { if (name) addActivity("Teacher Updated", name, id); }, 0);
  }, [addActivity]);

  const deactivateTeacher = useCallback((id) => {
    let name = "";
    setTeachers((prev) =>
      prev.map((t) => { if (t.id === id) { name = t.name; return { ...t, active: false }; } return t; })
    );
    setTimeout(() => { if (name) addActivity("Teacher Deactivated", name, id); }, 0);
  }, [addActivity]);

  const restoreTeacher = useCallback((id) => {
    let name = "";
    setTeachers((prev) =>
      prev.map((t) => { if (t.id === id) { name = t.name; return { ...t, active: true }; } return t; })
    );
    setTimeout(() => { if (name) addActivity("Teacher Restored", name, id); }, 0);
  }, [addActivity]);

  // ── Parent actions ────────────────────────────────────────────────────────
  // Parent Management is not an independent CRUD module — Students.jsx is the
  // origin of Parent records (see addStudent/updateStudent/deleteStudent
  // above). The actions below only handle edits made directly on an existing
  // Parent record (Parents.jsx), and propagate those edits — including
  // deactivation/restoration — back down to that parent's Students so the two
  // modules never drift out of sync.

  const addParent = useCallback((parentData, newId) => {
    setParents((prev) => [...prev, { id: newId, ...parentData, active: true }]);
    addActivity("Parent Created", parentData.name, newId);
  }, [addActivity]);

  const updateParent = useCallback((id, updatedData) => {
    let name = "";
    let oldPhone = "";

    setParents((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          name = updatedData.name || p.name;
          oldPhone = p.phone;
          return { ...p, ...updatedData };
        }
        return p;
      })
    );

    // Reverse-sync: editing the Parent record directly (name, phone, email,
    // address, relationship) must update every Student that belongs to this
    // parent, so neither side ever holds stale duplicate data.
    setStudents((prevStudents) => {
      if (!oldPhone) return prevStudents;
      return prevStudents.map((s) => {
        if (s.phone !== oldPhone) return s;
        return {
          ...s,
          parentName:   updatedData.name?.trim() || s.parentName,
          relationship: updatedData.relationship || s.relationship,
          phone:        updatedData.phone?.trim() || s.phone,
          email:        updatedData.email?.trim() || s.email,
          address:      updatedData.address?.trim() || s.address,
          updatedAt: new Date().toISOString(),
        };
      });
    });

    setTimeout(() => { if (name) addActivity("Parent Updated", name, id); }, 0);
  }, [addActivity]);

  const deactivateParent = useCallback((id) => {
    let name = "";
    let phone = "";
    let cascadedStudentIds = [];

    // Discontinue every currently-active Student belonging to this parent.
    // Only the students this action itself deactivates are recorded, so a
    // later restore brings back exactly those — never a student who was
    // independently deactivated beforehand through Student Management.
    setStudents((prevStudents) => {
      const parentPhone = parents.find((p) => p.id === id)?.phone;
      phone = parentPhone || "";
      if (!phone) return prevStudents;
      return prevStudents.map((s) => {
        if (s.phone === phone && s.status === "Active") {
          cascadedStudentIds.push(s.id);
          return { ...s, status: "Inactive", updatedAt: new Date().toISOString() };
        }
        return s;
      });
    });

    setParents((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          name = p.name;
          return {
            ...p,
            active: false,
            parentStatus: "Inactive",
            cascadedStudentIds,
          };
        }
        return p;
      })
    );

    setTimeout(() => {
      if (name) addActivity("Parent Deactivated", name, id);
      cascadedStudentIds.forEach((sid) => {
        const s = students.find((st) => st.id === sid);
        if (s) addActivity("Student Deactivated", s.name, s.studentId);
      });
    }, 0);
  }, [addActivity, parents, students]);

  const restoreParent = useCallback((id) => {
    let name = "";
    let restoredStudentIds = [];

    setParents((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          name = p.name;
          restoredStudentIds = p.cascadedStudentIds || [];
          return { ...p, active: true, parentStatus: "Active", cascadedStudentIds: [] };
        }
        return p;
      })
    );

    // Restore only the students this parent's deactivation had cascaded —
    // students independently discontinued beforehand stay as they were.
    setStudents((prevStudents) =>
      prevStudents.map((s) =>
        restoredStudentIds.includes(s.id)
          ? { ...s, status: "Active", updatedAt: new Date().toISOString() }
          : s
      )
    );

    setTimeout(() => {
      if (name) addActivity("Parent Restored", name, id);
      restoredStudentIds.forEach((sid) => {
        const s = students.find((st) => st.id === sid);
        if (s) addActivity("Student Restored", s.name, s.studentId);
      });
    }, 0);
  }, [addActivity, students]);

  const value = {
    // Raw state (kept for backward-compat with any direct reads)
    students, setStudents,
    studentCounter, setStudentCounter,
    teachers, setTeachers,
    parents, setParents,
    activities,

    // Student actions
    addStudent,
    updateStudent,
    deleteStudent,
    toggleStudentStatus,

    // Teacher actions
    addTeacher,
    updateTeacher,
    deactivateTeacher,
    restoreTeacher,

    // Parent actions
    addParent,
    updateParent,
    deactivateParent,
    restoreParent,

    // Utility
    addActivity,
  };

  return <ERPContext.Provider value={value}>{children}</ERPContext.Provider>;
}

export function useERP() {
  const ctx = useContext(ERPContext);
  if (ctx === undefined) throw new Error("useERP must be used within an ERPProvider");
  return ctx;
}

export default ERPContext;