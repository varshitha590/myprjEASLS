import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

export default function AdminUsers(){

const [users,setUsers] = useState([]);

async function loadUsers(){
  const data = await apiRequest("/api/analytics/users");
  setUsers(data);
}

useEffect(()=>{
  loadUsers();
},[]);

async function toggleBlock(user){

  if(user.is_blocked){

    await apiRequest(`/api/admin/users/${user.id}/unblock`,{
      method:"PATCH"
    });

  }else{

    await apiRequest(`/api/admin/users/${user.id}/block`,{
      method:"PATCH"
    });

  }

  loadUsers();
}

return(

<div className="p-8">

<h2 className="text-2xl font-semibold mb-6">Users</h2>

<table className="w-full text-sm">

<thead className="border-b border-gray-700 text-gray-400">

<tr className="text-left">
<th className="py-3 pr-6">User</th>
<th className="py-3 pr-6">Sessions</th>
<th className="py-3 pr-6">Avg Engagement</th>
<th className="py-3 pr-6">Risk</th>
<th className="py-3 pr-6">Status</th>
<th className="py-3">Action</th>
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

<tr key={u.id} className="border-b border-gray-800 hover:bg-slate-900">

<td className="py-3 pr-6">{u.email}</td>

<td className="py-3 pr-6 text-gray-300">
{u.total_sessions}
</td>

<td className="py-3 pr-6 text-gray-300">
{Math.round(u.avg_engagement*100)}%
</td>

<td className={`py-3 pr-6 font-medium ${
risk === "High"
? "text-red-400"
: risk === "Medium"
? "text-yellow-400"
: "text-green-400"
}`}>
{risk}
</td>

<td className="py-3 pr-6">
{u.is_blocked ? (
<span className="text-red-400 font-medium">Blocked</span>
) : (
<span className="text-green-400 font-medium">Active</span>
)}
</td>

<td className="py-3">

<button
onClick={()=>toggleBlock(u)}
className={`px-3 py-1 rounded-md text-sm font-medium transition ${
u.is_blocked
? "bg-green-600 hover:bg-green-700"
: "bg-red-600 hover:bg-red-700"
}`}
>

{u.is_blocked ? "Unblock" : "Block"}

</button>

</td>

</tr>

);

})}

</tbody>

</table>

</div>

);

}