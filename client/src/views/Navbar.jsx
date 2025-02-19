import { NavLink } from "react-router-dom";
import useUserStore from "../store/userStore";
import { supabase } from "../../../server/db/connect";
import { useEffect } from "react";

function Navbar() {
  const session = useUserStore((state) => state.session);
  const setAuthSession = useUserStore((state) => state.setAuthSession);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setAuthSession(session);
    };

    checkSession();
  }, [setAuthSession]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthSession(null);
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top bg-body-tertiary">
      <div className="container-fluid">
        <NavLink className="navbar-brand" to="/">
          <i className="fa-solid fa-retweet"></i> NodeShare
        </NavLink>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              {session ? (
                <NavLink className="nav-link" aria-current="page" to="/upload">
                  <i className="fa-solid fa-share-nodes"></i> Share
                </NavLink>
              ) : (
                <NavLink className="nav-link" aria-current="page" to="/login">
                  <i className="fa-solid fa-share-nodes"></i> Share
                </NavLink>
              )}
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="#">
                <i className="fa-solid fa-arrows-turn-to-dots"></i> Convert
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="#">
                <i className="fa-solid fa-minimize"></i> Compress
              </NavLink>
            </li>
          </ul>
          <div className="navbar-nav ms-auto">
            {!session ? (
              <>
                <NavLink className="nav-link" to="/signup">
                  <i className="fa-solid fa-user-plus"></i>&nbsp;
                  <b>Sign Up</b>
                </NavLink>
                <NavLink className="nav-link" to="/login">
                  <i className="fa-solid fa-right-to-bracket"></i>&nbsp;
                  <b>Login</b>
                </NavLink>
              </>
            ) : (
              <button className="btn btn-light" onClick={handleLogout}>
                <i className="fa-solid fa-right-to-bracket"></i>&nbsp;
                <b>Logout</b>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
