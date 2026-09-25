import { useState } from 'react';

const ALL_FAQS = [
  {
    id: 'q1',
    col: 1,
    question: 'How Do I Register in Pakistan railways Public Recruitment Service ?',
    answer:
      'Only passed candidates of the BPS Grade 5 to 15 tests are eligible to register. To register, enter your CNIC number and the mobile number used during your test on the registration page and complete the verification process.',
  },
  {
    id: 'q2',
    col: 1,
    question:
      'How can I create an account on the Pakistan Railways Public Recruitment Service portal?',
    answer:
      'To create an account, visit the registration page, enter your valid CNIC without dashes, provide your mobile number for OTP verification, and set up your profile password.',
  },
  {
    id: 'q3',
    col: 1,
    question:
      'Can you guide me through the registration process for Pakistan Railways Public Recruitment Service?',
    answer:
      'Click on Create Account on the homepage header, enter your CNIC and test details, verify your identity via SMS OTP, and complete your candidate profile.',
  },
  {
    id: 'q4',
    col: 2,
    question: 'What is the procedure to sign up for Pakistan Railways Public Recruitment Service?',
    answer:
      'Navigate to the signup page, input your CNIC number, complete the SMS OTP verification step, and build your candidate profile to start applying for positions.',
  },
  {
    id: 'q5',
    col: 2,
    question: 'How do I enroll in the Pakistan Railways Public Recruitment Service system?',
    answer:
      'Enrollment requires entering your CNIC and registered test details. Follow the step-by-step verification wizard to establish your candidate account.',
  },
  {
    id: 'q6',
    col: 2,
    question: 'Steps to register for Pakistan Railways Public Recruitment Service online?',
    answer:
      '1. Visit the portal homepage. 2. Click Register. 3. Enter CNIC & Mobile Number. 4. Verify OTP. 5. Fill out mandatory profile sections.',
  },
];

export function FaqSection() {
  const [openId, setOpenId] = useState(null);

  const col1Questions = ALL_FAQS.filter((q) => q.col === 1);
  const col2Questions = ALL_FAQS.filter((q) => q.col === 2);

  const toggleQuestion = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="bg-gray-50 border-gray-100 border-t px-4 py-16 font-['Instrument_Sans',sans-serif]">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-gray-900 mb-10 text-center font-['Instrument_Sans',sans-serif] text-3xl font-bold tracking-tight md:text-4xl">
          FAQs
        </h2>

        <div className="faq-grid">
          <div className="flex flex-col gap-5">
            {col1Questions.map((q) => {
              const isOpen = openId === q.id;
              return (
                <div key={q.id} className="faq-card">
                  <button
                    type="button"
                    className="flex w-full cursor-pointer items-center justify-between gap-4 border-none bg-none p-0 text-left"
                    onClick={() => toggleQuestion(q.id)}
                    aria-expanded={isOpen}
                  >
                    <span className="text-gray-800 font-['Instrument_Sans',sans-serif] text-[15px] leading-snug font-semibold">
                      {q.question}
                    </span>
                    <span className="text-gray-500 flex h-6 w-6 flex-shrink-0 items-center justify-center text-lg font-normal">
                      {isOpen ? '✕' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="mt-1">
                      <div className="border-gray-200 my-3.5 border-t border-dashed" />
                      <p className="text-gray-600 m-0 font-['Instrument_Sans',sans-serif] text-sm leading-relaxed font-normal">
                        {q.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-5">
            {col2Questions.map((q) => {
              const isOpen = openId === q.id;
              return (
                <div key={q.id} className="faq-card">
                  <button
                    type="button"
                    className="flex w-full cursor-pointer items-center justify-between gap-4 border-none bg-none p-0 text-left"
                    onClick={() => toggleQuestion(q.id)}
                    aria-expanded={isOpen}
                  >
                    <span className="text-gray-800 font-['Instrument_Sans',sans-serif] text-[15px] leading-snug font-semibold">
                      {q.question}
                    </span>
                    <span className="text-gray-500 flex h-6 w-6 flex-shrink-0 items-center justify-center text-lg font-normal">
                      {isOpen ? '✕' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="mt-1">
                      <div className="border-gray-200 my-3.5 border-t border-dashed" />
                      <p className="text-gray-600 m-0 font-['Instrument_Sans',sans-serif] text-sm leading-relaxed font-normal">
                        {q.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
