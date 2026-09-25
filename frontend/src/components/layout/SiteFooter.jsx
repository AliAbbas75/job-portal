import { useState } from 'react';
import { FaFacebookF, FaInstagram, FaTiktok } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

export function SiteFooter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const socialLinks = [
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/share/1Adk6DmZM6/',
      icon: <FaFacebookF />,
      iconColor: 'text-[#1877F2]',
      borderColor: 'border-[#1877F2]/40',
      fillColor: 'bg-[#1877F2]',
    },
    {
      name: 'TikTok',
      url: 'https://www.tiktok.com/@mor_pakistan?_r=1&_t=ZS-98qRhbrNzWe',
      icon: <FaTiktok />,
      iconColor: 'text-[#000000]',
      borderColor: 'border-[#000000]/30',
      fillColor: 'bg-[#000000]',
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/mor_pakistan?igsh=ZXRyYmdvMXl3eWl2',
      icon: <FaInstagram />,
      iconColor: 'text-[#E4405F]',
      borderColor: 'border-[#E4405F]/40',
      fillColor: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]',
    },
    {
      name: 'X (Twitter)',
      url: 'https://x.com/MOR_Pakistan',
      icon: <FaXTwitter />,
      iconColor: 'text-[#000000]',
      borderColor: 'border-[#000000]/30',
      fillColor: 'bg-[#000000]',
    },
  ];

  return (
    <footer className="w-full bg-[#eaf4ef] font-['Instrument_Sans',sans-serif]">
      {/* MAIN FOOTER SECTION */}
      <div className="relative overflow-hidden bg-[#eaf4ef] px-4 pt-10 pb-6 sm:px-8 lg:px-12">
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
          {/* EXACT VERTICAL LOGO */}
          <div className="flex items-center">
            <Link to="/">
              <img
                src="/pakrail-logo-vertical.png"
                alt="Pakistan Railways"
                className="h-32 w-auto object-contain"
              />
            </Link>
          </div>

          {/* SOCIAL MEDIA BUTTONS */}
          <div className="flex flex-col items-center gap-2 md:items-start">
            <span className="text-gray-800 font-['Instrument_Sans',sans-serif] text-sm font-semibold">
              Follow Us
            </span>
            <div className="flex items-center gap-3">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.name}
                  className={`group relative flex h-10 w-10 items-center justify-center rounded-full border bg-white ${item.borderColor} shadow-sm overflow-hidden transition-all duration-300`}
                >
                  {/* Bottom-to-Top Fill Overlay */}
                  <span
                    className={`absolute bottom-0 left-0 h-0 w-full transition-all duration-300 ease-out group-hover:h-full ${item.fillColor}`}
                  />
                  {/* Icon */}
                  <span
                    className={`relative z-10 text-sm ${item.iconColor} transition-colors duration-300 group-hover:text-white`}
                  >
                    {item.icon}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* LATEST JOB UPDATES */}
          <div className="flex w-full flex-col items-center gap-2 md:w-auto md:items-start">
            <span className="text-gray-800 font-['Instrument_Sans',sans-serif] text-sm font-semibold">
              Latest Job Updates
            </span>
            {subscribed ? (
              <span className="bg-emerald-100/70 rounded-lg px-4 py-2 font-['Instrument_Sans',sans-serif] text-sm font-medium text-[#1F4D36]">
                ✓ Thank you for subscribing!
              </span>
            ) : (
              <form onSubmit={handleSubscribe} className="flex w-full max-w-sm items-center gap-2">
                <input
                  type="email"
                  required
                  placeholder="Sign Up With Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-gray-800 border-gray-300 w-full rounded-lg border bg-white px-4 py-2 font-['Instrument_Sans',sans-serif] text-sm focus:ring-2 focus:ring-[#1F4D36] focus:outline-none"
                />
                <button
                  type="submit"
                  className="flex-shrink-0 rounded-lg bg-[#1F4D36] px-5 py-2 font-['Instrument_Sans',sans-serif] text-sm font-medium text-white transition-colors hover:bg-[#163827]"
                >
                  Sign up
                </button>
              </form>
            )}
          </div>
        </div>

        {/* DIVIDER */}
        <div className="border-gray-300/70 mx-auto my-6 max-w-7xl border-t" />

        {/* CONTACT INFO ROW */}
        <div className="text-gray-800 mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 font-['Instrument_Sans',sans-serif] text-sm font-medium">
          <div>
            <span className="text-gray-900 font-bold">Email:</span> info@pakrail.gov.pk
          </div>
          <div>
            <span className="text-gray-900 font-bold">Tel:</span> 042-99201938 (Lahore)
          </div>
          <div className="max-w-xl">
            <span className="text-gray-900 font-bold">Address:</span> Muhammad Raza Hussain (DPO),
            For Divisional Superintendent, Pakistan Railways.
          </div>
        </div>

        {/* FAINT WATERMARK TEXT - NO CUTOFF */}
        <div className="pointer-events-none mt-8 w-full overflow-hidden text-center select-none">
          <span className="block text-center font-['Instrument_Sans',sans-serif] text-[clamp(1.1rem,4.1vw,3.6rem)] leading-tight font-extrabold tracking-wider text-[#1F4D36]/10 uppercase">
            PUBLIC RECRUITMENT SERVICES
          </span>
        </div>
      </div>

      {/* BOTTOM DARK BAR */}
      <div className="bg-[#0b0f19] px-4 py-4 font-['Instrument_Sans',sans-serif] text-xs text-white sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
          <p className="font-['Instrument_Sans',sans-serif] text-white/90 underline decoration-white/40 underline-offset-4">
            Copyright 2026 - All Right Reserved - Developed By Directorate of IT Pakistan Railways
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 font-['Instrument_Sans',sans-serif] text-white">
            <Link to="/media-policy" className="font-medium text-white hover:underline">
              Media Policy
            </Link>
            <span className="text-white/60">|</span>
            <Link to="/legal-notice" className="font-medium text-white hover:underline">
              Legal Notice
            </Link>
            <span className="text-white/60">|</span>
            <Link to="/privacy-policy" className="font-medium text-white hover:underline">
              Privacy Policy
            </Link>
            <span className="text-white/60">|</span>
            <Link to="/terms" className="font-medium text-white hover:underline">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { SiteFooter as Footer };
export default SiteFooter;
