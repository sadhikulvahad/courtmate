import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { LatLngTuple } from "leaflet"; // Import Leaflet for icon fix
import { getCoordinates } from "@/utils/geocode";

interface AddressConfig {
  street: string;
  state: string;
  pincode: number;
  country: string;
  city: string;
}

interface Position {
  lat: number;
  lng: number;
}

interface LocationMapProps {
  address: AddressConfig;
}

// Fix Leaflet default marker icons
const DefaultIcon = L.Icon.Default as any;
delete DefaultIcon.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const LocationMap = ({ address }: LocationMapProps) => {
  const [position, setPosition] = useState<Position | null>(null);

  useEffect(() => {
    const fetchCoordinates = async () => {
      const coords = await getCoordinates(address);
      setPosition(coords);
    };
    fetchCoordinates();
  }, [address]);

  if (!position) {
    return (
      <div className="text-gray-700 flex items-center justify-center h-48">
        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        Loading map...
      </div>
    );
  }

  const center: LatLngTuple = [position.lat, position.lng];

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "200px", width: "100%" }}
      className="rounded-lg shadow"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <Marker position={center}>
        <Popup>
          {address.street}, {address.city}, {address.state}, {address.pincode}
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default LocationMap;
