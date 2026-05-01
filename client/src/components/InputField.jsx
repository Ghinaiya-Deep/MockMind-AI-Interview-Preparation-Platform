function InputField({
  id,
  label,
  type = "text",
  name,
  value,
  onChange,
  error,
  placeholder
}) {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={error ? "input error" : "input"}
      />
      {error ? <small className="error-text">{error}</small> : null}
    </div>
  );
}

export default InputField;

