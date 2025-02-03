import { NavLink } from "react-router-dom";
function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg sticky-top bg-body-tertiary">
            <div className="container-fluid">
                <NavLink className="navbar-brand" to="/">
                    <i class="fa-solid fa-retweet"></i> NodeShare
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
                            <NavLink
                                className="nav-link"
                                aria-current="page"
                                to="/upload"
                            >
                                <i class="fa-solid fa-share-nodes"></i> Share
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="#">
                                <i class="fa-solid fa-arrows-turn-to-dots"></i>{" "}
                                Convert
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="#">
                                <i class="fa-solid fa-minimize"></i> Compress
                            </NavLink>
                        </li>
                    </ul>
                    <div class="navbar-nav ms-auto">
                        <NavLink className="nav-link" to="/signup">
                            <i class="fa-solid fa-user-plus"></i>&nbsp;
                            <b>Sign Up</b>
                        </NavLink>
                        <NavLink className="nav-link" to="/login">
                            <i class="fa-solid fa-right-to-bracket"></i>&nbsp;
                            <b>Login</b>
                        </NavLink>
                        <NavLink className="nav-link" to="/logout">
                            <i class="fa-solid fa-right-to-bracket"></i>&nbsp;
                            <b>Logout</b>
                        </NavLink>
                    </div>
                </div>
            </div>
        </nav>
    );
}
export default Navbar;
