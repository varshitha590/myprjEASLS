import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import YouTube from "react-youtube";
import WebcamEmotion from "../components/WebcamEmotion";
import ConfusionAssistant from "../components/ConfusionAssistant";
import { apiRequest } from "../services/api";
import "../styles/WatchVideo.css";
import { supabase } from "../lib/supabase";

/* 🔧 Utility: extract YouTube videoId from URL */
function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:.*v=|v\/|embed\/)|youtu\.be\/)([^?&]+)/
  );
  return match ? match[1] : null;
}




export default function WatchVideo() {
  const { id: videoId } = useParams();

  const [video, setVideo] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transcript, setTranscript] = useState([]);
  const [playVideo, setPlayVideo] = useState(false);
  const [enableCamera, setEnableCamera] = useState(false); // ✅ HERE
  const [showPopup, setShowPopup] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [explanations, setExplanations] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeLine, setActiveLine] = useState(0);
  const [transcriptData, setTranscriptData] = useState([]);
  const [popupType, setPopupType] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [cameraDenied, setCameraDenied] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const neutralCountRef = useRef(0);
  const transcriptRef = useRef(null);
  const popupActiveRef = useRef(false);
  const playerRef = useRef(null);
  const lastNoFaceRef = useRef(0);
  const lastSpeechRef = useRef(0);
  const [isDetectionPaused, setIsDetectionPaused] = useState(false);
useEffect(() => {
  if (!transcriptRef.current) return;

  const activeElement =
    transcriptRef.current.querySelector(".active");

  if (activeElement) {
    activeElement.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
}, [activeLine]);

useEffect(() => {
  if (!transcriptData.length) return;

  const index = transcriptData.findIndex((line, i) => {
    const next = transcriptData[i + 1];
    return (
      currentTime >= line.time &&
      (!next || currentTime < next.time)
    );
  });

  if (index !== -1 && index !== activeLine) {
    setActiveLine(index);
  }
}, [currentTime, transcriptData]);

  
  console.log("🔥 WebcamEmotion mounted");
  
  /* =====================
     INIT VIDEO + SESSION
     ===================== */
  useEffect(() => {
    let started = false;

    async function init() {
      if (started) return;
      started = true;

      try {
        const videoData = await apiRequest(`/api/videos/${videoId}`);
        setVideo(videoData);
        console.log("VIDEO FROM API:", videoData);


        // NOTE: backend mounts session routes under /sessions
        const {
          data: { session }
        } = await supabase.auth.getSession();

        const userId = session?.user?.id;
        const email = session?.user?.email;
        if (!userId || !email) {
          throw new Error("User not authenticated");
        }
/*
        const res = await apiRequest("/sessions/start", {
          method: "POST",
          body: JSON.stringify({
            video_id: videoId,
            user_id: session.user.id,
            email: session.user.email, // 👈 ADD THIS
          }),
        });
        */
        /*
        const sessionRes = res;
        if (!sessionRes?.session?.id) {
          throw new Error("Session ID not returned from backend");
        }

        setSessionId(sessionRes.session.id);
        */
        // localStorage.setItem("session_id", sessionRes.session.id);

        // backend returns: { message: "Session started", session: { id, started_at } }
        const res = await apiRequest("/sessions/start", {
          method: "POST",
          body: JSON.stringify({
            video_id: videoId,
            user_id: session.user.id,
            email: session.user.email,
          }),
      });

        
        if (res?.session?.id) {
          setSessionId(res.session.id);
          localStorage.setItem("session_id", res.session.id);
          console.log("SESSION ID SET:", res.session.id);
        } else {
          console.error("Could not extract session id from response:", res);
          return;    
        }
      } catch (err) {
        console.error("Init failed", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [videoId]);
  /* =====================
   LOAD TRANSCRIPT
===================== */
/*
useEffect(() => {
  async function loadTranscript() {
    try {
      console.log("Loading transcript for:", videoId);

      const data = await apiRequest(`/api/transcripts/${videoId}`);

      console.log("Transcript loaded:", data);

      if (!data || data.length === 0) {
        console.warn("No transcript found");
        return;
      }

     const rawText = data[0].text;

      const regex =
        /(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})\s+([\s\S]*?)(?=\d{2}:\d{2}:\d{2},\d{3} -->|$)/g;

      const formatted = [];
*/
useEffect(() => {
  async function loadTranscript() {
    try {
      console.log("Loading transcript for:", videoId);

      const data = await apiRequest(`/api/transcripts/${videoId}`);

      console.log("Transcript rows:", data);

      if (!data || data.length === 0) {
  setTranscriptData([{ time: 0, text: "Transcript not available for this video." }]);
  return;
}

      const formatted = data.map((row) => ({
        time: row.start_time,
        text: row.text
      }));

      setTranscriptData(formatted);

    } catch (err) {
      console.error("Transcript load error:", err);
    }
  }

  if (videoId) loadTranscript();

}, [videoId]);
/*

      function timeToSeconds(time) {
        const [h, m, s] = time.replace(",", ".").split(":");
        return (
          parseInt(h) * 3600 +
          parseInt(m) * 60 +
          parseFloat(s)
        );
      }

      let match;

      while ((match = regex.exec(rawText)) !== null) {
        formatted.push({
          time: timeToSeconds(match[1]),
          text: match[3].replace(/\n/g, " ").trim(),
        });
      }

      console.log("Formatted transcript:", formatted);

      setTranscriptData(formatted);

    } catch (err) {
      console.error("Transcript load error:", err);
    }
  }

  if (videoId) loadTranscript();

}, [videoId]);
*/


useEffect(() => {
  let animationFrame;

  const updateTime = () => {
    if (playerRef.current && !showPopup) {
      const time = playerRef.current.getCurrentTime();
      setCurrentTime(time);
    }
    animationFrame = requestAnimationFrame(updateTime);
  };

  if (playVideo) {
    animationFrame = requestAnimationFrame(updateTime);
  }

  return () => cancelAnimationFrame(animationFrame);
}, [playVideo, showPopup]);


  /* =====================
     END SESSION ON LEAVE
     ===================== */
  useEffect(() => {
    return () => {
      if (sessionId) {
        fetch("http://localhost:5000/sessions/end", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ session_id: sessionId }),
        }).catch(console.error);
      }
    };
  }, [sessionId]);

  async function onPlayerReady(e) {
    playerRef.current = e.target;
    setEnableCamera(true);

    try {
      const {
      data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      /*
      const res = await apiRequest("/sessions/start", {
        method: "POST",
        body: JSON.stringify({
          video_id: videoId,
          user_id: session.user.id,
          email: session.user.email,
        }),
      });
      setSessionId(res.session.id);
      localStorage.setItem("session_id", res.session.id);
      */
    } catch (err) {
    console.error("Session start failed", err);
  }
}

  /*
  function handleConfusionDetected(payload) {
    const now = Date.now();
    if (now - lastSpeechRef.current < 10000) return;
    lastSpeechRef.current = now;

    if (!playerRef.current) return;
    
    if (payload?.type === "NO_FACE") {
      playerRef.current.pauseVideo();
      setShowPopup(true);
      speechSynthesis.speak(
        new SpeechSynthesisUtterance("I can't see you. Please focus on the screen.")
      );
      return;
    }

    if (payload?.type === "NEUTRAL") {
      playerRef.current.pauseVideo();
      setShowPopup(true);
      speechSynthesis.speak(
        new SpeechSynthesisUtterance("You might be confused. Focus here.")
      );
      return;
    }
    if (payload?.type === "EXPLAIN") {
      if (!transcriptData.length) {
        console.warn("Transcript not ready yet");
        return;
      }

      playerRef.current?.pauseVideo();
      setShowAssistant(true);
      const explanation =
        payload.emotion === "CONFUSED"
          ? "You seem confused. Let’s break this concept into simple steps with an example."
          : payload.emotion === "STRESSED"
          ? "You look stressed. Let’s slow down and explain this in an easier way."
          : "Here’s a simpler explanation to help you understand better.";
      setSideExplanation(explanation);
    }
  }
*/
  function handleConfusionDetected(payload) {
  if (!playerRef.current) return;

  const now = Date.now();

  /* ============================= */
  /* 🚨 NO FACE → Immediate Alert */
  /* ============================= */
  if (payload?.type === "NO_FACE") {
    neutralCountRef.current = 0; // reset neutral counter

    // Prevent rapid repeat alerts
    if (now - lastNoFaceRef.current < 5000) return;
    lastNoFaceRef.current = now;

    playerRef.current.pauseVideo();

    setPopupType("NO_FACE");
    setShowPopup(true);
    setIsDetectionPaused(true);

    speechSynthesis.cancel();
    speechSynthesis.speak(
      new SpeechSynthesisUtterance(
        "Unable to see you. Please adjust your camera."
      )
    );

    return;
  }

  /* ====================================== */
  /* 🟡 NEUTRAL → Only after 5 consecutive */
  /* ====================================== */
  if (payload?.type === "NEUTRAL") {
    neutralCountRef.current += 1;

    console.log("Neutral count:", neutralCountRef.current);

    if (neutralCountRef.current < 5) return;

    neutralCountRef.current = 0; // reset after triggering

    playerRef.current.pauseVideo();

    setPopupType("DISTRACTION");
    setShowPopup(true);
    setIsDetectionPaused(true);

    speechSynthesis.cancel();
    speechSynthesis.speak(
      new SpeechSynthesisUtterance(
        "You seem distracted. Please focus on the video."
      )
    );

    return;
    
  }
  neutralCountRef.current = 0;
  // 🧠 Confusion → show assistant
  if (payload?.type === "EXPLAIN") {
      if (!transcriptData.length) {
        console.warn("Transcript not ready yet");
        return;
      }

      playerRef.current?.pauseVideo();
      setShowAssistant(true);
      const explanation =
        payload.emotion === "CONFUSED"
          ? "You seem confused. Let’s break this concept into simple steps with an example."
          : payload.emotion === "STRESSED"
          ? "You look stressed. Let’s slow down and explain this in an easier way."
          : "Here’s a simpler explanation to help you understand better.";
      //setSideExplanation(explanation);
    }
  }


  function handlePopupOk() {
    popupActiveRef.current = false;
    setShowPopup(false);
    setIsDetectionPaused(false);
    speechSynthesis.cancel();
    playerRef.current?.playVideo();
  }

  function resumeVideo() {
    setShowAssistant(false);
    playerRef.current?.playVideo();
  }

  async function endSession() {
    if (!sessionId) return;
    await apiRequest("/sessions/end", {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId }),
    });
  }

  if (loading) return <p className="wv-loading">Loading learning session…</p>;
  if (!video) return <p className="wv-error">Video not found.</p>;
  const ytId = extractYouTubeId(video.video_url);
  if (!ytId) return <p className="wv-error">Invalid YouTube URL.</p>;


  const thumbnailUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;

  return (
    <div className="wv-page">
      <header className="wv-header">
        <h1>{video.title}</h1>
        <p>{video.description}</p>
      </header>

      <section className="wv-layout">

  {/* LEFT COLUMN */}
  <div className="wv-left">

    {/* VIDEO */}
    <div className="wv-video">
      {!playVideo ? (
        <div
  className="wv-thumbnail"
  onClick={() => {
    if (cameraDenied) {
      alert("Camera access is required to watch this video.");
      return;
    }
    setPlayVideo(true);
  }}
>
          <img src={thumbnailUrl} alt="Video thumbnail" />
          <div className="wv-play">▶</div>
        </div>
      ) : (
        <YouTube
          videoId={ytId}
          onReady={onPlayerReady}
          onEnd={() => {
  endSession();
  setSessionEnded(true);
}}
          onStateChange={(event) => {
            if (event.data === 1) {
              setIsVideoPlaying(true);   // Playing
            } else {
              setIsVideoPlaying(false);  // Paused / ended / buffering
           }
          }}
          opts={{
            width: "100%",
            height: "360",
            playerVars: {
              autoplay: 1,
              origin: window.location.origin,
            },
          }}
        />
      )}
    </div>

    {/* TRANSCRIPT BELOW VIDEO */}
    <div className="wv-transcript">
      <h3>Live Transcript</h3>
      <div className="transcript-box" ref={transcriptRef}>
        {transcriptData.map((line, index) => (
          <p
            key={index}
            className={
              index === activeLine
                ? "transcript-line active"
                : "transcript-line"
            }
          >
            {line.text}
          </p>
        ))}
      </div>
    </div>

  </div>



  {sessionEnded && sessionId && (
  <div
    style={{
      marginTop: "20px",
      padding: "16px",
      background: "#022c22",
      borderRadius: "10px",
      textAlign: "center"
    }}
  >
    <h3 style={{ color: "#4ade80", marginBottom: "10px" }}>
      🎉 Session Completed
    </h3>

    <button
      onClick={() =>
        window.open(`/report/${sessionId}`, "_blank")
      }
      style={{
        padding: "10px 18px",
        background: "#22c55e",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "500"
      }}
    >
      📄 Download Learning Report
    </button>
  </div>
)}


  {/* RIGHT COLUMN */}
  <div className="wv-right">

    {/* SIMPLIFIED EXPLANATION */}
    <div className="wv-explanation">
      <h3>Simplified Explanation</h3>

      {explanations.length === 0 && (
  <p className="wv-placeholder">
    When confusion is detected, explanation will appear here.
  </p>
)}

{explanations.map((item, index) => (
  <div
    key={index}
    className="wv-text"
    style={{
      marginBottom: "16px",
      padding: "10px",
      background: "rgba(56,189,248,0.05)",
      borderRadius: "8px"
    }}
  >
    <div style={{ fontSize: 11, opacity: 0.6 }}>
      ⏱ At {Math.floor(item.time)} seconds
    </div>
    {item.text}
  </div>
))}
    </div>

    {/* WEBCAM BELOW EXPLANATION */}
    {enableCamera && playVideo && sessionId && (
      <div className="wv-webcam-wrapper">
        <WebcamEmotion
  sessionId={sessionId}
  onConfusionDetected={handleConfusionDetected}
  isVideoPlaying={isVideoPlaying}
  onCameraDenied={() => {
  setCameraDenied(true);

  if (playerRef.current) {
    playerRef.current.pauseVideo();
  }

  setIsVideoPlaying(false);
  setPlayVideo(false);
}}
/>
      </div>
    )}

  </div>

</section>

      {/* WEBCAM: mount only after playVideo AND sessionId exist */}
      

      {sessionId && (
        <div
          style={{
            marginTop: 12,
            padding: 10,
            background: "#020617",
            color: "#93c5fd",
            borderRadius: 8,
            fontSize: 12,
          }}
        >
          <div>Session ID: {sessionId}</div>
          <div>Video Playing: {String(playVideo)}</div>
        </div>
    )}


      {showPopup && (
  <div className="wv-popup-overlay">
    <div className="wv-popup-coach">
      <div className="wv-popup-icon">
        {popupType === "NO_FACE" ? "📷" : "⚠️"}
      </div>

      {cameraDenied && (
  <div className="wv-popup-overlay">
    <div className="wv-popup-coach">
      <div className="wv-popup-icon">📷</div>
      <h3>Camera Access Lost</h3>
      <p>
        Camera access was revoked. Video playback is stopped.
        Please allow camera permission to continue.
      </p>
      <button onClick={() => window.location.reload()}>
        Re-enable Camera
      </button>
    </div>
  </div>
)}

      {popupType === "NO_FACE" && (
        <>
          <h3>Camera Not Detected</h3>
          <p>
            Unable to see you. Please adjust your camera and make sure your face is visible.
          </p>
        </>
      )}

      {popupType === "DISTRACTION" && (
        <>
          <h3>Attention Needed</h3>
          <p>
            You might be distracted. Please focus on the video.
          </p>
        </>
      )}

      <button onClick={handlePopupOk}>OK</button>
    </div>
  </div>
)}

      <ConfusionAssistant
        open={showAssistant && transcriptData.length > 0}
        videoId={videoId}
        transcriptLine={transcriptData[activeLine]?.text || transcriptData[0]?.text}
        emotion="CONFUSED"
   // ✅ ADD THIS LINE
        onClose={() => setShowAssistant(false)}
        onResume={resumeVideo}
        onExplanationGenerated={(newExplanation) => {
  setExplanations(prev => [
    ...prev,
    {
      text: newExplanation,
      time: currentTime
    }
  ]);
}}
      />
    </div>
  );
}
