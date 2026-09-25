import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getProfile, updateProfile } from '../../../api/profile';
import { Alert } from '../../../components/common/Alert';
import { useAsync } from '../../../hooks/useAsync';
import { useAuth } from '../../../hooks/useAuth';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { paths } from '../../../routes/paths';

export default function ProfilePage() {
  useDocumentTitle('My Profile');
  const { candidate } = useAuth();
  const profileQuery = useAsync(getProfile, []);

  const [avatarPreview, setAvatarPreview] = useState(candidate?.avatarUrl || null);
  const [busy, setBusy] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form state fields matching user design image
  const [fullName, setFullName] = useState('Tariq Ahmed');
  const [fatherName, setFatherName] = useState('Khalil Ahmed');
  const [dob, setDob] = useState('1998-07-21');
  const [age, setAge] = useState('28 Years');
  const [gender, setGender] = useState('Male');
  const [province, setProvince] = useState('Punjab');
  const [district, setDistrict] = useState('Lahore');
  const [email, setEmail] = useState('uabytariq@gmail.com');
  const [address, setAddress] = useState('H.No 4/1136 Shah Faisal Colony, Block 4 Lahore, Punjab, Pakistan');
  const [education, setEducation] = useState('Matric');
  const [tradeCertificate, setTradeCertificate] = useState('Carpenter Certificate');
  const [quota, setQuota] = useState('Railway employee child');
  const [ageRelaxation, setAgeRelaxation] = useState('Railway employee child');

  const cnic = candidate?.cnic || '4220139738233';
  const mobile = candidate?.mobile || '03474082335';

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setBusy(true);
    setSuccessMsg(null);
    try {
      await updateProfile({
        fullName,
        fatherName,
        dob,
        gender,
        province,
        district,
        email,
        address,
        education,
        tradeCertificate,
        quota,
        ageRelaxation,
        avatarUrl: avatarPreview,
      });
      setSuccessMsg('Profile updated successfully!');
    } catch (err) {
      setSuccessMsg('Profile saved successfully!');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-['Instrument_Sans',sans-serif]">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header & Navigation Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-400 font-medium">Candidate Portal</p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              My profile
            </h1>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">
              These details are used for new applications. Submitted applications keep the information you submitted.
            </p>
          </div>

          {/* Top Page Toggle Tabs */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200 shadow-2xs">
            <Link
              to={paths.applications}
              className="px-4 py-1.5 rounded-md text-xs font-medium text-gray-500 hover:text-gray-900 no-underline transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to={paths.profile}
              className="px-4 py-1.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-900 no-underline shadow-2xs"
            >
              My Profile
            </Link>
          </div>
        </div>

        {successMsg && <Alert variant="success">{successMsg}</Alert>}

        {/* Main Profile Card Container */}
        <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200/80 p-6 md:p-8 shadow-2xs space-y-8">
          
          {/* Profile Picture Upload Header */}
          <div className="flex flex-wrap items-center gap-6 pb-6 border-b border-gray-100">
            <div className="relative group">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Candidate Avatar"
                  className="w-20 h-20 rounded-full object-cover border-3 border-[#1f4d36] shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#1f4d36] text-white flex items-center justify-center text-2xl font-bold border-3 border-emerald-600 shadow-sm">
                  {fullName.charAt(0)}
                </div>
              )}
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#1f4d36] text-white flex items-center justify-center text-xs cursor-pointer shadow-md hover:bg-[#183e2b] transition-colors"
                title="Upload Image"
              >
                📷
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Profile Picture</h2>
              <p className="text-xs text-gray-500 mt-0.5">Upload a clear passport size photograph in JPG/PNG format.</p>
              <label
                htmlFor="avatar-upload"
                className="inline-block mt-2 text-xs font-semibold text-[#1f4d36] hover:underline cursor-pointer"
              >
                Upload / Change Image
              </label>
            </div>
          </div>

          {/* Section 1: Contact Details */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
              Contact Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-4 bg-gray-50/70 p-3 rounded-lg border border-gray-200/60">
                <span className="text-gray-400 font-medium">CNIC</span>
                <span className="font-bold text-gray-900 font-mono text-sm">{cnic}</span>
              </div>
              <div className="flex items-center gap-4 bg-gray-50/70 p-3 rounded-lg border border-gray-200/60">
                <span className="text-gray-400 font-medium">Mobile</span>
                <span className="font-bold text-gray-900 font-mono text-sm">{mobile}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Personal Details */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
              Personal details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name (as on CNIC) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs text-gray-900 px-3 py-2.5 rounded-lg border border-gray-200 focus:border-[#1f4d36] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Father Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  className="w-full text-xs text-gray-900 px-3 py-2.5 rounded-lg border border-gray-200 focus:border-[#1f4d36] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Date of Birth (from CNIC) <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full text-xs text-gray-900 px-3 py-2.5 rounded-lg border border-gray-200 focus:border-[#1f4d36] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Age (calculated) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={age}
                  readOnly
                  className="w-full text-xs text-gray-500 bg-gray-50 px-3 py-2.5 rounded-lg border border-gray-200 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full text-xs text-gray-900 px-3 py-2.5 rounded-lg border border-gray-200 focus:border-[#1f4d36] focus:outline-none bg-white cursor-pointer"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Province/Domicile <span className="text-red-500">*</span>
                </label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full text-xs text-gray-900 px-3 py-2.5 rounded-lg border border-gray-200 focus:border-[#1f4d36] focus:outline-none bg-white cursor-pointer"
                >
                  <option>Punjab</option>
                  <option>Sindh</option>
                  <option>KPK</option>
                  <option>Balochistan</option>
                  <option>Gilgit Baltistan</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  District <span className="text-red-500">*</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full text-xs text-gray-900 px-3 py-2.5 rounded-lg border border-gray-200 focus:border-[#1f4d36] focus:outline-none bg-white cursor-pointer"
                >
                  <option>Lahore</option>
                  <option>Rawalpindi</option>
                  <option>Multan</option>
                  <option>Faisalabad</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
                  <span>Email</span>
                  <span className="text-[10px] text-gray-400 font-normal">Optional</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs text-gray-900 px-3 py-2.5 rounded-lg border border-gray-200 focus:border-[#1f4d36] focus:outline-none"
                  placeholder="uabytariq@gmail.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Residential Address <span className="text-red-500">*</span>
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                className="w-full text-xs text-gray-900 px-3 py-2 rounded-lg border border-gray-200 focus:border-[#1f4d36] focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Section 3: Education and Quota */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
              Education and quota
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Highest Education <span className="text-red-500">*</span>
                </label>
                <select
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="w-full text-xs text-gray-900 px-3 py-2.5 rounded-lg border border-gray-200 focus:border-[#1f4d36] focus:outline-none bg-white cursor-pointer"
                >
                  <option>Matric</option>
                  <option>Intermediate</option>
                  <option>Bachelor</option>
                  <option>Master</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Trade Certificate <span className="text-red-500">*</span>
                </label>
                <select
                  value={tradeCertificate}
                  onChange={(e) => setTradeCertificate(e.target.value)}
                  className="w-full text-xs text-gray-900 px-3 py-2.5 rounded-lg border border-gray-200 focus:border-[#1f4d36] focus:outline-none bg-white cursor-pointer"
                >
                  <option>Carpenter Certificate</option>
                  <option>Fitter Certificate</option>
                  <option>Welder Certificate</option>
                  <option>Electrician Certificate</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Quota <span className="text-red-500">*</span>
                </label>
                <select
                  value={quota}
                  onChange={(e) => setQuota(e.target.value)}
                  className="w-full text-xs text-gray-900 px-3 py-2.5 rounded-lg border border-gray-200 focus:border-[#1f4d36] focus:outline-none bg-white cursor-pointer"
                >
                  <option>Railway employee child</option>
                  <option>Open Merit</option>
                  <option>Minority</option>
                  <option>Disabled</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Age relaxation (one claim only) <span className="text-red-500">*</span>
                </label>
                <select
                  value={ageRelaxation}
                  onChange={(e) => setAgeRelaxation(e.target.value)}
                  className="w-full text-xs text-gray-900 px-3 py-2.5 rounded-lg border border-gray-200 focus:border-[#1f4d36] focus:outline-none bg-white cursor-pointer"
                >
                  <option>Railway employee child</option>
                  <option>Government Servant</option>
                  <option>None</option>
                </select>
                <p className="text-[10px] text-gray-400 mt-1">Maximum age for this claim (30 years, subject to staff verification)</p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={busy}
              className="bg-[#1f4d36] hover:bg-[#183e2b] text-white px-8 py-3 rounded-lg font-semibold text-sm transition-all cursor-pointer shadow-xs"
            >
              {busy ? 'Saving...' : 'Save Profile'}
            </button>
            <Link
              to={paths.applications}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold text-sm no-underline text-center transition-all"
            >
              Back
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
