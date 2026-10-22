import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function useDocumentTitle() {
  const location = useLocation()

  useEffect(() => {
    const path = location.pathname.split("/")[1];

    if (!path) { document.title = "SMs | HOME"; return }

    const formattedTitle = path.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    document.title = `SMs | ${formattedTitle}`
  }, [location])
  return (
    <div>useDocumentTitle</div>
  )
}

export default useDocumentTitle