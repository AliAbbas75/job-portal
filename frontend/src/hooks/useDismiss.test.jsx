import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, useState } from 'react';
import { useDismiss } from './useDismiss';

function Menu() {
  const [open, setOpen] = useState(true);
  const ref = useRef(null);
  useDismiss(ref, open, () => setOpen(false));
  return (
    <div>
      <button type="button">Outside</button>
      {open && (
        <div ref={ref}>
          <button type="button">Inside</button>
        </div>
      )}
    </div>
  );
}

describe('useDismiss', () => {
  it('stays open on a click inside', async () => {
    render(<Menu />);
    await userEvent.click(screen.getByRole('button', { name: 'Inside' }));
    expect(screen.getByRole('button', { name: 'Inside' })).toBeInTheDocument();
  });

  it('closes on a click outside', async () => {
    render(<Menu />);
    await userEvent.click(screen.getByRole('button', { name: 'Outside' }));
    expect(screen.queryByRole('button', { name: 'Inside' })).not.toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    render(<Menu />);
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('button', { name: 'Inside' })).not.toBeInTheDocument();
  });
});
