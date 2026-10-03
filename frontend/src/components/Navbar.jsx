import LockeTypeSelect from './LockeTypeSelect';
import SectionSelect from './SectionSelect';

export default function Navbar({ lockeTypes = [], activeTypeId, onSelect, onAddType }) {
  return (
    <header className="navbar">
      <div className="brand">
        <span className="pokeball" />
        <span className="brand-name">PokéLocke Tracker</span>
      </div>

      <div className="nav-actions">
        {onSelect && (
          <LockeTypeSelect
            lockeTypes={lockeTypes}
            activeTypeId={activeTypeId}
            onSelect={onSelect}
          />
        )}
        <SectionSelect />
        {onAddType && (
          <button className="btn-add" onClick={onAddType}>
            + Añadir Tipo de Locke
          </button>
        )}
      </div>
    </header>
  );
}