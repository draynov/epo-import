/**
 * Portfolio Editor Page
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Portfolio } from "@/types/portfolio-data";
import { portfolioStorage } from "@/lib/storage/portfolio-storage";
import { Button } from "@/components/ui";
import { PORTFOLIO_CONFIGURATION } from "@/config/portfolio-schema";

interface PortfolioEditorPageProps {
  params: Promise<{ id: string }>;
}

export default function PortfolioEditorPage({ params }: PortfolioEditorPageProps) {
  const router = useRouter();
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

  if (!portfolio) {
    return null;
  }

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

      {/* Sections */}
      <div className="space-y-6">
        {PORTFOLIO_CONFIGURATION.sections.map((section) => (
          <div
            key={section.sectionId}
            className="bg-white shadow-md rounded-lg overflow-hidden"
          >
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
              {section.subsections.map((subsection) => (
                <div
                  key={subsection.subsectionId}
                  className="border border-gray-200 rounded-md p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {subsection.title}
                      </h3>
                      {subsection.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {subsection.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Тип: {subsection.type === "direct_fields" ? "Директни полета" : "Списък със записи"}
                      </p>
                    </div>
                    <Button size="sm">Редактирай</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
