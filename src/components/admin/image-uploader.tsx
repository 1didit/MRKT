"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { uploadImagesAction } from "@/lib/admin/product-actions";
import { cn } from "@/lib/utils";

function SortableImage({
  url,
  primary,
  onRemove,
}: {
  url: string;
  primary: boolean;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: url });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group relative aspect-[3/4] cursor-grab overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50",
        isDragging && "z-10 ring-2 ring-accent",
      )}
      {...attributes}
      {...listeners}
    >
      <Image
        src={url}
        alt=""
        fill
        sizes="140px"
        className="pointer-events-none object-cover"
      />
      {primary && (
        <span className="absolute left-1 top-1 rounded bg-accent px-1.5 py-0.5 text-[10px] font-medium text-white">
          Primary
        </span>
      )}
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onRemove}
        aria-label="Remove image"
        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-zinc-700 opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100 cursor-pointer"
      >
        <X size={13} />
      </button>
    </div>
  );
}

export function ImageUploader({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function onFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    setUploading(true);
    const fd = new FormData();
    Array.from(fileList).forEach((f) => fd.append("files", f));
    const res = await uploadImagesAction(fd);
    setUploading(false);
    if (res.ok) {
      onChange([...value, ...res.urls]);
    } else {
      toast.error(res.error);
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = value.indexOf(String(active.id));
    const newIndex = value.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(value, oldIndex, newIndex));
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={value} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
            {value.map((url, i) => (
              <SortableImage
                key={url}
                url={url}
                primary={i === 0}
                onRemove={() => onChange(value.filter((u) => u !== url))}
              />
            ))}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex aspect-[3/4] flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-zinc-300 text-xs text-zinc-500 transition-colors hover:border-accent hover:text-accent cursor-pointer"
            >
              <ImagePlus size={18} />
              {uploading ? "Uploading…" : "Add"}
            </button>
          </div>
        </SortableContext>
      </DndContext>
      <input
        ref={inputRef}
        type="file"
        accept="image/webp,image/jpeg,image/png,image/avif"
        multiple
        hidden
        onChange={(e) => onFiles(e.target.files)}
      />
      <p className="mt-2 text-xs text-zinc-400">
        Drag to reorder · first image is the primary
      </p>
    </>
  );
}
