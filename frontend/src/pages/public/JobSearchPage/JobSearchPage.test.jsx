import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../../context/AuthProvider';
import JobSearchPage from '.';

function renderPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <JobSearchPage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('JobSearchPage', () => {
  it('lists open jobs from the API and hides closed ones', async () => {
    renderPage();
    expect(
      await screen.findByRole('link', { name: 'Assistant Station Master' }),
    ).toBeInTheDocument();
    expect(screen.getByText('12 jobs')).toBeInTheDocument();
    expect(screen.queryByText('Junior Clerk')).not.toBeInTheDocument();
  });

  it('filters by keyword', async () => {
    renderPage();
    await screen.findByText('12 jobs');
    await userEvent.type(screen.getByRole('searchbox'), 'nurse{enter}');
    expect(await screen.findByText('1 job')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Staff Nurse' })).toBeInTheDocument();
  });

  it('filters by department', async () => {
    renderPage();
    await screen.findByText('12 jobs');
    await userEvent.click(screen.getByRole('combobox', { name: 'Department' }));
    await userEvent.click(screen.getByRole('option', { name: 'Medical Services' }));
    expect(await screen.findByText('2 jobs')).toBeInTheDocument();
  });

  it('pages through results', async () => {
    renderPage();
    await screen.findByText('1–10 of 12');
    expect(screen.getAllByRole('link', { name: 'Apply now' })).toHaveLength(10);
    await userEvent.click(screen.getByRole('button', { name: '2' }));
    expect(await screen.findByText('11–12 of 12')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Apply now' })).toHaveLength(2);
  });

  it('filters by category', async () => {
    renderPage();
    await screen.findByText('12 jobs');
    await userEvent.click(screen.getByRole('combobox', { name: 'Category' }));
    await userEvent.click(screen.getByRole('option', { name: 'Medical' }));
    expect(await screen.findByText('2 jobs')).toBeInTheDocument();
  });
});
