import { useEffect, useState } from "react";
import { Briefcase, FileText, Mail, HelpCircle } from "lucide-react";
import client from "../api/client";

export default function Dashboard() {
  const [stats, setStats] = useState({ works: 0, blogs: 0, unreadMessages: 0, personalQueries: 0 });

  useEffect(() => {
    Promise.all([
      client.get("/api/works/"),
      client.get("/api/blogs/?published_only=false"),
      client.get("/api/messages/"),
      client.get("/api/personal-queries/"),
    ]).then(([works, blogs, messages, pq]) => {
      setStats({
        works: works.data.length,
        blogs: blogs.data.length,
        unreadMessages: messages.data.filter((m) => !m.is_read).length,
        personalQueries: pq.data.filter((p) => !p.is_resolved).length,
      });
    }).catch(() => {});
  }, []);

  const cards = [
    { label: "Total Works", value: stats.works, icon: Briefcase },
    { label: "Total Blogs", value: stats.blogs, icon: FileText },
    { label: "Unread Messages", value: stats.unreadMessages, icon: Mail },
    { label: "Pending Personal Queries", value: stats.personalQueries, icon: HelpCircle },
  ];

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-text mb-8">Dashboard</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c) => (
          <div key={c.label} className="bg-surface border border-border rounded-2xl p-6">
            <c.icon className="text-accent mb-4" size={24} />
            <p className="text-3xl font-bold text-text mb-1">{c.value}</p>
            <p className="text-textDim text-sm">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
