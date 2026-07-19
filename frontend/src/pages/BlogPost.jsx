import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { ArrowLeft } from "lucide-react";
import client from "../api/client";

export default function BlogPost() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    client
      .get(`/api/blogs/${slug}`)
      .then((res) => setBlog(res.data))
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <p className="text-textDim">Blog post not found.</p>
        <Link to="/blog" className="text-accent text-sm mt-4 inline-block">← Back to blog</Link>
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <Link to="/blog" className="flex items-center gap-1.5 text-sm text-textDim hover:text-accent mb-8">
        <ArrowLeft size={16} /> Back to blog
      </Link>
      {blog.cover_image && (
        <img src={blog.cover_image} alt={blog.title} className="w-full h-64 object-cover rounded-2xl mb-8" />
      )}
      <h1 className="font-display font-bold text-4xl mb-3">{blog.title}</h1>
      <p className="font-mono text-xs text-accent mb-10">
        {new Date(blog.created_at).toLocaleDateString()}
      </p>
      <article className="prose prose-invert prose-headings:font-display max-w-none text-textDim leading-relaxed">
        <ReactMarkdown>{blog.content}</ReactMarkdown>
      </article>
    </div>
  );
}