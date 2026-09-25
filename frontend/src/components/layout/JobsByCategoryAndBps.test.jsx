import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { JobsByCategoryAndBps } from './JobsByCategoryAndBps';

describe('JobsByCategoryAndBps', () => {
  it('renders Jobs By Category heading and all category items', () => {
    render(
      <BrowserRouter>
        <JobsByCategoryAndBps />
      </BrowserRouter>,
    );

    expect(screen.getByRole('heading', { name: /Jobs By Category/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Jobs By BPS/i })).toBeInTheDocument();

    expect(screen.getByText('Carpenter')).toBeInTheDocument();
    expect(screen.getByText('Gateman')).toBeInTheDocument();
    expect(screen.getByText('Welder')).toBeInTheDocument();
    expect(screen.getByText('BPS - 14')).toBeInTheDocument();
    expect(screen.getByText('BPS - 5')).toBeInTheDocument();
  });
});
