/**
 * Portfolio List Component
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { CreatePortfolioModal } from "./create-portfolio-modal";
import { Portfolio, CreatePortfolioInput } from "@/types/portfolio-data";
import { portfolioStorage } from "@/lib/storage/portfolio-storage";

export function PortfolioList() {
  const router = useRouter();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Load portfolios
  useEffect(() => {
    setPortfolios(portfolioStorage.getAll());
  }, []);

  const handleCreate = (data: CreatePortfolioInput) => {
    const portfolio = portfolioStorage.create(data);
    setPortfolios(portfolioStorage.getAll());
    
    // Redirect to editor
    router.push(`/portfolios/${portfolio.id}/edit`);
  };

  const handleEdit = (id: string) => {
    router.push(`/portfolios/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    if (confirm("Сигурни ли сте, че искате да изтриете това портфолио?")) {
      portfolioStorage.delete(id);
      setPortfolios(portfolioStorage.getAll());
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Портфолиа</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          ➕ Създай портфолио
        </Button>
      </div>

      {/* Empty state */}
      {portfolios.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 mb-4">Няма създадени портфолиа</p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            Създай първо портфолио
          </Button>
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
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEdit(portfolio.id)}
                    >
                      ✏️ Редактирай
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(portfolio.id)}
                    >
                      🗑️ Изтрий
                    </Button>
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
