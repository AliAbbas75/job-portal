import { FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import { t } from '../../i18n';
import { paths } from '../../routes/paths';
import { Icon } from '../common/Icon';

const SOCIAL = [
  {
    key: 'facebook',
    name: 'Facebook',
    url: 'https://www.facebook.com/share/1Adk6DmZM6/',
    Icon: FaFacebookF,
    textColor: 'text-[#1877F2]',
    fillBg: 'bg-[#1877F2]',
  },
  {
    key: 'instagram',
    name: 'Instagram',
    url: 'https://www.instagram.com/mor_pakistan',
    Icon: FaInstagram,
    textColor: 'text-[#E4405F]',
    fillBg: 'bg-[#E4405F]',
  },
  {
    key: 'x',
    name: 'X',
    url: 'https://x.com/MOR_Pakistan',
    Icon: FaXTwitter,
    textColor: 'text-black',
    fillBg: 'bg-black',
  },
  {
    key: 'youtube',
    name: 'YouTube',
    url: 'https://www.youtube.com/@pakrailways',
    Icon: FaYoutube,
    textColor: 'text-[#FF0000]',
    fillBg: 'bg-[#FF0000]',
  },
];

/** Site footer matching official Pakistan Railways brand guidelines: Heritage Green, Surface Green, Black, and Instrument Sans. */
export function SiteFooter() {
  return (
    <footer id="contact" className="w-full border-t border-heritage/20 bg-surface">
      {/* Main Footer Section with exact home page padding and page alignment */}
      <div className="page pt-10 pb-6">
        {/* Top Row: Logo, Follow Us, Latest Job Updates */}
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:items-center">
          <Link
            to={paths.home}
            className="flex items-center no-underline"
            aria-label={t('header.homeLink')}
          >
            <img
              src="/pakrail-logo-horizontal.png"
              alt="Pakistan Railways"
              className="h-12 w-auto object-contain sm:h-14"
            />
          </Link>

          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-bold text-black">{t('footer.followUs')}</p>
            <ul className="flex items-center gap-3">
              {SOCIAL.map(({ key, name, url, Icon: SocIcon, textColor, fillBg }) => (
                <li key={key} className="relative">
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={t(`footer.social.${key}`)}
                    className="group relative flex flex-col items-center"
                  >
                    <span className="relative flex size-10 items-center justify-center overflow-hidden rounded-full border border-heritage/20 bg-white transition-transform duration-200 group-hover:scale-105">
                      <span
                        className={`absolute inset-0 translate-y-full rounded-full transition-transform duration-200 ease-out group-hover:translate-y-0 ${fillBg}`}
                      />
                      <SocIcon
                        className={`relative z-10 size-4 transition-colors duration-200 ${textColor} group-hover:text-white`}
                        aria-hidden="true"
                      />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex w-full flex-col items-center gap-2 md:w-auto md:items-end">
            <p className="text-sm font-bold text-black">{t('footer.latestJobUpdates')}</p>
            <form onSubmit={(e) => e.preventDefault()} className="flex w-full max-w-sm flex-col items-center gap-2 sm:flex-row">
              <input
                type="email"
                placeholder={t('footer.signUpWithEmail')}
                className="h-10 w-full rounded-lg border border-heritage/30 bg-white px-3.5 text-sm text-black placeholder:text-black/40 focus:border-heritage focus:outline-none sm:w-60"
              />
              <button
                type="submit"
                className="h-10 w-full cursor-pointer rounded-lg bg-heritage px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto flex-shrink-0"
              >
                {t('footer.signUpButton')}
              </button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 w-full border-t border-heritage/20" />

        {/* Contact details */}
        <address className="flex flex-col justify-between gap-3 text-sm text-black/90 not-italic sm:flex-row sm:items-center">
          <p className="flex items-center gap-2">
            <Icon name="mail" size={16} className="text-heritage flex-none" />
            <span className="font-bold text-black">{t('footer.email')}:</span>{' '}
            <a
              href={`mailto:${t('footer.emailValue')}`}
              className="text-black/90 underline hover:text-heritage"
            >
              {t('footer.emailValue')}
            </a>
          </p>
          <p className="flex items-center gap-2">
            <Icon name="phone" size={16} className="text-heritage flex-none" />
            <span className="font-bold text-black">{t('footer.phone')}:</span>{' '}
            {t('footer.phoneValue')}
          </p>
          <p className="hidden md:flex items-center gap-2 max-w-lg">
            <Icon name="mapPin" size={16} className="text-heritage flex-none" />
            <span className="font-bold text-black">{t('footer.address')}:</span>{' '}
            {t('footer.addressValue')}
          </p>
        </address>

        {/* Watermark spanning the full width of the footer */}
        <div className="mt-8 pointer-events-none w-full select-none" aria-hidden="true">
          <p className="text-center text-[clamp(1.25rem,4.5vw,3.5rem)] leading-tight font-extrabold tracking-wider text-heritage/10 uppercase">
            {t('footer.wordmark')}
          </p>
        </div>
      </div>

      {/* Dark Legal / Bottom Bar with exact home page padding */}
      <div className="bg-black py-4 text-xs text-white/80">
        <div className="page flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-center sm:text-left text-xs">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs">
            <a
              href="#policy"
              className="text-white/80 no-underline hover:text-white hover:underline"
            >
              {t('footer.mediaPolicy')}
            </a>
            <a
              href="#legal"
              className="text-white/80 no-underline hover:text-white hover:underline"
            >
              {t('footer.legalNotice')}
            </a>
            <a
              href="#privacy"
              className="text-white/80 no-underline hover:text-white hover:underline"
            >
              {t('footer.privacyPolicy')}
            </a>
            <a
              href="#terms"
              className="text-white/80 no-underline hover:text-white hover:underline"
            >
              {t('footer.termsConditions')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
