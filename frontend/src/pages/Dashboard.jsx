import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { apiRequest } from "../services/api";
import { useNavigate } from "react-router-dom";
import { extractYouTubeId } from "../utils/youtube";

/* 🔧 Utility: extract YouTube videoId */
/*
function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:.*v=|v\/|embed\/)|youtu\.be\/)([^?&]+)/
  );
  return match ? match[1] : null;
}
  */

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
  const loginTime = sessionStorage.getItem("loginTime");
  if (loginTime) {
    const diff = Date.now() - Number(loginTime);
    if (diff < 60000) {
      setShowWelcome(true);
      setTimeout(() => setShowWelcome(false), 60000 - diff);
    }
  }
}, []);

  /* 🔐 AUTH GUARD + LOAD USER */
  useEffect(() => {
    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.replace("/login");
        return;
      }

      setUser(session.user);

      try {
        const sessionsData = await apiRequest(
  `/dashboard/recent-sessions?user_id=${session.user.id}`
);

setSessions(sessionsData || []);

        const videosData = await apiRequest("/videos");

console.log("VIDEOS RESPONSE:", videosData);

if (Array.isArray(videosData)) {
  setVideos(videosData);
} else {
  setVideos([videosData]);   // wrap single video into array
}
      } catch (err) {
        console.error("Dashboard fetch failed", err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  function startSession(videoId) {
    window.location.href = `/watch/${videoId}`;
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.replace("/login");
  }

  if (loading) {
    return (
      <p className="text-center mt-24 text-lg text-gray-400">
        Loading dashboard...
      </p>
    );
  }

  return (
    <div className="page">
      {/* ===== HEADER ===== */}
      {showWelcome && (
  <header className="mb-8">
    <h2 className="text-xl font-semibold">
      Welcome, {user?.user_metadata?.name} 👋
    </h2>
  </header>
)}


      {/* ===== START LEARNING ===== */}
  


      <section className="mb-12">
        <h3 className="text-lg font-semibold mb-4">
          🎥 Start a Learning Session
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(videos || []).filter((v) => extractYouTubeId(v.video_url))
            .map((video) => {

            const ytId = extractYouTubeId(video.video_url);
            const thumbnailUrl = ytId
              ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
              : null;

            return (
              <div key={video.id} className="glow-card">
                {thumbnailUrl && (
                  <img
                    src={thumbnailUrl}
                    alt={video.title}
                    className="w-full rounded mb-3"
                  />
                )}

                <h4 className="font-semibold mb-1">{video.title}</h4>

                <p className="text-sm text-gray-400 mb-3">
                  {video.description || "No description available"}
                </p>

                <button
                  className="glow-btn"
                  onClick={() => startSession(video.id)}
                >
                  Start Session
                </button>
              </div>
            );
          })}
        </div>
      </section>
/*
      */
    </div>
  );
}
