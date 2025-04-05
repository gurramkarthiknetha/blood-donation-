import React from 'react';
import './Footer.css';
import { FaFacebook,FaTwitter,FaInstagram,FaLinkedinIn } from "react-icons/fa";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-column">
          <h3>LifeFlow</h3>
          <p>Connecting donors with those in need,saving lives one donation at a time.</p>
        </div>
        <div className="footer-column">
          <h4>Quick Links</h4>
          <ul>
            <li>About Us</li>
            <li>Find Donors</li>
            <li>Blood Banks</li>
            <li>Contact</li>
          </ul>
        </div>
        <div className="footer-column">
          <h4>Legal</h4>
          <ul>
            <li>Privacy Policy</li>
            <li>Terms of Service</li>
            <li>Cookie Policy</li>
          </ul>
        </div>
        <div className="footer-column">
          <h4>Connect With Us</h4>
          <div className="social-icons">
            <FaFacebook />
            <FaTwitter />
            <FaInstagram />
            <FaLinkedinIn />
          </div>
          <div className="store-buttons">
            <button className="google-play">Google Play</button>
            <button className="app-store">App Store</button>
          </div>
        </div>
      </div>
      <hr />
      <p className="copyright">© 2025 LifeFlow. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
