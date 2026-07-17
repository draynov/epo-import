/**
 * Пълна конфигурация на портфолиото
 * 6 секции, 30 подсекции
 */

import { PortfolioConfiguration } from "@/types";
import { SECTION_1_GENERAL_INFO } from "./sections/section-1-general";
import { SECTION_2_EDUCATION } from "./sections/section-2-education";
import { SECTION_3_PRACTICAL } from "./sections/section-3-practical";
import { SECTION_4_ACHIEVEMENTS } from "./sections/section-4-achievements";
import { SECTION_5_PARTICIPATION } from "./sections/section-5-participation";
import { SECTION_6_SELF_ASSESSMENT } from "./sections/section-6-self-assessment";

/**
 * Главна конфигурация на портфолиото
 */
export const PORTFOLIO_CONFIGURATION: PortfolioConfiguration = {
  version: "1.0.0",
  sections: [
    SECTION_1_GENERAL_INFO,
    SECTION_2_EDUCATION,
    SECTION_3_PRACTICAL,
    SECTION_4_ACHIEVEMENTS,
    SECTION_5_PARTICIPATION,
    SECTION_6_SELF_ASSESSMENT,
  ],
};

/**
 * Helper функции за работа с конфигурацията
 */

export function findSection(sectionId: string) {
  return PORTFOLIO_CONFIGURATION.sections.find(
    (s) => s.sectionId === sectionId
  );
}

export function findSubsection(subsectionId: string) {
  for (const section of PORTFOLIO_CONFIGURATION.sections) {
    const subsection = section.subsections.find(
      (sub) => sub.subsectionId === subsectionId
    );
    if (subsection) {
      return { section, subsection };
    }
  }
  return null;
}

export function validateSubsectionBelongsToSection(
  subsectionId: string,
  sectionId: string
): boolean {
  const found = findSubsection(subsectionId);
  return found !== null && found.section.sectionId === sectionId;
}

export function getAllSubsections() {
  return PORTFOLIO_CONFIGURATION.sections.flatMap((s) => s.subsections);
}

export function getSubsectionsByType(type: "direct_fields" | "record_list") {
  return getAllSubsections().filter((sub) => sub.type === type);
}
