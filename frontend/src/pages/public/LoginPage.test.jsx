import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from '../../context/AuthProvider';
import LoginPage from './LoginPage';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  it('renders the brand headline, eyebrow, and candidate feature pill', () => {
    renderPage();

    expect(screen.getAllByText(/PAKISTAN RAILWAYS/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/PUBLIC RECRUITMENT SERVICES/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Your next/i);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/opportunity/i);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/starts here/i);
    expect(
      screen.getByText(/Access your candidate profile, applications and job updates/i)
    ).toBeInTheDocument();
  });

  it('renders the login form elements and all active Pakistani operators', async () => {
    const user = userEvent.setup();
    renderPage();

    // Form inputs and controls
    expect(screen.getByPlaceholderText(/Enter 13 digit CNIC/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/03xx xxxxxx/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /I'm not a robot/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Remember me/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Forgot Password\?/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Create Account/i })).toBeInTheDocument();

    // Open operator dropdown and verify all Pakistani operators are present
    const operatorCombobox = screen.getByRole('combobox');
    await user.click(operatorCombobox);

    expect(screen.getByRole('option', { name: 'Jazz' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Telenor' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Zong' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Ufone' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'SCOM' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Onic' })).toBeInTheDocument();
  });
});
