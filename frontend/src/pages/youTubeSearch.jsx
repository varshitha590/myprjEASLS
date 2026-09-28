import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiRequest } from "../services/api";
import "../styles/pages/watchVideo.css";

/* 🔧 Utility */
function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:.*v=|v\/|embed\/)|youtu\.be\/)([^?&]+)/
  );
  return match ? match[1] : null;
}

export default function YouTubeSearch() {
  const [videos, setVideos] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function loadVideos() {
      const data = await apiRequest("/videos");
      setVideos(data);
    }
    loadVideos();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q")?.toLowerCase() || "";

    if (!q) {
      setFiltered(videos);
    } else {
      const result = videos.filter((v) =>
        v.title.toLowerCase().includes(q)
      );
      setFiltered(result);
    }
  }, [location.search, videos]);

  return (
    <div className="watch-container">
      <h2>Search Educational Videos</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
        {filtered.map((video) => {
          const ytId = extractYouTubeId(video.video_url);
          const thumbnailUrl = ytId
            ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
            : null;

          return (
            <div
              key={video.id}
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/watch/${video.id}`)}
              className="glow-card"
            >
              {thumbnailUrl && (
                <img src={thumbnailUrl} alt={video.title} />
              )}
              <h4>{video.title}</h4>
              <p>{video.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
