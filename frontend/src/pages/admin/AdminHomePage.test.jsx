import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';
import { staffLogin } from '../../api/adminAuth';
import { StaffAuthProvider } from '../../context/StaffAuthProvider';
import { paths } from '../../routes/paths';
import AdminHomePage from './AdminHomePage';

function EditPage() {
  const { jobId } = useParams();
  return <p>Editing {jobId}</p>;
}

async function renderPanel() {
  const session = await staffLogin({ email: 'admin@example.com', password: 'demo-password' });
  sessionStorage.setItem('pr-staff-token', session.token);
  return render(
    <MemoryRouter initialEntries={[paths.admin]}>
      <StaffAuthProvider>
        <Routes>
          <Route path={paths.admin} element={<AdminHomePage />} />
          <Route path={paths.adminEditJob()} element={<EditPage />} />
        </Routes>
      </StaffAuthProvider>
    </MemoryRouter>,
  );
}

describe('AdminHomePage (admin panel)', () => {
  beforeEach(() => sessionStorage.clear());

  it('shows real jobs and applicant totals', async () => {
    await renderPanel();
    expect(
      await screen.findByRole('link', { name: 'Assistant Station Master' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Employer - Sub Engineer/)).not.toBeInTheDocument(); // no demo rows
  });

  it('saves the quick create form as a draft and opens the full job form', async () => {
    await renderPanel();
    // The side-panel tab and the button above the job table both open the form.
    const [createButton] = await screen.findAllByRole('button', { name: /Create/ });
    await userEvent.click(createButton);
    await userEvent.type(screen.getByPlaceholderText(/Sub Engineer Electrical/), 'Welder');
    await userEvent.click(screen.getByRole('button', { name: 'Save Requisition & Continue' }));
    expect(await screen.findByText(/Requisition saved as a draft/)).toBeInTheDocument();
    expect(await screen.findByText(/Editing j-/, {}, { timeout: 3000 })).toBeInTheDocument();
  }, 20000);

  it('changes the password only with the current one', async () => {
    await renderPanel();
    await userEvent.click(screen.getByRole('button', { name: 'Admin Profile Menu' }));
    await userEvent.click(screen.getByRole('button', { name: /Reset Password/ }));
    await userEvent.type(screen.getByPlaceholderText('Enter current password'), 'wrong');
    await userEvent.type(screen.getByPlaceholderText('Enter new password'), 'a-new-long-password');
    await userEvent.type(
      screen.getByPlaceholderText('Confirm new password'),
      'a-new-long-password',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Update Password' }));
    expect(await screen.findByText('Email or password is incorrect.')).toBeInTheDocument();
  }, 20000);
});
