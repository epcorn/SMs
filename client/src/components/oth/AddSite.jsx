import { useForm } from "react-hook-form"
import InputField from "../form/InputField"
import { MapContainer, Marker, TileLayer, useMapEvents, useMap } from "react-leaflet"
import { useState, useEffect } from "react";
import L from "leaflet";

// ✅ 1. Standard production bundle asset fix for missing Leaflet graphics
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: '',
  iconAnchor: '',
});
L.Marker.prototype.options.icon = DefaultIcon;

// ✅ 2. Sub-component to force map pan alignment transitions when state refreshes
function MapRecenter({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView([coords.lat, coords.lng], 15); // Auto pans view grid to target coordinates
    }
  }, [coords, map]);
  return null;
}

function AddSite() {
  const [coordinates, setCoordinates] = useState({ lat: 19.1136, lng: 72.8697 });
  const { register, formState: { errors }, handleSubmit } = useForm({
    defaultValues: {
      coords: { latitude: coordinates.lat, longitude: coordinates.lng }
    }
  }); // Added setValue to update form values if needed later

  const handleAutoLocate = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords = {
          lat: parseFloat(position.coords.latitude.toFixed(6)),
          lng: parseFloat(position.coords.longitude.toFixed(6)),
        };
        setCoordinates(newCoords);
      },
      (error) => alert(`Could not fetch location permissions: ${error.message}`),
      { enableHighAccuracy: true, timeout: 5000 } // Added safety performance parameters
    );
  };
  const submit = (data) => { console.log(data) }


  return (
    <>
      <h3 className="text-2xl font-semibold m-3 my-5 underline text-center">Add a New Site</h3>
      <form action="" onSubmit={handleSubmit(submit)}>
        <div className="w-2xl p-5 grid gap-x-5">
          <InputField label='Site Name ' error={errors} name={'name'} register={register} />
          <InputField label='Address' error={errors} name={'address'} register={register} />
          <InputField label='Location' error={errors} name={'location'} register={register} />
          <InputField label='Contract Number' error={errors} name={'contractNumber'} register={register} />

          <div className="outline outline-gray-500 p-1 rounded-md row-span-4">
            <div className="grid grid-cols-2 gap-2 ">
              {/* ✅ 3. FIXED: Mapped values properly to individual fields */}
              <InputField label='Latitude' error={errors} name={'coords.latitude'} register={register} />
              <InputField label='Longitude' error={errors} name={'coords.longitude'} register={register} />
            </div>

            <button onClick={handleAutoLocate} type="button" className="btn btn-neutral my-2">Current location</button>
            <div className="h-64 w-full rounded-md overflow-hidden border border-gray-300 z-0 relative">
              <p className="text-xs text-gray-500 mb-1 absolute top-2 right-2 z-999 bg-white p-1 rounded shadow">
                💡 Click anywhere on the map to re-adjust office pin
              </p>
              <MapContainer
                center={[coordinates.lat, coordinates.lng]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
                />
                {/* ✅ Click Tracker Registration */}
                <MapClickHandler setCoordinates={setCoordinates} />

                {/* ✅ Dynamic View Center Sync Registration */}
                <MapRecenter coords={coordinates} />

                {/* Dropped visual pin anchor indicator */}
                <Marker position={[coordinates.lat, coordinates.lng]} />
              </MapContainer>
            </div>
          </div>
        </div>
        <button className="btn btn-block btn-info mt-4">Add</button>
      </form>
    </>
  )
}

export default AddSite

function MapClickHandler({ setCoordinates }) {
  useMapEvents({
    click(e) {
      setCoordinates({
        lat: parseFloat(e.latlng.lat.toFixed(6)),
        lng: parseFloat(e.latlng.lng.toFixed(6)),
      });
    },
  });
  return null;
}
