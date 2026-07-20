"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Portfolio } from "@/types/portfolio-data";
import { supabasePortfolioStorage } from "@/lib/storage/supabase-portfolio-storage";
import { parseHTMLContent, ParsedHTMLData } from "@/lib/parsers/html-parser";
import { mapToSection1, Section1Mapping } from "@/lib/mapping/section-1-mapper";
import { ImportWizard } from "@/components/import/import-wizard";
import { supabaseSubsectionDataStorage } from "@/lib/storage/supabase-subsection-data-storage";

interface ImportPdfPageProps {
  params: Promise<{ id: string }>;
}

export default function ImportPdfPage({ params }: ImportPdfPageProps) {
  const router = useRouter();
  const { id } = use(params);
  
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileData, setFileData] = useState<any>(null);
  const [parsedData, setParsedData] = useState<ParsedHTMLData | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [section1Mapping, setSection1Mapping] = useState<Section1Mapping | null>(null);
  const [showWizard, setShowWizard] = useState(false);

  // Load portfolio
  useEffect(() => {
    async function loadPortfolio() {
      const found = await supabasePortfolioStorage.getById(id);
      if (!found) {
        router.push("/");
        return;
      }

      setPortfolio(found);
      setLoading(false);
    }
    loadPortfolio();
  }, [id, router]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    const validTypes = ["application/pdf", "text/html", "text/plain"];
    const validExtensions = [".pdf", ".html", ".htm"];
    const fileExtension = uploadedFile.name.toLowerCase().slice(uploadedFile.name.lastIndexOf("."));
    
    if (!validTypes.includes(uploadedFile.type) && !validExtensions.includes(fileExtension)) {
      setFileError("Моля изберете PDF или HTML файл");
      return;
    }

    setFile(uploadedFile);
    setFileLoading(true);
    setFileError(null);
    setFileData(null);
    setParsedData(null);

    try {
      const isPdf = uploadedFile.type === "application/pdf" || fileExtension === ".pdf";
      const isHtml = fileExtension === ".html" || fileExtension === ".htm" || uploadedFile.type === "text/html";
      
      if (isHtml) {
        // Parse HTML file
        const text = await uploadedFile.text();
        
        // Parse the HTML content
        const parsed = parseHTMLContent(text);
        setParsedData(parsed);
        
        const fileInfo = {
          name: uploadedFile.name,
          size: uploadedFile.size,
          type: uploadedFile.type || "text/html",
          fileType: "HTML",
          lastModified: new Date(uploadedFile.lastModified).toISOString(),
          content: text,
          tablesCount: parsed.rawTables.length,
          textFieldsCount: parsed.rawTextFields.length,
          sectionsCount: parsed.sections.length,
        };
        setFileData(fileInfo);
        
        // Map to Section 1 and start wizard automatically
        const mapping = mapToSection1(parsed);
        setSection1Mapping(mapping);
        setShowWizard(true);
      } else if (isPdf) {
        // TODO: Implement PDF parsing
        // For now, just show file info
        const fileInfo = {
          name: uploadedFile.name,
          size: uploadedFile.size,
          type: uploadedFile.type,
          fileType: "PDF",
          lastModified: new Date(uploadedFile.lastModified).toISOString(),
        };
        setFileData(fileInfo);
      }
    } catch (err) {
      setFileError(err instanceof Error ? err.message : "Грешка при обработка на файла");
    } finally {
      setFileLoading(false);
    }
  };

  const handleImport = () => {
    // No longer needed - wizard starts automatically after file upload
  };

  const handleConfirmImport = async (selectedMapping: Section1Mapping) => {
    if (!portfolio) return;

    try {
      // Group fields by subsection
      const fieldsBySubsection: Record<string, Record<string, string>> = {};
      
      selectedMapping.fields.forEach((field) => {
        if (!fieldsBySubsection[field.subsectionId]) {
          fieldsBySubsection[field.subsectionId] = {};
        }
        fieldsBySubsection[field.subsectionId][field.targetField] = field.sourceValue;
      });

      // Save direct_fields data
      for (const [subsectionId, data] of Object.entries(fieldsBySubsection)) {
        await supabaseSubsectionDataStorage.saveData(portfolio.id, subsectionId, data);
      }

      // Save record_list data
      for (const recordMapping of selectedMapping.records) {
        await supabaseSubsectionDataStorage.saveData(
          portfolio.id,
          recordMapping.targetSubsection,
          { records: recordMapping.records }
        );
      }

      // Success - redirect to edit page
      alert(`✓ Успешен импорт!\n\n- Импортирани полета: ${selectedMapping.fields.length}\n- Импортирани записи: ${selectedMapping.records.reduce((sum, r) => sum + r.records.length, 0)}`);
      router.push(`/portfolios/${portfolio.id}/edit`);
    } catch (err) {
      console.error("Грешка при импорт:", err);
      alert("Грешка при импортиране на данните. Моля опитайте отново.");
    }
  };

  const handleCancelWizard = () => {
    setShowWizard(false);
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
          <h1 className="text-3xl font-bold text-gray-900">Импорт от файл</h1>
          <a
            href={`/portfolios/${id}/edit`}
            className="inline-flex items-center justify-center h-10 px-4 text-base rounded-md font-medium transition-colors bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
          >
            ← Назад към портфолио
          </a>
        </div>
      </div>

      {/* Portfolio Info Section */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Информация за портфолио</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Име на портфолио</div>
              <div className="text-base font-medium text-gray-900">{portfolio.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">EPO User ID</div>
              <div className="text-base font-medium text-gray-900">{portfolio.epoUserId}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">EPO Portfolio ID</div>
              <div className="text-base font-medium text-gray-900">{portfolio.epoPortfolioId}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Import Section */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-orange-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Импорт от файл</h2>
          <p className="text-sm text-gray-600 mt-1">
            Качете PDF или HTML файл с данни от електронно портфолио
          </p>
        </div>
        
        <div className="p-6 space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Изберете файл (PDF или HTML)
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-12 h-12 mb-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Кликнете за избор</span> или влачете файла тук
                  </p>
                  <p className="text-xs text-gray-500">Поддържат се PDF и HTML файлове</p>
                  {file && (
                    <p className="mt-2 text-sm text-orange-600 font-medium">
                      Избран: {file.name}
                    </p>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.html,.htm,application/pdf,text/html"
                  onChange={handleFileUpload}
                  disabled={fileLoading}
                />
              </label>
            </div>
          </div>

          {/* Error Display */}
          {fileError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-red-600 mr-2 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-red-800">{fileError}</p>
              </div>
            </div>
          )}

          {/* Loading */}
          {fileLoading && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
              <p className="ml-4 text-gray-600">Обработка на файла...</p>
            </div>
          )}

          {/* Import Wizard (3 steps) - starts automatically after HTML file upload */}
          {showWizard && parsedData && section1Mapping && (
            <ImportWizard
              parsedData={parsedData}
              section1Mapping={section1Mapping}
              onConfirmImport={handleConfirmImport}
              onCancel={handleCancelWizard}
            />
          )}

          {/* PDF file info (PDF parsing not yet implemented) */}
          {fileData && fileData.fileType === "PDF" && !fileLoading && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex items-start">
                  <svg
                    className="h-5 w-5 text-yellow-600 mr-2 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-2">PDF импорт все още не е имплементиран</p>
                    <p>Моля използвайте HTML файл за импорт на данни.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-start">
                  <svg
                    className="h-5 w-5 text-blue-600 mr-2 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Информация за файла:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Име: {fileData.name}</li>
                      <li>Размер: {(fileData.size / 1024).toFixed(2)} KB</li>
                      <li>Тип: {fileData.fileType || fileData.type}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
