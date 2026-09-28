import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

/* FORMAT VIDEO DURATION */
function formatDuration(sec){
  if(!sec) return "-";

  const m = Math.floor(sec/60);
  const s = sec % 60;

  return `${m}:${s.toString().padStart(2,"0")}`;
}

function getYouTubeThumbnail(url){
  try{
    const id = new URL(url).searchParams.get("v");
    if(!id) return null;
    return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  }catch{
    return null;
  }
}

export default function AdminVideos(){

const [videos,setVideos] = useState([]);

async function loadVideos(){
  const data = await apiRequest("/api/videos");
  setVideos(data);
}

useEffect(()=>{
  loadVideos();
},[]);

async function deleteVideo(id){

  if(!confirm("Delete this video?")) return;

  await apiRequest(`/api/videos/${id}`,{
    method:"DELETE"
  });

  loadVideos();
}

return(

<div className="p-8">

<h2 className="text-2xl font-semibold mb-6">Video Management</h2>

<table className="w-full text-sm">

<thead className="border-b border-gray-700 text-gray-400">

<tr>
<th className="text-left py-2">Title</th>
<th>Duration</th>
<th>Uploaded</th>
<th>URL</th>
<th>Action</th>
</tr>

</thead>

<tbody>

{videos.map(v=>(

<tr key={v.id} className="border-b border-gray-800 hover:bg-slate-900">

<td className="py-3 flex items-center gap-3">

<img
src={getYouTubeThumbnail(v.video_url)}
alt="thumbnail"
className="w-20 h-12 object-cover rounded"
/>

<span>{v.title}</span>

</td>

<td>
{formatDuration(v.duration_seconds)}
</td>

<td>
{v.created_at
 ? new Date(v.created_at).toLocaleDateString()
 : "-"}
</td>

<td className="text-blue-400 truncate max-w-[420px]">
{v.video_url}
</td>

<td>
<button
onClick={()=>deleteVideo(v.id)}
className="text-red-400 hover:text-red-600 font-medium"
>
Delete
</button>
</td>

</tr>

))}

</tbody>

</table>

</div>

);

}