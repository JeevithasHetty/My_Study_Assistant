import clsx from 'clsx';

export default function Input({
  label,
  error,
  helpText,
  icon: Icon,
  className,
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
          {props.required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
            <Icon size={18} />
          </div>
        )}
        <input
          className={clsx(
            'w-full px-3 py-2.5 rounded-lg border transition-colors duration-200',
            Icon ? 'pl-10' : 'px-3',
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500',
            'focus:outline-none focus:ring-2',
            className,
          )}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      {helpText && <p className="text-sm text-slate-500 mt-1">{helpText}</p>}
    </div>
  );
}
