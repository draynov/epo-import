/**
 * Import Review Page
 * Final review of all mapped sections before importing to Supabase
 */

'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImportSessionStorage } from '@/lib/storage/import-session-storage';
import { Section1Mapping } from '@/lib/mapping/section-1-mapper';
import { supabaseSubsectionDataStorage } from '@/lib/storage/supabase-subsection-data-storage';

export default function ImportReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [section1Mapping, setSection1Mapping] = useState<Section1Mapping | null>(null);

  useEffect(() => {
    // Check if there's an active import session
    if (!ImportSessionStorage.hasActiveSession()) {
      setError('Няма активна сесия за импорт. Моля, качете HTML файл отново.');
      setLoading(false);
      return;
    }

    // Get completed sections
    const completed = ImportSessionStorage.getCompletedSections();
    setCompletedSections(completed);

    // Get section mappings
    const section1 = ImportSessionStorage.getSectionMapping(1) as Section1Mapping | null;
    setSection1Mapping(section1);

    if (!section1) {
      setError('Не са намерени мапинги. Моля, завършете поне една секция.');
      setLoading(false);
      return;
    }

    setLoading(false);
  }, []);

  const handleConfirmImport = async () => {
    if (!section1Mapping) return;

    setImporting(true);
    setError(null);

    try {
      // Import Section 1 data
      if (section1Mapping) {
        // Group fields by subsection
        const fieldsBySubsection: Record<string, Record<string, string>> = {};
        
        section1Mapping.fields.forEach((field) => {
          if (!fieldsBySubsection[field.subsectionId]) {
            fieldsBySubsection[field.subsectionId] = {};
          }
          fieldsBySubsection[field.subsectionId][field.targetField] = field.sourceValue;
        });

        // Save direct_fields data
        for (const [subsectionId, data] of Object.entries(fieldsBySubsection)) {
          await supabaseSubsectionDataStorage.saveData(id, subsectionId, data);
        }

        // Save record_list data
        for (const recordMapping of section1Mapping.records) {
          await supabaseSubsectionDataStorage.saveData(
            id,
            recordMapping.targetSubsection,
            { records: recordMapping.records }
          );
        }
      }

      // Clear import session
      ImportSessionStorage.clearSession();

      // Success - redirect to edit page
      alert(
        `Успешен импорт!\n\n` +
        `- Секции: ${completedSections.length}\n` +
        `- Полета: ${section1Mapping.fields.length}\n` +
        `- Записи: ${section1Mapping.records.reduce((sum, r) => sum + r.records.length, 0)}`
      );
      
      router.push(`/portfolios/${id}/edit`);
    } catch (err) {
      console.error('Грешка при импорт:', err);
      setError('Грешка при импортиране на данните. Моля опитайте отново.');
      setImporting(false);
    }
  };

  const handleCancel = () => {
    // Clear session and go back to portfolio
    ImportSessionStorage.clearSession();
    router.push(`/portfolios/${id}/edit`);
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

  if (error && !section1Mapping) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-2">Грешка</h2>
            <p className="text-sm text-red-700">{error}</p>
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Преглед преди импорт</h1>
          <p className="text-gray-600">
            Прегледайте мапнатите данни преди да ги импортирате в портфолиото
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-500 mb-1">Завършени секции</div>
            <div className="text-3xl font-bold text-green-600">{completedSections.length}</div>
          </div>
          
          {section1Mapping && (
            <>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-sm text-gray-500 mb-1">Мапнати полета</div>
                <div className="text-3xl font-bold text-blue-600">{section1Mapping.fields.length}</div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-sm text-gray-500 mb-1">Мапнати записи (таблици)</div>
                <div className="text-3xl font-bold text-purple-600">
                  {section1Mapping.records.reduce((sum, r) => sum + r.records.length, 0)}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Section Details */}
        {section1Mapping && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Секция 1: Обща информация
            </h2>
            
            {/* Fields */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Полета ({section1Mapping.fields.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {section1Mapping.fields.slice(0, 10).map((field, idx) => (
                  <div key={idx} className="bg-gray-50 rounded p-3">
                    <div className="text-xs text-gray-500">{field.targetLabel}</div>
                    <div className="text-sm text-gray-900 font-medium truncate">
                      {field.sourceValue || '-'}
                    </div>
                  </div>
                ))}
              </div>
              {section1Mapping.fields.length > 10 && (
                <p className="text-sm text-gray-500 mt-2">
                  ... и още {section1Mapping.fields.length - 10} полета
                </p>
              )}
            </div>

            {/* Records */}
            {section1Mapping.records.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Таблици ({section1Mapping.records.length})
                </h3>
                <div className="space-y-2">
                  {section1Mapping.records.map((record, idx) => (
                    <div key={idx} className="bg-gray-50 rounded p-3">
                      <div className="text-sm text-gray-900 font-medium">{record.targetLabel}</div>
                      <div className="text-xs text-gray-500">
                        {record.records.length} {record.records.length === 1 ? 'запис' : 'записа'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleCancel}
            disabled={importing}
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Откажи импорт
          </button>

          <button
            onClick={handleConfirmImport}
            disabled={importing}
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importing ? (
              <>
                <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Импортиране...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Потвърди и импортирай
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
