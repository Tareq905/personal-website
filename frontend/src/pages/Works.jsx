import { useEffect, useState } from "react";
import { Github, ExternalLink } from "lucide-react";
import client from "../api/client";

export default function Works() {
  const [works, setWorks] = useState([]);
  const [filter, setFilter] = useState("project");

  useEffect(() => {
    client.get("/api/works/").then((res) => setWorks(res.data)).catch(() => {});
  }, []);

  const filtered = works.filter((w) => w.category === filter);

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <h1 className="font-display font-bold text-4xl mb-3">Projects & Research</h1>
      <p className="text-textDim mb-10">A collection of things I've built and explored.</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-10 border-b border-border">
        {["project", "research"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-5 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
              filter === tab
                ? "border-accent text-accent"
                : "border-transparent text-textDim hover:text-text"
            }`}
          >
            {tab === "project" ? "Projects" : "Research"}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filtered.map((w) => (
          <div
            key={w.id}
            className="bg-surface border border-border rounded-2xl overflow-hidden hover:border-accent/30 transition-colors"
          >
            {w.image_url && (
              <img src={w.image_url} alt={w.title} className="w-full h-48 object-cover" />
            )}
            <div className="p-6">
              <h3 className="font-display font-semibold text-xl mb-2">{w.title}</h3>
              <p className="text-textDim text-sm leading-relaxed mb-4">{w.description}</p>
              {w.tech_stack && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {w.tech_stack.split(",").map((tech, i) => (
                    <span
                      key={i}
                      className="text-xs font-mono px-2.5 py-1 rounded-full bg-bg border border-border text-accent"
                    >
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-4">
                {w.github_url && (
                  <a
                    href={w.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-sm text-textDim hover:text-accent transition-colors"
                  >
                    <Github size={16} /> Code
                  </a>
                )}
                {w.live_url && (
                  <a
                    href={w.live_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-sm text-textDim hover:text-accent transition-colors"
                  >
                    <ExternalLink size={16} /> Live
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-textDim text-sm col-span-2">Nothing here yet.</p>
        )}
      </div>
    </div>
  );
}