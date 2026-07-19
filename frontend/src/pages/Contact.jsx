import { useEffect, useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import client from "../api/client";

export default function Contact() {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState({ loading: false, error: "", success: false });

  useEffect(() => {
    client.get("/api/settings/").then((res) => setSettings(res.data)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: "", success: false });
    try {
      await client.post("/api/messages/", form);
      setStatus({ loading: false, error: "", success: true });
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      const errorDetail = err.response?.data?.detail;
      let errorMessage = "Something went wrong. Try again.";
      if (typeof errorDetail === "string") {
        errorMessage = errorDetail;
      } else if (Array.isArray(errorDetail)) {
        errorMessage = errorDetail[0]?.msg || errorMessage;
      }
      setStatus({
        loading: false,
        error: errorMessage,
        success: false,
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-5 gap-12">
      {/* Info */}
      <div className="md:col-span-2">
        <h1 className="font-display font-bold text-4xl mb-4">Get in Touch</h1>
        <p className="text-textDim mb-10">
          Have a project in mind or just want to say hi? Reach out.
        </p>
        <div className="space-y-5">
          {settings?.email && (
            <div className="flex items-center gap-3 text-sm">
              <Mail size={18} className="text-accent" />
              <a href={`mailto:${settings.email}`} className="text-textDim hover:text-text">
                {settings.email}
              </a>
            </div>
          )}
          {settings?.phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone size={18} className="text-accent" />
              <span className="text-textDim">{settings.phone}</span>
            </div>
          )}
          {settings?.location && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin size={18} className="text-accent" />
              <span className="text-textDim">{settings.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="md:col-span-3 space-y-5">
        <div>
          <label className="text-sm text-textDim mb-1.5 block">Name</label>
          <input
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent/50"
          />
        </div>
        <div>
          <label className="text-sm text-textDim mb-1.5 block">Email</label>
          <input
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="you@gmail.com"
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent/50"
          />
        </div>
        <div>
          <label className="text-sm text-textDim mb-1.5 block">Phone (with country code)</label>
          <input
            name="phone"
            required
            value={form.phone}
            onChange={handleChange}
            placeholder="+8801XXXXXXXXX"
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent/50"
          />
        </div>
        <div>
          <label className="text-sm text-textDim mb-1.5 block">Message</label>
          <textarea
            name="message"
            required
            rows={5}
            value={form.message}
            onChange={handleChange}
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent/50 resize-none"
          />
        </div>

        {status.error && <p className="text-red-400 text-sm">{status.error}</p>}
        {status.success && (
          <p className="text-accent text-sm flex items-center gap-2">
            <CheckCircle2 size={16} /> Message sent! I'll get back to you soon.
          </p>
        )}

        <button
          type="submit"
          disabled={status.loading}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-bg font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          <Send size={18} /> {status.loading ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}