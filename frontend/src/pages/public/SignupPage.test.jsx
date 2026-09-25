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

describe('SignupPage', () => {
  beforeEach(() => {
    resetDb();
    sessionStorage.clear();
  });

  it('asks for the network and CAPTCHA before sending a code', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Send code' }));
    expect(screen.getByText('Select your mobile network.')).toBeInTheDocument();
    expect(screen.getByText('Please complete the CAPTCHA.')).toBeInTheDocument();
  });

  it('signs up with a 6-box code and shows the success screen', async () => {
    renderPage();
    await userEvent.type(screen.getByLabelText(/CNIC number/), '0000012345671');
    await userEvent.click(screen.getByRole('combobox', { name: /Mobile network/ }));
    await userEvent.click(screen.getByRole('option', { name: 'Zong' }));
    await userEvent.type(screen.getByLabelText(/Mobile number/), '03001234567');
    await userEvent.click(screen.getByRole('checkbox', { name: /not a robot/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Send code' }));

    const firstBox = await screen.findByRole('textbox', { name: 'Verification code 1' });
    await userEvent.click(firstBox);
    await userEvent.paste('123456');
    expect(screen.getByRole('textbox', { name: 'Verification code 6' })).toHaveValue('6');
    await userEvent.click(screen.getByRole('button', { name: 'Verify code' }));

    expect(await screen.findByRole('heading', { name: 'Success!' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByText('Profile page')).toBeInTheDocument();
  });
});
