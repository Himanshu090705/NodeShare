import { NavLink, useNavigate } from "react-router-dom";
import useUserStore from "../store/userStore";
import { supabase } from "../../../server/db/connect";
import { useEffect } from "react";

function Navbar() {
    const session = useUserStore((state) => state.session);
    const navigate = useNavigate();
    const setAuthSession = useUserStore((state) => state.setAuthSession);

    useEffect(() => {
        const checkSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            setAuthSession(session);
        };

        checkSession();
    }, [setAuthSession]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setAuthSession(null);
        navigate("/");
    };
    const handleProfile = () => {
        navigate("/profile");
    };

    return (
        <nav className="navbar navbar-expand-lg fixed-top navbar-box shadow-lg">
            <div className="container-fluid">
                <NavLink className="navbar-brand" to="/">
                    <i className="fa-solid fa-retweet"></i> NodeShare
                </NavLink>
                <button
                    class="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            {session ? (
                                <NavLink
                                    className="nav-link text-white"
                                    aria-current="page"
                                    to="/upload"
                                >
                                    <i className="fa-solid fa-share-nodes"></i>{" "}
                                    Share
                                </NavLink>
                            ) : (
                                <NavLink
                                    className="nav-link text-white"
                                    aria-current="page"
                                    to="/login"
                                >
                                    <i className="fa-solid fa-share-nodes"></i>{" "}
                                    Share
                                </NavLink>
                            )}
                        </li>
                        <li className="nav-item">
                            {session ? (
                                <NavLink className="nav-link" to="/convert">
                                    <i className="fa-solid fa-arrows-turn-to-dots"></i>{" "}
                                    Convert
                                </NavLink>
                            ) : (
                                <NavLink
                                    className="nav-link text-white"
                                    aria-current="page"
                                    to="/login"
                                >
                                    <i className="fa-solid fa-arrows-turn-to-dots"></i>{" "}
                                    Convert
                                </NavLink>
                            )}
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="#">
                                <i className="fa-solid fa-minimize"></i>{" "}
                                Compress
                            </NavLink>
                        </li>
                    </ul>
                    <div className="navbar-nav ms-auto">
                        {!session ? (
                            <>
                                <NavLink className="nav-link" to="/signup">
                                    <i className="fa-solid fa-user-plus"></i>
                                    &nbsp;
                                    <b>Sign Up</b>
                                </NavLink>
                                <NavLink className="nav-link" to="/login">
                                    <i className="fa-solid fa-right-to-bracket"></i>
                                    &nbsp;
                                    <b>Login</b>
                                </NavLink>
                            </>
                        ) : (
                            <>
                                <button
                                    className="btn  text-white"
                                    onClick={handleLogout}
                                >
                                    <i className="fa-solid fa-right-to-bracket"></i>
                                    &nbsp;
                                    <b>Logout</b>
                                </button>
                                <button
                                    className="btn text-white"
                                    onClick={handleProfile}
                                >
                                    <i className="fa-solid fa-user"></i>&nbsp;
                                    <b>Profile</b>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
        // <nav className="navbar navbar-expand-lg fixed-top navbar-box shadow-lg">
        //     <div className="container-fluid">
        //         <NavLink className="navbar-brand text-white" to="/">
        //             <i className="fa-solid fa-retweet"></i> NodeShare
        //         </NavLink>
        //         <div className="collapse navbar-collapse" id="navbarNav">
        //             <ul className="navbar-nav">
        //                 <li className="nav-item">
        //                     {isLogin ? (
        //                         <NavLink
        //                             className="nav-link text-white"
        //                             to="/upload"
        //                         >
        //                             <i className="fa-solid fa-share-nodes"></i>{" "}
        //                             Share
        //                         </NavLink>
        //                     ) : (
        //                         <NavLink
        //                             className="nav-link text-white"
        //                             to="/login"
        //                         >
        //                             <i className="fa-solid fa-share-nodes"></i>{" "}
        //                             Share
        //                         </NavLink>
        //                     )}
        //                 </li>
        //                 <li className="nav-item">
        //                     <NavLink className="nav-link text-white" to="#">
        //                         <i className="fa-solid fa-arrows-turn-to-dots"></i>{" "}
        //                         Convert
        //                     </NavLink>
        //                 </li>
        //                 <li className="nav-item">
        //                     <NavLink className="nav-link text-white" to="#">
        //                         <i className="fa-solid fa-minimize"></i>{" "}
        //                         Compress
        //                     </NavLink>
        //                 </li>
        //             </ul>
        //             <div className="navbar-nav ms-auto">
        //                 {!isLogin ? (
        //                     <>
        //                         <NavLink
        //                             className="nav-link text-white"
        //                             to="/signup"
        //                         >
        //                             <i className="fa-solid fa-user-plus"></i>
        //                             &nbsp;
        //                             <b>Sign Up</b>
        //                         </NavLink>
        //                         <NavLink
        //                             className="nav-link text-white"
        //                             to="/login"
        //                         >
        //                             <i className="fa-solid fa-right-to-bracket"></i>
        //                             &nbsp;
        //                             <b>Login</b>
        //                         </NavLink>
        //                     </>
        //                 ) : (
        //                     <NavLink
        //                         className="btn btn-light"
        //                         onClick={() => setIsLogin(false)}
        //                         to={"/"}
        //                     >
        //                         <i className="fa-solid fa-right-to-bracket"></i>
        //                         &nbsp;
        //                         <b>Logout</b>
        //                     </NavLink>
        //                 )}
        //             </div>
        //         </div>
        //     </div>
        // </nav>
    );
}

export default Navbar;