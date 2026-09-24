/** Application statuses in order (master flow §4.9). `rejected` can follow any step. */
export const STATUS_FLOW = [
  'submitted',
  'under_review',
  'shortlisted',
  'admit_card_issued',
  'test_interview',
  'result',
  'merit_list',
  'document_verification',
  'medical',
  'offer',
];

export const REJECTED = 'rejected';
