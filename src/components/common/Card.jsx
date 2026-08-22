/** components/common/Card.jsx — placeholder (generic surface card, used by RestaurantCard etc.) */
export default function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-cream-muted ${className}`}>
      {children}
    </div>
  );
}
