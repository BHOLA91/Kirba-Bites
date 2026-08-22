/** components/common/Button.jsx — placeholder (build reusable variant system in phase 2) */
export default function Button({ children, variant = "primary", ...props }) {
  return (
    <button
      className={`px-5 py-2.5 rounded-lg font-body font-medium transition-colors ${
        variant === "primary"
          ? "bg-forest text-cream hover:bg-forest-light"
          : "border border-burntorange text-burntorange hover:bg-burntorange/10"
      }`}
      {...props}
    >
      {children}
    </button>
  );
}
