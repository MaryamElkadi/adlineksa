import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  className = "",
  children,
  ...rest
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary";

  const variantClasses =
    variant === "primary"
      ? "bg-brand-primary text-white hover:bg-brand-primaryHover shadow-md"
      : "bg-white text-brand-primary border border-brand-primary hover:bg-brand-primaryLight";

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;