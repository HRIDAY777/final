import React from 'react';
import { useResponsive } from '../../hooks/useResponsive';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'time' | 'datetime-local';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  className?: string;
}

interface ResponsiveFormProps {
  fields: FormField[];
  onSubmit: (data: any) => void;
  submitText?: string;
  loading?: boolean;
  className?: string;
  layout?: 'vertical' | 'horizontal' | 'grid';
  gridCols?: 1 | 2 | 3;
}

const ResponsiveForm: React.FC<ResponsiveFormProps> = ({
  fields,
  onSubmit,
  submitText = 'Submit',
  loading = false,
  className = '',
  layout = 'vertical',
  gridCols = 1,
}) => {
  const { isMobile, isTablet } = useResponsive();
  const [formData, setFormData] = React.useState<Record<string, any>>({});

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderField = (field: FormField) => {
    const commonProps = {
      id: field.name,
      name: field.name,
      value: formData[field.name] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        handleInputChange(field.name, e.target.value);
      },
      required: field.required,
      className: `input-responsive ${field.className || ''}`,
      ...field.validation,
    };

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            placeholder={field.placeholder}
            rows={4}
            className={`input-responsive resize-none ${field.className || ''}`}
          />
        );

      case 'select':
        return (
          <select {...commonProps} className={`select-responsive ${field.className || ''}`}>
            <option value="">{field.placeholder || 'Select an option'}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={field.name}
              name={field.name}
              checked={formData[field.name] || false}
              onChange={(e) => handleInputChange(field.name, e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor={field.name} className="text-sm font-medium text-gray-700">
              {field.label}
            </label>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map(option => (
              <div key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${field.name}-${option.value}`}
                  name={field.name}
                  value={option.value}
                  checked={formData[field.name] === option.value}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor={`${field.name}-${option.value}`} className="text-sm font-medium text-gray-700">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <input
            {...commonProps}
            type={field.type}
            placeholder={field.placeholder}
          />
        );
    }
  };

  const getLayoutClasses = () => {
    if (layout === 'grid') {
      const cols = isMobile ? 1 : isTablet ? Math.min(gridCols, 2) : gridCols;
      return `grid grid-cols-1 ${cols === 2 ? 'sm:grid-cols-2' : ''} ${cols === 3 ? 'lg:grid-cols-3' : ''} gap-4 sm:gap-6`;
    }

    if (layout === 'horizontal' && !isMobile) {
      return 'space-y-4 sm:space-y-6';
    }

    return 'space-y-4 sm:space-y-6';
  };

  const renderFieldGroup = (field: FormField) => {
    if (field.type === 'checkbox' || field.type === 'radio') {
      return (
        <div key={field.name} className="space-y-2">
          {renderField(field)}
        </div>
      );
    }

    if (layout === 'horizontal' && !isMobile) {
      return (
        <div key={field.name} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <label htmlFor={field.name} className="text-sm font-medium text-gray-700 sm:text-right">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="sm:col-span-2">
            {renderField(field)}
          </div>
        </div>
      );
    }

    return (
      <div key={field.name} className="space-y-2">
        <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {renderField(field)}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className={`${getLayoutClasses()} ${className}`}>
      {fields.map(renderFieldGroup)}
      
      <div className={`${layout === 'horizontal' && !isMobile ? 'sm:col-span-3' : ''} pt-4`}>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary-responsive w-full sm:w-auto"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Loading...
            </div>
          ) : (
            submitText
          )}
        </button>
      </div>
    </form>
  );
};

export default ResponsiveForm;
