import { t } from '../../../i18n';

/** Green hero with headline, two headline numbers and the search card (`children`). */
export function HomeHero({ stats, children }) {
  const figures = [
    { value: stats?.openJobs, label: t('hero.statJobs') },
    { value: stats?.vacancies, label: t('hero.statVacancies') },
  ];

  return (
    <section className="bg-heritage text-white">
      <div className="page flex flex-col gap-5 py-8 md:gap-8 md:py-12">
        <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-5">
          <div className="flex max-w-160 flex-col gap-3">
            <p className="text-sm font-bold tracking-[0.15em] text-gold uppercase">
              {t('hero.eyebrow')}
            </p>
            <h1 className="text-4xl text-white md:text-[2.75rem]">{t('hero.title')}</h1>
            <p className="text-lg text-cream">{t('hero.lead')}</p>
          </div>
          <dl className="flex">
            {figures.map((figure) => (
              <div
                key={figure.label}
                className="flex flex-col-reverse border-surface px-6 not-first:border-l first:pl-0"
              >
                <dt className="mt-1 text-cream">{figure.label}</dt>
                <dd className="m-0 text-3xl leading-none font-bold text-gold md:text-[2.5rem]">
                  {figure.value ?? '–'}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        {children}
      </div>
    </section>
  );
}
