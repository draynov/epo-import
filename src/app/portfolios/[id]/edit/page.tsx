/**
 * Portfolio Editor Page
 */

"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Portfolio } from "@/types/portfolio-data";
import { PortfolioSubsectionDefinition } from "@/types";
import { supabasePortfolioStorage } from "@/lib/storage/supabase-portfolio-storage";
import { supabaseSubsectionDataStorage } from "@/lib/storage/supabase-subsection-data-storage";
import { Button } from "@/components/ui";
import { EditSubsectionModal, RecordListView } from "@/components/forms";
import { PORTFOLIO_CONFIGURATION } from "@/config/portfolio-schema";
import { MONTHS } from "@/config/date-options";

interface PortfolioEditorPageProps {
  params: Promise<{ id: string }>;
}

export default function PortfolioEditorPage({ params }: PortfolioEditorPageProps) {
  const router = useRouter();
  const { id } = use(params);
  
  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSubsection, setEditingSubsection] = useState<PortfolioSubsectionDefinition | null>(null);
  const [subsectionData, setSubsectionData] = useState<Record<string, unknown> | Array<Record<string, unknown>>>({});
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [allSubsectionData, setAllSubsectionData] = useState<Record<string, Record<string, unknown>>>({});
  
  // Record list add handlers - store refs to trigger modals
  const [recordListTriggers, setRecordListTriggers] = useState<Record<string, () => void>>({});

  // Load portfolio and all subsection data
  useEffect(() => {
    async function loadPortfolio() {
      const found = await supabasePortfolioStorage.getById(id);
      if (!found) {
        router.push("/");
        return;
      }

      setPortfolio(found);
      
      // Load all subsection data
      const allData: Record<string, Record<string, unknown>> = {};
      for (const section of PORTFOLIO_CONFIGURATION.sections) {
        for (const subsection of section.subsections) {
          const data = await supabaseSubsectionDataStorage.getData(found.id, subsection.subsectionId);
          if (data) {
            allData[subsection.subsectionId] = data;
          }
        }
      }
      setAllSubsectionData(allData);
      
      setLoading(false);
    }
    loadPortfolio();
  }, [id, router]);

  // For record_list - handles data changes inline
  const handleRecordListDataChange = useCallback(async (subsectionId: string, data: { records: Array<Record<string, unknown>> }) => {
    await supabaseSubsectionDataStorage.saveData(id, subsectionId, data);
    
    // Update local state
    setAllSubsectionData(prev => ({
      ...prev,
      [subsectionId]: data
    }));
  }, [id]);

  // Only for direct_fields - opens modal
  const handleEditSubsection = async (subsection: PortfolioSubsectionDefinition) => {
    if (!portfolio || subsection.type !== "direct_fields") return;
    
    setEditingSubsection(subsection);
    
    // Load existing data
    const data = await supabaseSubsectionDataStorage.getData(portfolio.id, subsection.subsectionId);
    setSubsectionData(data || {});
    
    setIsEditModalOpen(true);
  };

  const handleSaveSubsection = async (data: Record<string, unknown> | Array<Record<string, unknown>>) => {
    if (!portfolio || !editingSubsection) return;
    
    // Convert data to proper format for storage
    const dataToSave: Record<string, unknown> = 
      editingSubsection.type === "record_list" 
        ? { records: data as Array<Record<string, unknown>> } 
        : data as Record<string, unknown>;
    
    await supabaseSubsectionDataStorage.saveData(
      portfolio.id, 
      editingSubsection.subsectionId, 
      dataToSave
    );
    
    // Update local state
    setAllSubsectionData(prev => ({
      ...prev,
      [editingSubsection.subsectionId]: dataToSave
    }));
    
    setIsEditModalOpen(false);
    setEditingSubsection(null);
  };

  // Helper function to format month numbers to Bulgarian month names
  const formatMonth = (month: number | string): string => {
    const monthNum = typeof month === 'string' ? parseInt(month) : month;
    const monthObj = MONTHS.find(m => m.value === monthNum);
    return monthObj ? monthObj.label : String(month);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-gray-600">Зареждане...</p>
      </div>
    );
  }

  if (!portfolio) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{portfolio.name}</h1>
          <div className="flex gap-3">
            <a
              href={`/portfolios/${id}/import`}
              className="inline-flex items-center justify-center h-10 px-4 text-base rounded-md font-medium transition-colors bg-purple-600 hover:bg-purple-700 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2 inline"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              URL
            </a>
            <a
              href={`/portfolios/${id}/import-pdf`}
              className="inline-flex items-center justify-center h-10 px-4 text-base rounded-md font-medium transition-colors bg-orange-600 hover:bg-orange-700 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2 inline"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Файл
            </a>
            <a href="/" className="inline-flex items-center justify-center h-10 px-4 text-base rounded-md font-medium transition-colors bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500">
              ← Назад
            </a>
          </div>
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
                try {
                  const data = allSubsectionData[subsection.subsectionId] || null;
                  
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
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Попълнено
                          </span>
                        )}
                      </div>
                      {!hasData && subsection.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {subsection.description}
                        </p>
                      )}
                    </div>
                    
                    {/* Buttons */}
                    {subsection.type === "direct_fields" && hasModal && (
                      <Button 
                        size="sm" 
                        onClick={() => handleEditSubsection(subsection)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Редактирай
                      </Button>
                    )}
                    {subsection.type === "record_list" && hasModal && (
                      <Button 
                        size="sm"
                        onClick={() => recordListTriggers[subsection.subsectionId]?.()}
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
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Добави
                      </Button>
                    )}
                    {!hasModal && (
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
                          
                          return (
                            <div key={field.key} className="bg-white rounded px-3 py-2">
                              <div className="text-xs text-gray-500 mb-0.5">{field.label}</div>
                              <div className="text-sm font-medium text-gray-900">
                                {field.type === "boolean" 
                                  ? (value ? "Да" : "Не")
                                  : field.key.includes("mesec") && typeof value === "number"
                                  ? formatMonth(value)
                                  : String(value)
                                }
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* RecordListView for record_list (inline, no modal) */}
                  {subsection.type === "record_list" && hasModal && (
                    <div className="mt-4">
                      <RecordListView
                        subsection={subsection}
                        portfolioId={portfolio.id}
                        subsectionId={subsection.subsectionId}
                        initialData={recordsData || undefined}
                        onDataChange={handleRecordListDataChange}
                        onRegisterAddTrigger={(trigger) => {
                          setRecordListTriggers(prev => ({
                            ...prev,
                            [subsection.subsectionId]: trigger
                          }));
                        }}
                      />
                    </div>
                  )}
                </div>
              );
                } catch (error) {
                  console.error(`Error rendering subsection ${subsection.subsectionId}:`, error);
                  return (
                    <div key={subsection.subsectionId} className="border border-red-200 rounded-md p-4 bg-red-50">
                      <p className="text-red-600">Грешка при зареждане на {subsection.title}</p>
                    </div>
                  );
                }
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
