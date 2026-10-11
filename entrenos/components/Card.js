import { CATEGORIES, RARITIES } from '../lib/cards';

export function Stars({ rarity }) {
  const { stars, label } = RARITIES[rarity];
  return (
    <span className="stars" title={label}>
      {stars ? '★'.repeat(stars) : '♥'}
    </span>
  );
}

// Carta virada para cima.
export function Card({ card, onClick, size = 'md', badge }) {
  const cat = CATEGORIES[card.category];
  return (
    <button
      type="button"
      className={`card card-${size} rarity-${card.rarity}`}
      style={{ '--cat': cat.color }}
      onClick={onClick}
      disabled={!onClick}
    >
      {badge && <span className="card-badge">{badge}</span>}
      <span className="card-top">
        <span className="card-cat">{cat.label}</span>
        <Stars rarity={card.rarity} />
      </span>
      <span className="card-emoji">{cat.emoji}</span>
      <span className="card-title">{card.title}</span>
      {size !== 'sm' && <span className="card-desc">{card.desc}</span>}
      <span className="card-foot">EntreNós</span>
    </button>
  );
}

// Carta ainda não desbloqueada.
export function LockedCard({ card, size = 'md' }) {
  const cat = CATEGORIES[card.category];
  return (
    <div className={`card card-${size} card-locked`} style={{ '--cat': cat.color }} aria-label="Carta bloqueada">
      <span className="card-top">
        <span className="card-cat">{cat.label}</span>
        <Stars rarity={card.rarity} />
      </span>
      <span className="card-emoji">🔒</span>
      <span className="card-title">{RARITIES[card.rarity].label}</span>
      <span className="card-foot">EntreNós</span>
    </div>
  );
}
