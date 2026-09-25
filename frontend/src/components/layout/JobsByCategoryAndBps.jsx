import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  {
    id: 'carpenter',
    name: 'Carpenter',
    count: 23,
    filterKey: 'q',
    filterValue: 'Carpenter',
    icon: (
      <svg className="w-7 h-7 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    id: 'gateman',
    name: 'Gateman',
    count: 35,
    filterKey: 'q',
    filterValue: 'Gateman',
    icon: (
      <svg className="w-7 h-7 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
      </svg>
    ),
  },
  {
    id: 'pointman',
    name: 'Pointman',
    count: 25,
    filterKey: 'q',
    filterValue: 'Pointman',
    icon: (
      <svg className="w-7 h-7 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <circle cx="12" cy="4.5" r="2.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5v8m-4-6l4-2 4 2m-6 12l2-4 2 4" />
      </svg>
    ),
  },
  {
    id: 'welder',
    name: 'Welder',
    count: 15,
    filterKey: 'q',
    filterValue: 'Welder',
    icon: (
      <svg className="w-7 h-7 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    id: 'fitter',
    name: 'Fitter',
    count: 135,
    filterKey: 'q',
    filterValue: 'Fitter',
    icon: (
      <svg className="w-7 h-7 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    id: 'electrician',
    name: 'Electrician',
    count: 65,
    filterKey: 'q',
    filterValue: 'Electrician',
    icon: (
      <svg className="w-7 h-7 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <rect x="6" y="7" width="12" height="13" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v4m6-4v4m-6 7h6m-3-3v6" />
      </svg>
    ),
  },
  {
    id: 'mason',
    name: 'Mason',
    count: 64,
    filterKey: 'q',
    filterValue: 'Mason',
    icon: (
      <svg className="w-7 h-7 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16M9 6v6m6 0v6M9 12v6" />
      </svg>
    ),
  },
  {
    id: 'painter',
    name: 'Painter',
    count: 78,
    filterKey: 'q',
    filterValue: 'Painter',
    icon: (
      <svg className="w-7 h-7 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <rect x="4" y="3" width="16" height="6" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 9v3a2 2 0 002 2h4a2 2 0 012 2v4a2 2 0 01-2 2h-2" />
      </svg>
    ),
  },
  {
    id: 'driver',
    name: 'Driver',
    count: 23,
    filterKey: 'q',
    filterValue: 'Driver',
    icon: (
      <svg className="w-7 h-7 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 17a2 2 0 100-4 2 2 0 000 4zm8 0a2 2 0 100-4 2 2 0 000 4z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 11l2-5a2 2 0 012-1h10a2 2 0 012 1l2 5m-18 0h18v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4z" />
      </svg>
    ),
  },
  {
    id: 'roofer',
    name: 'Roofer',
    count: 63,
    filterKey: 'q',
    filterValue: 'Roofer',
    icon: (
      <svg className="w-7 h-7 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1v-9.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12h6v9" />
      </svg>
    ),
  },
];

const BPS_GRADES = [
  { grade: 'BPS - 14', value: '14', count: 25 },
  { grade: 'BPS - 13', value: '13', count: 23 },
  { grade: 'BPS - 12', value: '12', count: 35 },
  { grade: 'BPS - 11', value: '11', count: 15 },
  { grade: 'BPS - 10', value: '10', count: 33 },
  { grade: 'BPS - 9', value: '9', count: 35 },
  { grade: 'BPS - 8', value: '8', count: 55 },
  { grade: 'BPS - 7', value: '7', count: 235 },
  { grade: 'BPS - 6', value: '6', count: 25 },
  { grade: 'BPS - 5', value: '5', count: 25 },
];

export function JobsByCategoryAndBps() {
  const navigate = useNavigate();

  const handleCategoryClick = (filterKey, filterValue) => {
    navigate(`/?${filterKey}=${encodeURIComponent(filterValue)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBpsClick = (bpsValue) => {
    navigate(`/?bps=${encodeURIComponent(bpsValue)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShowAll = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-gray-50 border-t border-gray-100 py-12 px-4 sm:px-6 lg:px-8 font-['Instrument_Sans',sans-serif]">
      <div className="max-w-6xl mx-auto space-y-14">
        {/* Jobs By Category Section */}
        <section aria-labelledby="jobs-by-category-heading">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <h2
                id="jobs-by-category-heading"
                className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight"
              >
                Jobs By <span className="text-ember">Category</span>
              </h2>
              <p className="text-sm md:text-base text-gray-500 mt-1.5 leading-relaxed">
                Our job portal makes it easy to find and apply for positions that match your skills and career goals.
              </p>
            </div>
            <button
              type="button"
              onClick={handleShowAll}
              className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-900 hover:text-ember transition-colors cursor-pointer"
            >
              Show all jobs
              <span className="text-sm font-bold transition-transform group-hover:translate-x-1">→</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.filterKey, cat.filterValue)}
                className="group bg-white rounded-xl border border-gray-200/80 p-5 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="mb-3 text-gray-800">{cat.icon}</div>
                  <h3 className="font-bold text-gray-900 text-base mb-1.5 leading-snug group-hover:text-ember transition-colors">
                    {cat.name}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium pt-2">
                  <span>{cat.count} jobs available</span>
                  <span className="text-xs font-semibold text-gray-400 group-hover:text-ember transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Jobs By BPS Section */}
        <section aria-labelledby="jobs-by-bps-heading">
          <div className="mb-6">
            <h2
              id="jobs-by-bps-heading"
              className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight"
            >
              Jobs By <span className="text-ember">BPS</span>
            </h2>
            <p className="text-sm md:text-base text-gray-500 mt-1.5 leading-relaxed">
              Our job portal makes it easy to find and apply for positions that match your skills and career goals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {BPS_GRADES.map((bps) => (
              <div
                key={bps.grade}
                onClick={() => handleBpsClick(bps.value)}
                className="group bg-white rounded-xl border border-gray-200/80 p-5 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-bold text-gray-900 text-base mb-1.5 leading-snug group-hover:text-ember transition-colors">
                    {bps.grade}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium pt-2">
                  <span>{bps.count} jobs available</span>
                  <span className="text-xs font-semibold text-gray-400 group-hover:text-ember transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
