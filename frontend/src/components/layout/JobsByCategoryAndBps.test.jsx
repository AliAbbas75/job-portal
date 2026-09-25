import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { JobsByCategoryAndBps } from './JobsByCategoryAndBps';

describe('JobsByCategoryAndBps', () => {
  it('shows live job counts linking to the filtered job list', async () => {
    render(
      <MemoryRouter>
        <JobsByCategoryAndBps />
      </MemoryRouter>,
    );

    const categories = await screen.findByRole('region', { name: 'Jobs By Category' });
    expect(
      within(categories).getByRole('link', { name: /Engineering\s*3 jobs available/ }),
    ).toHaveAttribute('href', '/jobs?category=engineering');
    const scales = screen.getByRole('region', { name: 'Jobs By BPS' });
    expect(within(scales).getByRole('link', { name: /BPS - 17/ })).toHaveAttribute(
      'href',
      '/jobs?scale=17',
    );
  });
});
