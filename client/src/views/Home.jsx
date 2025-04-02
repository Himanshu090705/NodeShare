import { Link } from "react-router-dom";
import useUserStore from "../store/userStore";

const Home = () => {
    const isLogin = useUserStore((state) => state.isLogin);
    return (
        <>
            {/* Header Section */}
            <header className="header-box text-white text-center py-5 shadow-lg">
                <div className="container">
                    <h1 className="display-3 fw-bold">
                        Secure P2P File Sharing
                    </h1>
                    <p className="lead fs-4">
                        Share files directly with your peers—secure, fast, and
                        private.
                    </p>
                    {isLogin ? (
                        <Link
                            to="/upload"
                            className="btn btn-light btn-lg mt-4 px-5 py-3 fw-semibold rounded-pill shadow-sm"
                        >
                            Get Started →
                        </Link>
                    ) : (
                        <Link
                            to="/login"
                            className="btn btn-light btn-lg mt-4 px-5 py-3 fw-semibold rounded-pill shadow-sm"
                        >
                            Get Started →
                        </Link>
                    )}
                </div>
            </header>

            {/* What is NodeShare Section */}
            <section className="section-box container bg-white text-center py-5 rounded shadow-sm">
                <h2 className="text-black fw-bold mb-4">What is NodeShare?</h2>
                <div className=" row justify-content-center gap-4 align-items-center">
                    <div className="col-md-2 card p-4 border-secondary shadow-lg">
                        <h5 className="text-black fw-bold">Choose File</h5>
                    </div>
                    <div className="col-md-1 text-secondary fs-2">→</div>
                    <div className="col-md-2 card p-4 border-secondary shadow-lg">
                        <h5 className="text-black fw-bold">P2P Transfer</h5>
                    </div>
                    <div className="col-md-1 text-secondary fs-2">→</div>
                    <div className="col-md-2 card p-4 border-secondary shadow-lg">
                        <h5 className="text-black fw-bold">Download File</h5>
                    </div>
                </div>
            </section>

            {/* Additional Sections */}
            <section className="section-box2 container py-5  text-white rounded shadow-sm">
                <div className="row align-items-center">
                    <div className="col-md-6 text-center">
                        <i className="fa-solid fa-cloud-arrow-up fs-1 bg-light text-black p-4 border rounded-circle shadow-sm"></i>
                    </div>
                    <div className="col-md-6">
                        <h4 className="fw-bold">
                            Files are shared straight from your device
                        </h4>
                        <p>
                            Closing the browser tab stops sharing, ensuring data
                            privacy. NodeShare prioritizes secure peer-to-peer
                            transfers without storing files.
                        </p>
                    </div>
                </div>
            </section>

            <section className="section-box2 container py-5 bg-light text-black rounded shadow-sm">
                <div className="row align-items-center">
                    <div className="col-md-6">
                        <h4 className="fw-bold">No More File Size Limits</h4>
                        <p>
                            Since we don't store data, you can share files of
                            any size with complete freedom.
                        </p>
                    </div>
                    <div className="col-md-6 text-center">
                        <i className="fa-solid fa-ruler fs-1 bg-black text-white p-4 border rounded-circle shadow-sm"></i>
                    </div>
                </div>
            </section>

            <section className="section-box2 container py-5 text-white rounded shadow-sm">
                <div className="row align-items-center">
                    <div className="col-md-6 text-center">
                        <i className="fa-solid fa-user-lock fs-1 bg-white text-black p-4 border rounded-circle shadow-sm"></i>
                    </div>
                    <div className="col-md-6">
                        <h4 className="fw-bold">
                            Only the Receiver Can Access Your Files
                        </h4>
                        <p>
                            With end-to-end encryption, only the intended
                            recipient can access your files, ensuring maximum
                            security.
                        </p>
                    </div>
                </div>
            </section>

            <section className="section-box2 container py-5 bg-light text-black rounded shadow-sm">
                <div className="row align-items-center">
                    <div className="col-md-6">
                        <h4 className="fw-bold">Low Environmental Impact</h4>
                        <p>
                            No bulky servers, reduced energy consumption, and a
                            smaller carbon footprint.
                        </p>
                    </div>
                    <div className="col-md-6 text-center">
                        <i className="fa-solid fa-leaf fs-1 bg-black text-white p-4 border rounded-circle shadow-sm"></i>
                    </div>
                </div>
            </section>

            <section className="section-box2 container text-center py-5 text-white rounded shadow-sm">
                <h2 className="fw-bold">
                    Seamless Sharing, Effortless Conversion.
                </h2>
                <p>
                    Experience the future of file transfers and conversions with
                    NodeShare.
                </p>
                {isLogin ? (
                    <Link
                        to="/upload"
                        className="btn btn-light btn-lg px-5 py-3 text-black fw-semibold rounded-pill shadow-sm mt-4"
                    >
                        Start Now
                    </Link>
                ) : (
                    <Link
                        to="/signup"
                        className="btn btn-light btn-lg px-5 py-3 text-black fw-semibold rounded-pill shadow-sm mt-4"
                    >
                        Start Now
                    </Link>
                )}
            </section>
        </>
    );
};

export default Home;
