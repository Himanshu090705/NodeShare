import React from "react";

const Footer = () => {
    return (
        <footer className="bg-light py-4 mt-5">
            <div className="container text-center">
                <div className="mb-3">
                    <a className="mx-2 text-dark" href="https://www.facebook.com/">
                        <i className="fa-brands fa-square-facebook fa-2x"></i>
                    </a>
                    <a className="mx-2 text-dark" href="https://www.instagram.com/">
                        <i className="fa-brands fa-square-instagram fa-2x"></i>
                    </a>
                    <a className="mx-2 text-dark" href="https://www.linkedin.com/feed/">
                        <i className="fa-brands fa-linkedin fa-2x"></i>
                    </a>
                    <a className="mx-2 text-dark" href="https://x.com/">
                        <i className="fa-brands fa-twitter fa-2x"></i>
                    </a>
                </div>
                <div className="mb-3">
                    <a className="text-decoration-none text-dark mx-2" href="/listings/privacy">Privacy</a>
                    <a className="text-decoration-none text-dark mx-2" href="/listings/terms">Terms</a>
                    <a className="text-decoration-none text-dark mx-2" href="/listings/contact">Contact Us</a>
                    <a className="text-decoration-none text-dark mx-2" href="/listings/about">About Us</a>
                </div>
                <div className="text-muted">
                    WanderLust Private Limited &nbsp;
                    <i className="fa-regular fa-copyright"></i> 2024 - All Rights Reserved &nbsp;
                    <i className="fa-solid fa-registered"></i>
                </div>
                <hr className="mt-4" />
            </div>
        </footer>
    );
};

export default Footer;
