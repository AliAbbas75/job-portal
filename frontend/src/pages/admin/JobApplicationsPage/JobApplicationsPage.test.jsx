import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { staffLogin } from '../../../api/adminAuth';
import { StaffAuthProvider } from '../../../context/StaffAuthProvider';
import { paths } from '../../../routes/paths';
import JobApplicationsPage from '.';

async function renderAs(email) {
  const session = await staffLogin({ email, password: 'demo-password' });
  sessionStorage.setItem('pr-staff-token', session.token);
  return render(
    <MemoryRouter initialEntries={[paths.adminJobApplications('j-101')]}>
      <StaffAuthProvider>
        <Routes>
          <Route path={paths.adminJobApplications()} element={<JobApplicationsPage />} />
        </Routes>
      </StaffAuthProvider>
    </MemoryRouter>,
  );
}

describe('JobApplicationsPage', () => {
  beforeEach(() => sessionStorage.clear());

  it('lets an admin move an application to a later status', async () => {
    await renderAs('admin@example.com');
    const row = (await screen.findByText('Demo Candidate One')).closest('li');
    await userEvent.click(within(row).getByRole('button', { name: 'Change status' }));
    await userEvent.click(within(row).getByRole('combobox', { name: 'New status' }));
    await userEvent.click(screen.getByRole('option', { name: 'Shortlisted' }));
    await userEvent.click(within(row).getByRole('button', { name: 'Save' }));
    expect(await within(row).findByText('Shortlisted')).toBeInTheDocument();
  });

  it('shows other staff the list without status changes', async () => {
    await renderAs('approver@example.com');
    await screen.findByText('Demo Candidate Two');
    expect(screen.queryByRole('button', { name: 'Change status' })).not.toBeInTheDocument();
  });
});
