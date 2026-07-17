/**
 * Create Portfolio Modal
 */

"use client";

import { useState, FormEvent } from "react";
import { Modal, Input, Button } from "@/components/ui";
import { CreatePortfolioInput } from "@/types/portfolio-data";

export interface CreatePortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePortfolioInput) => void;
}

export function CreatePortfolioModal({
  isOpen,
  onClose,
  onSubmit,
}: CreatePortfolioModalProps) {
  const [formData, setFormData] = useState<CreatePortfolioInput>({
    name: "",
    epoUserId: 0,
    epoPortfolioId: 0,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreatePortfolioInput, string>>>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Валидация
    const newErrors: Partial<Record<keyof CreatePortfolioInput, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Наименованието е задължително";
    }

    if (!formData.epoUserId || formData.epoUserId <= 0) {
      newErrors.epoUserId = "User ID трябва да е положително число";
    }

    if (!formData.epoPortfolioId || formData.epoPortfolioId <= 0) {
      newErrors.epoPortfolioId = "Portfolio ID трябва да е положително число";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit
    onSubmit(formData);

    // Reset
    setFormData({ name: "", epoUserId: 0, epoPortfolioId: 0 });
    setErrors({});
    onClose();
  };

  const handleClose = () => {
    setFormData({ name: "", epoUserId: 0, epoPortfolioId: 0 });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Създай портфолио"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Отказ
          </Button>
          <Button onClick={handleSubmit}>Създай</Button>
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
          type="number"
          value={formData.epoUserId || ""}
          onChange={(e) =>
            setFormData({ ...formData, epoUserId: parseInt(e.target.value) || 0 })
          }
          error={errors.epoUserId}
          placeholder="123"
          required
        />

        <Input
          label="Portfolio ID от EPO"
          type="number"
          value={formData.epoPortfolioId || ""}
          onChange={(e) =>
            setFormData({ ...formData, epoPortfolioId: parseInt(e.target.value) || 0 })
          }
          error={errors.epoPortfolioId}
          placeholder="456"
          required
        />
      </form>
    </Modal>
  );
}
