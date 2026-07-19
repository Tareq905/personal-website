import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";

export default function Blog() {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    client.get("/api/blogs/").then((res) => setBlogs(res.data)).catch(() => {});
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <h1 className="font-display font-bold text-4xl mb-10">Blog</h1>
      <div className="space-y-6">
        {blogs.map((b) => (
          <Link
            key={b.id}
            to={`/blog/${b.slug}`}
            className="block bg-surface border border-border rounded-2xl p-6 hover:border-accent/30 transition-colors"
          >
            {b.cover_image && (
              <img src={b.cover_image} alt={b.title} className="w-full h-48 object-cover rounded-xl mb-4" />
            )}
            <h2 className="font-display font-semibold text-2xl mb-2">{b.title}</h2>
            <p className="font-mono text-xs text-accent">
              {new Date(b.created_at).toLocaleDateString()}
            </p>
          </Link>
        ))}
        {blogs.length === 0 && <p className="text-textDim text-sm">No blog posts yet.</p>}
      </div>
    </div>
  );
}