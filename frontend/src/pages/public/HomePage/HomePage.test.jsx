import { render, screen } from '@testing-library/react';
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
  it('shows the most recent jobs', async () => {
    renderPage();
    expect(await screen.findByRole('heading', { name: 'Recent jobs' })).toBeInTheDocument();
    expect(await screen.findAllByRole('link', { name: 'Apply now' })).toHaveLength(5);
  });

  it('sends a search to the job list', async () => {
    renderPage();
    await userEvent.type(screen.getByRole('searchbox'), 'nurse{enter}');
    expect(await screen.findByTestId('location')).toHaveTextContent('/jobs?q=nurse');
  });
});
