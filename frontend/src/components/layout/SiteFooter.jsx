import { Link } from 'react-router-dom';
import { t } from '../../i18n';
import { paths } from '../../routes/paths';
import { Logo } from '../common/Logo';

const headingClass = 'mb-3 text-base text-gold';

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-heritage text-white">
      <div className="page grid gap-8 py-12 md:grid-cols-[2fr_1fr_1.5fr]">
        <div className="flex max-w-[36ch] flex-col gap-3 text-cream">
          <Logo inverted />
          <p>{t('footer.about')}</p>
        </div>
        <nav aria-label={t('footer.candidatesHeading')}>
          <h2 className={headingClass}>{t('footer.candidatesHeading')}</h2>
          <ul className="grid gap-2 [&_a]:text-white">
            <li>
              <Link to={paths.home}>{t('nav.findJobs')}</Link>
            </li>
            <li>
              <Link to={paths.signup}>{t('nav.createAccount')}</Link>
            </li>
            <li>
              <Link to={paths.applications}>{t('nav.myApplications')}</Link>
            </li>
          </ul>
        </nav>
        <div>
          <h2 className={headingClass}>{t('footer.howHeading')}</h2>
          <ol className="grid list-decimal gap-2 pl-5 text-cream">
            <li>{t('footer.step1')}</li>
            <li>{t('footer.step2')}</li>
            <li>{t('footer.step3')}</li>
          </ol>
        </div>
      </div>
      <div className="border-t border-surface py-4 text-sm text-cream">
        <p className="page">{t('footer.copyright', { year: new Date().getFullYear() })}</p>
      </div>
    </footer>
  );
}
