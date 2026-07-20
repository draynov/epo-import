/**
 * Import Progress Bar
 * Shows the current step in the multi-section import flow
 */

'use client';

interface ImportProgressBarProps {
  currentSection: number; // 1-6 for sections, 0 for review
  completedSections: number[];
}

const SECTIONS = [
  { number: 1, title: 'Обща информация' },
  { number: 2, title: 'Образование' },
  { number: 3, title: 'Практическа дейност' },
  { number: 4, title: 'Постижения' },
  { number: 5, title: 'Участие' },
  { number: 6, title: 'Самооценка' },
];

export function ImportProgressBar({ currentSection, completedSections }: ImportProgressBarProps) {
  return (
    <div className="mb-8">
      {/* Progress Bar */}
      <div className="relative">
        {/* Background Line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200" />
        
        {/* Progress Line */}
        <div
          className="absolute top-5 left-0 h-1 bg-green-600 transition-all duration-300"
          style={{
            width: `${(completedSections.length / SECTIONS.length) * 100}%`,
          }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {SECTIONS.map((section) => {
            const isCompleted = completedSections.includes(section.number);
            const isCurrent = currentSection === section.number;
            const isUpcoming = !isCompleted && !isCurrent;

            return (
              <div key={section.number} className="flex flex-col items-center">
                {/* Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                    isCompleted
                      ? 'bg-green-600 text-white'
                      : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : 'bg-white text-gray-400 border-2 border-gray-300'
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    section.number
                  )}
                </div>

                {/* Label */}
                <div className="mt-2 text-center max-w-[100px]">
                  <div
                    className={`text-xs font-medium ${
                      isCurrent
                        ? 'text-blue-600'
                        : isCompleted
                        ? 'text-green-600'
                        : 'text-gray-500'
                    }`}
                  >
                    Секция {section.number}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 hidden sm:block">
                    {section.title}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Step Info */}
      <div className="mt-6 text-center">
        <div className="text-sm text-gray-600">
          Стъпка <span className="font-semibold text-gray-900">{currentSection}</span> от{' '}
          <span className="font-semibold text-gray-900">{SECTIONS.length}</span>
        </div>
        {currentSection > 0 && currentSection <= SECTIONS.length && (
          <div className="text-lg font-semibold text-gray-900 mt-1">
            Секция {currentSection}: {SECTIONS[currentSection - 1].title}
          </div>
        )}
      </div>
    </div>
  );
}
