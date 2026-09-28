export default function EmotionOverlay({ emotion }) {
  return (
    <div className="emotion-box">
      <div className="emotion-title">Detected Emotion</div>

      <div className="emotion-value">
        {emotion || "Neutral"}
      </div>
    </div>
  );
}