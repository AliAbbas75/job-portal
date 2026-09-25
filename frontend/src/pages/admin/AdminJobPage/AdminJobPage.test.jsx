import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { staffLogin } from '../../../api/adminAuth';
import { StaffAuthProvider } from '../../../context/StaffAuthProvider';
import { paths } from '../../../routes/paths';
import AdminJobPage from '.';

async function renderAs(email, jobId) {
  const session = await staffLogin({ email, password: 'demo-password' });
  sessionStorage.setItem('pr-staff-token', session.token);
  return render(
    <MemoryRouter initialEntries={[paths.adminJob(jobId)]}>
      <StaffAuthProvider>
        <Routes>
          <Route path={paths.adminJob()} element={<AdminJobPage />} />
        </Routes>
      </StaffAuthProvider>
    </MemoryRouter>,
  );
}

describe('AdminJobPage', () => {
  beforeEach(() => sessionStorage.clear());

  it('lets an approver return a job only with comments', async () => {
    await renderAs('approver@example.com', 'j-201');
    expect(await screen.findByText('Waiting for approval')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Return for changes' }));
    expect(screen.getByText('Add comments to return or reject the job.')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/Comments/), 'Check the age limit.');
    await userEvent.click(screen.getByRole('button', { name: 'Return for changes' }));
    expect(await screen.findByText('Returned')).toBeInTheDocument();
    expect(screen.getByText('Check the age limit.')).toBeInTheDocument();
  });

  it('lets a job creator submit a draft, without approval buttons', async () => {
    await renderAs('creator@example.com', 'j-202');
    await userEvent.click(await screen.findByRole('button', { name: 'Submit for approval' }));
    expect(await screen.findByText('Waiting for approval')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument();
  });
});
