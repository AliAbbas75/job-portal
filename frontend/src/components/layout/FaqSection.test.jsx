import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FaqSection } from './FaqSection';

describe('FaqSection', () => {
  it('has answers closed by default and opens one answer at a time', async () => {
    render(<FaqSection />);
    const first = screen.getByRole('button', { name: /How Do I Register/i });
    expect(first).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(first);
    expect(first).toHaveAttribute('aria-expanded', 'true');

    const second = screen.getByRole('button', { name: /Do I need a password/i });
    expect(second).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(second);
    expect(second).toHaveAttribute('aria-expanded', 'true');
    expect(first).toHaveAttribute('aria-expanded', 'false');
  });
});
