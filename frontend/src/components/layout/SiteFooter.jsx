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
    <footer className="w-full font-['Instrument_Sans',sans-serif] bg-[#eaf4ef]">
      {/* MAIN FOOTER SECTION */}
      <div className="relative bg-[#eaf4ef] pt-10 pb-6 px-4 sm:px-8 lg:px-12 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
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

          {/* SOCIAL MEDIA BUTTONS (Colorful Border & Icon in Default State, Fill Color Bottom-to-Top on Hover) */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="text-sm font-semibold text-gray-800 font-['Instrument_Sans',sans-serif]">
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
                  className={`relative group w-10 h-10 rounded-full bg-white flex items-center justify-center border ${item.borderColor} shadow-sm overflow-hidden transition-all duration-300`}
                >
                  {/* Bottom-to-Top Fill Overlay */}
                  <span
                    className={`absolute bottom-0 left-0 w-full h-0 group-hover:h-full transition-all duration-300 ease-out ${item.fillColor}`}
                  />
                  {/* Icon */}
                  <span
                    className={`relative z-10 text-sm ${item.iconColor} group-hover:text-white transition-colors duration-300`}
                  >
                    {item.icon}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* LATEST JOB UPDATES */}
          <div className="flex flex-col items-center md:items-start gap-2 w-full md:w-auto">
            <span className="text-sm font-semibold text-gray-800 font-['Instrument_Sans',sans-serif]">
              Latest Job Updates
            </span>
            {subscribed ? (
              <span className="text-sm font-medium text-[#1F4D36] bg-emerald-100/70 px-4 py-2 rounded-lg font-['Instrument_Sans',sans-serif]">
                ✓ Thank you for subscribing!
              </span>
            ) : (
              <form onSubmit={handleSubscribe} className="flex items-center gap-2 w-full max-w-sm">
                <input
                  type="email"
                  required
                  placeholder="Sign Up With Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-4 py-2 text-sm bg-white text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4D36] w-full font-['Instrument_Sans',sans-serif]"
                />
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium bg-[#1F4D36] text-white rounded-lg transition-colors hover:bg-[#163827] flex-shrink-0 font-['Instrument_Sans',sans-serif]"
                >
                  Sign up
                </button>
              </form>
            )}
          </div>
        </div>

        {/* DIVIDER */}
        <div className="max-w-7xl mx-auto my-6 border-t border-gray-300/70" />

        {/* CONTACT INFO ROW */}
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4 text-sm text-gray-800 font-medium font-['Instrument_Sans',sans-serif]">
          <div>
            <span className="font-bold text-gray-900">Email:</span> info@pakrail.gov.pk
          </div>
          <div>
            <span className="font-bold text-gray-900">Tel:</span> 042-99201938 (Lahore)
          </div>
          <div className="max-w-xl">
            <span className="font-bold text-gray-900">Address:</span> Muhammad Raza Hussain (DPO),
            For Divisional Superintendent, Pakistan Railways.
          </div>
        </div>

        {/* FAINT WATERMARK TEXT - NO CUTOFF - INSTRUMENT SANS */}
        <div className="mt-8 text-center select-none pointer-events-none w-full overflow-hidden">
          <span className="font-['Instrument_Sans',sans-serif] font-extrabold text-[clamp(1.1rem,4.1vw,3.6rem)] text-[#1F4D36]/10 tracking-wider uppercase block text-center leading-tight">
            PUBLIC RECRUITMENT SERVICES
          </span>
        </div>
      </div>

      {/* BOTTOM DARK BAR */}
      <div className="bg-[#0b0f19] text-white py-4 px-4 sm:px-8 lg:px-12 text-xs font-['Instrument_Sans',sans-serif]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-center sm:text-left">
          <p className="text-white/90 underline decoration-white/40 underline-offset-4 font-['Instrument_Sans',sans-serif]">
            Copyright 2026 - All Right Reserved - Developed By Directorate of IT Pakistan Railways
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-white font-['Instrument_Sans',sans-serif]">
            <Link to="/media-policy" className="text-white hover:underline font-medium">
              Media Policy
            </Link>
            <span className="text-white/60">|</span>
            <Link to="/legal-notice" className="text-white hover:underline font-medium">
              Legal Notice
            </Link>
            <span className="text-white/60">|</span>
            <Link to="/privacy-policy" className="text-white hover:underline font-medium">
              Privacy Policy
            </Link>
            <span className="text-white/60">|</span>
            <Link to="/terms" className="text-white hover:underline font-medium">
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
