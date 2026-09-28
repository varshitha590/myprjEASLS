import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import CountUp from "react-countup";
import { useNavigate, useLocation } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import {
  FiPieChart,
  FiUsers,
  FiVideo,
  FiSettings,
  FiSearch,
  FiBell,
  FiTrash,
  FiPlus
} from "react-icons/fi";

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

const COLORS = ["#6366f1","#06b6d4","#10b981","#f59e0b"];

export default function AdminDashboard(){

const [stats,setStats] = useState(null);
const [activity,setActivity] = useState([]);
const [videos,setVideos] = useState([]);
const [users,setUsers] = useState([]);
const [range,setRange] = useState("all");

const [showModal,setShowModal] = useState(false);
const [videoTitle,setVideoTitle] = useState("");
const [videoUrl,setVideoUrl] = useState("");
const [urlError, setUrlError] = useState("");
const [videoDuration, setVideoDuration] = useState(0);

const navigate = useNavigate();
const location = useLocation();


const [selectedFile, setSelectedFile] = useState(null);


useEffect(()=>{

async function loadData(){

try{

const overview = await apiRequest(`/api/analytics/admin-overview?range=${range}`);
setStats(overview || {});

const act = await apiRequest(`/api/analytics/recent-activity`);
setActivity(act || []);

const vids = await apiRequest(`/api/videos`);

if (Array.isArray(vids)) {
  setVideos(vids);
} else {
  setVideos([vids]);
}
const usr = await apiRequest(`/api/analytics/users`);
setUsers(usr || []);

}catch(err){
console.error("Dashboard load failed:",err);
}

}

loadData();   // ← THIS LINE WAS MISSING

},[range]);

if (!stats) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
      Loading dashboard...
    </div>
  );
}

const emotionData =
stats.emotionDistribution?.map(e=>({
name:e.emotion,
value:Number(e.count)
})) || [];

const engagementData =
stats.engagementTrend?.map(e=>({
date:e.date.split("T")[0],
current:Number(e.current_avg||0),
previous:Number(e.previous_avg||0)
})) || [];

async function fetchYouTubeMeta(url){
  try{

    const res = await apiRequest(
      `/api/videos/meta?url=${encodeURIComponent(url)}`
    );

    if(res?.title){
      setVideoTitle(res.title);
    }

    if(res?.duration){
      setVideoDuration(res.duration);
    }

  }catch(err){
    console.error("Meta fetch failed");
  }
}

async function handleUpload(){

  setUrlError(""); // reset error

  // 🔍 frontend check
  const alreadyExists = videos.some(
    v => v.video_url === videoUrl
  );

  if(alreadyExists){
    setUrlError("This video already exists");
    return;
  }

  try{

    const formData = new FormData();

formData.append("title", videoTitle);
formData.append("video_url", videoUrl);
formData.append("duration_seconds", videoDuration);

// optional (only if file exists later)
if (selectedFile) {
  formData.append("transcript", selectedFile);
}

const res = await fetch("http://localhost:5000/api/videos", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`
  },
  body: formData
});

if (!res.ok) {
  const errText = await res.text();
  console.error("UPLOAD ERROR:", errText);
  throw new Error("Upload failed");
}

    // success
    setShowModal(false);
    setVideoTitle("");
    setVideoUrl("");
    setUrlError("");
    setVideoDuration(0);

    const vids = await apiRequest("/api/videos");
    setVideos(vids);

  }catch(err){

    if(err.message?.includes("409")){
      setUrlError("This video is already uploaded");
    }else{
      setUrlError("Upload failed. Try again.");
    }

  }

}

async function deleteVideo(id){

await apiRequest(`/api/videos/${id}`,{method:"DELETE"});
setVideos(videos.filter(v=>v.id!==id));

}

return(

<div className="min-h-screen flex bg-[#0f172a] text-gray-100">

{/* MAIN AREA */}

<div className="flex-1 flex flex-col">

{/* TOP BAR */}

<div className="h-20 bg-[#111827] border-b border-gray-800 flex items-center justify-between px-8">

<div>
<h2 className="text-2xl font-semibold">Dashboard Overview</h2>
<p className="text-sm text-gray-400">
Monitor platform performance and engagement
</p>
</div>

<div className="flex items-center gap-4">

<div className="relative">
<FiSearch className="absolute top-3 left-3 text-gray-400"/>
<input
placeholder="Search..."
className="w-64 bg-[#1f2937] pl-9 pr-4 py-2 rounded-lg text-sm border border-gray-700"
/>


</div>

<button
onClick={()=>setShowModal(true)}
className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700"
>
<FiPlus/> Add Video
</button>

<FiBell className="text-gray-400 cursor-pointer"/>

<div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center">
A
</div>

</div>

</div>

{/* CONTENT */}

<div className="p-8 space-y-10 overflow-y-auto">

{/* KPI */}

<div className="grid md:grid-cols-4 gap-6">

<KPI title="Total Users" value={stats.totalUsers}/>
<KPI title="Total Sessions" value={stats.totalSessions}/>
<KPI title="Avg Engagement" value={Math.round(stats.avgEngagement*100)} percent/>
<KPI title="Confusion Events" value={stats.confusionEvents}/>

</div>

{/* CHARTS */}

<div className="grid md:grid-cols-2 gap-6">

<Panel title="Emotion Distribution">

<ResponsiveContainer width="100%" height={250}>

<PieChart>

<Pie
data={emotionData}
dataKey="value"
outerRadius={90}
isAnimationActive={true}
animationDuration={800}
>

{emotionData.map((_,i)=>(
<Cell key={i} fill={COLORS[i%COLORS.length]}/>
))}

</Pie>

<Tooltip/>

</PieChart>

</ResponsiveContainer>

</Panel>

<Panel title="Engagement Trend">

<ResponsiveContainer width="100%" height={250}>

<LineChart data={engagementData}>

<CartesianGrid strokeDasharray="3 3" stroke="#1f2937"/>

<XAxis dataKey="date" stroke="#9ca3af"/>
<YAxis/>

<Tooltip/>

<Line
type="monotone"
dataKey="current"
stroke="#6366f1"
strokeWidth={3}
dot={{ r: 4 }}
activeDot={{ r: 6 }}
isAnimationActive={true}
/>
<Line type="monotone" dataKey="previous" stroke="#06b6d4" strokeDasharray="5 5"/>

</LineChart>

</ResponsiveContainer>

</Panel>

</div>

{/* VIDEO TABLE */}

<Panel title="Video Management">

<table className="w-full text-sm">

<thead className="text-gray-400 border-b border-gray-700">

<tr>
<th className="py-2 text-left">Title</th>
<th>Duration</th>
<th>Uploaded</th>
<th></th>
</tr>

</thead>

<tbody>

{videos.map(v=>(
<tr key={v.id} className="border-b border-gray-800">

<td className="py-3">{v.title}</td>
<td>
{formatDuration(v.duration_seconds)}
</td>
<td>{new Date(v.created_at || Date.now()).toLocaleDateString()}</td>

<td>
<button
onClick={()=>deleteVideo(v.id)}
className="text-red-400 hover:text-red-600"
>
<FiTrash/>
</button>
</td>

</tr>
))}

</tbody>

</table>

</Panel>

{/* USER TABLE */}

<Panel title="User Engagement">

<table className="w-full text-sm">

<thead className="text-gray-400 border-b border-gray-700">

<tr>
<th>User</th>
<th>Sessions</th>
<th>Avg Engagement</th>
<th>Risk</th>
</tr>

</thead>

<tbody>

{users.map(u=>{

const risk =
u.avg_engagement < 0.4
? "High"
: u.avg_engagement < 0.7
? "Medium"
: "Healthy";

return(

<tr key={u.id} className="border-b border-gray-800">

<td className="py-3">{u.email}</td>
<td>{u.total_sessions}</td>
<td>{Math.round(u.avg_engagement*100)}%</td>

<td className={
risk==="High"
?"text-red-400"
:risk==="Medium"
?"text-yellow-400"
:"text-green-400"
}>
{risk}
</td>

</tr>

);

})}

</tbody>

</table>

</Panel>

{/* ACTIVITY */}

<Panel title="Recent Activity">

<ul className="space-y-3 text-sm text-gray-400">

{activity.map((item,i)=>(
<li key={i}>{item.message}</li>
))}

</ul>

</Panel>

</div>

</div>

{/* MODAL */}

{showModal && (

<div className="fixed inset-0 bg-black/50 flex items-center justify-center">

<div className="bg-[#111827] p-6 rounded-xl w-[420px]">

<h3 className="text-lg font-semibold mb-4">Add New Video</h3>

<input
value={videoTitle}
onChange={e=>setVideoTitle(e.target.value)}
placeholder="Video Title"
className="w-full mb-3 p-2 bg-[#1f2937] border border-gray-700 rounded"
/>

<input
  value={videoUrl}
  onChange={e=>{
  const value = e.target.value;

  setVideoUrl(value);
  setUrlError("");

  const isValid =
    value.includes("youtube.com/watch") ||
    value.includes("youtu.be/");

  if(isValid && value.length > 15){
  fetchYouTubeMeta(value);
}
}}
  placeholder="YouTube URL"
  className={`w-full p-2 bg-[#1f2937] border rounded 
  ${urlError ? "border-red-500" : "border-gray-700"}`}
/>

{urlError && (
  <p className="text-red-400 text-sm mt-1 mb-3">
    ⚠️ {urlError}
  </p>
)}

<input
  type="file"
  accept=".srt"
  onChange={(e)=>setSelectedFile(e.target.files[0])}
  className="mb-3"
/>

{videoUrl && getYouTubeThumbnail(videoUrl) && (

<div className="mb-4">

<img
src={getYouTubeThumbnail(videoUrl)}
alt="preview"
className="w-full h-48 object-cover rounded-lg border border-gray-700"
/>

{videoDuration > 0 && (
  <div className="mt-2 text-sm text-gray-300 flex justify-between">
    <span>Duration:</span>
    <span className="text-indigo-400 font-medium">
      {formatDuration(videoDuration)}
    </span>
  </div>
)}

</div>

)}

<div className="flex justify-end gap-3">

<button
onClick={()=>setShowModal(false)}
className="px-4 py-2 bg-gray-700 rounded"
>
Cancel
</button>

<button
  onClick={handleUpload}
  className="px-4 py-2 bg-indigo-600 rounded"
>
  Upload
</button>

</div>

</div>

</div>

)}

</div>

);

}

function SidebarItem({icon,label,active,onClick}){

return(

<button
onClick={onClick}
className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200
${active
? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg"
: "text-gray-400 hover:bg-white/5 hover:text-white"
}`}
>

{icon}
{label}

</button>

);

}

function KPI({ title, value, percent }) {

return (

<div className="
glass
rounded-xl
p-6
border border-white/5
transition-all
duration-300
hover:-translate-y-1
hover:shadow-[0_0_35px_rgba(124,58,237,0.35)]
">

<p className="text-sm text-gray-400">{title}</p>

<h3 className="text-3xl font-semibold mt-2 text-white">
<CountUp end={value}/>
{percent && "%"}
</h3>

</div>

);
}

function Panel({title,children}){

return(

<div className="
glass
rounded-xl
p-6
border border-white/5
shadow-[0_0_30px_rgba(0,0,0,0.3)]
transition-all
hover:shadow-[0_0_35px_rgba(99,102,241,0.2)]
">

<h3 className="text-sm font-semibold mb-4 text-gray-300">{title}</h3>

{children}

</div>

);

}