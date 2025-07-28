import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle = () => {
  const { toggle, dark } = useTheme();

  return (
    <button onClick={toggle} className="p-2 rounded-full bg-white hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-800">
      {dark ? <SunIcon className="h-6 w-6 text-yellow-500" /> : <MoonIcon className="h-6 w-6 text-gray-700" />}
    </button>
  );
};