import React, { useMemo, useState } from 'react';

type StudentSubmitAssignmentProps = {
  assignmentId?: string;
  assignmentTitle?: string;
  onClose?: () => void;
};

/**
 * UI-only upload screen (no backend).
 * Allows selecting one or more local files via <input type="file" />.
 */
export default function StudentSubmitAssignment({
  assignmentId,
  assignmentTitle,
  onClose,
}: StudentSubmitAssignmentProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [touched, setTouched] = useState(false);

  const title = assignmentTitle ?? 'Assignment';
  const id = assignmentId ?? '(not set)';

  const acceptError = useMemo(() => {
    if (!touched) return null;
    if (selectedFiles.length === 0) return 'Please choose at least one file.';
    return null;
  }, [selectedFiles.length, touched]);

  const onPickFiles: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.target.files;
    if (!files) return;
    const arr = Array.from(files);

    // Keep previously selected files and append new ones (dedupe by name+size).
    const existingKeys = new Set(selectedFiles.map((f) => `${f.name}:${f.size}`));
    const merged: File[] = [...selectedFiles];
    for (const f of arr) {
      const key = `${f.name}:${f.size}`;
      if (!existingKeys.has(key)) merged.push(f);
    }

    setSelectedFiles(merged);
    setTouched(true);
  };

  const removeFile = (idx: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
    setTouched(true);
  };

  const handleLocalSubmit = () => {
    setTouched(true);
    if (selectedFiles.length === 0) return;

    // UI-only confirmation
    alert(
      `Selected ${selectedFiles.length} file(s) for submission.\n\nAssignment: ${title}\nID: ${id}`
    );

    // Optional: keep files or clear after submit. Here we clear.
    setSelectedFiles([]);
    setTouched(false);

    // Optional close for modal flows.
    onClose?.();
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Submit Work</h2>
            <p className="text-gray-500 mt-1">
              {title} <span className="text-gray-400">•</span> ID: <span className="font-mono">{id}</span>
            </p>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 font-medium"
              aria-label="Close"
            >
              ✕
            </button>
          )}
        </div>

        <div className="p-6 space-y-5">
          <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
            <p className="font-semibold text-gray-800">Choose your files</p>
            <p className="text-sm text-gray-600 mt-1">
              Upload PDF/images/docs from your local device. (No backend—UI only.)
            </p>

            <div className="mt-4">
              <input
                type="file"
                multiple
                onChange={onPickFiles}
                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {acceptError && <div className="mt-2 text-sm text-red-600 font-medium">{acceptError}</div>}
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="font-semibold text-gray-800">Selected files</p>
              <ul className="divide-y divide-gray-100">
                {selectedFiles.map((f, idx) => (
                  <li key={`${f.name}:${f.size}:${idx}`} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{f.name}</p>
                      <p className="text-xs text-gray-500">{Math.max(1, Math.round(f.size / 1024))} KB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="shrink-0 px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-700"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={() => {
                setSelectedFiles([]);
                setTouched(false);
              }}
              className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium"
              disabled={selectedFiles.length === 0}
            >
              Clear
            </button>

            <button
              type="button"
              onClick={handleLocalSubmit}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Submit (UI only)
            </button>
          </div>

          <div className="text-xs text-gray-500">
            Tip: If you want to wire this to a real backend later, replace the submit handler with an API call and upload `selectedFiles`.
          </div>
        </div>
      </div>
    </div>
  );
}

