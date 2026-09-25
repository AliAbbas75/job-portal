// Resume upload + parse and PDF export for mock mode. The parse result is a fixed example with
// the same shape the backend returns (backend/app/services/resume_parser_service.py).
import { uploadDocument } from './documentsMock';
import { fail, respond } from './store';

const RESUME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export async function uploadResume(file) {
  if (!RESUME_TYPES.includes(file.type)) return fail('file_type_not_allowed');
  const doc = await uploadDocument('resume', {
    ...file,
    type: 'application/pdf',
    name: file.name,
    size: file.size,
  });
  // A file named like "scan..." acts like an unreadable scan, to try the builder path.
  if (/scan/i.test(file.name)) {
    return respond({
      documentId: doc.id,
      parsed: false,
      lowConfidence: 0.6,
      sections: emptySections(),
    });
  }
  return respond({
    documentId: doc.id,
    parsed: true,
    lowConfidence: 0.6,
    sections: {
      personal: {
        fullName: { value: 'Demo Candidate', confidence: 0.6 },
        fatherName: { value: 'Demo Father', confidence: 0.85 },
        dob: { value: '1996-01-15', confidence: 0.85 },
      },
      contact: {
        email: { value: 'demo@example.com', confidence: 0.95 },
        currentAddress: { value: 'House 1, Street 1, Lahore', confidence: 0.7 },
      },
      statementOfPurpose: {
        value: 'Civil engineer seeking a role in railway infrastructure.',
        confidence: 0.6,
      },
      education: [
        {
          level: 'bachelor16',
          discipline: 'Civil Engineering',
          institution: 'University of Engineering and Technology',
          year: 2018,
          marksPercent: 78,
          confidence: 0.88,
        },
        {
          level: 'intermediate',
          discipline: 'Pre-Engineering',
          institution: 'Punjab Board',
          year: 2014,
          marksPercent: 82,
          confidence: 0.88,
        },
      ],
      experience: [
        {
          designation: 'Site Engineer',
          organization: 'Punjab Highways Department',
          startDate: '2019-01-01',
          endDate: null,
          current: true,
          confidence: 0.85,
        },
        {
          designation: 'Trainee Engineer',
          organization: '',
          startDate: '2018-03-01',
          endDate: '2018-12-01',
          current: false,
          confidence: 0.55,
        },
      ],
      skills: ['AutoCAD', 'Primavera', 'Surveying'],
      registrations: [{ body: 'PEC', registrationNo: 'CIVIL/12345', confidence: 0.75 }],
      publications: [
        { title: 'Ballast behaviour under heavy axle loads', year: 2021, confidence: 0.5 },
      ],
      references: [
        {
          name: 'Dr. Demo Referee',
          designation: 'Professor',
          organization: 'UET Lahore',
          email: 'referee@example.com',
          phone: null,
          confidence: 0.5,
        },
      ],
    },
  });
}

function emptySections() {
  return {
    personal: {},
    contact: {},
    education: [],
    experience: [],
    skills: [],
    registrations: [],
    publications: [],
    references: [],
  };
}

/** Mock mode has no PDF generator. */
export function downloadResumePdf() {
  return respond(null);
}
