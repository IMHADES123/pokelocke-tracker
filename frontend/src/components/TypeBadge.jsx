export default function TypeBadge({ name, color }) {
  return (
    <span
      className="type-badge"
      style={{ color, borderColor: color, background: `${color}22` }}
    >
      {name}
    </span>
  );
}