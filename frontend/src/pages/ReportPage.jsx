import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiRequest } from "../services/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "../styles/pages/report.css";

export default function ReportPage() {
  const { sessionId } = useParams();

  const [data, setData] = useState(null);

  useEffect(() => {
    async function loadReport() {
      try {
        const res = await apiRequest(`/api/report/${sessionId}`);
        console.log("REPORT DATA:", res);
        setData(res);
      } catch (err) {
        console.error("Report load error:", err);
      }
    }

    loadReport();
  }, [sessionId]);

  async function downloadPDF() {
  const element = document.getElementById("report");

  // ✅ switch to white mode
  element.classList.add("pdf-mode");

  const canvas = await html2canvas(element, {
    scale: 3,
    useCORS: true,
  });

  element.classList.remove("pdf-mode");

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");

  const width = pdf.internal.pageSize.getWidth();
  const height = (canvas.height * width) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, width, height);
  pdf.save("Learning_Report.pdf");
}

  if (!data) return <p>Loading report...</p>;

  const { session, video, emotions } = data;

  // 🔹 Derived values
  const confusionEvents = emotions.filter(e => e.emotion === "CONFUSED");
  const noFaceEvents = emotions.filter(e => e.emotion === "NO_FACE");

  const duration =
  session?.started_at && session?.ended_at
    ? Math.floor(
        (new Date(session.ended_at) - new Date(session.started_at)) / 1000
      )
    : 0;

    const score = session?.average_engagement_score || 0;

let grade = "C";
if (score > 0.8) grade = "A";
else if (score > 0.6) grade = "B";


  return (
    <div className="report-page">
      
      <button
  onClick={downloadPDF}
  className="glow-btn report-download"
>
        Download Report (PDF)
      </button>

      {/* REPORT CONTENT */}
      <div id="report" className="report-card">

        {/* HEADER */}
        <h1 className="report-title">
          EASL – Learning Analytics Report
        </h1>

        <hr className="report-divider" />

        {/* USER + VIDEO */}
        <section className="report-section">
          <h3>👤 User Details</h3>
          <p>Email: {session.email || "User"}</p>

          <h3>🎥 Video</h3>
          <p>{video?.title || "Unknown Video"}</p>
          <p>Duration: {duration} seconds</p>
          
        </section>

        {/* SUMMARY */}
        <section className="report-section">
          <h3 className="report-highlight">
  📊 Session Summary
</h3>
<p><strong>Performance Grade:</strong> {grade}</p>
          <p>
  Average Engagement:{" "}
  {session.average_engagement_score
    ? `${Math.round(session.average_engagement_score * 100)}%`
    : "N/A"}
</p>

<p>
  Dominant Emotion: {session.dominant_emotion || "N/A"}
</p>
          <p>Confusion Events: {confusionEvents.length}</p>
          <p>No Face Events: {noFaceEvents.length}</p>
        </section>

        {/* EVENTS */}
        <section className="report-box">
          <h3>⚠️ Key Events</h3>

          {emotions.slice(0, 10).map((e, i) => (
            <p key={i}>
              {Math.floor(i * 5)}s → {e.emotion} ({e.confidence})
            </p>
          ))}
        </section>

        {/* INSIGHTS */}
        <section className="report-box">
          <h3>🧠 Instructor Insights</h3>

          <p>
            The learner showed moderate engagement throughout the session.
            Confusion was observed in key segments, suggesting difficulty in
            understanding complex concepts.
          </p>
        </section>

        {/* RECOMMENDATIONS */}
        <section className="report-box">
          <h3>🎯 Recommendations</h3>

          <ul>
            <li>Rewatch confusing segments</li>
            <li>Slow down playback speed</li>
            <li>Focus on core concepts</li>
          </ul>
        </section>

      </div>
    </div>
  );
}