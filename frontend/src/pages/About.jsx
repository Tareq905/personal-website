import { useEffect, useState } from "react";
import client from "../api/client";

export default function About() {
  const [settings, setSettings] = useState(null);
  const [experience, setExperience] = useState([]);

  useEffect(() => {
    client.get("/api/settings/").then((res) => setSettings(res.data)).catch(() => {});
    client.get("/api/experience/").then((res) => setExperience(res.data)).catch(() => {});
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <h1 className="font-display font-bold text-4xl mb-8">About</h1>

      {settings?.profile_image && (
        <img
          src={settings.profile_image}
          alt="Tareq"
          className="w-32 h-32 rounded-2xl object-cover mb-8 border border-border"
        />
      )}

      <p className="text-lg text-textDim leading-relaxed whitespace-pre-line mb-16">
        {settings ? (settings.bio || "No bio added yet.") : "Loading bio..."}
      </p>

      <h2 className="font-display font-semibold text-2xl mb-8">Experience</h2>
      <div className="space-y-6">
        {experience.map((exp) => (
          <div key={exp.id} className="border-l-2 border-accent/30 pl-6 relative">
            <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-accent" />
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-semibold text-text">{exp.role}</h3>
              <span className="text-textDim text-sm">@ {exp.company}</span>
            </div>
            <p className="font-mono text-xs text-accent mb-2">
              {exp.start_date} — {exp.end_date || "Present"}
            </p>
            {exp.description && (
              <p className="text-textDim text-sm leading-relaxed">{exp.description}</p>
            )}
          </div>
        ))}
        {experience.length === 0 && (
          <p className="text-textDim text-sm">No experience added yet.</p>
        )}
      </div>
    </div>
  );
}