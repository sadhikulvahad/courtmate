import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: "primary" | "secondary";
  label?: string;
}

const Button: React.FC<ButtonProps> = ({
  label,
  children,
  isLoading = false,
  variant = "primary",
  className = "",
  ...props
}) => {
  const baseStyles = "w-full py-1 rounded-lg font-semibold transition-colors flex items-center justify-center";
  
  const variants = {
    primary: "bg-gray-800 text-white hover:bg-black",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className} ${
        isLoading ? "opacity-50 cursor-not-allowed" : ""
      }`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="animate-spin">🌀</span>
      ) : (
        label || children
      )}
    </button>
  );
};

export default Button;