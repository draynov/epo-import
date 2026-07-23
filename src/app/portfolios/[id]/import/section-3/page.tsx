/**
 * Section 3 Import Mapping Page
 * Dedicated page for mapping Section 3 (Teaching Methods and Philosophy) fields
 */

'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImportProgressBar } from '@/components/import/import-progress-bar';
import { MappingPreview } from '@/components/import/mapping-preview';
import { ImportSessionStorage } from '@/lib/storage/import-session-storage';
import { mapToSection3, Section3Mapping } from '@/lib/mapping/section-3-mapper';
import { SECTION_3_PRACTICAL } from '@/config/sections/section-3-practical';

export default function Section3ImportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [mapping, setMapping] = useState<Section3Mapping | null>(null);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if there's an active import session
    if (!ImportSessionStorage.hasActiveSession()) {
      setError('Няма активна сесия за импорт. Моля, качете HTML файл отново.');
      setLoading(false);
      return;
    }

    // Get parsed data from session
    const parsedData = ImportSessionStorage.getParsedData();
    if (!parsedData) {
      setError('Не са намерени парсирани данни. Моля, качете HTML файл отново.');
      setLoading(false);
      return;
    }

    // Check if existing mapping exists (user came back to edit)
    const existingMapping = ImportSessionStorage.getSectionMapping(3) as Section3Mapping | null;
    
    if (existingMapping) {
      setMapping(existingMapping);
    } else {
      // Create new mapping from parsed data
      const newMapping = mapToSection3(parsedData);
      setMapping(newMapping);
    }

    // Get completed sections for progress bar
    const completed = ImportSessionStorage.getCompletedSections();
    setCompletedSections(completed);

    setLoading(false);
  }, []);

  const handleConfirm = (selectedMapping: Section3Mapping) => {
    // Save mapping to session
    ImportSessionStorage.saveSectionMapping(3, selectedMapping);

    // Redirect to review page
    router.push(`/portfolios/${id}/import/review`);
  };

  const handleCancel = () => {
    router.push(`/portfolios/${id}/import/section-2`);
  };

  const handleSkip = () => {
    // Skip this section and go to review
    router.push(`/portfolios/${id}/import/review`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Зареждане...</p>
        </div>
      </div>
    );
  }

  if (error || !mapping) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-2">Грешка</h2>
            <p className="text-sm text-red-700">{error || 'Неуспешно зареждане на данните'}</p>
            <div className="flex gap-3 justify-center mt-4">
              <button
                onClick={() => router.push(`/portfolios/${id}/import/section-2`)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Назад към Секция 2
              </button>
              <button
                onClick={handleSkip}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Пропусни секцията
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if mapping has any fields
  const hasFields = mapping.fields && mapping.fields.length > 0;

  if (!hasFields) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <ImportProgressBar currentSection={3} completedSections={completedSections} portfolioId={id} />
          
          <div className="max-w-2xl mx-auto text-center mt-12">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
              <h2 className="text-xl font-semibold text-yellow-900 mb-3">Няма открити данни</h2>
              <p className="text-yellow-700 mb-6">
                Не бяха открити методи на преподаване или философия на преподаване в HTML файла.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => router.push(`/portfolios/${id}/import/section-2`)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  ← Назад
                </button>
                <button
                  onClick={handleSkip}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Пропусни секцията →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <ImportProgressBar currentSection={3} completedSections={completedSections} portfolioId={id} />

        {/* Mapping Preview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <MappingPreview
            mapping={mapping}
            sectionConfig={SECTION_3_PRACTICAL}
            sectionNumber={3}
            sectionTitle="Практическо приложение"
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            onSkip={handleSkip}
          />
        </div>
      </div>
    </div>
  );
}
