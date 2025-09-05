import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
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

const SelectContext = createContext<SelectContextType>(null!);

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

const SelectTrigger: React.FC<{ className?: string }> = ({ className }) => {
  const { open, setOpen, value, placeholder, options } = useContext(SelectContext);
  const label = value ? options[value] : placeholder;
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        'px-3 py-1 rounded-full border bg-white/70 backdrop-blur flex items-center gap-2 text-sm',
        className
      )}
    >
      <span>{label || 'Select'}</span>
      <ChevronDown className="w-4 h-4" />
    </button>
  );
};

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

  if (!open) return null;
  return (
    <div
      ref={ref}
      className={cn(
        'absolute z-20 mt-1 min-w-full rounded-md border bg-white shadow',
        className
      )}
    >
      {children}
    </div>
  );
};

const SelectItem: React.FC<{ value: string; children: React.ReactNode; className?: string }> = ({ value, children, className }) => {
  const { onChange, setOpen, register } = useContext(SelectContext);
  useEffect(() => {
    register(value, String(children));
  }, [value, children, register]);
  return (
    <div
      onClick={() => {
        onChange(value);
        setOpen(false);
      }}
      className={cn('px-3 py-1 text-sm hover:bg-gray-100 cursor-pointer', className)}
    >
      {children}
    </div>
  );
};

Select.Trigger = SelectTrigger;
Select.Content = SelectContent;
Select.Item = SelectItem;

export default Select;
