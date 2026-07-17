/**
 * Portfolio Editor Page
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Portfolio } from "@/types/portfolio-data";
import { PortfolioSubsectionDefinition } from "@/types";
import { portfolioStorage } from "@/lib/storage/portfolio-storage";
import { subsectionDataStorage } from "@/lib/storage/subsection-data-storage";
import { Button } from "@/components/ui";
import { EditSubsectionModal } from "@/components/forms";
import { PORTFOLIO_CONFIGURATION } from "@/config/portfolio-schema";
import { MONTHS } from "@/config/date-options";

interface PortfolioEditorPageProps {
  params: Promise<{ id: string }>;
}

export default function PortfolioEditorPage({ params }: PortfolioEditorPageProps) {
  const router = useRouter();
  
  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSubsection, setEditingSubsection] = useState<PortfolioSubsectionDefinition | null>(null);
  const [subsectionData, setSubsectionData] = useState<Record<string, unknown> | Array<Record<string, unknown>>>({});
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

  // Resolve params promise
  useEffect(() => {
    params.then((p) => {
      setResolvedParams(p);
    });
  }, [params]);

  // Load portfolio
  useEffect(() => {
    if (!resolvedParams) return;

    const found = portfolioStorage.getById(resolvedParams.id);
    if (!found) {
      router.push("/");
      return;
    }

    setPortfolio(found);
    setLoading(false);
  }, [resolvedParams, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-gray-600">Зареждане...</p>
      </div>
    );
  }
  
  const handleEditSubsection = (subsection: PortfolioSubsectionDefinition) => {
    if (!portfolio) return;
    
    setEditingSubsection(subsection);
    
    // Load existing data
    const data = subsectionDataStorage.getData(portfolio.id, subsection.subsectionId);
    setSubsectionData(data || (subsection.type === "record_list" ? [] : {}));
    
    setIsEditModalOpen(true);
  };

  const handleSaveSubsection = (data: Record<string, unknown> | Array<Record<string, unknown>>) => {
    if (!portfolio || !editingSubsection) return;
    
    // Convert data to proper format for storage
    const dataToSave: Record<string, unknown> = 
      editingSubsection.type === "record_list" 
        ? { records: data as Array<Record<string, unknown>> } 
        : data as Record<string, unknown>;
    
    subsectionDataStorage.saveData(
      portfolio.id, 
      editingSubsection.subsectionId, 
      dataToSave
    );
    
    // Trigger re-render by updating a dummy state
    setIsEditModalOpen(false);
    setEditingSubsection(null);
  };

  const handleEditRecord = (subsection: PortfolioSubsectionDefinition, index: number) => {
    if (!portfolio) return;
    
    const data = subsectionDataStorage.getData(portfolio.id, subsection.subsectionId);
    const recordsData = data as { records?: Array<Record<string, unknown>> } | null;
    const record = recordsData?.records?.[index];
    
    if (record) {
      setEditingSubsection({ ...subsection, editingRecordIndex: index } as any);
      setSubsectionData(recordsData?.records || []);
      setIsEditModalOpen(true);
    }
  };

  const handleDeleteRecord = (subsection: PortfolioSubsectionDefinition, index: number) => {
    if (!portfolio) return;
    if (!confirm("Сигурни ли сте, че искате да изтриете този запис?")) return;
    
    const data = subsectionDataStorage.getData(portfolio.id, subsection.subsectionId);
    const recordsData = data as { records?: Array<Record<string, unknown>> } | null;
    const records = recordsData?.records || [];
    
    const newRecords = records.filter((_, i) => i !== index);
    subsectionDataStorage.saveData(
      portfolio.id,
      subsection.subsectionId,
      { records: newRecords }
    );
    
    // Force re-render
    setPortfolio({ ...portfolio });
  };

  if (!portfolio) return null;

  // Helper function to format month numbers to Bulgarian month names
  const formatMonth = (month: number | string): string => {
    const monthNum = typeof month === 'string' ? parseInt(month) : month;
    const monthObj = MONTHS.find(m => m.value === monthNum);
    return monthObj ? monthObj.label : String(month);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{portfolio.name}</h1>
          <Button variant="secondary" onClick={() => router.push("/")}>
            ← Назад
          </Button>
        </div>
        <div className="text-sm text-gray-600">
          <p>User ID: {portfolio.epoUserId}</p>
          <p>Portfolio ID: {portfolio.epoPortfolioId}</p>
        </div>
      </div>

      {/* All Sections */}
      <div className="space-y-6">
        {PORTFOLIO_CONFIGURATION.sections.map((section) => (
          <div key={section.sectionId} className="bg-white shadow-md rounded-lg overflow-hidden">
            {/* Section Header */}
            <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {section.title}
              </h2>
              {section.description && (
                <p className="text-sm text-gray-600 mt-1">{section.description}</p>
              )}
            </div>

            {/* Subsections */}
            <div className="p-6 space-y-4">
              {section.subsections.map((subsection) => {
                const data = subsectionDataStorage.getData(portfolio.id, subsection.subsectionId);
                
                // Type guard for record list data
                const recordsData = data as { records?: Array<Record<string, unknown>> } | null;
                
                // Check if subsection has data based on its type
                const hasData = data && (
                  subsection.type === "record_list" 
                    ? Array.isArray(recordsData?.records) && recordsData.records.length > 0
                    : Object.keys(data).length > 0
                );
                
                // Only Section 1 has working modals for now
                const hasModal = section.sectionId === "section-1";

                return (
                  <div
                  key={subsection.subsectionId}
                  className="border border-gray-200 rounded-md p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">
                          {subsection.title}
                        </h3>
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          {subsection.type === "direct_fields" ? "Полета" : "Списък"}
                        </span>
                        {hasData && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                            ✓ Попълнено
                          </span>
                        )}
                      </div>
                      {!hasData && subsection.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {subsection.description}
                        </p>
                      )}
                    </div>
                    
                    {hasModal ? (
                      <Button 
                        size="sm" 
                        onClick={() => handleEditSubsection(subsection)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-4 w-4 mr-1" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d={subsection.type === "record_list" 
                              ? "M12 4v16m8-8H4"
                              : "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            }
                          />
                        </svg>
                        {subsection.type === "record_list" ? "Добави запис" : "Редактирай"}
                      </Button>
                    ) : (
                      <Button size="sm" variant="secondary" disabled>
                        Скоро
                      </Button>
                    )}
                  </div>
                  
                  {/* Data Visualization */}
                  {hasData && subsection.type === "direct_fields" && (
                    <div className="mt-4 pt-4 border-t border-gray-200 bg-gray-50 -mx-4 -mb-4 px-4 pb-4 rounded-b-md">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {subsection.fields.map((field) => {
                          const value = data?.[field.key];
                          if (!value && field.type !== "boolean") return null;
                          field.key.includes("mesec") && typeof value === "number"
                                  ? formatMonth(value)
                                  : 
                          return (
                            <div key={field.key} className="bg-white rounded px-3 py-2">
                              <div className="text-xs text-gray-500 mb-0.5">{field.label}</div>
                              <div className="text-sm font-medium text-gray-900">
                                {field.type === "boolean" 
                                  ? (value ? "Да" : "Не")
                                  : String(value)
                                }
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {hasData && subsection.type === "record_list" && (
                    <div className="mt-4 pt-4 border-t border-gray-200 bg-gray-50 -mx-4 -mb-4 px-4 pb-4 rounded-b-md">
                      <div className="bg-white rounded overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                              <tr>
                                {subsection.fields.slice(0, 5).map((field) => (
                                  <th
                                    key={field.key}
                                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                                  >
                                    {field.label}
                                  </th>
                                ))}
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Действия
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {(recordsData?.records || []).map((record: Record<string, unknown>, idx: number) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                  {subsection.fields.slice(0, 5).map((field) => (
                                    <td
                                      key={field.key}
                                      className="px-4 py-3 text-sm text-gray-900"
                                    >
                                      {fiefield.key.includes("mesec") && typeof record[field.key] === "number"
                                        ? formatMonth(record[field.key] as number)
                                        : ld.type === "boolean"
                                        ? (record[field.key] ? "Да" : "Не")
                                        : String(record[field.key] || "-")
                                      }
                                    </td>
                                  ))}
                                  <td className="px-4 py-3 text-right text-sm">
                                    <button
                                      onClick={() => handleEditRecord(subsection, idx)}
                                      className="text-blue-600 hover:text-blue-800 mr-3"
                                      title="Редактирай"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() => handleDeleteRecord(subsection, idx)}
                                      className="text-red-600 hover:text-red-800"
                                      title="Изтрий"
                                    >
                                      🗑️
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        ))}
      </div>

      {/* Edit Subsection Modal */}
      {editingSubsection && (
        <EditSubsectionModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          subsection={editingSubsection}
          initialData={subsectionData}
          onSave={handleSaveSubsection}
        />
      )}
    </div>
  );
}
