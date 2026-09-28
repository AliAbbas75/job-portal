import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../../../context/AuthProvider';
import JobDetailsPage from '.';

describe('JobDetailsPage', () => {
  it('shows the gender rule and eligibility criteria', async () => {
    render(
      <MemoryRouter initialEntries={['/jobs/j-110']}>
        <AuthProvider>
          <Routes>
            <Route path="/jobs/:jobId" element={<JobDetailsPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );
    expect(
      await screen.findByRole('heading', { name: 'Eligibility criteria' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Physically fit')).toBeInTheDocument();
    expect(screen.getByText('Male')).toBeInTheDocument();
    // No advertisement file in demo data, so no download button.
    expect(screen.queryByRole('link', { name: 'Click here' })).not.toBeInTheDocument();
  });
});
