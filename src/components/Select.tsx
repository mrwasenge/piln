// Custom Select component
// - Context-driven open/value state
// - Pill-style trigger, popover list, keyboard + a11y support
// - Closes on outside click and Escape
import React, { createContext, useContext, useEffect, useRef, useState, KeyboardEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectContextType {
  open: boolean;
  setOpen: (o: boolean) => void;
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  options: Record<string, string>;
  register: (v: string, l: string) => void;
}

// Internal context for Select composition API
const SelectContext = createContext<SelectContextType>(null!);

// Root Select component provides state to Trigger/Content/Item
export const Select: React.FC<{ value?: string; onChange: (v: string) => void; placeholder?: string; children: React.ReactNode; className?: string; }> & {
  Trigger: typeof SelectTrigger;
  Content: typeof SelectContent;
  Item: typeof SelectItem;
} = ({ value, onChange, placeholder, children, className }) => {
  const [open, setOpen] = useState(false);
  const optionsRef = useRef<Record<string, string>>({});
  const register = (v: string, l: string) => {
    optionsRef.current[v] = l;
  };
  const ctx: SelectContextType = {
    open,
    setOpen,
    value,
    onChange,
    placeholder,
    options: optionsRef.current,
    register,
  };

  return (
    <SelectContext.Provider value={ctx}>
      <div className={cn('relative', className)}>{children}</div>
    </SelectContext.Provider>
  );
};

// Clickable pill that toggles the dropdown; supports Enter/Space/Escape
const SelectTrigger: React.FC<{ className?: string }> = ({ className }) => {
  const { open, setOpen, value, placeholder, options } = useContext(SelectContext);
  const label = value ? options[value] : placeholder;
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(!open);
    }
    if (e.key === 'Escape') {
      setOpen(false);
    }
  };
  return (
    <button
      type="button"
      aria-haspopup="listbox"
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      onKeyDown={onKeyDown}
      className={cn(
        'pill-trigger inline-flex items-center gap-2',
        className
      )}
    >
      <span>{label || 'Select'}</span>
      <ChevronDown className={cn('w-4 h-4 transition-transform', open && 'rotate-180')} />
    </button>
  );
};

// Popover list that closes on outside click or Escape
const SelectContent: React.FC<{ className?: string }> = ({ className, children }) => {
  const { open, setOpen } = useContext(SelectContext);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [setOpen]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey as any);
    return () => document.removeEventListener('keydown', onKey as any);
  }, [setOpen]);

  if (!open) return null;
  return (
    <div
      ref={ref}
      className={cn(
        'absolute z-20 mt-1 min-w-full rounded-md border shadow-elev bg-popover',
        className
      )}
      role="listbox"
    >
      <div className="py-1">
        {children}
      </div>
    </div>
  );
};

// Option row: registers label and commits value on click/Enter
const SelectItem: React.FC<{ value: string; children: React.ReactNode; className?: string }> = ({ value, children, className }) => {
  const { onChange, setOpen, register, value: selected } = useContext(SelectContext);
  useEffect(() => {
    register(value, String(children));
  }, [value, children, register]);
  return (
    <div
      role="option"
      aria-selected={selected === value}
      tabIndex={0}
      onClick={() => {
        onChange(value);
        setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onChange(value);
          setOpen(false);
        }
        if (e.key === 'Escape') setOpen(false);
      }}
      className={cn('select-item', selected === value && 'bg-accent/40', className)}
    >
      {children}
    </div>
  );
};

Select.Trigger = SelectTrigger;
Select.Content = SelectContent;
Select.Item = SelectItem;

export default Select;
