"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Portfolio } from "@/types/portfolio-data";
import { portfolioStorage } from "@/lib/storage/portfolio-storage";

interface ImportPdfPageProps {
  params: Promise<{ id: string }>;
}

export default function ImportPdfPage({ params }: ImportPdfPageProps) {
  const router = useRouter();
  const { id } = use(params);
  
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfData, setPdfData] = useState<any>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Load portfolio
  useEffect(() => {
    const found = portfolioStorage.getById(id);
    if (!found) {
      router.push("/");
      return;
    }

    setPortfolio(found);
    setLoading(false);
  }, [id, router]);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setPdfError("Моля изберете PDF файл");
      return;
    }

    setPdfFile(file);
    setPdfLoading(true);
    setPdfError(null);
    setPdfData(null);

    try {
      // TODO: Implement PDF parsing
      // For now, just show file info
      const fileInfo = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified).toISOString(),
      };
      
      setPdfData(fileInfo);
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : "Грешка при обработка на PDF файла");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleImport = () => {
    // TODO: Implement mapping and import logic
    console.log("Импорт на данни от PDF:", pdfData);
    alert("Импортът от PDF ще бъде имплементиран скоро!");
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
          <h1 className="text-3xl font-bold text-gray-900">Импорт от PDF</h1>
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
          <h2 className="text-xl font-semibold text-gray-900">Импорт от PDF файл</h2>
          <p className="text-sm text-gray-600 mt-1">
            Качете PDF файл с данни от електронно портфолио
          </p>
        </div>
        
        <div className="p-6 space-y-6">
          {/* PDF Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PDF файл
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
                  <p className="text-xs text-gray-500">Поддържа се само PDF файл</p>
                  {pdfFile && (
                    <p className="mt-2 text-sm text-orange-600 font-medium">
                      Избран: {pdfFile.name}
                    </p>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,application/pdf"
                  onChange={handlePdfUpload}
                  disabled={pdfLoading}
                />
              </label>
            </div>
          </div>

          {/* Error Display */}
          {pdfError && (
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
                <p className="text-sm text-red-800">{pdfError}</p>
              </div>
            </div>
          )}

          {/* Loading */}
          {pdfLoading && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
              <p className="ml-4 text-gray-600">Обработка на PDF файла...</p>
            </div>
          )}

          {/* Data Preview */}
          {pdfData && !pdfLoading && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Данни от PDF
                </h3>
                <button
                  onClick={handleImport}
                  className="inline-flex items-center justify-center h-10 px-4 text-base rounded-md font-medium transition-colors bg-green-600 hover:bg-green-700 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-600"
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
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  Импортирай данните
                </button>
              </div>
              
              <div className="max-h-96 overflow-auto bg-gray-50 border border-gray-200 rounded-md p-4">
                <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono">
                  {JSON.stringify(pdfData, null, 2)}
                </pre>
              </div>

              {/* Stats */}
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
                      <li>Име: {pdfData.name}</li>
                      <li>Размер: {(pdfData.size / 1024).toFixed(2)} KB</li>
                      <li>Тип: {pdfData.type}</li>
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
