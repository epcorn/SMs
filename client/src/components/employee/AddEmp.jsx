import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import InputField from "../form/InputField";
import SelectField from "../form/SelectField";
import toast from "react-hot-toast";
import InputFile from "../form/InputFile";
import { useUploadFile } from "@/hooks/empHooks";
import { useGetSiteQuery } from "@/hooks/siteHooks";
import { Pencil, Trash2 } from "lucide-react";

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

const getDefaults = (user) => ({
  firstname: user?.firstname || "",
  middlename: user?.middlename || "",
  lastname: user?.lastname || "",
  email: user?.email || "",
  photo: user?.photo || "",
  department: user?.department || "",
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
    allowance: user?.salaryDetails?.allowance?.length
      ? user?.salaryDetails?.allowance
      : [{ name: "", amount: "" }],
  },
});

function AddEmp({ type = "add", user = null, onSubmitEmp, loading }) {
  const [uploading, setUploading] = useState(false);
  const { mutateAsync: uploadFileMutation } = useUploadFile();
  const { data: sites } = useGetSiteQuery();

  const sitesOptions = sites?.map((s) => ({ value: s._id, label: s.name }));
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

  const {
    fields: allowanceFields,
    append: appendAllowance,
    remove: removeAllowance,
  } = useFieldArray({ control, name: "salaryDetails.allowance" });

  const onSubmit = async (formData) => {
    const payload = { creds: formData, id: user?._id };
    try {
      const responseData = await onSubmitEmp(payload);

      toast.success(
        responseData?.msg || (type === "edit" ? "User Edited" : "User Created"),
      );
      document.getElementById(modalId)?.close();
    } catch (error) {
      toast.error(error?.msg || error?.message || "Employee save failed");
    }
  };

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
      e.target.value = "";
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
            : "btn btn-primary btn-md text-base"
        }
        onClick={() => document.getElementById(modalId).showModal()}>
        {type === "edit" ? <Pencil className="h-4 w-4" /> : "+ Add Employee"}
      </button>

      <dialog id={modalId} className="modal">
        <div className="modal-box max-w-4xl max-h-[90vh] bg-base-100 flex flex-col p-0">
          {/* Modal Header */}
          <div className="sticky top-0 z-20 bg-base-100 navbar px-6 border-b border-base-300">
            <div className="flex-1 gap-4">
              <h3 className="font-bold text-xl capitalize">
                {type === "edit" ? "Edit Employee" : "Add New Employee"}
              </h3>
              {user && (
                <span
                  className={`badge badge-${user.active ? "success" : "ghost"
                    }`}>
                  {user.active ? "Active" : "Inactive"}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => document.getElementById(modalId)?.close()}
              className="btn btn-sm btn-circle btn-ghost">
              ✕
            </button>
          </div>

          {/* Form Body */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-y-auto p-6 gap-6">
            {/* Basic Info Card */}
            <div className="card bg-base-200 outline outline-gray-400 shadow-sm p-4">
              <h4 className="font-semibold text-lg mb-4">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField
                  label="First Name"
                  name="firstname"
                  register={register}
                  required={true}
                />
                <InputField
                  label="Middle Name"
                  name="middlename"
                  register={register}
                />
                <InputField
                  label="Last Name"
                  name="lastname"
                  register={register}
                />

                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  register={register}
                />

                <SelectField
                  error={errors}
                  options={genderOptions}
                  register={register}
                  name="gender"
                  label="Gender"
                />

                <InputField
                  label="Department"
                  name="department"
                  type="text"
                  register={register}
                />

                {/* Photo Upload */}
                <div className="form-control gap-1">
                  <input type="hidden" {...register("photo")} />
                  <InputFile
                    id="photo"
                    label="Employee Photo"
                    allowed="image/*"
                    onChange={(e) =>
                      handleFileUpload(
                        e,
                        "photo",
                        "Photo uploaded successfully!",
                      )
                    }
                  />
                  {photo && (
                    <div className="flex items-center gap-2 mt-2">
                      <img
                        src={photo}
                        alt="Preview"
                        className="h-12 w-12 object-cover rounded-box border border-base-300"
                      />
                      <button
                        type="button"
                        className="btn btn-xs btn-outline btn-error"
                        onClick={() =>
                          setValue("photo", "", { shouldDirty: true })
                        }>
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {type === "add" && (
                  <InputField
                    label="Password"
                    name="password"
                    type="password"
                    register={register}
                  />
                )}

                <SelectField
                  error={errors}
                  options={sitesOptions}
                  register={register}
                  name="site"
                  label="Select Site"
                />

                <SelectField
                  error={errors}
                  options={UToptions}
                  register={register}
                  name="userType"
                  label="User Type"
                />

                <InputField
                  label="DOB"
                  name="dob"
                  type="date"
                  register={register}
                />
                <InputField
                  label="Residential Address"
                  name="residAddress"
                  register={register}
                />
                <InputField
                  label="Current Address"
                  name="currAddress"
                  register={register}
                />
                <InputField
                  label="Blood Group"
                  name="bloodGroup"
                  register={register}
                />

                {/* Resume Upload */}
                <div className="form-control gap-1">
                  <input type="hidden" {...register("resume")} />
                  <InputFile
                    id="resume"
                    label="Resume"
                    onChange={(e) =>
                      handleFileUpload(
                        e,
                        "resume",
                        "Resume uploaded successfully!",
                      )
                    }
                  />
                  {resume && (
                    <a
                      href={resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link link-primary text-xs mt-1">
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
                  name="policeVerification"
                  label="Police Verification"
                />
              </div>
            </div>

            {/* Government ID Card */}
            <div className="card bg-base-200 shadow-sm outline outline-gray-400 p-4">
              <h4 className="font-semibold text-lg mb-4">Government ID</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="ID Number"
                  name="govtIds.id"
                  placeholder="e.g. Aadhaar / PAN"
                  register={register}
                />
                <InputField
                  label="ID Name"
                  name="govtIds.name"
                  register={register}
                />
              </div>
            </div>

            {/* Certificate Details Card */}
            <div className="card bg-base-200 shadow-sm outline outline-gray-400 p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-lg">Certificate Details</h4>
                <button
                  type="button"
                  className="btn btn-sm btn-outline btn-primary"
                  onClick={() =>
                    appendMedical({ name: "", number: "", file: "" })
                  }>
                  + Add Certificate
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {medicalFields.map((field, index) => {
                  const fileValue = watch(`medicalDetails.${index}.file`);
                  return (
                    <div
                      key={field.id}
                      className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end bg-base-100 p-3 rounded-box">
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
                      <div className="flex gap-2 items-center">
                        <div className="flex-1">
                          <input
                            type="hidden"
                            {...register(`medicalDetails.${index}.file`)}
                          />
                          {fileValue ? (
                            <div className="flex items-center justify-between bg-base-200 rounded-box">
                              <a
                                href={fileValue}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link link-primary text-xs">
                                View File
                              </a>
                              <button
                                type="button"
                                className="btn btn-xs btn-outline btn-error"
                                onClick={() =>
                                  setValue(`medicalDetails.${index}.file`, "", {
                                    shouldDirty: true,
                                  })
                                }>
                                Change
                              </button>
                            </div>
                          ) : (
                            <InputFile
                              id={`medical-file-${index}`}
                              label="File (.pdf, image)"
                              onChange={(e) =>
                                handleFileUpload(
                                  e,
                                  `medicalDetails.${index}.file`,
                                  "Certificate uploaded successfully!",
                                )
                              }
                            />
                          )}
                        </div>
                        {medicalFields.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-square btn-error btn-sm"
                            onClick={() => removeMedical(index)}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Family Details Card */}
            <div className="card bg-base-200 outline outline-gray-400 shadow-sm p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-lg">Family Details</h4>
                <button
                  type="button"
                  className="btn btn-sm btn-outline btn-primary"
                  onClick={() =>
                    appendFamily({
                      emergency: false,
                      name: "",
                      relation: "",
                      phone: "",
                      email: "",
                    })
                  }>
                  + Add Member
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {familyFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center bg-base-100 p-1 rounded-box">
                    <div className="flex items-center gap-2">
                      <label className="label flex flex-col cursor-pointer gap-3">
                        <span className="label-text font-semibold text-black text-sm">Emergency</span>
                        <input
                          type="checkbox"
                          {...register(`familyDetails.${index}.emergency`)}
                          className="checkbox checkbox-primary checkbox-sm"
                        />
                      </label>
                      <InputField
                        label="Name"
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
                    <div className="flex gap-2 items-end">
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
                          className="btn btn-square btn-error btn-sm"
                          onClick={() => removeFamily(index)}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bank Details Card */}
            <div className="card bg-base-200 outline outline-gray-400 shadow-sm p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-lg">Bank Details</h4>
                <button
                  type="button"
                  className="btn btn-sm btn-outline btn-primary"
                  onClick={() =>
                    appendBank({ name: "", number: "", IFSC: "" })
                  }>
                  + Add Account
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {bankFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end bg-base-100 p-3 rounded-box">
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
                          className="btn btn-square btn-error btn-sm"
                          onClick={() => removeBank(index)}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Salary Information Card */}
            <div className="card bg-base-200 outline outline-gray-400 shadow-sm p-4">
              <h4 className="font-semibold text-lg mb-4">Salary Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <InputField
                  register={register}
                  error={errors}
                  label="Current Salary"
                  name="salaryDetails.currentSalary"
                />
                <InputField
                  register={register}
                  error={errors}
                  label="Basic Salary"
                  name="salaryDetails.basicPay"
                />
                <InputField
                  register={register}
                  error={errors}
                  label="Professional Tax"
                  name="salaryDetails.PT"
                />
                <InputField
                  register={register}
                  error={errors}
                  label="ESIC"
                  name="salaryDetails.ESIC"
                />
                <InputField
                  register={register}
                  error={errors}
                  label="UAN Number"
                  name="salaryDetails.UAN"
                />
              </div>

              {/* Allowances Sub-section */}
              <div className="bg-base-100 p-1 rounded-box">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-medium">Allowances</h5>
                  <button
                    type="button"
                    className="btn btn-xs btn-outline btn-primary"
                    onClick={() => appendAllowance({ name: "", amount: "" })}>
                    + Add Allowance
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {allowanceFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex gap-2 items-center bg-base-200 rounded-box outline p-1">
                      <div className="flex gap-2 flex-1">
                        <InputField
                          name={`salaryDetails.allowance.${index}.name`}
                          register={register}
                          error={errors}
                          label={"Allowance Type"}
                        />
                        <InputField
                          name={`salaryDetails.allowance.${index}.amount`}
                          register={register}
                          error={errors}
                          label={"Allowance Amount"}
                        />
                      </div>
                      {allowanceFields.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-square btn-error btn-xs"
                          onClick={() => removeAllowance(index)}>
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="modal-action mt-4">
              <button
                type="submit"
                disabled={loading || uploading}
                className="btn btn-accent w-full">
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
