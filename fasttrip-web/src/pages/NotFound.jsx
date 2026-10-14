import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
      <h1 style={{ marginBottom: 8 }}>Page not found</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
        The page you are looking for doesn't exist or has moved.
      </p>
      <Link to="/" className="btn">Back to home</Link>
    </main>
  );
}