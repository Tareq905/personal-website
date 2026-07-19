import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Sparkles, X, Upload } from "lucide-react";
import client from "../api/client";

const emptyForm = {
  category: "project", title: "", description: "", tech_stack: "",
  image_url: "", live_url: "", github_url: "", featured: false,
};

export default function ManageWorks() {
  const [works, setWorks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchWorks = () => client.get("/api/works/").then((res) => setWorks(res.data)).catch(() => {});

  useEffect(() => { fetchWorks(); }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (w) => {
    setForm({ ...w });
    setEditingId(w.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await client.put(`/api/works/${editingId}`, form);
      } else {
        await client.post("/api/works/", form);
      }
      resetForm();
      fetchWorks();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to save");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this item?")) return;
    await client.delete(`/api/works/${id}`);
    fetchWorks();
  };

  const handleGenerateDescription = async () => {
    if (!form.title) return alert("Add a title first");
    setGenerating(true);
    try {
      const res = await client.post("/api/ai/generate-description", {
        title: form.title,
        tech_stack: form.tech_stack,
      });
      setForm({ ...form, description: res.data.description });
    } catch {
      alert("AI generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await client.post("/api/upload/image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm({ ...form, image_url: res.data.url });
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-bold text-3xl text-text">Projects & Research</h1>
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
            <h3 className="font-semibold text-text">{editingId ? "Edit" : "New"} Work</h3>
            <button type="button" onClick={resetForm} className="text-textDim hover:text-text">
              <X size={20} />
            </button>
          </div>

          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-text"
          >
            <option value="project">Project</option>
            <option value="research">Research</option>
          </select>

          <input
            required
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-text"
          />

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs text-textDim">Description</label>
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={generating}
                className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 disabled:opacity-50"
              >
                <Sparkles size={14} /> {generating ? "Generating..." : "AI Generate"}
              </button>
            </div>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-text resize-none"
            />
          </div>

          <input
            placeholder="Tech stack (comma separated)"
            value={form.tech_stack}
            onChange={(e) => setForm({ ...form, tech_stack: e.target.value })}
            className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-text"
          />

          <div>
            <label className="text-xs text-textDim mb-1.5 block">Image</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm text-textDim hover:text-accent hover:border-accent/40 cursor-pointer">
                <Upload size={16} /> {uploading ? "Uploading..." : "Upload"}
                <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
              </label>
              {form.image_url && (
                <img src={form.image_url} alt="preview" className="h-12 w-12 object-cover rounded-lg" />
              )}
            </div>
          </div>

          <input
            placeholder="Live URL"
            value={form.live_url}
            onChange={(e) => setForm({ ...form, live_url: e.target.value })}
            className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-text"
          />
          <input
            placeholder="GitHub URL"
            value={form.github_url}
            onChange={(e) => setForm({ ...form, github_url: e.target.value })}
            className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-text"
          />

          <label className="flex items-center gap-2 text-sm text-textDim">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            />
            Featured on homepage
          </label>

          <button type="submit" className="w-full bg-accent text-bg font-semibold py-2.5 rounded-xl hover:bg-accent/90">
            {editingId ? "Update" : "Create"}
          </button>
        </form>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {works.map((w) => (
          <div key={w.id} className="bg-surface border border-border rounded-2xl p-5 flex justify-between items-start">
            <div>
              <span className="text-xs font-mono text-accent uppercase">{w.category}</span>
              <h3 className="font-semibold text-text mt-1">{w.title}</h3>
              <p className="text-textDim text-sm line-clamp-2 mt-1">{w.description}</p>
            </div>
            <div className="flex gap-2 shrink-0 ml-4">
              <button onClick={() => handleEdit(w)} className="p-2 rounded-lg hover:bg-surfaceHover text-textDim hover:text-accent">
                <Edit2 size={16} />
              </button>
              <button onClick={() => handleDelete(w.id)} className="p-2 rounded-lg hover:bg-red-400/10 text-textDim hover:text-red-400">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
