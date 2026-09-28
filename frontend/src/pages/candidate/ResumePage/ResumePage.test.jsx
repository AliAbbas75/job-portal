import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { requestOtp, verifyOtp } from '../../../api/auth';
import { resetDb } from '../../../api/mocks/store';
import { AuthProvider } from '../../../context/AuthProvider';
import { paths } from '../../../routes/paths';
import ResumePage from '.';

const CNIC = '00000-1234567-1';
const MOBILE = '03001234567';

async function signUp() {
  await requestOtp({ purpose: 'signup', cnic: CNIC, mobile: MOBILE, operator: 'jazz' });
  const session = await verifyOtp({ purpose: 'signup', cnic: CNIC, mobile: MOBILE, otp: '123456' });
  sessionStorage.setItem('pr-auth-token', session.token);
}

function renderPage() {
  render(
    <MemoryRouter initialEntries={[paths.resume]}>
      <AuthProvider>
        <Routes>
          <Route path={paths.resume} element={<ResumePage />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

const section = (heading) => screen.getByRole('heading', { name: heading }).closest('section');

async function upload(name) {
  const file = new File(['%PDF-1.4'], name, { type: 'application/pdf' });
  await userEvent.upload(await screen.findByLabelText('Choose PDF or Word file'), file);
}

describe('Resume page', () => {
  beforeEach(async () => {
    resetDb();
    sessionStorage.clear();
    await signUp();
  });

  it('adds a suggestion from the resume only after the candidate reviews it', async () => {
    renderPage();
    await upload('resume.pdf');

    expect(await screen.findByText('We read your resume')).toBeInTheDocument();
    const registrations = section('Professional registrations');
    expect(within(registrations).getByText('No registrations added yet.')).toBeInTheDocument();

    await userEvent.click(within(registrations).getByRole('button', { name: 'Review and add' }));
    expect(within(registrations).getByLabelText(/Registering body/)).toHaveValue('PEC');
    await userEvent.click(within(registrations).getByRole('button', { name: 'Save' }));

    expect(await within(registrations).findByText('PEC · CIVIL/12345')).toBeInTheDocument();
    expect(within(registrations).queryByText('From your resume')).not.toBeInTheDocument();
  });

  it('flags low-confidence suggestions', async () => {
    renderPage();
    await upload('resume.pdf');

    const publications = await screen.findByRole('heading', { name: 'Publications' });
    expect(within(publications.closest('section')).getByText('Please check')).toBeInTheDocument();
  });

  it('falls back to the builder when the file cannot be read', async () => {
    renderPage();
    await upload('scan.pdf');

    expect(await screen.findByText("We couldn't read this file")).toBeInTheDocument();
    expect(screen.queryByText('From your resume')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Statement of purpose' })).toBeInTheDocument();
  });

  it('saves skills typed into the builder', async () => {
    renderPage();
    const skills = (await screen.findByRole('heading', { name: 'Skills and licences' })).closest(
      'section',
    );

    await userEvent.type(within(skills).getByLabelText(/Add a skill/), 'HTV licence{Enter}');
    await userEvent.click(within(skills).getByRole('button', { name: 'Save' }));

    expect(await within(skills).findByText('Saved.')).toBeInTheDocument();
    expect(within(skills).getByText('HTV licence')).toBeInTheDocument();
  });
});
