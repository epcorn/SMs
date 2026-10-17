import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Guaranteed visible marker icon (fixes Vite/Next.js broken image bug)
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Helper: In India, Latitude is ~8 to 37, Longitude is ~68 to 97.
// This ensures Leaflet ALWAYS gets [latitude, longitude] even if DB order was flipped!
function getLatLng(coords) {
  if (!Array.isArray(coords) || coords.length < 2) return null;
  const [a, b] = [Number(coords[0]), Number(coords[1])];
  if (isNaN(a) || isNaN(b) || (a === 0 && b === 0)) return null;

  // If first number is > 60 (e.g., 72.86 for Mumbai longitude), swap to [lat, lng]
  return Math.abs(a) > Math.abs(b) ? [b, a] : [a, b];
}

function AdminMap({ users = [] }) {
  const validUsers = users
    .map((u) => ({
      ...u,
      latLng: getLatLng(u?.location?.coordinates || u?.coords),
    }))
    .filter((u) => u.latLng !== null);

  return (
    <div className="w-full h-[80vh] z-1 rounded-2xl overflow-hidden border border-base-300 shadow-xs">
      <MapContainer
        center={validUsers[0]?.latLng || [19.248, 72.863]} // Centers on first user or Dahisar/Mumbai
        zoom={15}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validUsers.map((user) => (
          <Marker key={user._id} position={user.latLng} icon={customIcon}>
            <Popup>
              <strong>
                {user.firstname
                  ? `${user.firstname} ${user.lastname || ""}`
                  : user.name || "Employee"}
              </strong>
              <br />
              Last active: {new Date(user.updatedAt).toLocaleTimeString()}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default AdminMap;