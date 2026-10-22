function InputField({
  label,
  required = false,
  disabled = false,
  type = "text",
  name,
  register,
  error,
  validation = {},
  placeholder = ""
}) {
  const fieldId = name || label.toLowerCase().replace(/\s+/g, '-');

  // Fix deep error pathing (e.g., handles "address.city" or array names)
  const fieldError = name?.split('.').reduce((obj, key) => obj?.[key], error);

  return (
    <div>
      <fieldset className="fieldset">
        <label
          className={`label font-semibold capitalize text-base text-gray-700 ${label ? "" : "hidden"}`}
          htmlFor={fieldId}
        >
          {label}{required && <span className="text-red-600">*</span>}
        </label>

        <input
          type={type}
          disabled={disabled}
          id={fieldId}
          className={`input w-full text-black ${fieldError ? 'input-error border-error' : 'border-success'}`}
          placeholder={placeholder || label}
          {...(register
            ? register(name, {
              required: required ? `${label || name} is required` : false,
              ...validation
            })
            : {})}
        />

        {fieldError && (
          <span className="text-error text-xs mt-1">
            {fieldError.message || `${label || name} is invalid`}
          </span>
        )}
      </fieldset>
    </div>
  );
}

export default InputField;
