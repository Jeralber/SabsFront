import { clsx } from 'clsx';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export const Button = ({ children, variant = 'primary', className, ...props }: ButtonProps) => {
  return (
    <button
      {...props}
      className={clsx(
        'px-4 py-2 rounded-xl font-semibold transition',
        variant === 'primary' && 'bg-green-600 text-white hover:bg-green-700',
        variant === 'secondary' && 'bg-gray-200 text-black dark:bg-gray-700 dark:text-white',
        className
      )}
    >
      {children}
    </button>
  );
};