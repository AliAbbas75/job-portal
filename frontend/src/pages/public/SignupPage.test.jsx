import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { resetDb } from '../../api/mocks/store';
import { AuthProvider } from '../../context/AuthProvider';
import SignupPage from './SignupPage';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/signup']}>
      <AuthProvider>
        <Routes>
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/profile" element={<p>Profile page</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

async function fillDetails() {
  await userEvent.type(screen.getByLabelText(/Candidate CNIC/), '0000012345671');
  await userEvent.click(screen.getByRole('combobox', { name: /Select Telecom Operator/ }));
  await userEvent.click(screen.getByRole('option', { name: 'Zong' }));
  await userEvent.type(screen.getByLabelText(/Mobile number/), '03001234567');
}

describe('SignupPage', () => {
  beforeEach(() => {
    resetDb();
    sessionStorage.clear();
  });

  it('keeps Register disabled until the form, network and CAPTCHA are done', async () => {
    renderPage();
    const register = screen.getByRole('button', { name: 'Register' });
    expect(register).toBeDisabled();
    await fillDetails();
    expect(register).toBeDisabled();
    await userEvent.click(screen.getByRole('checkbox', { name: /not a robot/ }));
    expect(register).toBeEnabled();
  }, 20000);

  it('signs up with the 6-digit code and shows the success screen', async () => {
    renderPage();
    await fillDetails();
    await userEvent.click(screen.getByRole('checkbox', { name: /not a robot/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    await userEvent.click(
      await screen.findByRole('textbox', { name: 'Digit 1 of the verification code' }),
    );
    await userEvent.paste('123456'); // the sixth digit verifies automatically

    expect(await screen.findByRole('heading', { name: 'Success!' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByText('Profile page')).toBeInTheDocument();
  }, 20000);
});
