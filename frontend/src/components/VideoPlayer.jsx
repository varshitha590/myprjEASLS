export default function VideoPlayer({ src }) {
  return (
    <div>
      <h3>Learning Video</h3>
      <video controls width="640">
        <source src={src} type="video/mp4" />
        Your browser does not support video.
      </video>
    </div>
  );
}
