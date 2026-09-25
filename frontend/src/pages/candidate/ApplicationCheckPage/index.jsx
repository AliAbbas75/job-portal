import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getJob } from '../../../api/jobs';
import { useAsync } from '../../../hooks/useAsync';
import { useAuth } from '../../../hooks/useAuth';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { paths } from '../../../routes/paths';

const OPERATORS = ['Telenor', 'Jazz', 'Zong', 'Ufone', 'ONIC'];

const STEPS = [
  { id: 1, key: 'identity', label: '1. Identity' },
  { id: 2, key: 'otp', label: '2. OTP' },
  { id: 3, key: 'profile', label: '3. Profile' },
  { id: 4, key: 'documents', label: '4. Documents' },
  { id: 5, key: 'review', label: '5. Review' },
  { id: 6, key: 'confirm', label: '6. Confirm' },
];

export default function ApplicationCheckPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { candidate } = useAuth();
  useDocumentTitle('Apply For Position');
  const jobQuery = useAsync(() => getJob(jobId), [jobId]);

  const [currentStep, setCurrentStep] = useState(1);

  // Form states - starting empty so candidate fills out their own details
  const [cnic, setCnic] = useState(candidate?.cnic || '');
  const [operator, setOperator] = useState('');
  const [mobile, setMobile] = useState(candidate?.mobile || '');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);

  // Profile states - starting empty
  const [fullName, setFullName] = useState(candidate?.name || '');
  const [fatherName, setFatherName] = useState('');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [education, setEducation] = useState('');
  const [tradeCertificate, setTradeCertificate] = useState('');
  const [quota, setQuota] = useState('');
  const [ageRelaxation, setAgeRelaxation] = useState('');

  // Documents state - starting unuploaded
  const [documents, setDocuments] = useState({
    photo: false,
    domicile: false,
    education: false,
    character: false,
    trade: false,
    quota: false,
    ageRelaxation: false,
  });

  const jobTitle = jobQuery.data?.title || 'Position';
  const bpsGrade = jobQuery.data?.bps ? `BPS ${jobQuery.data.bps}` : 'BPS 05';

  const toggleDoc = (docKey) => {
    setDocuments((prev) => ({ ...prev, [docKey]: !prev[docKey] }));
  };

  const handleDobChange = (val) => {
    setDob(val);
    if (val) {
      const birthYear = new Date(val).getFullYear();
      const currentYear = new Date().getFullYear();
      if (!isNaN(birthYear)) {
        setAge(`${currentYear - birthYear} Years`);
      }
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-['Instrument_Sans',sans-serif]">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Top Header Card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 md:p-8 shadow-2xs space-y-6">
          
          {/* Applying For Banner */}
          <div className="bg-slate-50/80 rounded-xl p-4 flex items-center justify-between border border-gray-100">
            <div>
              <p className="text-xs text-gray-400 font-medium">Applying For</p>
              <h2 className="text-base font-bold text-gray-900 mt-0.5">
                {jobTitle} - {bpsGrade}
              </h2>
            </div>
            <Link
              to={paths.job(jobId)}
              className="text-xs sm:text-sm font-semibold text-[#3b82f6] hover:underline no-underline"
            >
              View Details
            </Link>
          </div>

          {/* 6-Step Pill Progress Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {STEPS.map((step) => {
              const isDone = step.id < currentStep;
              const isCurrent = step.id === currentStep;

              return (
                <div
                  key={step.key}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isCurrent
                      ? 'border border-[#1f4d36] bg-[#f0fdf4] text-[#1f4d36] shadow-2xs'
                      : isDone
                      ? 'border border-emerald-600 bg-emerald-50 text-emerald-700'
                      : 'border border-gray-200 text-gray-400 bg-white'
                  }`}
                >
                  {isDone && <span className="font-bold text-emerald-700">✓</span>}
                  <span>{step.label}</span>
                </div>
              );
            })}
          </div>

          {/* STEP 1: IDENTITY VERIFICATION */}
          {currentStep === 1 && (
            <div className="space-y-6 pt-2">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Step 1 — Identity Verification</h1>
                <p className="text-xs text-gray-400 mt-1">Enter your CNIC and mobile number. No password required</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Candidate CNIC <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <rect x="3" y="4" width="18" height="16" rx="2" />
                      <circle cx="9" cy="10" r="2.5" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 8h2m-2 4h2M6 17c0-2 2-3 3-3s3 1 3 3" />
                    </svg>
                    <input
                      type="text"
                      value={cnic}
                      onChange={(e) => setCnic(e.target.value)}
                      placeholder="Enter 13-digit CNIC"
                      className="w-full text-xs text-gray-900 focus:outline-none bg-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Select Telecom Operator <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white">
                      <select
                        value={operator}
                        onChange={(e) => setOperator(e.target.value)}
                        className="w-full text-xs text-gray-900 focus:outline-none bg-transparent appearance-none cursor-pointer pr-6"
                      >
                        <option value="" disabled hidden>
                          Select Operator
                        </option>
                        {OPERATORS.map((op) => (
                          <option key={op} value={op}>
                            {op}
                          </option>
                        ))}
                      </select>
                      <svg className="w-4 h-4 text-gray-400 absolute right-3 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Mobile number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white">
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="03xx xxxxxxx"
                        className="w-full text-xs text-gray-900 focus:outline-none bg-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => navigate(paths.job(jobId))}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-2.5 rounded-lg font-semibold text-xs transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="bg-[#1f4d36] hover:bg-[#183e2b] text-white px-8 py-2.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: OTP VERIFICATION */}
          {currentStep === 2 && (
            <div className="space-y-6 text-center py-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Step 1 — Identity Verification</h1>
                <p className="text-xs text-gray-400 mt-1">A 6-digit OTP was sent to {mobile || 'your mobile number'}</p>
              </div>

              <div className="flex justify-center gap-2.5 my-6">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const next = [...otpDigits];
                      next[idx] = e.target.value;
                      setOtpDigits(next);
                    }}
                    placeholder="0"
                    className="w-11 h-12 text-center text-lg font-bold rounded-lg border border-gray-200 bg-white text-gray-900 focus:border-[#1f4d36] focus:outline-none shadow-2xs"
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="w-full py-3 rounded-lg font-semibold text-xs bg-[#1f4d36] hover:bg-[#183e2b] text-white transition-all cursor-pointer shadow-xs"
              >
                Verify
              </button>
            </div>
          )}

          {/* STEP 3: PERSONAL INFORMATION */}
          {currentStep === 3 && (
            <div className="space-y-6 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Step 3 — Personal Information</h1>
                  <p className="text-xs text-gray-400 mt-0.5">Verify and complete your details.</p>
                </div>
                <span className="px-2.5 py-1 rounded bg-gray-100 text-xs font-bold text-gray-600">2/2</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Full Name (as on CNIC) *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#1f4d36] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Father Name *</label>
                  <input
                    type="text"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder="Enter father name"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#1f4d36] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => handleDobChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#1f4d36] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Age (calculated) *</label>
                  <input
                    type="text"
                    value={age}
                    placeholder="Auto calculated"
                    readOnly
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#1f4d36] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="" disabled hidden>Select Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Province/Domicile *</label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#1f4d36] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="" disabled hidden>Select Province</option>
                    <option>Punjab</option>
                    <option>Sindh</option>
                    <option>KPK</option>
                    <option>Balochistan</option>
                    <option>Gilgit Baltistan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">District *</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#1f4d36] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="" disabled hidden>Select District</option>
                    <option>Lahore</option>
                    <option>Rawalpindi</option>
                    <option>Multan</option>
                    <option>Faisalabad</option>
                    <option>Karachi</option>
                    <option>Peshawar</option>
                    <option>Quetta</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#1f4d36] focus:outline-none"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block font-semibold text-gray-700 mb-1">Residential Address *</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House No, Street, City"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#1f4d36] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Highest Education *</label>
                  <select
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#1f4d36] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="" disabled hidden>Select Highest Education</option>
                    <option>Matric</option>
                    <option>Intermediate</option>
                    <option>Bachelor</option>
                    <option>Master</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Trade Certificate *</label>
                  <select
                    value={tradeCertificate}
                    onChange={(e) => setTradeCertificate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#1f4d36] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="" disabled hidden>Select Trade Certificate</option>
                    <option>Carpenter Certificate</option>
                    <option>Fitter Certificate</option>
                    <option>Welder Certificate</option>
                    <option>Electrician Certificate</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Quota *</label>
                  <select
                    value={quota}
                    onChange={(e) => setQuota(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#1f4d36] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="" disabled hidden>Select Quota</option>
                    <option>Railway employee child</option>
                    <option>Open Merit</option>
                    <option>Minority</option>
                    <option>Disabled</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Age relaxation *</label>
                  <select
                    value={ageRelaxation}
                    onChange={(e) => setAgeRelaxation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#1f4d36] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="" disabled hidden>Select Age Relaxation</option>
                    <option>Railway employee child</option>
                    <option>Government Servant</option>
                    <option>None</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-2.5 rounded-lg font-semibold text-xs transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="bg-[#1f4d36] hover:bg-[#183e2b] text-white px-8 py-2.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SUPPORTING DOCUMENTS */}
          {currentStep === 4 && (
            <div className="space-y-6 pt-2">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Step 4 — Supporting documents</h1>
                <p className="text-xs text-gray-400 mt-1">Upload clear copies. Staff will verify the original details.</p>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'photo', label: 'One passport size photo', size: 'JPG, PNG or PDF · Maximum 5 MB' },
                  { key: 'domicile', label: 'Domicile certificate', size: 'JPG, PNG or PDF · Maximum 5 MB' },
                  { key: 'education', label: 'Education certificate', size: 'JPG, PNG or PDF · Maximum 5 MB' },
                  { key: 'character', label: 'Character certificate', size: 'JPG, PNG or PDF · Maximum 5 MB' },
                  { key: 'trade', label: 'Trade Certificate', size: 'JPG, PNG or PDF · Maximum 5 MB' },
                  { key: 'quota', label: 'Quota Proof', size: 'JPG, PNG or PDF · Maximum 5 MB' },
                  { key: 'ageRelaxation', label: 'Age relaxation proof', size: 'JPG, PNG or PDF · Maximum 5 MB' },
                ].map((doc) => {
                  const isUploaded = documents[doc.key];
                  return (
                    <div
                      key={doc.key}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                        isUploaded ? 'border-emerald-500 bg-emerald-50/40' : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isUploaded ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                          {isUploaded ? '✓' : '📄'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">{doc.label}</p>
                          <p className="text-[10px] text-gray-400">{doc.size}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleDoc(doc.key)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                          isUploaded
                            ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                            : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-100'
                        }`}
                      >
                        {isUploaded ? 'Replace' : 'Upload'}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-2.5 rounded-lg font-semibold text-xs transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="bg-[#1f4d36] hover:bg-[#183e2b] text-white px-8 py-2.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW APPLICATION */}
          {currentStep === 5 && (
            <div className="space-y-6 pt-2 text-xs">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Step 5 — Review your application</h1>
                <p className="text-xs text-gray-400 mt-1">Verify all details. Changes cannot be made after submission.</p>
              </div>

              <div className="space-y-4">
                {/* Identity Summary Card */}
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
                  <h3 className="font-bold text-gray-900 text-xs border-b border-gray-200 pb-1.5">Identity</h3>
                  <div className="grid grid-cols-2 gap-2 text-gray-600">
                    <p><span className="text-gray-400">CNIC:</span> <strong className="text-gray-900">{cnic || 'N/A'}</strong></p>
                    <p><span className="text-gray-400">Mobile:</span> <strong className="text-gray-900">{mobile || 'N/A'}</strong></p>
                  </div>
                </div>

                {/* Profile Summary Card */}
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
                  <h3 className="font-bold text-gray-900 text-xs border-b border-gray-200 pb-1.5">Profile</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-gray-600">
                    <p><span className="text-gray-400">Name:</span> <strong className="text-gray-900">{fullName || 'N/A'}</strong></p>
                    <p><span className="text-gray-400">Father:</span> <strong className="text-gray-900">{fatherName || 'N/A'}</strong></p>
                    <p><span className="text-gray-400">DOB:</span> <strong className="text-gray-900">{dob || 'N/A'}</strong></p>
                    <p><span className="text-gray-400">Gender:</span> <strong className="text-gray-900">{gender || 'N/A'}</strong></p>
                    <p><span className="text-gray-400">Province:</span> <strong className="text-gray-900">{province || 'N/A'}</strong></p>
                    <p><span className="text-gray-400">District:</span> <strong className="text-gray-900">{district || 'N/A'}</strong></p>
                    <p><span className="text-gray-400">Education:</span> <strong className="text-gray-900">{education || 'N/A'}</strong></p>
                    <p><span className="text-gray-400">Trade:</span> <strong className="text-gray-900">{tradeCertificate || 'N/A'}</strong></p>
                    <p><span className="text-gray-400">Quota:</span> <strong className="text-gray-900">{quota || 'N/A'}</strong></p>
                  </div>
                </div>

                {/* Disclaimer Alert */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] leading-relaxed">
                  <strong>Disclaimer:</strong> By submitting, you confirm all information is true. False information results in disqualification.
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-2.5 rounded-lg font-semibold text-xs transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(6)}
                  className="bg-[#1f4d36] hover:bg-[#183e2b] text-white px-8 py-2.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Submit
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: APPLICATION SUBMITTED! */}
          {currentStep === 6 && (
            <div className="space-y-6 text-center py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 mx-auto flex items-center justify-center text-3xl font-bold">
                ✓
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Application Submitted!</h1>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mt-2 leading-relaxed">
                  Your application for {jobTitle} is now awaiting under review. We will verify on your registered mobile number.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate(paths.applications)}
                className="w-full max-w-xs py-3 rounded-lg font-semibold text-xs bg-[#1f4d36] hover:bg-[#183e2b] text-white transition-all cursor-pointer shadow-xs"
              >
                Go To Dashboard
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
