export function extractYouTubeId(url) {
  if (!url) return null;

  const match = url.match(
    /(?:youtube\.com\/(?:.*v=|v\/|embed\/)|youtu\.be\/)([^?&]+)/
  );

  return match ? match[1] : null;
}

