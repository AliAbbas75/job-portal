import { FaFacebookF, FaInstagram, FaTiktok } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import { t } from '../../i18n';
import { paths } from '../../routes/paths';
import { Logo } from '../common/Logo';

const SOCIAL = [
  { key: 'facebook', url: 'https://www.facebook.com/share/1Adk6DmZM6/', Icon: FaFacebookF },
  { key: 'instagram', url: 'https://www.instagram.com/mor_pakistan', Icon: FaInstagram },
  { key: 'x', url: 'https://x.com/MOR_Pakistan', Icon: FaXTwitter },
  { key: 'tiktok', url: 'https://www.tiktok.com/@mor_pakistan', Icon: FaTiktok },
];

/** Site footer: logo, social links, contact details (the "Contact us" nav target). */
export function SiteFooter() {
  return (
    <footer id="contact" className="border-t border-heritage bg-surface">
      <div className="page flex flex-col gap-6 pt-10 pb-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link
            to={paths.home}
            className="rounded-sm bg-white p-3"
            aria-label={t('header.homeLink')}
          >
            <Logo />
          </Link>
          <div className="flex flex-col items-center gap-2 md:items-end">
            <p className="text-sm font-bold">{t('footer.followUs')}</p>
            <ul className="flex gap-3">
              {SOCIAL.map(({ key, url, Icon }) => (
                <li key={key}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={t(`footer.social.${key}`)}
                    className="flex size-10 items-center justify-center rounded-full border border-heritage bg-white text-heritage no-underline hover:bg-heritage hover:text-white"
                  >
                    <Icon aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <address className="flex flex-col gap-2 border-t border-heritage pt-5 text-sm not-italic md:flex-row md:justify-between md:gap-6">
          <p>
            <span className="font-bold">{t('footer.email')}:</span>{' '}
            <a href={`mailto:${t('footer.emailValue')}`}>{t('footer.emailValue')}</a>
          </p>
          <p>
            <span className="font-bold">{t('footer.phone')}:</span> {t('footer.phoneValue')}
          </p>
          <p className="md:max-w-md">
            <span className="font-bold">{t('footer.address')}:</span> {t('footer.addressValue')}
          </p>
        </address>

        <p
          className="text-center text-[clamp(1.25rem,4.5vw,3.5rem)] leading-tight font-extrabold tracking-wider text-white uppercase select-none"
          aria-hidden="true"
        >
          {t('footer.wordmark')}
        </p>
      </div>

      <div className="bg-heritage py-3 text-sm text-white">
        <p className="page text-center">
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
