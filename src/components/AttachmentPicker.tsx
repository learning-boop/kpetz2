import { useEffect, useState } from "react";
import { FileVideo, ImagePlus, X } from "lucide-react";

const MAX_FILES = 5;

type Props = {
  files: File[];
  onChange: (files: File[]) => void;
};

/**
 * Shows chosen photos as thumbnails rather than a list of filenames, so the
 * person can see they've picked the right image of the right animal.
 *
 * Each file gets its own remove button. Previously the only way to drop one
 * was to re-select the whole set, because a file input's value can't be
 * partially edited.
 */
export default function AttachmentPicker({ files, onChange }: Props) {
  const [previews, setPreviews] = useState<Record<string, string>>({});

  // Object URLs hold memory until revoked, so they're rebuilt and cleaned up
  // whenever the selection changes.
  useEffect(() => {
    const next: Record<string, string> = {};
    files.forEach((f) => {
      if (f.type.startsWith("image/")) next[f.name + f.size] = URL.createObjectURL(f);
    });
    setPreviews(next);
    return () => Object.values(next).forEach(URL.revokeObjectURL);
  }, [files]);

  const add = (picked: FileList | null) => {
    if (!picked) return;
    const merged = [...files];
    Array.from(picked).forEach((f) => {
      const duplicate = merged.some((m) => m.name === f.name && m.size === f.size);
      if (!duplicate && merged.length < MAX_FILES) merged.push(f);
    });
    onChange(merged);
  };

  const remove = (index: number) => onChange(files.filter((_, i) => i !== index));

  return (
    <div>
      <span className="mb-1.5 block font-display text-[11px] font-extrabold uppercase tracking-[0.14em] text-white">
        Photos or video{" "}
        <span className="font-semibold normal-case tracking-normal text-white/60">
          — optional
        </span>
      </span>

      {files.length > 0 && (
        <ul className="mb-3 flex flex-wrap gap-2.5">
          {files.map((file, i) => {
            const preview = previews[file.name + file.size];
            return (
              <li key={file.name + file.size} className="relative">
                <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-xl bg-white/15">
                  {preview ? (
                    <img src={preview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <FileVideo className="h-7 w-7 text-white/70" aria-hidden="true" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label={`Remove ${file.name}`}
                  className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-ink text-white shadow-md transition hover:bg-white hover:text-ink"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <span className="mt-1 block w-20 truncate text-center text-[10px] font-semibold text-white/70">
                  {Math.round(file.size / 1024)} KB
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {files.length < MAX_FILES && (
        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-white/35 px-4 py-3.5 transition hover:border-white/60 hover:bg-white/5">
          <ImagePlus className="h-5 w-5 shrink-0 text-white/80" aria-hidden="true" />
          <span className="text-[14px] font-semibold text-white">
            {files.length ? "Add another" : "Add a photo of the problem"}
          </span>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(e) => {
              add(e.target.files);
              e.target.value = ""; // lets the same file be re-picked after removal
            }}
            className="sr-only"
          />
        </label>
      )}

      <span className="mt-2 block text-xs font-semibold text-white/75">
        A clear photo tells the vet far more than a description. Up to {MAX_FILES} files.
      </span>
    </div>
  );
}
