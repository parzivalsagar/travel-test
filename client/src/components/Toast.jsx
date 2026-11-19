export default function Toast({ message, show }) {
  return (
    <div className={`toast-box ${show ? "show" : ""}`} role="status">
      <span>{message}</span>
    </div>
  );
}
