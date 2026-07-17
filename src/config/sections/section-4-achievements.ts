/**
 * Секция 4: Постижения на специалиста
 * 4 подсекции
 */

import { PortfolioSectionDefinition } from "@/types";
import * as OPTIONS from "../field-options";

export const SECTION_4_ACHIEVEMENTS: PortfolioSectionDefinition = {
  sectionId: "section-4",
  title: "Постижения на специалиста",
  description: "Лични постижения и авторство",
  order: 4,
  subsections: [
    // 4.1. Лични постижения (record_list)
    {
      subsectionId: "personal-achievements",
      sectionId: "section-4",
      type: "record_list",
      title: "Лични постижения",
      description: "Награди, отличия и постижения",
      order: 1,
      displayMode: "list",
      allowMultipleRecords: true,
      endpoint: {
        cmd: "personals",
        method: "POST",
      },
      fields: [
        {
          key: "name",
          label: "Наименование",
          type: "text",
          required: true,
          maxLength: 150,
        },
        {
          key: "content",
          label: "Описание",
          type: "textarea",
          required: false,
        },
      ],
    },

    // 4.2. Постижения на ученици (record_list)
    {
      subsectionId: "student-achievements",
      sectionId: "section-4",
      type: "record_list",
      title: "Постижения на ученици",
      description: "Отличаване на ученици",
      order: 2,
      displayMode: "list",
      allowMultipleRecords: true,
      endpoint: {
        cmd: "students",
        method: "POST",
      },
      fields: [
        {
          key: "name",
          label: "Наименование",
          type: "text",
          required: true,
          maxLength: 150,
        },
        {
          key: "content",
          label: "Описание",
          type: "textarea",
          required: false,
        },
      ],
    },

    // 4.3. Постигнати резултати (record_list)
    {
      subsectionId: "results",
      sectionId: "section-4",
      type: "record_list",
      title: "Постигнати резултати",
      description: "Ученически резултати и постижения",
      order: 3,
      displayMode: "list",
      allowMultipleRecords: true,
      endpoint: {
        cmd: "results",
        method: "POST",
      },
      fields: [
        {
          key: "name",
          label: "Наименование",
          type: "text",
          required: true,
          maxLength: 150,
        },
        {
          key: "years",
          label: "Учебни години",
          type: "text",
          required: true,
        },
        {
          key: "content",
          label: "Описание",
          type: "textarea",
          required: false,
        },
      ],
    },

    // 4.4. Авторство (record_list)
    {
      subsectionId: "authorship",
      sectionId: "section-4",
      type: "record_list",
      title: "Авторство",
      description: "Учебници, публикации и авторски материали",
      order: 4,
      displayMode: "table",
      allowMultipleRecords: true,
      endpoint: {
        cmd: "authorship",
        method: "POST",
      },
      fields: [
        {
          key: "type",
          label: "Тип",
          type: "select",
          required: true,
          options: OPTIONS.AUTHORSHIP_TYPES,
        },
        {
          key: "role",
          label: "Роля",
          type: "select",
          required: true,
          options: OPTIONS.AUTHORSHIP_ROLES,
        },
        {
          key: "name",
          label: "Наименование",
          type: "text",
          required: true,
          maxLength: 150,
        },
        {
          key: "content",
          label: "Описание",
          type: "textarea",
          required: false,
        },
      ],
    },
  ],
};
