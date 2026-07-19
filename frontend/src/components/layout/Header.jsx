import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, MessageCircle } from "lucide-react";
import { useChatWidget } from "../../context/ChatContext";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/works", label: "Works" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { openChat } = useChatWidget();

  return (
    <header className="sticky top-0 z-50 bg-bg/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <NavLink to="/" className="font-display font-bold text-xl text-text">
          Tareq<span className="text-accent">.</span>
        </NavLink>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? "text-accent" : "text-textDim hover:text-text"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <button
            onClick={openChat}
            className="flex items-center gap-2 text-sm font-mono px-4 py-2 rounded-full border border-accent/40 text-accent hover:bg-accent/10 transition-colors"
          >
            <MessageCircle size={16} />
            talk with tareq.ai
          </button>
        </nav>

        <button className="md:hidden text-text" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border px-6 py-4 flex flex-col gap-4 bg-bg">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="text-textDim hover:text-text text-sm font-medium"
            >
              {link.label}
            </NavLink>
          ))}
          <button
            onClick={() => {
              setOpen(false);
              openChat();
            }}
            className="flex items-center gap-2 text-sm font-mono px-4 py-2 rounded-full border border-accent/40 text-accent w-fit"
          >
            <MessageCircle size={16} />
            talk with tareq.ai
          </button>
        </div>
      )}
    </header>
  );
}