import { useEffect, useState } from "react";
import { connectEmotionSocket, disconnectEmotionSocket } from "../services/emotionSocket";

export default function useEmotionStream() {
  const [emotion, setEmotion] = useState("Neutral");

  useEffect(() => {
    connectEmotionSocket((data) => {
      setEmotion(data.emotion);
    });

    return () => disconnectEmotionSocket();
  }, []);

  return emotion;
}
