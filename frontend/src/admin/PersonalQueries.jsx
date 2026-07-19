import { useEffect, useState } from "react";
import { Trash2, CheckCircle2, Circle } from "lucide-react";
import client from "../api/client";

export default function PersonalQueries() {
  const [queries, setQueries] = useState([]);

  const fetchQueries = () => client.get("/api/personal-queries/").then((res) => setQueries(res.data)).catch(() => {});
  useEffect(() => { fetchQueries(); }, []);

  const toggleResolved = async (q) => {
    await client.put(`/api/personal-queries/${q.id}`, { is_resolved: !q.is_resolved });
    fetchQueries();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this query?")) return;
    await client.delete(`/api/personal-queries/${id}`);
    fetchQueries();
  };

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-text mb-2">Personal Queries</h1>
      <p className="text-textDim text-sm mb-8">
        Questions the chatbot couldn't answer — visitors who left their contact info.
      </p>
      <div className="space-y-4">
        {queries.map((q) => (
          <div key={q.id} className={`bg-surface border rounded-2xl p-5 ${q.is_resolved ? "border-border opacity-60" : "border-accent/40"}`}>
            <div className="flex justify-between items-start">
              <p className="text-text text-sm flex-1">"{q.question}"</p>
              <div className="flex gap-2 shrink-0 ml-4">
                <button onClick={() => toggleResolved(q)} className="p-2 rounded-lg hover:bg-surfaceHover text-textDim hover:text-accent">
                  {q.is_resolved ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                </button>
                <button onClick={() => handleDelete(q.id)} className="p-2 rounded-lg hover:bg-red-400/10 text-textDim hover:text-red-400">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="flex gap-4 mt-3 text-xs font-mono text-accent">
              {q.visitor_email && <span>📧 {q.visitor_email}</span>}
              {q.visitor_phone && <span>📱 {q.visitor_phone}</span>}
            </div>
            <p className="text-textDim text-xs font-mono mt-2">{new Date(q.created_at).toLocaleString()}</p>
          </div>
        ))}
        {queries.length === 0 && <p className="text-textDim text-sm">No personal queries yet.</p>}
      </div>
    </div>
  );
}
