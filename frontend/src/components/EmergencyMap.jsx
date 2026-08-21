import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

const EmergencyMap = () => {
  const emergencyLocation = [13.0827, 80.2707];

  const resources = [
    {
      name: "Apollo Hospital",
      type: "🏥 Hospital",
      position: [13.0674, 80.2376],
    },
    {
      name: "Police Station",
      type: "🚔 Police",
      position: [13.0878, 80.2785],
    },
    {
      name: "Emergency Transport",
      type: "🚑 Ambulance",
      position: [13.0732, 80.2609],
    },
  ];

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <MapContainer
        center={emergencyLocation}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Emergency Location */}
        <Marker position={emergencyLocation}>
          <Popup>
            🚨 <strong>Emergency Location</strong>
            <br />
            Incident detected here.
          </Popup>
        </Marker>

        {/* Emergency Resources */}
        {resources.map((resource, index) => (
          <Marker key={index} position={resource.position}>
            <Popup>
              <strong>{resource.type}</strong>
              <br />
              {resource.name}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default EmergencyMap;