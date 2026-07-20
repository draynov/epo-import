/**
 * Section 1 Import Mapping Page
 * Dedicated page for mapping Section 1 (General Information) fields
 */

'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImportProgressBar } from '@/components/import/import-progress-bar';
import { MappingPreview } from '@/components/import/mapping-preview';
import { ImportSessionStorage } from '@/lib/storage/import-session-storage';
import { mapToSection1, Section1Mapping } from '@/lib/mapping/section-1-mapper';

export default function Section1ImportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [mapping, setMapping] = useState<Section1Mapping | null>(null);
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
    const existingMapping = ImportSessionStorage.getSectionMapping(1) as Section1Mapping | null;
    
    if (existingMapping) {
      setMapping(existingMapping);
    } else {
      // Create new mapping from parsed data
      const newMapping = mapToSection1(parsedData);
      setMapping(newMapping);
    }

    // Get completed sections for progress bar
    const completed = ImportSessionStorage.getCompletedSections();
    setCompletedSections(completed);

    setLoading(false);
  }, []);

  const handleConfirm = (selectedMapping: Section1Mapping) => {
    // Save mapping to session
    ImportSessionStorage.saveSectionMapping(1, selectedMapping);

    // Redirect to next section (Section 2) or review if all done
    // For now, redirect to review since we only have Section 1
    router.push(`/portfolios/${id}/import/review`);
  };

  const handleCancel = () => {
    router.push(`/portfolios/${id}/import-pdf`);
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
            <button
              onClick={() => router.push(`/portfolios/${id}/import-pdf`)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Назад към качване на файл
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <ImportProgressBar currentSection={1} completedSections={completedSections} />

        {/* Mapping Preview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <MappingPreview
            mapping={mapping}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}
