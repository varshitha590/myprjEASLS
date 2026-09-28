import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
/*
export default function AdminUsers(){

const [users,setUsers] = useState([]);

useEffect(()=>{

apiRequest("/api/analytics/users")
.then(setUsers);

},[]);

return(

<div className="p-8">

<h2 className="text-2xl font-semibold mb-6">Users</h2>

<table className="w-full text-sm">

<thead className="border-b border-gray-700 text-gray-400">

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
<td>{risk}</td>

</tr>

);

})}

</tbody>

</table>

</div>

);

}
*/
export default function AdminSettings(){

return(

<div className="p-8">
<h2 className="text-2xl font-semibold mb-6">
Settings
</h2>

<div className="bg-slate-900 border border-slate-800 rounded-lg p-6">

<h3 className="text-lg font-semibold mb-4">
Platform Settings
</h3>

<p className="text-gray-400 mb-4">
This section will contain system configuration for the platform.
</p>

<div className="space-y-4">

<div className="flex justify-between border-b border-slate-800 pb-3">
<span>Emotion Detection Model</span>
<span className="text-green-400">Active</span>
</div>

<div className="flex justify-between border-b border-slate-800 pb-3">
<span>Analytics Collection</span>
<span className="text-green-400">Enabled</span>
</div>

<div className="flex justify-between">
<span>API Status</span>
<span className="text-green-400">Online</span>
</div>

</div>

</div>

</div>

);

}