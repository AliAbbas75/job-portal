import { useId, useState } from 'react';
import { Icon } from '../../../components/common/Icon';
import { t, tList } from '../../../i18n';
import { cx } from '../../../utils/cx';

const TOPICS = ['general', 'applications', 'account'];

/** FAQ with topic tabs and one open answer at a time. Text lives in i18n/en/faq.json. */
export function FaqSection() {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [open, setOpen] = useState(0);
  const id = useId();
  const questions = tList(`faq.${topic}`);

  function choose(next) {
    setTopic(next);
    setOpen(0);
  }

  return (
    <section id="faq" className="scroll-mt-4 bg-cream py-14" aria-labelledby={`${id}-heading`}>
      <div className="page flex flex-col items-center gap-6">
        <h2 id={`${id}-heading`} className="text-center text-3xl">
          {t('faq.heading')}
        </h2>
        <div
          role="tablist"
          aria-label={t('faq.tabsLabel')}
          className="flex flex-wrap justify-center gap-2"
        >
          {TOPICS.map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              id={`${id}-tab-${key}`}
              aria-selected={topic === key}
              aria-controls={`${id}-panel`}
              onClick={() => choose(key)}
              className={cx(
                'cursor-pointer rounded-full border px-4 py-2 font-medium',
                topic === key
                  ? 'border-heritage bg-heritage text-white'
                  : 'border-heritage bg-white text-heritage hover:bg-surface',
              )}
            >
              {t(`faq.tabs.${key}`)}
            </button>
          ))}
        </div>

        <ul
          id={`${id}-panel`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${topic}`}
          className="grid w-full gap-4 md:grid-cols-2"
        >
          {questions.map((item, index) => {
            const expanded = open === index;
            return (
              <li key={item.q} className="rounded-md border border-heritage bg-white">
                <h3 className="text-base">
                  <button
                    type="button"
                    className="flex w-full cursor-pointer items-center justify-between gap-4 p-4 text-left font-bold text-black"
                    aria-expanded={expanded}
                    aria-controls={`${id}-answer-${index}`}
                    onClick={() => setOpen(expanded ? null : index)}
                  >
                    {item.q}
                    <Icon
                      name={expanded ? 'x' : 'plus'}
                      size={18}
                      className="flex-none text-heritage"
                    />
                  </button>
                </h3>
                <p
                  id={`${id}-answer-${index}`}
                  hidden={!expanded}
                  className="border-t border-dashed border-heritage p-4"
                >
                  {item.a}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
