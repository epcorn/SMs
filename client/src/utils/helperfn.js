const dateFormat = (date) => {
  // Return null entirely if there is no valid date
  if (!date) return null;
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return null;

  return {
    time: parsedDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    date: parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    fullDateAndTime: parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
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

const dashboardStatsColor = (label) => {
  switch (label) {
    case "Total Records":
      return {
        bg: "bg-indigo-200 border-indigo-100",
        title: "text-indigo-600",
        value: "text-indigo-900",
      };
    case "Total Present":
      return {
        bg: "bg-emerald-200 border-emerald-100",
        title: "text-emerald-600",
        value: "text-emerald-900",
      };
    case "Total Absent":
      return {
        bg: "bg-rose-200 border-rose-100",
        title: "text-rose-600",
        value: "text-rose-900",
      };
    case "Total HalfDay":
      return {
        bg: "bg-amber-200 border-amber-100",
        title: "text-amber-600",
        value: "text-amber-900",
      };
    case "Total CheckIns":
      return {
        bg: "bg-sky-200 border-sky-100",
        title: "text-sky-600",
        value: "text-sky-900",
      };
    case "Total CheckOuts":
      return {
        bg: "bg-slate-200 border-slate-200",
        title: "text-slate-600",
        value: "text-slate-900",
      };
    default:
      return {
        bg: "bg-base-200 border-base-300",
        title: "text-slate-500",
        value: "text-slate-800",
      };
  }
};

export {
  dateFormat,
  dateCompare,
  userLocation,
  getStatusStyle,
  dashboardStatsColor,
};
