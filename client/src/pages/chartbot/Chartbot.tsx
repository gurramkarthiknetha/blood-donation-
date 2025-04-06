import React from 'react'
import './chartbot.css'

function Chartbot() {
  return (
    <div className="chartbot-container">
      <div className="info-section">
        {/* <h2>Welcome to Blood Donation Assistant</h2>
        <p>Get instant answers to your questions about blood donation. Our chatbot can help you with:</p>
        <ul>
          <li>Donation eligibility</li>
          <li>Donation process</li>
          <li>Health requirements</li>
          <li>Post-donation care</li>
        </ul> */}
      </div>
      <div className="chatbot-section">
        <iframe
          src="https://www.chatbase.co/chatbot-iframe/9jC66DN-PF5YBKak5WX2O"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={true}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        ></iframe>
      </div>
    </div>
  )
}

export default Chartbot
