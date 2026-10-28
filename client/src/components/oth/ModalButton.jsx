

function ModalButton({ id = "my-modal-1", title, children, onClick, btn = 'btn-primary' }) {
  return (
    <>
      {/* Trigger Button */}
      {title && (
        <button className={`btn ${btn} flex items-center *:flex *:items-center gap-2 *:gap-2`} popoverTarget={id} onClick={onClick}>
          {title}
        </button>
      )}

      {/* Popover Container */}
      <div
        id={id}
        popover="auto"
        className="modal bg-black/40 backdrop-blur-[2px] backdrop:bg-neutral-900/50 p-0"
      >
        <div className="modal-box md:max-w-5xl w-full bg-base-100 text-base-content border border-base-300 shadow-2xl relative p-2">

          {/* Close Button at top-right */}
          <button
            popoverTarget={id}
            popoverTargetAction="hide"
            className="btn btn-sm btn-circle btn-error absolute right-3 top-3 text-white z-10"
          >
            ✕
          </button>

          {/* Form / Children Content */}
          <div className="pt-2">
            {children}
          </div>

          {/* Bottom Action Footer */}
          <div className="modal-action mt-6 flex justify-end hidden">
            <button
              popoverTarget={id}
              popoverTargetAction="hide"
              className="btn btn-outline"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ModalButton;