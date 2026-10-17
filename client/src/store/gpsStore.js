import { create } from "zustand";

// Helper function to calculate distance in meters between two lat/lng points
const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Radius of the earth in meters
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

const useGpsStore = create((set, get) => ({
  location: null,
  error: null,
  watchId: null,

  startTracking: () => {
    return new Promise((resolve, reject) => {
      if (get().watchId) {
        resolve(get().location);
        return;
      }

      if (!("geolocation" in navigator)) {
        const errorMsg = "Geolocation is not supported by your browser";
        set({ error: errorMsg });
        reject(new Error(errorMsg));
        return;
      }

      const id = navigator.geolocation.watchPosition(
        (pos) => {
          const newLat = pos.coords.latitude;
          const newLon = pos.coords.longitude;
          const currentLocation = get().location;

          // If we already have a location, check if the user has moved at least 15 meters
          if (currentLocation) {
            const distance = getDistanceFromLatLonInMeters(
              currentLocation.latitude,
              currentLocation.longitude,
              newLat,
              newLon
            );

            // Skip updating state if movement is less than 15 meters
            if (distance < 15) return;
          }

          const newLocation = { latitude: newLat, longitude: newLon };
          set({ location: newLocation, error: null });
          resolve(newLocation);
        },
        (err) => {
          set({ error: err.message });
          reject(err);
        },
        { enableHighAccuracy: true, maximumAge: 60000, timeout: 50000 }
      );

      set({ watchId: id });
    });
  },

  stopTracking: () => {
    const { watchId } = get();
    if (!watchId) return;

    navigator.geolocation.clearWatch(watchId);
    set({ watchId: null });
  },
}));

export default useGpsStore;