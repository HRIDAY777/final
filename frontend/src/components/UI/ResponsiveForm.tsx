import React from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  options?: Array<{ value: string; label: string }>;
  rows?: number;
  className?: string;
}

/**
 * Responsive Form Field Component
 * Prevents iOS zoom with proper font sizing
 */
export const ResponsiveFormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  options,
  rows = 3,
  className = ''
}) => {
  const baseInputClasses = `
    w-full
    px-3 py-2 sm:px-4 sm:py-2.5 md:px-4 md:py-3
    text-base sm:text-base
    border rounded-lg sm:rounded-xl
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    transition-all duration-200
    ${error ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'}
  `;

  return (
    <div className={`space-y-1 sm:space-y-1.5 ${className}`}>
      <label
        htmlFor={name}
        className="block text-sm sm:text-base font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className={baseInputClasses}
        />
      ) : type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={baseInputClasses}
        >
          <option value="">Select {label}</option>
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={baseInputClasses}
        />
      )}

      {error && (
        <p className="text-xs sm:text-sm text-red-600 mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

interface ResponsiveFormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
  columns?: number;
}

/**
 * Responsive Form Container
 * Auto-adjusts grid columns based on screen size
 */
export const ResponsiveForm: React.FC<ResponsiveFormProps> = ({
  children,
  onSubmit,
  className = '',
  columns = 1
}) => {
  const gridClasses = columns === 1
    ? 'space-y-4 sm:space-y-5 md:space-y-6'
    : `grid grid-cols-1 sm:grid-cols-${Math.min(columns, 2)} lg:grid-cols-${columns} gap-4 sm:gap-5 md:gap-6`;

  return (
    <form onSubmit={onSubmit} className={`${gridClasses} ${className}`}>
      {children}
    </form>
  );
};

export default ResponsiveForm;

