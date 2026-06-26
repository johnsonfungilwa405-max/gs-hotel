import { useEffect, useState } from 'react';
import { Newspaper } from 'lucide-react';
import { api } from '../api';
import { useReveal } from '../hooks/useReveal';
import './News.css';

export default function News() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useReveal([posts]);

  useEffect(() => {
    api.getNews().then(setPosts).catch(() => setPosts([])).finally(() => setLoading(false));
  }, []);

  return (
    <div ref={containerRef}>
      <section className="page-banner">
        <div className="container">
          <p className="eyebrow">Stay informed</p>
          <h1>News &amp; Updates</h1>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading ? (
            <p className="state-msg">Loading…</p>
          ) : posts.length === 0 ? (
            <p className="state-msg">No updates yet — check back soon.</p>
          ) : (
            <div className="news-list">
              {posts.map((post) => (
                <article key={post.id} className="news-item reveal">
                  <div className="news-icon">
                    <Newspaper size={18} />
                  </div>
                  <div>
                    <p className="news-date">
                      {new Date(post.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <h3>{post.title}</h3>
                    <p className="news-body">{post.body}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
