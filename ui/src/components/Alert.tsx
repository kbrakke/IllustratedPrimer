import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  type: "success" | "info" | "warning" | "danger";
}
const Alert = ({ children, type }: Props) => {
  /*return (
    <div className={"alert alert-dismissable alert-" + type} role="alert">
      <button
        type="button"
        className="close"
        data-dismiss="alert"
        aria-label="Close"
      >
        <span aria-hidden="true">&times;</span>
      </button>
      {children}
    </div>
  );*/
  return (
    <div
      className={"alert alert-dismissible fade show alert-" + type}
      role="alert"
    >
      {children}
      <button
        type="button"
        className="btn-close"
        data-bs-dismiss="alert"
        aria-label="Close"
      ></button>
    </div>
  );
};

export default Alert;
