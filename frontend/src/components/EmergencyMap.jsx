import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

const EmergencyMap = () => {
  // Incident location: Bhagalpur, Bihar.
  // Resource positions are clearly simulated operational inputs for the prototype.
  const emergencyLocation = [25.2425, 86.9842];

  const resources = [
    {
      name: "Medical Response Unit",
      type: "🏥 Hospital",
      position: [25.2550, 86.9905],
    },
    {
      name: "Police Coordination Point",
      type: "🚔 Police",
      position: [25.2328, 86.9725],
    },
    {
      name: "Emergency Transport Staging",
      type: "🚑 Ambulance",
      position: [25.2508, 86.9658],
    },
    {
      name: "Relief Shelter",
      type: "⛺ NGO / Relief",
      position: [25.2208, 86.9980],
    },
  ];

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <MapContainer
        center={emergencyLocation}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={emergencyLocation}>
          <Popup>
            🚨 <strong>BIHAR-FLOOD-2026</strong>
            <br />
            Bhagalpur · Bihar
            <br />
            Real-world incident context; operational resources are simulated.
          </Popup>
        </Marker>

        {resources.map((resource, index) => (
          <Marker key={index} position={resource.position}>
            <Popup>
              <strong>{resource.type}</strong>
              <br />
              {resource.name}
              <br />
              <small>Prototype simulation input</small>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default EmergencyMap;
