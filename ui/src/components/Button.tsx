import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  buttonType?:
    | "primary"
    | "default"
    | "link"
    | "success"
    | "danger"
    | "warning"
    | "info";
  handleClick: () => void;
}

const Button = ({ children, buttonType = "primary", handleClick }: Props) => {
  return (
    <button
      type="button"
      className={`btn btn-${buttonType}`}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

export default Button;
