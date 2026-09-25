import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { requestOtp, verifyOtp } from '../../../api/auth';
import { resetDb } from '../../../api/mocks/store';
import { AuthProvider } from '../../../context/AuthProvider';
import { paths } from '../../../routes/paths';
import ApplicationCheckPage from '.';

const CNIC = '00000-1234567-1';
const MOBILE = '03001234567';

async function signUp() {
  await requestOtp({ purpose: 'signup', cnic: CNIC, mobile: MOBILE, operator: 'jazz' });
  const session = await verifyOtp({ purpose: 'signup', cnic: CNIC, mobile: MOBILE, otp: '123456' });
  sessionStorage.setItem('pr-auth-token', session.token);
}

async function choose(label, option) {
  await userEvent.click(screen.getByRole('combobox', { name: label }));
  await userEvent.click(screen.getByRole('option', { name: option }));
}

const pdf = (name) => new File(['%PDF-1.4'], name, { type: 'application/pdf' });

describe('Apply wizard', () => {
  beforeEach(async () => {
    resetDb();
    sessionStorage.clear();
    await signUp();
  });

  it('goes from identity check to a submitted application', async () => {
    // Ticket Checker (j-103): matric, age 18-25, Sindh domicile, no minimum marks.
    render(
      <MemoryRouter initialEntries={[paths.applyCheck('j-103')]}>
        <AuthProvider>
          <Routes>
            <Route path={paths.applyCheck()} element={<ApplicationCheckPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    // 1. Identity: CNIC is prefilled; the mobile must be the registered one.
    expect(await screen.findByRole('heading', { name: /Step 1/ })).toBeInTheDocument();
    await choose(/Select Telecom Operator/, 'Jazz');
    await userEvent.type(screen.getByLabelText(/Mobile number/), MOBILE);
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    // 2. SMS code.
    await userEvent.click(
      await screen.findByRole('textbox', { name: 'Digit 1 of the verification code' }),
    );
    await userEvent.paste('123456');

    // 3. Profile (saved to the permanent profile).
    expect(await screen.findByRole('heading', { name: /Step 3/ })).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText(/Full Name/), 'Demo Applicant');
    await userEvent.type(screen.getByLabelText(/Father Name/), 'Demo Father');
    await userEvent.type(
      screen.getByLabelText(/Date of Birth/),
      `${new Date().getFullYear() - 22}-01-15`,
    );
    await choose(/Gender/, 'Male');
    await choose(/Province/, 'Sindh');
    await choose(/District/, 'Karachi');
    await userEvent.type(screen.getByLabelText(/Residential Address/), 'House 1, Karachi');
    await choose(/Highest Education/, 'Matric / SSC');
    await choose(/Trade Certificate/, 'None');
    await choose(/^Quota/, 'Open merit');
    await choose(/Age relaxation/, 'None');
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    // 4. Documents: the job's list (no claim proofs for open merit / no relaxation).
    expect(await screen.findByRole('heading', { name: /Step 4/ })).toBeInTheDocument();
    const inputs = document.querySelectorAll('input[type="file"]');
    expect(inputs).toHaveLength(5);
    for (const [index, input] of [...inputs].entries()) {
      await userEvent.upload(input, pdf(`doc-${index}.pdf`));
    }
    expect(await screen.findAllByText(/Uploaded/)).toHaveLength(5);
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    // 5. Review, then submit.
    expect(await screen.findByText("You meet this job's requirements.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    // 6. Confirmation with the application number.
    expect(
      await screen.findByRole('heading', { name: 'Application Submitted!' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Application reference: PR-/)).toBeInTheDocument();
  }, 60000);
});
