"use client";

import { useState } from "react";
import { Modal } from "@/components/ui";

interface ImportFromUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolioId: string;
  onImportComplete?: () => void;
}

export function ImportFromUrlModal({
  isOpen,
  onClose,
  portfolioId,
  onImportComplete,
}: ImportFromUrlModalProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetchData = async () => {
    if (!url.trim()) {
      setError("Моля въведете URL адрес");
      return;
    }

    setLoading(true);
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
        fetchedData = await response.blob();
      }

      setData(fetchedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка при зареждане на данните");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = () => {
    // TODO: Implement mapping and import logic
    console.log("Импорт на данни:", data);
    if (onImportComplete) {
      onImportComplete();
    }
    onClose();
  };

  const handleClose = () => {
    setUrl("");
    setData(null);
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Импорт от URL">
      <div className="space-y-4">
        {/* URL Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL адрес
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/data.json"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              onClick={handleFetchData}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? "Зареждане..." : "Зареди"}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Data Preview */}
        {data && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">
              Заредени данни
            </h3>
            <div className="max-h-96 overflow-auto bg-gray-50 border border-gray-200 rounded-md p-4">
              <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                {typeof data === "string"
                  ? data
                  : JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Отказ
          </button>
          {data && (
            <button
              onClick={handleImport}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Импортирай
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
