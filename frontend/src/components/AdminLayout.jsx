import { useNavigate, useLocation, Outlet } from "react-router-dom";

import {
  FiPieChart,
  FiUsers,
  FiVideo,
  FiSettings
} from "react-icons/fi";

export default function AdminLayout(){

const navigate = useNavigate();
const location = useLocation();

return(

<div className="min-h-screen flex bg-[#0f172a] text-gray-100">

{/* SIDEBAR */}

<aside className="
w-64
bg-gradient-to-b
from-[#0f172a]
via-[#0b1220]
to-[#020617]
border-r border-white/5
flex flex-col
shadow-[0_0_40px_rgba(99,102,241,0.15)]
">

<div className="flex-1">

<div className="px-6 py-6 border-b border-gray-800">
<h1 className="text-xl font-semibold">EASLS Admin</h1>
</div>

<nav className="p-4 space-y-2 text-sm">

<SidebarItem
icon={<FiPieChart/>}
label="Dashboard"
active={location.pathname==="/admin-dashboard"}
onClick={()=>navigate("/admin-dashboard")}
/>

<SidebarItem
icon={<FiUsers/>}
label="Users"
active={location.pathname==="/admin-users"}
onClick={()=>navigate("/admin-users")}
/>

<SidebarItem
icon={<FiVideo/>}
label="Videos"
active={location.pathname==="/admin-videos"}
onClick={()=>navigate("/admin-videos")}
/>

<SidebarItem
icon={<FiSettings/>}
label="Settings"
active={location.pathname==="/admin-settings"}
onClick={()=>navigate("/admin-settings")}
/>

</nav>

</div>

<div className="px-6 py-4 text-xs text-gray-500 border-t border-gray-800">
© 2026 EASLS AI Platform
</div>

</aside>

{/* PAGE CONTENT */}

<div className="flex-1 overflow-y-auto">
<Outlet/>
</div>

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