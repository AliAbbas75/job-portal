import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FaqSection } from './FaqSection';

describe('FaqSection', () => {
  it('switches topics and opens one answer at a time', async () => {
    render(<FaqSection />);
    await userEvent.click(screen.getByRole('tab', { name: 'Account and login' }));
    const first = screen.getByRole('button', { name: /How do I create an account/ });
    expect(first).toHaveAttribute('aria-expanded', 'true');
    const password = screen.getByRole('button', { name: /Do I need a password/ });
    await userEvent.click(password);
    expect(password).toHaveAttribute('aria-expanded', 'true');
    expect(first).toHaveAttribute('aria-expanded', 'false');
  });
});
