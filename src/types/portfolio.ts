import { PortfolioFieldDefinition } from "./field-types";

/**
 * Основна секция в портфолиото (за визуална организация)
 */
export interface PortfolioSection {
  sectionId: string;
  title: string;
  description: string;
  order: number;
}

/**
 * Базова дефиниция на подсекция
 */
interface BaseSubsectionDefinition {
  subsectionId: string;
  sectionId: string;
  title: string;
  description: string;
  order: number;
  fields: PortfolioFieldDefinition[];
  
  // API endpoint информация
  endpoint: {
    cmd: string; // За epo.bg API
    method: "POST";
  };
}

/**
 * Подсекция с директни полета (една форма)
 */
export interface DirectFieldsSubsectionDefinition
  extends BaseSubsectionDefinition {
  type: "direct_fields";
}

/**
 * Подсекция със списък от записи
 */
export interface RecordListSubsectionDefinition
  extends BaseSubsectionDefinition {
  type: "record_list";
  displayMode: "table" | "list";
  allowMultipleRecords: true;
}

/**
 * Union тип за подсекции (discriminated union)
 */
export type PortfolioSubsectionDefinition =
  | DirectFieldsSubsectionDefinition
  | RecordListSubsectionDefinition;

/**
 * Пълна конфигурация на секция с подсекции
 */
export interface PortfolioSectionDefinition {
  sectionId: string;
  title: string;
  description: string;
  order: number;
  subsections: PortfolioSubsectionDefinition[];
}

/**
 * Пълна конфигурация на портфолиото
 */
export interface PortfolioConfiguration {
  version: string;
  sections: PortfolioSectionDefinition[];
}
