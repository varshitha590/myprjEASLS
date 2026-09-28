import React, { useMemo } from "react";

import "../styles/pages/analytics.css";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const EMOTION_COLORS = {
  ENGAGED: "#22c55e",
  HAPPY: "#10b981",
  CONFUSED: "#f59e0b",
  STRESSED: "#ef4444",
  BORED: "#9b55b2",
  NEUTRAL: "#94a3b8"
};

const AnalyticsDashboard = ({ logs = [] }) => {

  const chartData = useMemo(() => {
    return logs
      .filter((_, i) => i % 40 === 0)
      .map(log => ({
        time: new Date(log.captured_at).toLocaleTimeString(),
        emotion: log.emotion,
        confidence: log.confidence,
        topic: "Current Topic"
      }));
  }, [logs]);

  const emotionDistribution = useMemo(() => {
    const counts = {};
    logs.forEach(log => {
      counts[log.emotion] = (counts[log.emotion] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value
    }));
  }, [logs]);

  const dominantEmotion = useMemo(() => {
    if (!emotionDistribution.length) return null;

    return emotionDistribution.reduce((prev, current) =>
      prev.value > current.value ? prev : current
    );
  }, [emotionDistribution]);

  const confusionEvents = logs.filter(l =>
    ["CONFUSED", "STRESSED"].includes(l.emotion)
  ).length;

  const avgConfidence =
    logs.length > 0
      ? Math.round(
          (logs.reduce((acc, l) => acc + Number(l.confidence || 0), 0) /
            logs.length) *
            100
        )
      : 0;

  const engagementRate = logs.length
  ? Math.round(
      (logs.filter(l => l.emotion === "ENGAGED").length / logs.length) * 100
    )
  : 0;

  const learningInsight = useMemo(() => {
    if (!logs.length) return "";

    if (engagementRate < 5 && confusionEvents > 100)
      return "Low engagement with noticeable confusion. Revisiting difficult topics may help improve understanding.";

    if (engagementRate > 10)
      return "Good engagement detected. Continue practicing advanced topics to maintain momentum.";

    if (avgConfidence > 85)
      return "High confidence observed during learning. Concepts appear well understood.";

    return "Learning activity appears stable with mostly neutral responses.";
  }, [logs, engagementRate, confusionEvents, avgConfidence]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="custom-tooltip">
          <p><strong>{data.topic}</strong></p>
          <p>Time: {data.time}</p>
          <p style={{ color: EMOTION_COLORS[data.emotion] }}>
            Emotion: {data.emotion}
          </p>
        </div>
      );
    }
    return null;
  };

  if (!logs.length) {
    return (
      <div className="analytics-container">
        No analytics available yet.
      </div>
    );
  }

  return (

<div className="analytics-container">

{/* KPI GRID */}

<div className="analytics-grid">

<div className="analytics-card">
<p className="analytics-title">Total Observations</p>
<p className="analytics-value">{logs.length}</p>
</div>

<div className="analytics-card">
<p className="analytics-title">Average Confidence</p>
<p className="analytics-value">{avgConfidence}%</p>
</div>

<div className="analytics-card">
<p className="analytics-title">Confusion Events</p>
<p className="analytics-value analytics-danger">{confusionEvents}</p>
</div>

<div className="analytics-card">
<p className="analytics-title">Dominant Emotion</p>

<div className="dominant-emotion">
<span
className="dominant-dot"
style={{ background: EMOTION_COLORS[dominantEmotion?.name] }}
/>
<span className="analytics-value">
{dominantEmotion?.name || "-"}
</span>
</div>

</div>

</div>

{/* TIMELINE */}

<div className="chart-card">

<h3 className="chart-title">Session Engagement Timeline</h3>

<ResponsiveContainer width="100%" height={260}>
<LineChart data={chartData}>

<CartesianGrid
stroke="rgba(148,163,184,0.25)"
strokeDasharray="3 3"
vertical={false}
/>

<XAxis dataKey="time" stroke="#94a3b8" />

<YAxis
stroke="#94a3b8"
domain={[0,1]}
tickFormatter={(v)=>`${Math.round(v*100)}%`}
/>

<Tooltip content={<CustomTooltip />} />

<Line
type="monotone"
dataKey="confidence"
stroke="#38bdf8"
strokeWidth={2.5}
dot={false}
/>

</LineChart>
</ResponsiveContainer>

</div>

{/* LEARNING INSIGHTS */}

<div className="chart-card learning-insights">

<h3 className="chart-title">Learning Insights</h3>

<div className="insight-row">
<span>Dominant Emotion</span>

<div className="dominant-emotion">
<span
className="dominant-dot"
style={{ background: EMOTION_COLORS[dominantEmotion?.name] }}
/>
<strong>{dominantEmotion?.name || "-"}</strong>
</div>

</div>

<div className="insight-row">
<span>Confidence Level</span>
<strong>{avgConfidence}%</strong>
</div>

<div className="insight-row">
<span>Confusion Events</span>
<strong>{confusionEvents}</strong>
</div>

<div className="insight-box">
{learningInsight}
</div>

</div>

{/* BOTTOM SECTION */}

<div className="bottom-analytics">

{/* TOPIC TABLE */}

<div className="chart-card">

<h3 className="chart-title">Topic Difficulty Insights</h3>

<div className="topic-table">

<div className="topic-header">
<span>Video</span>
<span>Topic</span>
<span>Observations</span>
<span>Engagement</span>
<span>Struggles</span>
</div>

{Array.from(
  new Set(
    logs
      .map(l => l.session_id)
      .filter(id => id)   // ✅ remove undefined/null
  )
).map(sessionId => {

  const topicLogs = logs.filter(l => l.session_id === sessionId);

  const struggle = topicLogs.filter(l =>
    ["CONFUSED","STRESSED"].includes(l.emotion)
  ).length;

  const engagement = topicLogs.length
    ? (topicLogs.filter(l => l.emotion === "ENGAGED").length / topicLogs.length) * 100
    : 0;

  return (
    <div
  key={sessionId}
  className={`topic-row ${struggle > 20 ? "row-alert" : ""}`}
>

  {/* VIDEO + TITLE */}
  <div className="col-video">
    <img
      src={
        topicLogs[0]?.video_url?.includes("youtube")
          ? `https://img.youtube.com/vi/${new URL(topicLogs[0].video_url).searchParams.get("v")}/0.jpg`
          : "/default-thumb.png"
      }
      alt="thumbnail"
      className="video-thumb"
    />

    <div className="video-info">
      <div className="video-title">
        {topicLogs[0]?.topic || "Unknown Topic"}
      </div>
      <div className="video-id">
        Session {sessionId.slice(0,6)}
      </div>
    </div>
  </div>

  {/* OBSERVATIONS */}
  <div className="col-center">
    {topicLogs.length}
  </div>

  {/* ENGAGEMENT */}
  <div className="col-center">
    <span className="engagement-badge">
      {Math.round(engagement)}%
    </span>
  </div>

  {/* STRUGGLES */}
  <div className="col-center">
    <span
      className={`struggle-badge ${
        struggle > 20 ? "high" : struggle > 5 ? "medium" : "low"
      }`}
    >
      {struggle}
    </span>
  </div>

</div>
  );

})}

</div>

</div>

{/* PIE CHART */}

<div className="chart-card">

<h3 className="chart-title">Emotional Distribution</h3>

<div className="chart-pie-layout">

<div className="pie-wrapper">

<ResponsiveContainer width={260} height={260}>

<PieChart>

<Pie
data={emotionDistribution}
dataKey="value"
outerRadius={100}
paddingAngle={2}
>

{emotionDistribution.map((entry,i)=>(
<Cell
key={i}
fill={EMOTION_COLORS[entry.name]}
/>
))}

</Pie>

</PieChart>

</ResponsiveContainer>

</div>

<div className="emotion-legend">

{Object.entries(EMOTION_COLORS).map(([emotion,color])=>(
<div key={emotion} className="legend-item">

<span
className="legend-dot"
style={{ background: color }}
/>

<span className="legend-text">
{emotion}
</span>

</div>
))}

</div>

</div>

</div>

</div>

</div>

);

};

export default AnalyticsDashboard;