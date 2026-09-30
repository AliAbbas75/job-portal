import { useEffect, useState } from 'react';
import { Icon } from '../../../components/common/Icon';
import { t } from '../../../i18n';

const STEPS = [
  { key: 'register', icon: 'userPlus', title: 'Register' },
  { key: 'profile', icon: 'idBadge', title: 'Complete profile' },
  { key: 'apply', icon: 'search', title: 'Apply for a job' },
  { key: 'shortlisted', icon: 'clock', title: 'Get shortlisted' },
  { key: 'status', icon: 'clipboardCheck', title: 'Track your status' },
  { key: 'employed', icon: 'train', title: 'Get employed' },
];

/** The six steps opening one by one in sequence with rotating animation. */
export function HowItWorks() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase((prev) => {
        if (prev >= 11) {
          clearInterval(timer);
          return 11;
        }
        return prev + 1;
      });
    }, 280);

    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="how-to-apply"
      className="scroll-mt-4 bg-[#fbfdfb] py-12 sm:py-16"
      aria-labelledby="how-heading"
    >
      <div className="page flex flex-col items-center px-4 sm:px-6">
        {/* Section Heading */}
        <div className="mb-10 flex flex-col items-center gap-2 text-center">
          <h2 id="how-heading" className="text-3xl font-bold text-heritage sm:text-4xl">
            {t('home.howTitle')}
          </h2>
          <p className="max-w-xl text-sm text-black/70 sm:text-base">
            {t('home.howLead')}
          </p>
        </div>

        {/* Horizontal flow constrained within section width limit */}
        <div className="flex w-full max-w-3xl flex-wrap items-start justify-between gap-y-8 lg:flex-nowrap lg:gap-x-1 xl:max-w-4xl">
          {STEPS.map((step, index) => {
            const isStepVisible = phase >= index * 2;
            const isArrowVisible = phase >= index * 2 + 1;

            return (
              <div key={step.key} className="flex items-start">
                {/* Step item */}
                <div className="flex w-28 flex-col items-center text-center sm:w-32 lg:w-32">
                  {/* Rotating animated circle badge with pumpkin red boundary */}
                  <div className="relative">
                    <span
                      className={`flex size-18 items-center justify-center rounded-full border-2 border-ember bg-[#edf5ee] text-heritage shadow-sm transition-all duration-500 sm:size-20 ${
                        isStepVisible
                          ? 'rotate-0 scale-100 opacity-100'
                          : '-rotate-180 scale-0 opacity-0'
                      } cursor-pointer hover:rotate-12 hover:scale-105`}
                    >
                      <Icon name={step.icon} size={28} />
                    </span>
                  </div>

                  {/* Title (subtitles removed) */}
                  <strong
                    className={`mt-3.5 block text-center text-xs font-bold text-heritage transition-all duration-500 sm:text-sm ${
                      isStepVisible
                        ? 'translate-y-0 opacity-100'
                        : 'translate-y-2 opacity-0'
                    }`}
                  >
                    {step.title}
                  </strong>
                </div>

                {/* Animated right arrow connector between steps */}
                {index < STEPS.length - 1 && (
                  <div
                    className={`hidden h-18 items-center justify-center px-1 text-stone-300 transition-all duration-400 sm:h-20 lg:flex ${
                      isArrowVisible
                        ? 'translate-x-0 scale-x-100 opacity-100'
                        : '-translate-x-3 scale-x-0 opacity-0'
                    }`}
                    aria-hidden="true"
                  >
                    <svg
                      className="h-3.5 w-5 text-stone-400 xl:w-7"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                    >
                      <path
                        d="M4 12h16m-5-5 5 5-5 5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
