import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import InputField from "../form/InputField";
import SelectField from "../form/SelectField";
import toast from "react-hot-toast";
import InputFile from "../form/InputFile";
import { useUploadFile } from "@/hooks/empHooks";
import { useGetSiteQuery } from "@/hooks/siteHooks";
import { Pencil } from "lucide-react";

const PVoptions = [
  { label: "Done", value: "done" },
  { label: "Not Done", value: "notDone" },
];
const UToptions = [
  { label: "Apprentice", value: "apprentice" },
  { label: "Trainee", value: "trainee" },
];

const genderOptions = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];

const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
};

// One place for default values (used by useForm and reset)
const getDefaults = (user) => ({
  firstname: user?.firstname || "",
  middlename: user?.middlename || "",
  lastname: user?.lastname || "",
  email: user?.email || "",
  photo: user?.photo || "",
  gender: user?.gender || "",
  password: user?.password || "",
  site: user?.site?._id || undefined,
  userType: user?.userType || "trainee",
  dob: formatDateForInput(user?.dob),
  residAddress: user?.residAddress || "",
  currAddress: user?.currAddress || "",
  govtIds: user?.govtIds || { id: "", name: "" },
  policeVerification: user?.policeVerification || "notDone",
  bloodGroup: user?.bloodGroup || "N/A",
  joiningDate: formatDateForInput(user?.joiningDate),
  resume: user?.resume || "",
  medicalDetails: user?.medicalDetails?.length
    ? user.medicalDetails
    : [{ name: "", number: "", file: "" }],
  bankDetails: user?.bankDetails?.length
    ? user.bankDetails
    : [{ name: "", number: "", IFSC: "" }],
  familyDetails: user?.familyDetails?.length
    ? user.familyDetails
    : [{ emergency: false, name: "", relation: "", phone: "", email: "" }],
  salaryDetails: {
    currentSalary: user?.salaryDetails?.currentSalary ?? "",
    basicPay: user?.salaryDetails?.basicPay ?? "",
    PT: user?.salaryDetails?.PT ?? "",
    ESIC: user?.salaryDetails?.ESIC ?? "",
    UAN: user?.salaryDetails?.UAN ?? "",
  },
});

function AddEmp({ type = "add", user = null, onSubmitEmp, loading }) {

  const [uploading, setUploading] = useState(false);
  const { mutateAsync: uploadFileMutation } = useUploadFile();
  const { data: sites } = useGetSiteQuery()

  const sitesOptions = sites?.map(s => ({ value: s._id, label: s.name }))
  const modalId =
    type === "edit" && user?._id ? `modal_emp_${user._id}` : "modal_add_emp";

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: getDefaults(user) });

  useEffect(() => {
    if (type === "edit" && user) reset(getDefaults(user));
  }, [user, type, reset]);

  const {
    fields: familyFields,
    append: appendFamily,
    remove: removeFamily,
  } = useFieldArray({ control, name: "familyDetails" });

  const {
    fields: bankFields,
    append: appendBank,
    remove: removeBank,
  } = useFieldArray({ control, name: "bankDetails" });

  const {
    fields: medicalFields,
    append: appendMedical,
    remove: removeMedical,
  } = useFieldArray({ control, name: "medicalDetails" });

  const onSubmit = async (formData) => {
    console.log(formData)
    try {
      const responseData = await onSubmitEmp({
        ...formData,
        id: user?._id,
      });

      toast.success(
        responseData?.msg || (type === "edit" ? "User Edited" : "User Created")
      );
      document.getElementById(modalId)?.close();
    } catch (error) {
      toast.error(error?.msg || error?.message || "Employee save failed");
    }
  };

  // Uploads the file, then stores the returned URL in the form field
  const handleFileUpload = async (e, fieldName, successMessage) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);

      const res = await uploadFileMutation(body);
      const fileUrl = res?.results?.[0]?.filepath || res?.filepath;
      if (!fileUrl) throw new Error("No file URL returned");

      setValue(fieldName, fileUrl, { shouldDirty: true });
      toast.success(successMessage);
    } catch (error) {
      console.log(error);
      toast.error("File upload failed");
    } finally {
      e.target.value = ""; // allow selecting the same file again
      setUploading(false);
    }
  };

  const photo = watch("photo");
  const resume = watch("resume");

  return (
    <>
      <button
        type="button"
        className={
          type === "edit"
            ? "btn btn-outline btn-sm btn-info"
            : "btn btn-primary btn-md text-[1rem]"
        }
        onClick={() => document.getElementById(modalId).showModal()}
      >
        {type === "edit" ? <Pencil className="h-4" /> : "+ Add Employee"}
      </button>

      <dialog id={modalId} className="modal">

        <div className="modal-box max-w-4xl bg-neutral-200 max-h-[90vh] overflow-y-auto">
          <div className="sticky flex flex-row-reverse justify-between px-5 top-0 z-10 bg-gray-200 pt-5 pb-2">

            <button
              type="button"
              onClick={() => document.getElementById(modalId)?.close()}
              className="btn btn-sm btn-circle btn-error "
            >
              ✕
            </button>

            <h3 className="font-bold text-xl capitalize flex-1 pr-5 flex justify-center gap-20 ">
              <span>
                {type === "edit" ? "Edit Employee" : "Add New Employee"}
              </span>
              {user &&
                <span className={`badge badge-${user.active ? "success" : 'secondary'} `}>{user.active ? "active" : "inactive"}</span>
              }
            </h3>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
            <div className="flex-1 overflow-y-auto p-1">
              {/* Basic info */}
              <div className="grid grid-cols-3 gap-x-4">
                <InputField label="First Name" name="firstname" register={register} required={true} />
                <InputField label="Middle Name" name="middlename" register={register} />
                <InputField label="Last Name" name="lastname" register={register} />
                <InputField label="Email" name="email" type="email" register={register} />

                <SelectField
                  error={errors}
                  options={genderOptions}
                  register={register}
                  validation={{ required: false }}
                  name="gender"
                  label="User Gender"
                />

                {/* Photo */}
                <div className="flex flex-col gap-1">
                  <input type="hidden" {...register("photo")} />
                  <InputFile
                    id="photo"
                    label="Employee Photo"
                    allowed="image/*"
                    onChange={(e) =>
                      handleFileUpload(e, "photo", "Photo uploaded successfully!")
                    }
                  />
                  {photo && (
                    <div className="mt-2 flex items-center gap-2">
                      <img
                        src={photo}
                        alt="Preview"
                        className="h-16 w-16 object-contain rounded-md border"
                      />
                      <button
                        type="button"
                        className="btn btn-xs btn-outline btn-error"
                        onClick={() => setValue("photo", "", { shouldDirty: true })}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {type === "add" && (
                  <InputField
                    label="password"
                    name="password"
                    type="password"
                    register={register}
                  />
                )}

                <SelectField
                  error={errors}
                  options={sitesOptions}
                  register={register}
                  validation={{ required: false }}
                  name="site"
                  label="Select Site"
                />

                <SelectField
                  error={errors}
                  options={UToptions}
                  register={register}
                  validation={{ required: false }}
                  name="userType"
                  label="User Type"
                />
                <InputField label="DOB" name="dob" type="date" register={register} />
                <InputField
                  label="Residential Address"
                  name="residAddress"
                  type="text"
                  register={register}
                />
                <InputField
                  label="Current Address"
                  name="currAddress"
                  type="text"
                  register={register}
                />
                <InputField
                  label="Blood Group"
                  name="bloodGroup"
                  type="text"
                  register={register}
                />

                {/* Resume */}
                <div>
                  <input type="hidden" {...register("resume")} />
                  <InputFile
                    id="resume"
                    label="Resume"
                    onChange={(e) =>
                      handleFileUpload(e, "resume", "Resume uploaded successfully!")
                    }
                  />
                  {resume && (
                    <a
                      href={resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 underline"
                    >
                      View Resume
                    </a>
                  )}
                </div>

                <InputField
                  label="Joining Date"
                  name="joiningDate"
                  type="date"
                  register={register}
                />
                <SelectField
                  error={errors}
                  options={PVoptions}
                  register={register}
                  validation={{ required: false }}
                  name="policeVerification"
                  label="Police Verification"
                />
              </div>

              {/* Government ID */}
              <div className="grid grid-cols-2 gap-3 outline p-3 m-2 rounded-lg outline-gray-400 bg-gray-100 shadow-md">
                <h3 className="col-span-2 text-md font-bold">Government ID</h3>
                <InputField
                  label="Id Number"
                  name="govtIds.id"
                  type="text"
                  register={register}
                  placeholder="eg: adhaar card/pan Card, etc."
                />
                <InputField
                  label="Id Name"
                  name="govtIds.name"
                  type="text"
                  register={register}
                />
              </div>

              {/* Certificates */}
              <div className="border border-gray-400 p-4 rounded-lg m-2 bg-gray-100 shadow-md">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-md font-bold">Certificate Details</h4>
                  <button
                    type="button"
                    className="btn btn-xs btn-outline btn-primary"
                    onClick={() => appendMedical({ name: "", number: "", file: "" })}
                  >
                    + Add Certificate
                  </button>
                </div>

                {medicalFields.map((field, index) => {
                  const fileValue = watch(`medicalDetails.${index}.file`);

                  return (
                    <div key={field.id} className="grid grid-cols-3 gap-2 items-end mb-3">
                      <InputField
                        label={`Certificate ${index + 1} Name`}
                        name={`medicalDetails.${index}.name`}
                        register={register}
                      />
                      <InputField
                        label="Number"
                        name={`medicalDetails.${index}.number`}
                        register={register}
                      />

                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <input
                            type="hidden"
                            {...register(`medicalDetails.${index}.file`)}
                          />
                          {fileValue ? (
                            <div className="flex items-center gap-2 mt-2 p-2 bg-white rounded-md border border-gray-300">
                              <a
                                href={fileValue}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 underline"
                              >
                                View File
                              </a>
                              <button
                                type="button"
                                className="btn btn-xs btn-outline btn-error ml-auto"
                                onClick={() =>
                                  setValue(`medicalDetails.${index}.file`, "", {
                                    shouldDirty: true,
                                  })
                                }
                              >
                                Change
                              </button>
                            </div>
                          ) : (
                            <InputFile
                              id={`medical-file-${index}`}
                              label="File(.pdf, image, .docx)"
                              onChange={(e) =>
                                handleFileUpload(
                                  e,
                                  `medicalDetails.${index}.file`,
                                  "Certificate uploaded successfully!"
                                )
                              }
                            />
                          )}
                        </div>

                        {medicalFields.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-error btn-square btn-sm"
                            onClick={() => removeMedical(index)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Family */}
              <div className="border border-gray-400 p-1 rounded-lg m-2 bg-gray-100 shadow-md">
                <div className="flex justify-between items-center p-3 mb-3">
                  <h4 className="text-md font-bold">Family Details</h4>
                  <button
                    type="button"
                    className="btn btn-xs btn-outline btn-primary"
                    onClick={() =>
                      appendFamily({
                        emergency: false,
                        name: "",
                        relation: "",
                        phone: "",
                        email: "",
                      })
                    }
                  >
                    + Add Family Member
                  </button>
                </div>

                {familyFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-[2fr_1fr_2fr_2fr] gap-2 items-end mb-3 bg-white shadow-md px-3 py-2 rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="tooltip tooltip-info tooltip-right"
                        data-tip="Mark Emergency"
                      >
                        <input
                          type="checkbox"
                          {...register(`familyDetails.${index}.emergency`)}
                          className="checkbox"
                        />
                      </div>
                      <InputField
                        label={`Member ${index + 1} Name`}
                        name={`familyDetails.${index}.name`}
                        register={register}
                      />
                    </div>
                    <InputField
                      label="Relation"
                      name={`familyDetails.${index}.relation`}
                      register={register}
                    />
                    <InputField
                      label="Email"
                      name={`familyDetails.${index}.email`}
                      register={register}
                    />
                    <div className="flex gap-2 items-center">
                      <div className="flex-1">
                        <InputField
                          label="Phone"
                          name={`familyDetails.${index}.phone`}
                          register={register}
                        />
                      </div>
                      {familyFields.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-error btn-square btn-sm"
                          onClick={() => removeFamily(index)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bank */}
              <div className="border border-gray-600 p-4 rounded-lg m-2 bg-gray-100 shadow-md">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-md font-bold">Bank Details</h4>
                  <button
                    type="button"
                    className="btn btn-xs btn-outline btn-primary"
                    onClick={() => appendBank({ name: "", number: "", IFSC: "" })}
                  >
                    + Add Bank Account
                  </button>
                </div>

                {bankFields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-3 gap-2 items-end mb-3">
                    <InputField
                      label="Account Holder Name"
                      name={`bankDetails.${index}.name`}
                      register={register}
                    />
                    <InputField
                      label="Account Number"
                      name={`bankDetails.${index}.number`}
                      register={register}
                    />
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <InputField
                          label="IFSC Code"
                          name={`bankDetails.${index}.IFSC`}
                          register={register}
                        />
                      </div>
                      {bankFields.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-error btn-square btn-sm"
                          onClick={() => removeBank(index)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Salary */}
              <div className="outline outline-gray-400 m-3 p-3 rounded-md grid grid-cols-5 gap-x-4 bg-gray-100 shadow-md">
                <h3 className="text-lg font-bold capitalize col-span-full">
                  salary information
                </h3>
                <InputField
                  register={register}
                  error={errors}
                  label="Current Salary"
                  name="salaryDetails.currentSalary"
                />
                <InputField
                  register={register}
                  error={errors}
                  //  label="Basic Salary"
                  name="salaryDetails.basicPay"
                />
                <InputField
                  register={register}
                  error={errors}
                  //  label="Professional tax"
                  name="salaryDetails.PT"
                />
                <InputField
                  register={register}
                  error={errors}
                  //  label="ESIC"
                  name="salaryDetails.ESIC"
                />
                <InputField
                  register={register}
                  error={errors}
                  //  label="UAN number"
                  name="salaryDetails.UAN"
                />
              </div>
            </div>

            <div className="modal-action">
              <button
                type="submit"
                disabled={loading || uploading}
                className="btn btn-accent w-full disabled:opacity-65"
              >
                {uploading
                  ? "Uploading file..."
                  : type === "edit"
                    ? "Update Employee"
                    : "Save Employee"}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}

export default AddEmp;