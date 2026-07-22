/**
 * EPO API Transform Service
 * Transforms Supabase portfolio data to EPO API format
 */

import { EpoPortfolioRequest, ActualPosition, ActualType, TeacherFlag } from './epo-api-types';

/**
 * Transform portfolio data from Supabase to EPO API format
 * Изпраща: лични данни + стаж + актуална длъжност + любим цитат
 */
export function transformPortfolioToEpoApi(
  portfolioId: string,
  userId: string,
  subsectionData: Record<string, Record<string, unknown>>
): Partial<EpoPortfolioRequest> {
  // Get Section 1 subsections
  const basicInfo = subsectionData['basic-info'] || {};
  const workExperience = subsectionData['work-experience'] || {};
  const currentPosition = subsectionData['current-position'] || {};
  const favoriteQuote = subsectionData['favorite-quote'] || {};
  
  const payload: Partial<EpoPortfolioRequest> = {
    // Лични данни (basic-info)
    portfolio_name: basicInfo.portfolio_name as string || undefined,
    portfolio_surname: basicInfo.portfolio_surname as string || undefined,
    portfolio_family: basicInfo.portfolio_family as string || undefined,
    email: basicInfo.email as string || undefined,
    phone: basicInfo.phone as string || undefined,
    nationality: basicInfo.nationality as string || undefined,
    
    // Трудов стаж (work-experience)
    internship_total: workExperience.internship_total as string || undefined,
    internship_teaching: workExperience.internship_teaching as string || undefined,
    
    // Актуална длъжност (current-position)
    actual_position: currentPosition.actual_position as number || undefined,
    actual_position_other: currentPosition.actual_position_other as string || undefined,
    actual_type: currentPosition.actual_type as number || undefined,
    actual_name: currentPosition.actual_name as string || undefined,
    
    // Любим цитат (favorite-quote)
    citat: favoriteQuote.citat as string || undefined,
  };
  
  // NOTE: НЕ изпращаме:
  // ❌ teachingmethods, teachingphilosophy, selfmonitoring, futureplans
  // ❌ specialty1-5, teacher1-5
  
  return payload;
}

/**
 * Parse position text to ActualPosition enum value
 */
function parsePosition(positionText?: string): number | undefined {
  if (!positionText) return undefined;
  
  const normalized = positionText.toLowerCase().trim();
  
  // Map common position names to enum values
  const positionMap: Record<string, ActualPosition> = {
    'директор - училище': ActualPosition.DIRECTOR_SCHOOL,
    'директор': ActualPosition.DIRECTOR_SCHOOL,
    'заместник-директор - училище': ActualPosition.DEPUTY_DIRECTOR_SCHOOL,
    'заместник директор': ActualPosition.DEPUTY_DIRECTOR_SCHOOL,
    'психолог': ActualPosition.PSYCHOLOGIST,
    'учител': ActualPosition.TEACHER,
    'възпитател': ActualPosition.EDUCATOR,
    'треньор': ActualPosition.TRAINER,
    'директор - детска градина': ActualPosition.DIRECTOR_KINDERGARTEN,
    'заместник-директор - детска градина': ActualPosition.DEPUTY_DIRECTOR_KINDERGARTEN,
    'педагогически съветник': ActualPosition.PEDAGOGICAL_ADVISOR,
    'логопед': ActualPosition.SPEECH_THERAPIST,
    'рехабилитатор': ActualPosition.REHABILITATOR,
    'ръководител икт': ActualPosition.ICT_DIRECTOR,
    'корепетитор': ActualPosition.TUTOR,
    'хореограф': ActualPosition.CHOREOGRAPHER,
    'ресурсен учител': ActualPosition.RESOURCE_TEACHER,
    'социален педагог': ActualPosition.SOCIAL_PEDAGOGUE,
    'старши учител': ActualPosition.SENIOR_TEACHER,
    'старши възпитател': ActualPosition.SENIOR_EDUCATOR,
    'главен учител': ActualPosition.HEAD_TEACHER,
  };
  
  // Try exact match first
  if (positionMap[normalized]) {
    return positionMap[normalized];
  }
  
  // Try partial matches
  for (const [key, value] of Object.entries(positionMap)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  
  // Default to "Other"
  return ActualPosition.OTHER;
}

/**
 * Parse institution type text to ActualType enum value
 */
function parseInstitutionType(typeText?: string): number | undefined {
  if (!typeText) return undefined;
  
  const normalized = typeText.toLowerCase().trim();
  
  const typeMap: Record<string, ActualType> = {
    'училище': ActualType.SCHOOL,
    'детска градина': ActualType.KINDERGARTEN,
    'градина': ActualType.KINDERGARTEN,
    'цсоп': ActualType.CSOP,
    'център за специална образователна подкрепа': ActualType.CSOP,
    'цплр': ActualType.CPLR,
    'център за личностно развитие': ActualType.CPLR,
    'рцпппо': ActualType.RCPPPO,
  };
  
  // Try exact match
  if (typeMap[normalized]) {
    return typeMap[normalized];
  }
  
  // Try partial matches
  for (const [key, value] of Object.entries(typeMap)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  
  // Default to School
  return ActualType.SCHOOL;
}

/**
 * Helper: Check if specialty is teaching-related
 * Returns TeacherFlag (0 = YES teacher, 1 = NO not teacher)
 */
export function isTeachingSpecialty(specialty: string): TeacherFlag {
  const teachingKeywords = [
    'учител',
    'преподавател',
    'педагог',
    'обучител',
  ];
  
  const normalized = specialty.toLowerCase();
  const isTeacher = teachingKeywords.some(keyword => normalized.includes(keyword));
  
  return isTeacher ? TeacherFlag.YES : TeacherFlag.NO;
}
