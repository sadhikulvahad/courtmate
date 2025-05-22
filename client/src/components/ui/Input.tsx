import React, { useEffect, useRef, useState } from "react";

// Define props interface
interface InputProps {
  type?: "text" | "password" | "email" | "number" | "date" | "otp" | "select";
  placeholder?: string;
  value?: string ;
  name?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  label?: string;
  error?: string;
  className?: string;
  options?: { value: string; label: string }[]; // for select type
}

const Input: React.FC<InputProps> = ({
  type = "text",
  placeholder = "",
  value = "",
  onChange,
  label,
  error,
  className = "",
  name,
  options = [],
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const shouldFloatLabel = isFocused || value?.length > 0;

  const displayLabel = label || placeholder;

  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 4);
  }, []);

  useEffect(() => {
    if (type === "otp" && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [type]);

  const handleOtpChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      const updatedOtp = [...otp];
      updatedOtp[index] = val;
      setOtp(updatedOtp);

      if (val && index < otp.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowRight" && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Render OTP type
  if (type === "otp") {
    return (
      <div className="min-h-screen flex flex-col p-6">
        <div className="max-w-md mx-auto w-full flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-8 text-center">
            Enter your OTP
          </h1>

          <div className="flex gap-3 mb-8 w-full justify-center ">
            {[0, 1, 2, 3].map((index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={otp[index]}
                onChange={(e) => handleOtpChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-14 h-14 text-center text-2xl font-bold border rounded-md focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                aria-label={`Digit ${index + 1} of OTP`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render Select type
  if (type === "select") {
    return (
      <div className="input-container relative">
        {displayLabel && (
          <label
            className={`absolute transition-all duration-200 pointer-events-none bg-white px-1
              ${
                shouldFloatLabel
                  ? "text-xs text-blue-600 -top-2 left-3 z-10"
                  : "text-gray-400 top-3 left-3"
              }`}
          >
            {displayLabel}
          </label>
        )}
        <select
          name={name}
          value={value}
          onChange={(e) => onChange && onChange(e)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? "border-red-500" : ""
          } ${className}`}
        >
          <option value="" disabled>
            {placeholder || "Select an option"}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
      </div>
    );
  }

  // Render default input types (text, password, email, number, date)
  return (
    <div className="relative">
      {/* Floating label */}
      {displayLabel && (
        <label
          htmlFor={name}
          className={`
            absolute 
            z-10
            bg-white 
            px-1
            transition-all duration-200 
            pointer-events-none
            ${
              shouldFloatLabel
                ? "-top-2 left-3 text-xs text-blue-600" // Floating
                : "top-3 left-3 text-gray-400"
            }         // Placeholder position
          `}
        >
          {displayLabel}
        </label>
      )}

      {/* Input field */}
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`
          w-full 
          p-3 
          border rounded-md 
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${error ? "border-red-500" : "border-gray-300"}
          ${shouldFloatLabel ? "pt-4 pb-2" : ""}
          ${className}
        `}
        
      />

      {/* Error message */}
      {error && (
        <span className="text-red-500 text-sm mt-1 block">{error}</span>
      )}
    </div>
  );
};

export default Input;
