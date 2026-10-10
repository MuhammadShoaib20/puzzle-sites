'use client';

export default function ScrollToLevelsButton() {
  function handleClick() {
    const target = document.getElementById('levels');
    if (!target) return;

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <button type="button" onClick={handleClick} className="btn btn-primary">
      All levels ↓
    </button>
  );
}
