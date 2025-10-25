// Tailwind classnames helper: filter falsy and join
export function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}
