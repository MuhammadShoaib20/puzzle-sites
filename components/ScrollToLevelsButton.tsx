'use client';

export default function ScrollToLevelsButton() {
  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    const target = document.getElementById('levels');
    if (!target) return;

    event.preventDefault();
    window.history.pushState(null, '', '#levels');
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <a href="#levels" onClick={handleClick} className="btn btn-primary">
      All levels ↓
    </a>
  );
}
