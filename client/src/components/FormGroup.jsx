import React from 'react';

const FormGroup = ({ label, id, name, type = "text", value, onChange }) => (
  <div className="form-group">
    <label htmlFor={id} className="form-label">{label}</label>
    <input
      type={type}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className="input-field"
    />
  </div>
);
export default FormGroup;