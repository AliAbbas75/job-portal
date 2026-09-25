import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { StaffAuthProvider } from '../context/StaffAuthProvider';
import StaffLoginPage from '../pages/admin/StaffLoginPage';
import { paths } from './paths';
import { RequireStaff } from './RequireStaff';

function renderAt(path, roles) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <StaffAuthProvider>
        <Routes>
          <Route path={paths.adminLogin} element={<StaffLoginPage />} />
          <Route element={<RequireStaff roles={roles} />}>
            <Route path={paths.admin} element={<p>Staff home</p>} />
          </Route>
        </Routes>
      </StaffAuthProvider>
    </MemoryRouter>,
  );
}

async function logIn(email, password = 'demo-password') {
  await userEvent.type(screen.getByLabelText(/Work email/), email);
  await userEvent.type(screen.getByLabelText(/Password/), password);
  await userEvent.click(screen.getByRole('button', { name: 'Log in' }));
}

describe('staff login and RequireStaff', () => {
  beforeEach(() => sessionStorage.clear());

  it('sends signed-out visitors to the staff login, then back to the admin page', async () => {
    renderAt(paths.admin);
    expect(await screen.findByRole('heading', { name: 'Staff login' })).toBeInTheDocument();
    await logIn('approver@example.com');
    expect(await screen.findByText('Staff home')).toBeInTheDocument();
  });

  it('shows the error for a wrong password', async () => {
    renderAt(paths.adminLogin);
    await logIn('admin@example.com', 'wrong');
    expect(await screen.findByText('Email or password is incorrect.')).toBeInTheDocument();
  });

  it('blocks staff without the required role', async () => {
    renderAt(paths.admin, ['admin']);
    await screen.findByRole('heading', { name: 'Staff login' });
    await logIn('creator@example.com');
    expect(await screen.findByRole('heading', { name: 'No access' })).toBeInTheDocument();
  });
});
