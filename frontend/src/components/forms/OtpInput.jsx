import { useId, useRef } from 'react';

const LENGTH = 6;

/**
 * Six one-digit boxes for an SMS code. Typing moves forward, Backspace moves back, and pasting
 * or phone autofill ("one-time-code") fills every box. onChange(digits string).
 */
export function OtpInput({ value, onChange, label, error, autoFocus }) {
  const boxes = useRef([]);
  const errorId = useId();
  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] ?? '');

  function setFrom(index, text) {
    const clean = text.replace(/\D/g, '');
    if (!clean) return;
    const next = [...digits];
    for (let i = 0; i < clean.length && index + i < LENGTH; i += 1) next[index + i] = clean[i];
    onChange(next.join(''));
    boxes.current[Math.min(index + clean.length, LENGTH - 1)]?.focus();
  }

  function onKeyDown(index, event) {
    if (event.key === 'Backspace') {
      event.preventDefault();
      const next = [...digits];
      if (next[index]) next[index] = '';
      else if (index > 0) {
        next[index - 1] = '';
        boxes.current[index - 1]?.focus();
      }
      onChange(next.join(''));
    } else if (event.key === 'ArrowLeft' && index > 0) {
      boxes.current[index - 1]?.focus();
    } else if (event.key === 'ArrowRight' && index < LENGTH - 1) {
      boxes.current[index + 1]?.focus();
    }
  }

  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend className="mb-2 font-medium">{label}</legend>
      <div className="flex justify-center gap-2">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (boxes.current[index] = el)}
            className="size-12 rounded-md border border-heritage bg-white text-center text-xl font-bold"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={LENGTH}
            aria-label={`${label} ${index + 1}`}
            aria-invalid={Boolean(error) || undefined}
            value={digit}
            autoFocus={autoFocus && index === 0}
            onChange={(event) => setFrom(index, event.target.value)}
            onKeyDown={(event) => onKeyDown(index, event)}
            onFocus={(event) => event.target.select()}
          />
        ))}
      </div>
      {error && (
        <p id={errorId} className="mt-2 text-center text-sm font-medium text-ember">
          {error}
        </p>
      )}
    </fieldset>
  );
}
