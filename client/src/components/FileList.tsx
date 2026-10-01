import { useRef } from 'react';
import { Plus } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import FileItem from './FileItem';
import UploadZone from './UploadZone';
import type { UploadedFile } from '../types/file';
import { validateFile, createUploadedFile } from '../utils/fileUtils';

interface FileListProps {
  files: UploadedFile[];
  onFilesAdded: (files: UploadedFile[]) => void;
  onRemove: (id: string) => void;
  onReorder: (files: UploadedFile[]) => void;
  showDragHandles?: boolean;
}

export default function FileList({
  files,
  onFilesAdded,
  onRemove,
  onReorder,
  showDragHandles = false,
}: FileListProps) {
  const addMoreInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = files.findIndex(f => f.id === active.id);
      const newIndex = files.findIndex(f => f.id === over.id);
      const reordered = arrayMove(files, oldIndex, newIndex);
      onReorder(reordered);
    }
  };

  const handleAddMoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const validFiles: UploadedFile[] = [];
      Array.from(e.target.files).forEach(f => {
        if (!validateFile(f)) {
          validFiles.push(createUploadedFile(f));
        }
      });
      if (validFiles.length) onFilesAdded(validFiles);
      e.target.value = '';
    }
  };

  if (files.length === 0) {
    return (
      <UploadZone onFilesAdded={onFilesAdded} existingCount={0} />
    );
  }

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={showDragHandles ? [restrictToVerticalAxis, restrictToParentElement] : []}
      >
        <SortableContext items={files.map(f => f.id)} strategy={verticalListSortingStrategy}>
          <div
            className="file-list"
            role="list"
            aria-label="Selected files"
          >
            {files.map((file, index) => (
              <FileItem
                key={file.id}
                file={file}
                onRemove={onRemove}
                showDragHandle={showDragHandles}
                index={index}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add more files button */}
      <button
        type="button"
        className="btn-add-more"
        style={{ marginTop: 12 }}
        onClick={() => addMoreInputRef.current?.click()}
        aria-label="Add more files"
      >
        <Plus size={18} aria-hidden="true" />
        Add More Files
      </button>
      <input
        ref={addMoreInputRef}
        type="file"
        multiple
        accept=".doc,.docx,.txt,.rtf,.odt,.ppt,.pptx,.odp,.xls,.xlsx,.ods,.csv,.jpg,.jpeg,.png,.webp,.bmp,.tiff,.tif,.html,.htm,.pdf"
        onChange={handleAddMoreChange}
        style={{ display: 'none' }}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}
