"use client";
export default function ErrorPage({ reset }) {
  return (
    <div className="empty-state" role="alert">
      <h1>Something interrupted this page.</h1>
      <p>Please try loading it again.</p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
