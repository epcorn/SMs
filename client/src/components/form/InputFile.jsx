function InputFile({ label, id, allowed, onChange }) {
  
  return (
    <div className="mt-2 flex flex-col">
      <label htmlFor={id} className="label capitalize text-gray-800 font-semibold">
        {label}
      </label>
      <input
        id={id}
        type="file"
        accept={allowed || ".pdf,.docx,image/*"}
        className="file-input file-input-bordered file-input-md border-green-400 w-full"
        onChange={onChange}
      />
    </div>
  );
}

export default InputFile;