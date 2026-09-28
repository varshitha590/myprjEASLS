let socket;

export function connectEmotionSocket(onMessage) {
  socket = new WebSocket("ws://localhost:5000/emotions");

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };
}

export function disconnectEmotionSocket() {
  if (socket) socket.close();
}
