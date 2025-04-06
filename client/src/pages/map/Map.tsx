import React from 'react'
import './Map.css'

function Map() {
  return (
    <div className="map-container">
      <iframe 
        src="https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1s%25C4%25B0zmir!6i14!3m1!1sen!5m1!1sen"
        className="map-frame"
        title="Google Maps"
        loading="lazy"
        allowFullScreen
      />
    </div>
  )
}

export default Map
