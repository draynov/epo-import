/**
 * Edit Subsection Modal
 * Модал за редакция на подсекция
 */

"use client";

import { Modal } from "@/components/ui";
import { PortfolioSubsectionDefinition } from "@/types";
import { DirectFieldsForm } from "./direct-fields-form";
import { RecordListForm } from "./record-list-form";

export interface EditSubsectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subsection: PortfolioSubsectionDefinition;
  initialData?: Record<string, unknown> | Array<Record<string, unknown>>;
  onSave: (data: Record<string, unknown> | Array<Record<string, unknown>>) => void;
}

export function EditSubsectionModal({
  isOpen,
  onClose,
  subsection,
  initialData,
  onSave,
}: EditSubsectionModalProps) {
  const handleSave = (data: Record<string, unknown> | Array<Record<string, unknown>>) => {
    onSave(data);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={subsection.title}>
      <div className="mb-2">
        {subsection.description && (
          <p className="text-sm text-gray-600">{subsection.description}</p>
        )}
      </div>

      {subsection.type === "direct_fields" ? (
        <DirectFieldsForm
          subsection={subsection}
          initialData={(initialData as Record<string, unknown>) || {}}
          onSave={handleSave}
          onCancel={onClose}
        />
      ) : (
        <RecordListForm
          subsection={subsection}
          initialData={(initialData as Array<Record<string, unknown>>) || []}
          onSave={handleSave}
          onCancel={onClose}
        />
      )}
    </Modal>
  );
}
