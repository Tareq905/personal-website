import { useEffect, useState } from "react";
import { Upload, Save } from "lucide-react";
import client from "../api/client";

export default function Settings() {
  const [form, setForm] = useState({
    bio: "", profile_image: "", github_url: "", linkedin_url: "",
    youtube_url: "", twitter_url: "", email: "", phone: "", location: "",
  });
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    client.get("/api/settings/").then((res) => setForm({ ...form, ...res.data })).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await client.put("/api/settings/", form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
      setForm({ ...form, profile_image: res.data.url });
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-display font-bold text-3xl text-text mb-8">Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-xs text-textDim mb-1.5 block">Profile Image</label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm text-textDim hover:text-accent hover:border-accent/40 cursor-pointer">
              <Upload size={16} /> {uploading ? "Uploading..." : "Upload"}
              <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
            </label>
            {form.profile_image && <img src={form.profile_image} alt="preview" className="h-14 w-14 object-cover rounded-xl" />}
          </div>
        </div>

        <div>
          <label className="text-xs text-textDim mb-1.5 block">Bio</label>
          <textarea rows={6} value={form.bio || ""}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-textDim mb-1.5 block">Email</label>
            <input value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text" />
          </div>
          <div>
            <label className="text-xs text-textDim mb-1.5 block">Phone</label>
            <input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text" />
          </div>
        </div>

        <div>
          <label className="text-xs text-textDim mb-1.5 block">Location</label>
          <input value={form.location || ""} onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text" />
        </div>

        <div>
          <label className="text-xs text-textDim mb-1.5 block">GitHub URL</label>
          <input value={form.github_url || ""} onChange={(e) => setForm({ ...form, github_url: e.target.value })}
            className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text" />
        </div>
        <div>
          <label className="text-xs text-textDim mb-1.5 block">LinkedIn URL</label>
          <input value={form.linkedin_url || ""} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
            className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text" />
        </div>
        <div>
          <label className="text-xs text-textDim mb-1.5 block">YouTube URL</label>
          <input value={form.youtube_url || ""} onChange={(e) => setForm({ ...form, youtube_url: e.target.value })}
            className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-text" />
        </div>

        <button type="submit" className="flex items-center gap-2 bg-accent text-bg font-semibold px-6 py-3 rounded-xl hover:bg-accent/90">
          <Save size={18} /> {saved ? "Saved!" : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
