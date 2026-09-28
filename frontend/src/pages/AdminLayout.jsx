import { NavLink, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* Sidebar */}
      <div className="admin-sidebar">

        <h2 className="admin-logo">EASLS Admin</h2>

        <nav className="admin-menu">

          <NavLink to="/admin-dashboard" className="admin-link">
            Dashboard
          </NavLink>

          <NavLink to="/admin-users" className="admin-link">
            Users
          </NavLink>

          <NavLink to="/admin-videos" className="admin-link">
            Videos
          </NavLink>

          <NavLink to="/admin-settings" className="admin-link">
            Settings
          </NavLink>

        </nav>

      </div>

      {/* Page Content */}
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>

    </div>
  );
}