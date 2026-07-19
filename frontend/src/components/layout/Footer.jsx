import { useEffect, useState } from "react";
import { Github, Linkedin, Youtube } from "lucide-react";
import client from "../../api/client";

export default function Footer() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    client.get("/api/settings/").then((res) => setSettings(res.data)).catch(() => {});
  }, []);

  return (
    <footer className="border-t border-border bg-surface mt-20">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col items-center justify-center gap-6">
        <p className="text-textDim text-sm font-mono">
          © {new Date().getFullYear()} Md Tareq Shah Alam
        </p>
        <div className="flex items-center gap-5">
          {settings?.github_url && (
            <a href={settings.github_url} target="_blank" rel="noreferrer" className="text-textDim hover:text-accent transition-colors">
              <Github size={20} />
            </a>
          )}
          {settings?.linkedin_url && (
            <a href={settings.linkedin_url} target="_blank" rel="noreferrer" className="text-textDim hover:text-accent transition-colors">
              <Linkedin size={20} />
            </a>
          )}
          {settings?.youtube_url && (
            <a href={settings.youtube_url} target="_blank" rel="noreferrer" className="text-textDim hover:text-accent transition-colors">
              <Youtube size={20} />
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}