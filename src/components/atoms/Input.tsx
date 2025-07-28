import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`
          w-full px-3 py-2 border rounded-xl shadow-sm outline-none 
          text-sm transition
          bg-white dark:bg-gray-800 
          border-gray-300 dark:border-gray-600
          focus:ring-2 focus:ring-green-500
          ${error ? "border-red-500" : ""}
          ${className || ""}
        `}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};
