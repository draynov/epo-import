/**
 * Import Wizard Component
 * Multi-step wizard for importing portfolio data
 * Step 1: Extract data from file
 * Step 2: Map extracted data to Section 1
 * Step 3: Review and confirm import
 */

'use client';

import { useState } from 'react';
import { ParsedHTMLData } from '@/lib/parsers/html-parser';
import { Section1Mapping } from '@/lib/mapping/section-1-mapper';
import { ParsedDataView } from './parsed-data-view';
import { MappingPreview } from './mapping-preview';

interface ImportWizardProps {
  parsedData: ParsedHTMLData | null;
  section1Mapping: Section1Mapping | null;
  onConfirmImport: (mapping: Section1Mapping) => void;
  onCancel: () => void;
}

type WizardStep = 1 | 2 | 3;

export function ImportWizard({
  parsedData,
  section1Mapping,
  onConfirmImport,
  onCancel,
}: ImportWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [selectedMapping, setSelectedMapping] = useState<Section1Mapping | null>(null);

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as WizardStep);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as WizardStep);
    }
  };

  const handleMappingConfirm = (mapping: Section1Mapping) => {
    setSelectedMapping(mapping);
    handleNextStep();
  };

  const handleFinalConfirm = () => {
    if (selectedMapping) {
      onConfirmImport(selectedMapping);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between">
            {/* Step 1 */}
            <li className="flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= 1
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 bg-white text-gray-500'
                  }`}
                >
                  {currentStep > 1 ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span className="text-sm font-semibold">1</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={`text-sm font-medium ${
                      currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'
                    }`}
                  >
                    Извличане
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Парсиране на файл</p>
                </div>
              </div>
            </li>

            {/* Connector Line */}
            <div className="flex-1 h-0.5 mx-4 bg-gray-300">
              <div
                className={`h-full ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}
                style={{ width: currentStep >= 2 ? '100%' : '0%', transition: 'width 0.3s' }}
              />
            </div>

            {/* Step 2 */}
            <li className="flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= 2
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 bg-white text-gray-500'
                  }`}
                >
                  {currentStep > 2 ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span className="text-sm font-semibold">2</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={`text-sm font-medium ${
                      currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'
                    }`}
                  >
                    Мапинг
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Съпоставяне с полета</p>
                </div>
              </div>
            </li>

            {/* Connector Line */}
            <div className="flex-1 h-0.5 mx-4 bg-gray-300">
              <div
                className={`h-full ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}
                style={{ width: currentStep >= 3 ? '100%' : '0%', transition: 'width 0.3s' }}
              />
            </div>

            {/* Step 3 */}
            <li className="flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= 3
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 bg-white text-gray-500'
                  }`}
                >
                  <span className="text-sm font-semibold">3</span>
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={`text-sm font-medium ${
                      currentStep >= 3 ? 'text-blue-600' : 'text-gray-500'
                    }`}
                  >
                    Потвърждение
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Преглед и импорт</p>
                </div>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Step Content */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Step 1: Data Extraction */}
        {currentStep === 1 && parsedData && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Стъпка 1: Извлечени данни от файл
            </h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h4 className="text-base font-semibold text-gray-900">Структурирани данни</h4>
              </div>
              <div className="p-4 max-h-[500px] overflow-y-auto">
                <ParsedDataView data={parsedData} />
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Отказ
              </button>
              <button
                onClick={handleNextStep}
                className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Напред към Мапинг
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Mapping */}
        {currentStep === 2 && section1Mapping && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Стъпка 2: Мапинг към Секция 1
            </h3>
            <MappingPreview
              mapping={section1Mapping}
              onConfirm={handleMappingConfirm}
              onCancel={handlePreviousStep}
            />
          </div>
        )}

        {/* Step 3: Review and Confirm */}
        {currentStep === 3 && selectedMapping && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Стъпка 3: Преглед и потвърждение
            </h3>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-blue-600 mr-3 mt-0.5"
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
                  <p className="font-semibold mb-2">Готово за импорт:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      <span className="font-medium">{selectedMapping.fields.length}</span> полета
                      ще бъдат импортирани
                    </li>
                    <li>
                      <span className="font-medium">{selectedMapping.records.length}</span> таблици
                      с записи ще бъдат импортирани
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Summary of selected mappings */}
            <div className="space-y-4 mb-6">
              {/* Fields Summary */}
              {selectedMapping.fields.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900">Полета за импорт</h4>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2">
                      {selectedMapping.fields.map((field, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{field.targetLabel}:</span>
                          <span className="font-medium text-gray-900">{field.sourceValue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Records Summary */}
              {selectedMapping.records.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900">Таблици за импорт</h4>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2">
                      {selectedMapping.records.map((record, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{record.targetLabel}:</span>
                          <span className="font-medium text-gray-900">
                            {record.records.length}{' '}
                            {record.records.length === 1 ? 'запис' : 'записа'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={handlePreviousStep}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Назад
              </button>
              <button
                onClick={handleFinalConfirm}
                className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
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
                Потвърди импорт
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
