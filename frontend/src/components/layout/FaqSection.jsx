import { useId, useState } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';
import { t, tList } from '../../i18n';

/** FAQ section with equal cards per side, equal height across rows, closed by default. */
export function FaqSection() {
  const [open, setOpen] = useState(null);
  const id = useId();
  const questions = tList('faq.general');

  const half = Math.ceil(questions.length / 2);
  // Interleave left and right so grid rows pair (0,4), (1,5), etc. for equal row height
  const gridItems = [];
  for (let i = 0; i < half; i++) {
    gridItems.push({ item: questions[i], index: i });
    if (half + i < questions.length) {
      gridItems.push({ item: questions[half + i], index: half + i });
    }
  }

  return (
    <section
      id="faqs"
      className="scroll-mt-4 bg-white py-14 md:py-20"
      aria-labelledby={`${id}-heading`}
    >
      <div className="page flex flex-col items-center">
        <h2
          id={`${id}-heading`}
          className="text-center text-3xl font-extrabold tracking-tight text-black sm:text-4xl"
        >
          {t('faq.heading')}
        </h2>

        <div className="mt-10 grid w-full grid-cols-1 items-stretch gap-4 md:grid-cols-2">
          {gridItems.map(({ item, index }) => {
            const expanded = open === index;
            return (
              <div
                key={item.q}
                className="flex h-full flex-col justify-between rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all sm:p-6"
              >
                <div className="flex h-full flex-col justify-center">
                  <h3>
                    <button
                      type="button"
                      className="flex w-full cursor-pointer items-center justify-between gap-4 text-left font-semibold text-black"
                      aria-expanded={expanded}
                      aria-controls={`${id}-answer-${index}`}
                      onClick={() => setOpen(expanded ? null : index)}
                    >
                      <span className="text-sm leading-snug sm:text-base">{item.q}</span>
                      <span className="flex size-6 flex-none items-center justify-center text-black/50">
                        {expanded ? (
                          <FiX className="size-5 text-black/60" aria-hidden="true" />
                        ) : (
                          <FiPlus className="size-5 text-black/60" aria-hidden="true" />
                        )}
                      </span>
                    </button>
                  </h3>
                  {expanded && (
                    <p
                      id={`${id}-answer-${index}`}
                      className="mt-3.5 pt-1 text-sm leading-relaxed font-normal text-black/70"
                    >
                      {item.a}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
