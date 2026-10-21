
function SelectField({ options, label = '', name = '', register, error, validation = {} }) {
  const fieldId = name || label.toLowerCase().replace(/\s+/g, '-');

  
  const fieldError = error?.[name] || (error?.message ? error : null);

  return (
    <div>
      <label className="label mt-2 mb-1.5 font-semibold" htmlFor={fieldId}>
        {label}
      </label>
      <select
        id={fieldId}
        className={`select capitalize w-full ${fieldError ? 'select-error border-error' : ''}`}
        {...(register ? register(name, validation) : {})}
      >
        <option value="" disabled>Select {label}</option>
        {options?.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {fieldError && (
        <span className="text-error text-xs mt-1 block">
          {fieldError.message}
        </span>
      )}
    </div>
  )
}

export default SelectField;