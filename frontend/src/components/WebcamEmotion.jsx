import { useEffect, useRef, useState } from "react";

import * as faceapi from "face-api.js";
//import * as tf from "@tensorflow/tfjs";
//import "@tensorflow/tfjs-backend-webgl";

import { apiRequest } from "../services/api";
import "../styles/components.css";

const BACKEND_URL = "http://localhost:5000";

/* 🧠 Emotion explanations */
const EMOTION_EXPLANATION = {
  HAPPY: "You appear comfortable and engaged with the content.",
  SAD: "You may be feeling low or disconnected from the topic.",
  ANGRY: "This topic might be causing frustration or resistance.",
  FEARFUL: "You may feel uncertain or overwhelmed by the concept.",
  DISGUSTED: "This content may not align with your expectations.",
  SURPRISED: "Something unexpected just happened — pay attention.",
  NEUTRAL: "You appear calm and receptive to learning.",
  ENGAGED: "You are actively engaged in learning.",
  CONFUSED: "You seem confused. Let me help you.",
  STRESSED: "You look stressed. Relax and refocus.",
  BORED: "You may be losing interest. Stay attentive.",
};
export default function WebcamEmotion({ 
  onConfusionDetected, 
  sessionId,
  isVideoPlaying,
  onCameraDenied
}) {

  const videoRef = useRef(null);

  const [emotion, setEmotion] = useState("—");
  const [confidence, setConfidence] = useState(null);
  const [ready, setReady] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const [permissionError, setPermissionError] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const emotionBufferRef = useRef([]);
  const BUFFER_SIZE = 5;
  const neutralCountRef = useRef(0);
  const nonNeutralCountRef = useRef(0);
  const neutralTimeRef = useRef(0);
  const confusionCountRef = useRef(0);
  const negativeCountRef = useRef(0);
  //const tfReadyRef = useRef(false);
  const lastConfusionTriggerRef = useRef(0);
  const lastNoFaceRef = useRef(0);

  // TOP of file
/*async function initTensorFlow() {
  if (tfReadyRef.current) return;
  //await tf.setBackend("webgl");
  try {
    await tf.ready();
    console.log("✅ TensorFlow ready:", tf.getBackend());
    tfReadyRef.current = true;
  } catch (e) {
    console.warn("TensorFlow init skipped", e);
  }
}
  */
  /* =========================
     LOAD MODELS + CAMERA
  ========================= */
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        //await tf.setBackend('webgl');
        //await tf.ready();
        //console.log("TF BACKEND:", tf.getBackend());
        
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models/");
        await faceapi.nets.faceExpressionNet.loadFromUri("/models/");
        console.log("✅ TinyFace + Expression models loaded");


        console.log("Models loaded");

        if (!mounted) return;
        setModelsLoaded(true);

        // request camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
        },
        });

        const videoEl = videoRef.current;
        if (!videoEl) {
          console.error("videoRef missing");
          return;
        }

        videoEl.srcObject = stream;

        // 🔥 Detect camera being blocked mid-video
const videoTrack = stream.getVideoTracks()[0];

videoTrack.onended = () => {
  console.log("🚨 Camera permission revoked during playback");

  setPermissionError("Camera access was revoked.");
  onCameraDenied?.();   // notify parent
};

        // ensure the video element plays (some browsers need explicit play())
        try {
          await videoEl.play();
          console.log("Video play() succeeded");
          console.log("Webcam stream tracks:", stream.getTracks());
        } catch (playErr) {
          console.warn("videoEl.play() rejected; trying muted fallback", playErr);
          videoEl.muted = true;
          try {
            await videoEl.play();
            console.log("Fallback play() succeeded (muted)");
          } catch (err2) {
            console.error("Still cannot play video element", err2);
            setPermissionError("Cannot start webcam playback.");
            return;
          }
        }

        if (!mounted) return;
        setReady(true);
        console.log("Webcam stream started");
      } catch (err) {
  console.error("Camera init failed:", err);
  setPermissionError(err.message || "Camera permission or device error.");
  onCameraDenied?.();   // 🔥 notify parent
}
      //console.log("Webcam stream tracks:", stream.getTracks());
    }

    init();

    return () => {
      mounted = false;
      try {
        if (videoRef.current?.srcObject) {
          videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
        }
      } catch (e) {
        // ignore
      }
    };
  }, []);

  /* =========================
     EMOTION DETECTION LOOP
  ========================= */
function mapEmotion(emotion) {
  switch (emotion) {
    case "HAPPY":
    case "SURPRISED":
      return "ENGAGED";
    case "SAD":
    case "FEARFUL":
      return "CONFUSED";
    case "ANGRY":
      return "STRESSED";
    case "DISGUSTED":
      return "BORED";
    case "NEUTRAL":
      return "NEUTRAL";
    default:
      return emotion;
  }
}

  useEffect(() => {
  if (!ready || !modelsLoaded || !isVideoPlaying) return;

    const interval = setInterval(async () => {
      //if (isDetectionPaused) return;
      const video = videoRef.current;

      if (!video || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) return;

      try {
        const options = new faceapi.TinyFaceDetectorOptions({
  inputSize: 416,
  scoreThreshold: 0.5,
});
const face = await faceapi
  .detectSingleFace(
    video,
     new faceapi.TinyFaceDetectorOptions({
    inputSize: 320,
    scoreThreshold: 0.4,
  })
  )
  .withFaceExpressions();



console.log("FACE RESULT:", face);



        setLastChecked(new Date().toLocaleTimeString());

// ❶ NO FACE
if (!face) {
  setEmotion("NO_FACE");
  setConfidence(null);

  const now = Date.now();

  // prevent repeated triggers
  if (now - lastNoFaceRef.current > 4000) {
    onConfusionDetected?.({ type: "NO_FACE" });
    lastNoFaceRef.current = now;
  }

  return;
}
const expressions = face.expressions;
const [emo, score] = Object.entries(expressions)
  .sort((a, b) => b[1] - a[1])[0];

if (score < 0.55) {
  setEmotion("UNABLE_TO_READ");
  setConfidence(score);
  return;
}

setEmotion(emo.toUpperCase());
setConfidence(score);
//setLastChecked(new Date().toLocaleTimeString());

        //console.log("FACE DETECTED:", face.detection.score);
        //console.log("EXPRESSIONS:", face.expressions);
        /*
        if (!face || face.detection.score < 0.25) {
          setEmotion("NO_FACE");
          setConfidence(null);

          const now = Date.now();
          if (now - lastNoFaceRef.current > 8000) {
            onConfusionDetected?.({ type: "NO_FACE" });
            lastNoFaceRef.current = now;
          }
          setLastChecked(new Date().toLocaleTimeString()); 
          return;
        }
          
         */
        console.log(
          "RAW EXPRESSIONS:",
          face.expressions,
          "FACE SCORE:",
           face.detection.score
        );

        //const [emo, score] = Object.entries(face.expressions)
        //.sort((a, b) => b[1] - a[1])[0];

        const currentEmotion = emo.toUpperCase();
        // push to buffer
        emotionBufferRef.current.push(currentEmotion);
        // keep last 5
        if (emotionBufferRef.current.length > BUFFER_SIZE) {
          emotionBufferRef.current.shift();
        } 

        // find most frequent (mode)
        const counts = {};
        emotionBufferRef.current.forEach(e => {
          counts[e] = (counts[e] || 0) + 1;
        }); 

        const stableEmotion = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])[0][0];

        const mappedEmotion = mapEmotion(stableEmotion);
        setEmotion(mappedEmotion);
        setConfidence(score);
        console.log("LOGGING EMOTION FOR SESSION:", localStorage.getItem("session_id"));
        // ✅ ALWAYS log emotion (not only when confused)
        apiRequest("/emotions/log", {
          method: "POST",
          body: JSON.stringify({
            emotion: mappedEmotion,
            confidence: score,
            session_id: sessionId,
            timestamp: Date.now(),
  }),
});
        if (stableEmotion === "NEUTRAL") {
          neutralTimeRef.current += 1.5;
        } else {
          neutralTimeRef.current = 0;
        }
      if (["SAD", "FEARFUL", "ANGRY"].includes(stableEmotion)) {
        negativeCountRef.current += 1;
      } else {
        negativeCountRef.current = 0;
      }

      // Trigger confusion
      const now = Date.now();
      if (neutralTimeRef.current >= 6 && now - lastConfusionTriggerRef.current > 10000) {
        onConfusionDetected?.({ type: "NEUTRAL" });
        lastConfusionTriggerRef.current = now;
        neutralTimeRef.current = 0;
      }

      if (negativeCountRef.current >= 3 && now - lastConfusionTriggerRef.current > 10000) {
        onConfusionDetected?.({
          type: "EXPLAIN",
          emotion: mappedEmotion,
          timestamp: Date.now(),
          });
          lastConfusionTriggerRef.current = now;
          negativeCountRef.current = 0;
          apiRequest("/emotions/log", {
            method: "POST",
            body: JSON.stringify({
              emotion: mappedEmotion,
              confidence: score,
              session_id: localStorage.getItem("session_id"),
              timestamp: Date.now(),
            }),
        });


      }
      } catch (err) {
        console.error("Detection skipped safely:", err?.message || err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [ready, modelsLoaded, isVideoPlaying]);

  // ✅ ADD HERE
  const emotionClass =
    emotion === "ENGAGED" ? "emotion-engaged" :
    emotion === "CONFUSED" ? "emotion-confused" :
    emotion === "STRESSED" ? "emotion-stressed" :
    emotion === "BORED" ? "emotion-bored" :
    "emotion-neutral";

  const pulseClass =
    emotion === "CONFUSED" || emotion === "STRESSED"
      ? "pulse"
      : "";

  return (
    <>
      {/* 🎥 Webcam Block */}
      <div className="emotion-container">
        <div className="webcam-box">
          <div className="emotion-title">Live Webcam</div>

          <video
            ref={videoRef}
            className="webcam-video"
            autoPlay
            playsInline
            muted
          />
          <div className="emotion-meta">
            Models loaded: {modelsLoaded ? "yes" : "no"} — Last checked: {lastChecked ?? "never"}
          </div>

          {permissionError && (
          <div className="emotion-error">
              Camera problem: {permissionError}
            </div>
          )}
        </div>

        {/* 🧠 Emotion Explanation Block */}
        <div className={`emotion-box ${emotionClass} ${pulseClass}`}>
          <div className="emotion-title">DETECTED EMOTION</div>

          <div className="emotion-value">{emotion}</div>

          {confidence != null && (
            <>
              <div className="progress-bar">
                <div 
  className="progress-fill"
  style={{ width: `${confidence * 100}%` }}
/>
              </div>

              <div className="emotion-meta">{(confidence * 100).toFixed(1)}% confidence</div>
            </>
          )}

          <div className="emotion-description">
            {
  emotion === "NO_FACE"
    ? "No face detected. Please look at the screen."
    : emotion === "UNABLE_TO_READ"
    ? "Face detected but emotion unclear. Adjust lighting / camera."
    : EMOTION_EXPLANATION[emotion]
}

          </div>
        </div>
      </div>
    </>
  );
}
