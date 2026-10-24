import { useGetSiteQuery } from '@/hooks/siteHooks';
import { Pencil, X } from 'lucide-react';
import { useEffect } from 'react';

function ShowSites() {
  const { data: sites, isPending: loading, refetch } = useGetSiteQuery({ enabled: false, staleTime: 5000, refetchOnMount: false })

  useEffect(() => {
    const modalElement = document.getElementById("showSiteModal");
    if (!modalElement) return;

    // Listen to native popover toggle events
    const handleToggle = (event) => {
      if (event.newState === "open") {
        refetch(); // Fetch data the exact moment the modal opens!
      }
    };

    modalElement.addEventListener("toggle", handleToggle);
    return () => modalElement.removeEventListener("toggle", handleToggle);
  }, [refetch]);

  return (
    <div className='p-4 max-w-5xl min-h-[70dvh] w-full mx-auto'>
      <h3 className='font-bold text-2xl mb-4 text-base-content'>Show Sites</h3>

      {/* daisyUI Card container with border */}
      <div className="card bg-base-100 border border-base-300 shadow-xl overflow-hidden h-full">
        <div className="overflow-x-auto h-full">
          <table className='table table-zebra w-full h-full'>
            {/* Table Header */}
            <thead className='bg-gray-300 text-base-content uppercase text-sm tracking-wider'>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Address</th>
                <th>Contract No</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-base-content/60">
                    <span className="loading loading-spinner loading-md"></span>
                  </td>
                </tr>
              ) : sites?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-base-content/60">
                    No sites added yet.
                  </td>
                </tr>
              ) : (
                sites?.map((site, idx) => (
                  <tr key={site._id} className="hover">
                    <th className="font-medium">{idx + 1}</th>
                    <td className="font-semibold text-base">{site.name}</td>
                    <td>
                      <p className='max-w-md text-sm text-base-content/80 leading-relaxed'>{site.address}</p>
                    </td>
                    <td>
                      <span className="badge badge-ghost badge-sm font-semibold">
                        {site.contractNumber || "N/A"}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 justify-center">
                        {/* daisyUI Button styling */}
                        <button
                          type="button"
                          className="btn btn-sm btn-outline btn-square btn-info tooltip" data-tip='edit'
                          aria-label="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-square btn-outline btn-error tooltip"
                          aria-label="Delete" data-tip='Delete'
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ShowSites