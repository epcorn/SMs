export const dateFormat = (date) => {
  return {
    time: new Date(date).toLocaleTimeString(undefined, {
      minute: "2-digit",
      hour: "2-digit",
    }),
    date: new Date(date).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    fullDateAndTime: new Date(date).toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      year: "2-digit",
      minute: "2-digit",
      hour: "2-digit",
    }),
  };
};

const convertIsoDate = (val) => new Date(val).toISOString().split("T")[0];

export const dateCompare = (a, b) => {
  return convertIsoDate(a) === convertIsoDate(b);
};



export const userLocation = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          lognitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
    );
  });
};
