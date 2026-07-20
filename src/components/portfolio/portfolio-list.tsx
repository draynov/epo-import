/**
 * Portfolio List Component
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreatePortfolioModal } from "./create-portfolio-modal";
import { Portfolio, CreatePortfolioInput } from "@/types/portfolio-data";
import { supabasePortfolioStorage } from "@/lib/storage/supabase-portfolio-storage";

export function PortfolioList() {
  const router = useRouter();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load portfolios
  useEffect(() => {
    async function loadPortfolios() {
      const data = await supabasePortfolioStorage.getAll();
      setPortfolios(data);
      setLoading(false);
    }
    loadPortfolios();
  }, []);

  const handleCreate = async (data: CreatePortfolioInput) => {
    const portfolio = await supabasePortfolioStorage.create(data);
    if (!portfolio) {
      alert("Грешка при създаване на портфолио");
      return;
    }
    const allPortfolios = await supabasePortfolioStorage.getAll();
    setPortfolios(allPortfolios);
    
    // Redirect to editor
    router.push(`/portfolios/${portfolio.id}/edit`);
  };

  const handleEdit = (id: string) => {
    router.push(`/portfolios/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Сигурни ли сте, че искате да изтриете това портфолио?")) {
      await supabasePortfolioStorage.delete(id);
      const allPortfolios = await supabasePortfolioStorage.getAll();
      setPortfolios(allPortfolios);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Портфолиа</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center h-10 px-4 text-base rounded-md font-medium transition-colors bg-green-600 hover:bg-green-700 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-600"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Създай портфолио
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Зареждане...</p>
        </div>
      ) : portfolios.length === 0 ? (
        /* Empty state */
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 mb-4">Няма създадени портфолиа</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center h-10 px-4 text-base rounded-md font-medium transition-colors bg-green-600 hover:bg-green-700 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-600"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Създай първо портфолио
          </button>
        </div>
      ) : (
        /* Table */
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Наименование
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User ID EPO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Portfolio ID EPO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Създадено
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {portfolios.map((portfolio) => (
                <tr key={portfolio.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {portfolio.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {portfolio.epoUserId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {portfolio.epoPortfolioId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(portfolio.createdAt).toLocaleDateString("bg-BG")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <a
                      href={`/portfolios/${portfolio.id}/edit`}
                      className="inline-flex items-center justify-center h-9 px-3 text-sm rounded-md font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1.5"
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
                    </a>
                    <button
                      onClick={() => handleDelete(portfolio.id)}
                      className="inline-flex items-center justify-center h-9 px-3 text-sm rounded-md font-medium transition-colors bg-red-600 hover:bg-red-700 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Изтрий
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <CreatePortfolioModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
