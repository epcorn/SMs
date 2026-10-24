const dateFormat = (date) => {
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

const dateCompare = (a, b) => {
  return convertIsoDate(a) === convertIsoDate(b);
};

const userLocation = () => {
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
const getStatusStyle = (val) => {
  switch (val) {
    case "Present":
      return {
        btn: "btn-accent shadow-emerald-500/30 hover:shadow-emerald-500/50",
        ring: "bg-emerald-500/15",
        icon: "✓",
        label: "Marked (Present)",
        text: "text-emerald-500",
        bg: "bg-emerald-500",
      };
    case "Absent":
      return {
        btn: "btn-error shadow-rose-500/30 hover:shadow-rose-500/50",
        ring: "bg-rose-500/15",
        icon: "✘",
        label: "Marked (Absent)",
        text: "text-rose-500",
        bg: "bg-rose-500",
      };
    case "Half-day":
      return {
        btn: "btn-warning shadow-amber-500/30 hover:shadow-amber-500/50",
        ring: "bg-amber-500/15",
        icon: "½",
        label: "Marked (Half-Day)",
        text: "text-amber-500",
        bg: "bg-amber-500",
      };
    default:
      return {
        btn: "btn-primary shadow-primary/30 hover:shadow-primary/50",
        ring: "bg-primary/15",
        icon: "👆",
        label: "Tap to Check-In",
        text: "text-primary",
        bg: "bg-neutral-500 text-white outline-dashed outline-1",
      };
  }
};

export { dateFormat, dateCompare, userLocation, getStatusStyle };
