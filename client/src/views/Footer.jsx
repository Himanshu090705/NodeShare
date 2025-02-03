import React from "react";

const Footer = () => {
    return (
        <footer className="bg-dark py-3 mt-3">
            <div className="container text-center">
                <hr className="mt-4" />
                <div className="mb-3">
                    <a
                        className="mx-2 text-light"
                        href="https://www.facebook.com/"
                    >
                        <i className="fa-brands fa-square-facebook fa-2x"></i>
                    </a>
                    <a
                        className="mx-2 text-light"
                        href="https://www.instagram.com/"
                    >
                        <i className="fa-brands fa-square-instagram fa-2x"></i>
                    </a>
                    <a
                        className="mx-2 text-light"
                        href="https://www.linkedin.com/feed/"
                    >
                        <i className="fa-brands fa-linkedin fa-2x"></i>
                    </a>
                    <a className="mx-2 text-light" href="https://x.com/">
                        <i className="fa-brands fa-twitter fa-2x"></i>
                    </a>
                    <a className="mx-2 text-light" href="https://github.com/">
                        <i className="fa-brands fa-github fa-2x"></i>
                    </a>
                </div>
                <div className="mb-3">
                    <a
                        className="text-decoration-none text-light mx-2"
                        href="/listings/privacy"
                    >
                        Privacy
                    </a>
                    <a
                        className="text-decoration-none text-light mx-2"
                        href="/listings/terms"
                    >
                        Terms
                    </a>
                    <a
                        className="text-decoration-none text-light mx-2"
                        href="/listings/contact"
                    >
                        Contact Us
                    </a>
                    <a
                        className="text-decoration-none text-light mx-2"
                        href="/listings/about"
                    >
                        About Us
                    </a>
                </div>
                <div className="text-muted">
                    NodeShare Private Limited &nbsp;
                    <i className="fa-regular fa-copyright"></i> 2025 - All
                    Rights Reserved &nbsp;
                    <i className="fa-solid fa-registered"></i>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
