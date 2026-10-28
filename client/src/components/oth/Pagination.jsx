
function Pagination({ pages, page, total, onchange = () => { } }) {

  return (
    <div>
      <div className="join">
        {Array.from({ length: pages }).map((_, i) => {

          return (
            <input key={i}
              className="join-item btn btn-square"
              type="radio"
              name="options"
              aria-label={i + 1}
              onChange={() => onchange(i + 1)}
              checked={page === i + 1}
            />
          )
        })}
      </div>
      <h3 className='text-center font-semibold '>Total pages {total}</h3>
    </div>
  )
}

export default Pagination;
