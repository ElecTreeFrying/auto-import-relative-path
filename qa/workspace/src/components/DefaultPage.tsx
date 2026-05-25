import { useState } from 'react';

interface DefaultPageProps {
  initialTitle?: string;
}

export default function DefaultPage({ initialTitle = 'Untitled' }: DefaultPageProps) {
  const [title, setTitle] = useState(initialTitle);
  return (
    <article className="default-page">
      <input value={title} onChange={(event) => setTitle(event.target.value)} />
      <h1>{title}</h1>
    </article>
  );
}
