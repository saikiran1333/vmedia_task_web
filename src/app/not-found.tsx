import Link from "next/link";

export default function NotFound() {
  return (
    <main className="tg-site">
      <div className="tg-wrap tg-section">
        <h1 className="tg-display">This page is not available</h1>
        <p className="tg-muted">The address does not match a catalogue page.</p>
        <Link href="/" className="tg-button">
          Back to the homepage
        </Link>
      </div>
    </main>
  );
}
