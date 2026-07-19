import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, X, Upload } from "lucide-react";
import client from "../api/client";

const emptyForm = { title: "", slug: "", content: "", cover_image: "", published: false };

const slugify = (str) =>
  str.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

export default function ManageBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchBlogs = () => client.get("/api/blogs/?published_only=false").then((res) => setBlogs(res.data)).catch(() => {});
  useEffect(() => { fetchBlogs(); }, []);

  const resetForm = () => { setForm(emptyForm); setEditingId(null); setShowForm(false); };

  const handleEdit = (b) => { setForm({ ...b }); setEditingId(b.id); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await client.put(`/api/blogs/${editingId}`, form);
      } else {
        await client.post("/api/blogs/", form);
      }
      resetForm();
      fetchBlogs();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to save (slug might already exist)");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this blog post?")) return;
    await client.delete(`/api/blogs/${id}`);
    fetchBlogs();
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
      setForm({ ...form, cover_image: res.data.url });
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-bold text-3xl text-text">Blogs</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-bg font-medium text-sm hover:bg-accent/90">
          <Plus size={18} /> Add New
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl p-6 mb-8 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-text">{editingId ? "Edit" : "New"} Blog</h3>
            <button type="button" onClick={resetForm} className="text-textDim hover:text-text"><X size={20} /></button>
          </div>

          <input required placeholder="Title" value={form.title}
            onChange={(e) => {
              const title = e.target.value;
              setForm({ ...form, title, slug: editingId ? form.slug : slugify(title) });
            }}
            className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-text" />

          <input required placeholder="Slug" value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-text font-mono" />

          <div>
            <label className="text-xs text-textDim mb-1.5 block">Cover Image</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm text-textDim hover:text-accent hover:border-accent/40 cursor-pointer">
                <Upload size={16} /> {uploading ? "Uploading..." : "Upload"}
                <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
              </label>
              {form.cover_image && <img src={form.cover_image} alt="preview" className="h-12 w-12 object-cover rounded-lg" />}
            </div>
          </div>

          <textarea required rows={10} placeholder="Content (Markdown supported)" value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-text font-mono resize-none" />

          <label className="flex items-center gap-2 text-sm text-textDim">
            <input type="checkbox" checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })} />
            Published
          </label>

          <button type="submit" className="w-full bg-accent text-bg font-semibold py-2.5 rounded-xl hover:bg-accent/90">
            {editingId ? "Update" : "Create"}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {blogs.map((b) => (
          <div key={b.id} className="bg-surface border border-border rounded-2xl p-5 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-text">{b.title}</h3>
                {!b.published && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400">Draft</span>}
              </div>
              <p className="text-textDim text-xs font-mono mt-1">/{b.slug}</p>
            </div>
            <div className="flex gap-2 shrink-0 ml-4">
              <button onClick={() => handleEdit(b)} className="p-2 rounded-lg hover:bg-surfaceHover text-textDim hover:text-accent"><Edit2 size={16} /></button>
              <button onClick={() => handleDelete(b.id)} className="p-2 rounded-lg hover:bg-red-400/10 text-textDim hover:text-red-400"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
