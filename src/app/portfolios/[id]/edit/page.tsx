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
  };

  // Show only Section 1 for testing
  const section1 = PORTFOLIO_CONFIGURATION.sections.find(s => s.sectionId === "section-1");
  if (!section1 || !portfolio) return null;

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

      {/* Section 1: Обща информация */}
      <div className="space-y-6">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Section Header */}
          <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {section1.title}
            </h2>
            {section1.description && (
              <p className="text-sm text-gray-600 mt-1">{section1.description}</p>
            )}
          </div>

          {/* Subsections */}
          <div className="p-6 space-y-4">
            {section1.subsections.map((subsection) => {
              const data = subsectionDataStorage.getData(portfolio.id, subsection.subsectionId);
              const hasData = data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0);

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
                        {hasData && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                            ✓ Попълнено
                          </span>
                        )}
                      </div>
                      {subsection.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {subsection.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Тип: {subsection.type === "direct_fields" ? "Директни полета" : "Списък със записи"}
                      </p>
                    </div>
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                        />
                      </svg>
                      Редактирай
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
