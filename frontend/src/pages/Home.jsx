import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Cpu } from "lucide-react";
import client from "../api/client";

export default function Home() {
  const [settings, setSettings] = useState(null);
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    client.get("/api/settings/").then((res) => setSettings(res.data)).catch(() => {});
    client.get("/api/works/").then((res) => {
      setFeatured(res.data.filter((w) => w.featured).slice(0, 3));
    }).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-32">
        <div className="flex items-center gap-2 text-accent font-mono text-sm mb-6">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          Let's Shape the Future Together
        </div>
        <h1 className="font-display font-bold text-5xl md:text-7xl leading-tight mb-6">
          Md Tareq Shah Alam
        </h1>
        <p className="text-xl md:text-2xl text-textDim mb-10 max-w-2xl">
          AI Engineer building intelligent, secure systems — from RAG pipelines and
          agentic AI to computer vision and automated workflows.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/works"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-bg font-semibold hover:bg-accent/90 transition-colors"
          >
            View Works <ArrowRight size={18} />
          </Link>
          <Link
            to="/contact"
            className="px-6 py-3 rounded-full border border-border text-text hover:border-accent/50 transition-colors"
          >
            Get in Touch
          </Link>
        </div>
      </section>

      {/* Focus areas */}
      <section className="max-w-6xl mx-auto px-6 pb-32 grid md:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-2xl p-8 hover:border-accent/30 transition-colors">
          <Cpu className="text-accent mb-4" size={32} />
          <h3 className="font-display font-semibold text-xl mb-2">AI Engineering</h3>
          <p className="text-textDim text-sm leading-relaxed">
            RAG systems, LLM agents, computer vision, and end-to-end ML pipelines
            built for real-world reliability, not just demos.
          </p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-8 hover:border-accent/30 transition-colors">
          <Shield className="text-accent mb-4" size={32} />
          <h3 className="font-display font-semibold text-xl mb-2">Secure-First Mindset</h3>
          <p className="text-textDim text-sm leading-relaxed">
            Approaching system architecture with a deep awareness of safety. Engineering intelligent environments where data integrity and threat resilience are built-in from day one.
          </p>
        </div>
      </section>

      {/* Featured works */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-32">
          <h2 className="font-display font-semibold text-3xl mb-8">Featured Work</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {featured.map((w) => (
              <div key={w.id} className="bg-surface border border-border rounded-2xl overflow-hidden hover:border-accent/30 transition-colors group">
                {w.image_url && (
                  <img src={w.image_url} alt={w.title} className="w-full h-40 object-cover" />
                )}
                <div className="p-5">
                  <span className="text-xs font-mono text-accent uppercase">{w.category}</span>
                  <h3 className="font-display font-semibold text-lg mt-1 mb-2 group-hover:text-accent transition-colors">
                    {w.title}
                  </h3>
                  <p className="text-textDim text-sm line-clamp-2">{w.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}