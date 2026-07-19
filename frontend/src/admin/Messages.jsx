import { useEffect, useState } from "react";
import { Trash2, Mail, MailOpen } from "lucide-react";
import client from "../api/client";

export default function Messages() {
  const [messages, setMessages] = useState([]);

  const fetchMessages = () => client.get("/api/messages/").then((res) => setMessages(res.data)).catch(() => {});
  useEffect(() => { fetchMessages(); }, []);

  const markRead = async (id) => {
    await client.put(`/api/messages/${id}/read`);
    fetchMessages();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this message?")) return;
    await client.delete(`/api/messages/${id}`);
    fetchMessages();
  };

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-text mb-8">Messages</h1>
      <div className="space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`bg-surface border rounded-2xl p-5 ${m.is_read ? "border-border" : "border-accent/40"}`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-text">{m.name}</h3>
                  {!m.is_read && <span className="w-2 h-2 rounded-full bg-accent" />}
                </div>
                <p className="text-textDim text-xs font-mono mt-1">{m.email} • {m.phone}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => markRead(m.id)} className="p-2 rounded-lg hover:bg-surfaceHover text-textDim hover:text-accent">
                  {m.is_read ? <MailOpen size={16} /> : <Mail size={16} />}
                </button>
                <button onClick={() => handleDelete(m.id)} className="p-2 rounded-lg hover:bg-red-400/10 text-textDim hover:text-red-400">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <p className="text-textDim text-sm mt-3">{m.message}</p>
            <p className="text-textDim text-xs font-mono mt-2">{new Date(m.created_at).toLocaleString()}</p>
          </div>
        ))}
        {messages.length === 0 && <p className="text-textDim text-sm">No messages yet.</p>}
      </div>
    </div>
  );
}
