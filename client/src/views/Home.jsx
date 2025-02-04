import React from "react";

const Home = () => {
    return (
        <div className="container d-flex justify-content-center align-items-center mt-4">
            <div class="col-6 m-auto form-border py-4">
                {/* // <div className="col-6 col-md-6 col-lg-4 bg-dark text-light"> */}
                <h1 className="text-info text-center mb-4">
                    What is NodeShare?
                </h1>
                <div className="row justify-content-center align-items-center mb-4">
                    <div className="col-md-3 border border-info rounded p-3">
                        Choose File
                    </div>
                    <div className="col-md-1 text-info fs-2">→</div>
                    <div className="col-md-3 border border-info rounded p-3">
                        P2P Transfer
                    </div>
                    <div className="col-md-1 text-info fs-2">→</div>
                    <div className="col-md-3 border border-info rounded p-3">
                        Download File
                    </div>
                </div>
                <div className="row justify-content-center align-items-center mb-4">
                    <div className="col-md-3 border border-info rounded p-3">
                        Convert File
                    </div>
                    <div className="col-md-1 text-info fs-2">→</div>
                    <div className="col-md-3 border border-info rounded p-3">
                        Output Format
                    </div>
                </div>
                <p className="mt-4 fs-5">
                    NodeShare is a free and independent peer-to-peer (P2P) file
                    sharing and file conversion service. We prioritize privacy,
                    speed, and security, ensuring that your data is only in your
                    hands.
                </p>
                <p className="mt-1 fs-5 mb-2">
                    We store nothing online: simply close your browser to stop
                    sending.
                </p>
                <hr />
                <div className="row align-items-center mt-2 mb-4 mt-4 py-4">
                    <div className="col-md-2 text-center">
                        <div className="bg-light p-3 border rounded-circle">
                            <i className="fa-solid fa-cloud-arrow-up fs-1 text-info"></i>
                            {/* <FaCloudUploadAlt size={50} className="text-info" /> */}
                        </div>
                    </div>
                    <div className="col-md-10">
                        <h4>Files are shared straight from your device</h4>
                        <p>
                            When you close the browser tab, your files are no
                            longer accessible, minimizing the risk of
                            unauthorized access. NodeShare uses peer-to-peer
                            technology to ensure direct transfers without
                            storing your files on any server.
                        </p>
                    </div>
                </div>

                <div className="row align-items-center mb-4 mt-4 py-4">
                    <div className="col-md-10">
                        <h4>No more file size limits</h4>
                        <p>
                            Since we don't store your data, there are no file
                            size restrictions. Share files of any size with
                            complete freedom.
                        </p>
                    </div>
                    <div className="col-md-2 text-center">
                        <div className="bg-light p-3 border rounded-circle">
                            <i class="fa-solid fa-ruler fs-1 text-info"></i>
                        </div>
                        {/* <FaRulerCombined size={50} className="text-info" /> */}
                    </div>
                </div>

                <div className="row align-items-center mb-4 mt-4 py-4">
                    <div className="col-md-2 text-center">
                        <div className="bg-light p-3 border rounded-circle">
                            <i class="fa-solid fa-user-lock fs-1 text-info"></i>
                        </div>
                        {/* <FaLock size={50} className="text-info" /> */}
                    </div>
                    <div className="col-md-10">
                        <h4>Only the receiver can access your files</h4>
                        <p>
                            Your data is encrypted end-to-end, ensuring only the
                            intended receiver can access the files. NodeShare
                            prioritizes security with the latest encryption
                            standards.
                        </p>
                    </div>
                </div>

                <div className="row align-items-center mb-4 mt-4 py-4">
                    <div className="col-md-10">
                        <h4>Low environmental impact</h4>
                        <p>
                            Since we don’t store data, there’s no need for bulky
                            servers, reducing energy consumption and carbon
                            footprint.
                        </p>
                    </div>
                    <div className="col-md-2 text-center">
                        <div className="bg-light p-3 border rounded-circle">
                            <i class="fa-solid fa-leaf fs-1 text-info"></i>
                        </div>
                        {/* <FaLeaf size={50} className="text-info" /> */}
                    </div>
                </div>

                <div className="row align-items-center mb-4 mt-4 py-4">
                    <div className="col-md-2 text-center">
                        <div className="bg-light p-3 border rounded-circle">
                            <i class="fa-solid fa-repeat fs-1 text-info"></i>
                        </div>
                        {/* <FaExchangeAlt size={50} className="text-info" /> */}
                    </div>
                    <div className="col-md-10">
                        <h4>Effortless File Conversion</h4>
                        <p>
                            Unlike other services, NodeShare also offers
                            seamless file conversion. Easily transform files
                            into different formats before sending them.
                        </p>
                    </div>
                </div>
                <h2 className="mt-5 text-secondary">
                    Seamless Sharing, Effortless Conversion.
                </h2>
            </div>
        </div>
    );
};

export default Home;
