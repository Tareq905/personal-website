import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, X } from "lucide-react";
import client from "../api/client";

const emptyForm = { role: "", company: "", location: "", description: "", start_date: "", end_date: "" };

export default function ManageExperience() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchItems = () => client.get("/api/experience/").then((res) => setItems(res.data)).catch(() => {});
  useEffect(() => { fetchItems(); }, []);

  const resetForm = () => { setForm(emptyForm); setEditingId(null); setShowForm(false); };

  const handleEdit = (item) => {
    setForm({ ...item, end_date: item.end_date || "" });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await client.put(`/api/experience/${editingId}`, form);
    } else {
      await client.post("/api/experience/", form);
    }
    resetForm();
    fetchItems();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this experience entry?")) return;
    await client.delete(`/api/experience/${id}`);
    fetchItems();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-bold text-3xl text-text">Experience</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-bg font-medium text-sm hover:bg-accent/90"
        >
          <Plus size={18} /> Add New
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl p-6 mb-8 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-text">{editingId ? "Edit" : "New"} Experience</h3>
            <button type="button" onClick={resetForm} className="text-textDim hover:text-text"><X size={20} /></button>
          </div>
          <input required placeholder="Role (e.g. AI Engineer)" value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-text" />
          <input required placeholder="Company" value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-text" />
          <input placeholder="Location" value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-text" />
          <div className="grid grid-cols-2 gap-4">
            <input required placeholder="Start date (e.g. Nov 2025)" value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              className="bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-text" />
            <input placeholder="End date (leave empty if Present)" value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              className="bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-text" />
          </div>
          <textarea rows={3} placeholder="Description" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-text resize-none" />
          <button type="submit" className="w-full bg-accent text-bg font-semibold py-2.5 rounded-xl hover:bg-accent/90">
            {editingId ? "Update" : "Create"}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="bg-surface border border-border rounded-2xl p-5 flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-text">{item.role} @ {item.company}</h3>
              <p className="font-mono text-xs text-accent mt-1">{item.start_date} — {item.end_date || "Present"}</p>
              {item.description && <p className="text-textDim text-sm mt-2">{item.description}</p>}
            </div>
            <div className="flex gap-2 shrink-0 ml-4">
              <button onClick={() => handleEdit(item)} className="p-2 rounded-lg hover:bg-surfaceHover text-textDim hover:text-accent"><Edit2 size={16} /></button>
              <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-red-400/10 text-textDim hover:text-red-400"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
