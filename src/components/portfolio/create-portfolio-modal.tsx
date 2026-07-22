/**
 * Create Portfolio Modal
 */

"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import { Modal, Input, Button } from "@/components/ui";
import { CreatePortfolioInput } from "@/types/portfolio-data";

export interface CreatePortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePortfolioInput) => void;
  initialData?: CreatePortfolioInput;
  mode?: 'create' | 'edit';
}

export function CreatePortfolioModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
}: CreatePortfolioModalProps) {
  const [formData, setFormData] = useState<CreatePortfolioInput>({
    name: "",
    epoUserId: "",
    epoPortfolioId: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreatePortfolioInput, string>>>({});
  
  // Track previous isOpen state to detect when modal opens
  const prevIsOpenRef = useRef(false);

  // Load initial data only when modal opens (false -> true transition)
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      // Modal just opened
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({ name: "", epoUserId: "", epoPortfolioId: "" });
      }
      setErrors({});
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, initialData]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Валидация
    const newErrors: Partial<Record<keyof CreatePortfolioInput, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Наименованието е задължително";
    }

    if (!formData.epoUserId.trim()) {
      newErrors.epoUserId = "User ID е задължително";
    }

    if (!formData.epoPortfolioId.trim()) {
      newErrors.epoPortfolioId = "Portfolio ID е задължително";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit
    onSubmit(formData);

    // Reset
    setFormData({ name: "", epoUserId: "", epoPortfolioId: "" });
    setErrors({});
    onClose();
  };

  const handleClose = () => {
    setFormData({ name: "", epoUserId: "", epoPortfolioId: "" });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'edit' ? "Редактирай портфолио" : "Създай портфолио"}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Отказ
          </Button>
          <Button onClick={handleSubmit}>
            {mode === 'edit' ? 'Запази' : 'Създай'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Наименование"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          placeholder="Име на портфолиото"
          required
        />

        <Input
          label="User ID от EPO"
          value={formData.epoUserId}
          onChange={(e) =>
            setFormData({ ...formData, epoUserId: e.target.value })
          }
          error={errors.epoUserId}
          placeholder="123"
          required
        />

        <Input
          label="Portfolio ID от EPO"
          value={formData.epoPortfolioId}
          onChange={(e) =>
            setFormData({ ...formData, epoPortfolioId: e.target.value })
          }
          error={errors.epoPortfolioId}
          placeholder="456"
          required
        />
      </form>
    </Modal>
  );
}
