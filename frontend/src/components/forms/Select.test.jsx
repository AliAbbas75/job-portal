import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Select } from './Select';

const OPTIONS = ['Karachi', 'Lahore', 'Multan', 'Peshawar', 'Quetta', 'Sukkur'].map((city) => ({
  value: city.toLowerCase(),
  label: city,
}));

function Harness(props) {
  const [value, setValue] = useState('');
  return (
    <>
      <Select ariaLabel="City" value={value} onChange={setValue} options={OPTIONS} {...props} />
      <output>{value}</output>
    </>
  );
}

const combobox = () => screen.getByRole('combobox', { name: 'City' });

describe('Select', () => {
  it('opens a list limited to 4 visible rows that scrolls beyond that', async () => {
    render(<Harness placeholder="All cities" />);
    expect(screen.getByRole('listbox', { hidden: true })).not.toBeVisible();

    await userEvent.click(combobox());
    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeVisible();
    expect(listbox).toHaveClass('dropdown-list');
    expect(screen.getAllByRole('option')).toHaveLength(7);
    expect(combobox()).toHaveAttribute('aria-expanded', 'true');
  });

  it('selects with the mouse and closes', async () => {
    render(<Harness placeholder="All cities" />);
    await userEvent.click(combobox());
    await userEvent.click(screen.getByRole('option', { name: 'Multan' }));
    expect(screen.getByText('multan', { selector: 'output' })).toBeInTheDocument();
    expect(combobox()).toHaveAttribute('aria-expanded', 'false');
    expect(combobox()).toHaveTextContent('Multan');
  });

  it('supports arrow keys, Enter and Escape', async () => {
    render(<Harness placeholder="All cities" />);
    combobox().focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(combobox()).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(screen.getByText('lahore', { selector: 'output' })).toBeInTheDocument();

    await userEvent.keyboard('{ArrowDown}{Escape}');
    expect(combobox()).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('lahore', { selector: 'output' })).toBeInTheDocument();
  });

  it('jumps to an option by typing its first letters', async () => {
    render(<Harness placeholder="All cities" />);
    combobox().focus();
    await userEvent.keyboard('q');
    expect(screen.getByText('quetta', { selector: 'output' })).toBeInTheDocument();
  });

  it('marks the selected option for screen readers', async () => {
    render(<Harness placeholder="All cities" />);
    await userEvent.click(combobox());
    await userEvent.click(screen.getByRole('option', { name: 'Sukkur' }));
    await userEvent.click(combobox());
    expect(screen.getByRole('option', { name: 'Sukkur' })).toHaveAttribute('aria-selected', 'true');
  });
});
