import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import CursorEffect from "./components/layout/CursorEffect";
import ChatWidget from "./components/chatbot/ChatWidget";
import AnimatedBackground from "./components/ui/AnimatedBackground";

import Home from "./pages/Home";
import About from "./pages/About";
import Works from "./pages/Works";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/Contact";

import AdminLogin from "./admin/AdminLogin";
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/Dashboard";
import ManageWorks from "./admin/ManageWorks";
import ManageExperience from "./admin/ManageExperience";
import ManageBlogs from "./admin/ManageBlogs";
import Messages from "./admin/Messages";
import PersonalQueries from "./admin/PersonalQueries";
import Settings from "./admin/Settings";
import ProtectedRoute from "./components/ui/ProtectedRoute";

function PublicLayout({ children }) {
  return (
    <>
      <AnimatedBackground />
      <CursorEffect />
      <Header />
      <main className="min-h-screen text-text relative z-10">{children}</main>
      <Footer />
      <ChatWidget />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public site */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/works" element={<PublicLayout><Works /></PublicLayout>} />
        <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
        <Route path="/blog/:slug" element={<PublicLayout><BlogPost /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />

        {/* Admin */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="works" element={<ManageWorks />} />
          <Route path="experience" element={<ManageExperience />} />
          <Route path="blogs" element={<ManageBlogs />} />
          <Route path="messages" element={<Messages />} />
          <Route path="personal-queries" element={<PersonalQueries />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}