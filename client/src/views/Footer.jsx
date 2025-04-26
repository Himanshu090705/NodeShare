import React from "react";

const Footer = () => {
  return (
    <footer className="py-3 mt-auto">
      <div className="container text-center">
        <hr className="bg-black mt-4" />
        <div className="mb-3">
          <a className="mx-2 " href="https://www.facebook.com/">
            <i className="text-black fa-brands fa-square-facebook fa-2x"></i>
          </a>
          <a className="mx-2 " href="https://www.instagram.com/">
            <i className="text-black fa-brands fa-square-instagram fa-2x"></i>
          </a>
          <a className="mx-2 " href="https://www.linkedin.com/feed/">
            <i className="text-black fa-brands fa-linkedin fa-2x"></i>
          </a>
          <a className="mx-2 " href="https://x.com/">
            <i className="text-black fa-brands fa-twitter fa-2x"></i>
          </a>
          <a className="mx-2 " href="https://github.com/">
            <i className="text-black fa-brands fa-github fa-2x"></i>
          </a>
        </div>
        <div className="mb-3">
          <a
            className="text-decoration-none text-black mx-2"
            href="/listings/privacy"
          >
            Privacy
          </a>
          <a
            className="text-decoration-none text-black mx-2"
            href="/listings/terms"
          >
            Terms
          </a>
          <a
            className="text-decoration-none text-black mx-2"
            href="/listings/contact"
          >
            Contact Us
          </a>
          <a
            className="text-decoration-none text-black mx-2"
            href="/listings/about"
          >
            About Us
          </a>
        </div>
        <div className="text-black text-muted">
          NodeShare Private Limited &nbsp;
          <i className="text-black fa-regular fa-copyright"></i> 2025 - All
          Rights Reserved &nbsp;
          <i className="text-black fa-solid fa-registered"></i>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
