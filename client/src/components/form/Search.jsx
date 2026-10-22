import InputField from './InputField';

function Search({ register, errors, onSubmit }) {
  return (
    <div className='w-full rounded-md bg-accent-content p-4 text-white shadow-md border border-neutral-700'>
      <h3 className='text-lg font-semibold tracking-wide'>Search Employee</h3>

      <form onSubmit={onSubmit} className='flex flex-col gap-4 sm:flex-row sm:items-end'>

        <div className='grid grid-cols-1 items-center md:gap-3 w-full sm:grid-cols-[1fr_auto_1fr]'>

          <InputField error={errors} register={register} label='Name' name='name' />

          <div className='flex md:h-10 items-center justify-center font-medium uppercase text-neutral-400 sm:h-full sm:pt-5'>
            or
          </div>

          <InputField error={errors} type='email' register={register} label='Email' name='email' />

        </div>

        <button type='submit' className='btn btn-active h-10 px-5 sm:mb-0.5'>
          Search
        </button>
      </form>
    </div>
  );
}

export default Search;
