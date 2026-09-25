import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from '../../../context/AuthProvider';
import HomePage from '.';

function Location() {
  const location = useLocation();
  return <p data-testid="location">{location.pathname + location.search}</p>;
}

function renderPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<Location />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('HomePage', () => {
  it('shows recent jobs and job counts by category and scale', async () => {
    renderPage();
    expect(await screen.findByRole('heading', { name: 'Recent jobs' })).toBeInTheDocument();
    const categories = await screen.findByRole('region', { name: 'Jobs by category' });
    expect(
      within(categories).getByRole('link', { name: /Engineering\s*3 jobs available/ }),
    ).toHaveAttribute('href', '/jobs?category=engineering');
    const scales = screen.getByRole('region', { name: 'Jobs by BPS scale' });
    expect(within(scales).getByRole('link', { name: /BPS-17/ })).toHaveAttribute(
      'href',
      '/jobs?scale=17',
    );
  });

  it('sends a search to the job list', async () => {
    renderPage();
    await userEvent.type(screen.getByRole('searchbox'), 'nurse{enter}');
    expect(await screen.findByTestId('location')).toHaveTextContent('/jobs?q=nurse');
  });

  it('switches FAQ topics', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('tab', { name: 'Account and login' }));
    expect(screen.getByRole('button', { name: /Do I need a password/ })).toBeInTheDocument();
  });
});
