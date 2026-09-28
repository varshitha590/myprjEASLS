import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { apiRequest } from "../services/api";
import { extractYouTubeId } from "../utils/youtube";
 // OR copy function
import { useNavigate } from "react-router-dom";

export default function RecentSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchSessions() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.replace("/login");
        return;
      }

      try {
        const data = await apiRequest(
          `/dashboard/recent-sessions?user_id=${session.user.id}`
        );
        setSessions(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, []);

  if (loading) return <p className="text-gray-400">Loading...</p>;

  return (
    <div className="page">
      <h2 className="text-xl font-semibold mb-6">
        📊 Recent Learning Sessions
      </h2>

      {sessions.length === 0 ? (
        <p className="text-gray-400">No sessions yet.</p>
      ) : (
        <div className="glow-card overflow-x-auto p-4 rounded-xl border border-blue-900 bg-[#0b1220] shadow-lg">
          <table className="w-full text-sm text-white">
            <thead className="text-gray-400 border-b border-gray-700">
              <tr>
                <th className="text-left py-2">Video</th>
                <th className="text-left py-2">Started</th>
                <th className="text-left py-2">Avg Engagement</th>
                <th className="text-left py-2">Dominant Emotion</th>
                <th className="text-left py-2">Report</th>

              </tr>
            </thead>

            <tbody>
              {sessions.map((s) => {
                const ytId = s.video_url
                  ? s.video_url.match(
                      /(?:youtube\.com\/(?:.*v=|v\/|embed\/)|youtu\.be\/)([^?&]+)/
                    )?.[1]
                  : null;

                const thumbnail = ytId
                  ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`
                  : null;

                return (
                  <tr key={s.id} className="border-b border-gray-800">
                    <td className="py-2">
                      <div className="flex items-center gap-3">
                        {thumbnail && (
                          <img
                            src={thumbnail}
                            alt={s.video_title}
                            className="w-16 h-10 rounded object-cover"
                          />
                        )}
                        <span>{s.video_title}</span>
                      </div>
                    </td>

                    <td className="py-2">
                      {new Date(s.started_at).toLocaleString()}
                    </td>

                    <td className="py-2">
                      {Number(s.average_engagement_score) > 0
                        ? `${Math.round(
                            s.average_engagement_score * 100
                          )}%`
                        : "0%"}
                    </td>

                    <td className="py-2">
                      {s.dominant_emotion || "—"}
                    </td>

                    <td className="py-2">
  <button
    onClick={() => navigate(`/report/${s.id}`)}
    className="px-3 py-1 bg-indigo-600 rounded hover:bg-indigo-700 text-xs"
  >
    📄 View
  </button>
</td>




                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
