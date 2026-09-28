import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function TopBar() {

  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });
  }, [location.pathname]);

  function logout() {
    supabase.auth.signOut();
    navigate("/");
  }

  const name =
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const letter = name[0].toUpperCase();

  return (
  <header className="topbar">

  {/* LEFT */}
  <div className="top-left">
    <div className="logo" onClick={() => navigate("/")}>
      EASL
    </div>
  </div>

  {/* SEARCH */}
  <div className="top-center">
    <div className="search-wrapper">
      <input
        className="top-search"
        placeholder="Search topics..."
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            navigate(`/search?q=${e.target.value}`);
          }
        }}
      />
    </div>
  </div>

  {/* RIGHT */}
  <div className="top-right">

    <button
      className="contact-btn"
      onClick={() => window.location.href="mailto:yourmail@gmail.com"}
    >
      Contact
    </button>

    {user && (
      <div className="profile-wrapper">

        <div
          className="profile-trigger"
          onClick={() => setOpen(!open)}
        >
          <div className="avatar">{letter}</div>
          <span className="username">{name}</span>
        </div>

        {open && (
          <div className="profile-dropdown">

            <div className="dropdown-user">
              <div className="avatar big">{letter}</div>

              <div>
                <div className="name">{name}</div>
                <div className="email">{user.email}</div>
              </div>
            </div>

            <div className="dropdown-divider"/>

            <div className="dropdown-item" onClick={() => navigate("/dashboard")}>
              Dashboard
            </div>

            <div className="dropdown-item" onClick={() => navigate("/analytics")}>
              Analytics
            </div>

            <div className="dropdown-item" onClick={() => navigate("/recent-sessions")}>
              Recent Sessions
            </div>

            <div className="dropdown-divider"/>

            <div className="dropdown-item logout" onClick={logout}>
              Logout
            </div>

          </div>
        )}

      </div>
    )}

  </div>

</header>
);
}