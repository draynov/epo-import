"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Portfolio } from "@/types/portfolio-data";
import { supabasePortfolioStorage } from "@/lib/storage/supabase-portfolio-storage";

interface ImportPageProps {
  params: Promise<{ id: string }>;
}

export default function ImportPage({ params }: ImportPageProps) {
  const router = useRouter();
  const { id } = use(params);
  
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState("");
  const [fetchLoading, setFetchLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleFetchData = async () => {
    if (!url.trim()) {
      setError("Моля въведете URL адрес");
      return;
    }

    setFetchLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP грешка: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      let fetchedData;

      if (contentType?.includes("application/json")) {
        fetchedData = await response.json();
      } else if (contentType?.includes("text/")) {
        fetchedData = await response.text();
      } else {
        const blob = await response.blob();
        fetchedData = { type: blob.type, size: blob.size, note: "Binary data - not displayed" };
      }

      setData(fetchedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка при зареждане на данните");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleImport = () => {
    // TODO: Implement mapping and import logic
    console.log("Импорт на данни:", data);
    alert("Импортът ще бъде имплементиран скоро!");
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
          <h1 className="text-3xl font-bold text-gray-900">Импорт на данни</h1>
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
        <div className="bg-purple-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Импорт от URL</h2>
          <p className="text-sm text-gray-600 mt-1">
            Въведете URL адрес към JSON файл с данни за импорт
          </p>
        </div>
        
        <div className="p-6 space-y-6">
          {/* URL Input */}
          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL адрес
            </label>
            <div className="flex gap-3">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/data.json"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={fetchLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleFetchData();
                  }
                }}
              />
              <button
                onClick={handleFetchData}
                disabled={fetchLoading}
                className="inline-flex items-center justify-center h-10 px-6 text-base rounded-md font-medium transition-colors bg-purple-600 hover:bg-purple-700 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-600 disabled:pointer-events-none disabled:opacity-50"
              >
                {fetchLoading ? "Зареждане..." : "Зареди"}
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
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
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Data Preview */}
          {data && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Заредени данни
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
              
              <div className="max-h-[600px] overflow-auto bg-gray-50 border border-gray-200 rounded-md p-4">
                <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono">
                  {typeof data === "string"
                    ? data
                    : JSON.stringify(data, null, 2)}
                </pre>
              </div>

              {/* Data stats */}
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
                    <p className="font-medium mb-1">Информация за данните:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Тип: {typeof data === "object" ? (Array.isArray(data) ? "Array" : "Object") : typeof data}</li>
                      {Array.isArray(data) && <li>Брой елементи: {data.length}</li>}
                      {typeof data === "object" && !Array.isArray(data) && (
                        <li>Брой полета: {Object.keys(data).length}</li>
                      )}
                      <li>Размер: {JSON.stringify(data).length} символа</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Help text when no data */}
          {!data && !error && (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-6 text-center">
              <svg
                className="h-12 w-12 text-gray-400 mx-auto mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                />
              </svg>
              <p className="text-gray-600">
                Въведете URL адрес по-горе и натиснете "Зареди" за да започнете импорт
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
