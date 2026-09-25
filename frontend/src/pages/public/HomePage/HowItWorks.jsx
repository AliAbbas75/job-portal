import { Icon } from '../../../components/common/Icon';
import { t } from '../../../i18n';

const STEPS = [
  { key: 'register', icon: 'user' },
  { key: 'profile', icon: 'edit' },
  { key: 'apply', icon: 'file' },
  { key: 'shortlisted', icon: 'check' },
  { key: 'status', icon: 'clock' },
  { key: 'employed', icon: 'briefcase' },
];

/** The six steps from signing up to getting the job. */
export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-4 bg-surface py-12"
      aria-labelledby="how-heading"
    >
      <div className="page flex flex-col items-center gap-8 text-center">
        <div className="flex flex-col gap-2">
          <h2 id="how-heading" className="text-3xl">
            {t('home.howTitle')}
          </h2>
          <p>{t('home.howLead')}</p>
        </div>
        <ol className="grid w-full grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {STEPS.map((step, index) => (
            <li key={step.key} className="flex flex-col items-center gap-2">
              <span className="relative flex size-14 items-center justify-center rounded-full border-2 border-heritage bg-white text-heritage">
                <Icon name={step.icon} size={24} />
                <span className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-gold text-xs font-bold text-black">
                  {index + 1}
                </span>
              </span>
              <span className="font-bold">{t(`home.steps.${step.key}`)}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
