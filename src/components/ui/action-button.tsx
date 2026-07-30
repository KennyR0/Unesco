import type { ButtonHTMLAttributes, ReactNode } from "react";

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function ActionButton({
  children,
  className = "",
  type = "button",
  ...props
}: ActionButtonProps) {
  return (
    <button
      {...props}
      className={`min-h-[44px] min-w-[44px] rounded-sm border-2 border-black px-4 py-3 font-bold text-black outline-offset-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-700 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      type={type}
    >
      {children}
    </button>
  );
}
