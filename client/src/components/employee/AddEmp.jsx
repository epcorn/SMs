import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import InputField from "../form/InputField";
import SelectField from "../form/SelectField";
import toast from "react-hot-toast";
import InputFile from "../form/InputFile";
import { useUploadFile } from "@/hooks/empHooks";
import { useGetSiteQuery } from "@/hooks/siteHooks";
import { Trash2 } from "lucide-react";
import { useFormPersist } from "@/hooks/useFormPersist";

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
const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "employee", label: "Employee" },
  { value: "operator", label: "Operator" },
];
const religiousOptions = [
  { value: "hindu", label: "Hindu" },
  { value: "muslim", label: "Muslim" },
  { value: "christian", label: "Christian" },
  { value: "sikh", label: "Sikh" },
  { value: "buddhist", label: "Buddhist" },
  { value: "jain", label: "Jain" },
  { value: "parsi", label: "Parsi / Zoroastrian" },
  { value: "jewish", label: "Jewish" },
  { value: "other", label: "Other" },
];
const govtIdsArray = [
  {
    id: "aadhaar",
    title: "Aadhaar Card",
    numberField: { name: "adhaar_number", label: "Adhaar Number" },
    fileField: { name: "adhaar_card", label: "Upload Adhaar" },
  },
  {
    id: "pan",
    title: "PAN Card",
    numberField: { name: "pan_number", label: "PAN Number" },
    fileField: { name: "pan_card", label: "Upload PAN" },
  },
  {
    id: "voter",
    title: "Voter ID",
    numberField: { name: "voter_number", label: "Voter ID Number" },
    fileField: { name: "voter_card", label: "Upload Voter ID" },
  },
];
const bloodGroupOptions = [
  { label: "N/A", value: "N/A" },
  { label: "A+", value: "A+" },
  { label: "A-", value: "A-" },
  { label: "B+", value: "B+" },
  { label: "B-", value: "B-" },
  { label: "AB+", value: "AB+" },
  { label: "AB-", value: "AB-" },
  { label: "O+", value: "O+" },
  { label: "O-", value: "O-" },
];
const otherOptions = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
};

function getDefaults(user) {
  return {
    firstname: user?.firstname || "",
    middlename: user?.middlename || "",
    lastname: user?.lastname || "",
    email: user?.email || "",
    phone: user?.phone || "",
    role: user?.role || "employee",
    religion: user?.religion || "hindu",
    photo: user?.photo || "",
    department: user?.department || "",
    gender: user?.gender || "",
    password: "",
    site: user?.site?._id || user?.site || "",
    userType: user?.userType || "trainee",
    dob: formatDateForInput(user?.dob),
    same: false,
    address: {
      present: {
        l1: user?.address?.present?.l1 || "",
        l2: user?.address?.present?.l2 || "",
        l3: user?.address?.present?.l3 || "",
        state: user?.address?.present?.state || "",
        city: user?.address?.present?.city || "",
        pincode: user?.address?.present?.pincode || "",
      },
      permanent: {
        l1: user?.address?.permanent?.l1 || "",
        l2: user?.address?.permanent?.l2 || "",
        l3: user?.address?.permanent?.l3 || "",
        state: user?.address?.permanent?.state || "",
        city: user?.address?.permanent?.city || "",
        pincode: user?.address?.permanent?.pincode || "",
      },
    },
    govtIds: {
      adhaar_number: user?.govtIds?.adhaar_number || "",
      adhaar_card: user?.govtIds?.adhaar_card || "",
      pan_number: user?.govtIds?.pan_number || "",
      pan_card: user?.govtIds?.pan_card || "",
      voter_number: user?.govtIds?.voter_number || "",
      voter_card: user?.govtIds?.voter_card || "",
    },
    policeVerification: user?.policeVerification || "notDone",
    bloodGroup: user?.bloodGroup || "N/A",
    joiningDate: formatDateForInput(user?.joiningDate),
    resume: user?.resume || "",
    eduDetails: user?.eduDetails?.length
      ? user.eduDetails
      : [{ degree: "", year: "", institute: "", grade: "", file: "" }],
    familyDetails: user?.familyDetails?.length
      ? user.familyDetails
      : [{ emergency: false, name: "", relation: "", phone: "", email: "" }],
    medicalDetails: user?.medicalDetails?.length
      ? user.medicalDetails
      : [{ name: "", number: "", file: "" }],
    bankDetails: user?.bankDetails?.length
      ? user.bankDetails
      : [{ name: "", number: "", IFSC: "" }],
    salaryDetails: {
      currentSalary: user?.salaryDetails?.currentSalary ?? "",
      basicPay: user?.salaryDetails?.basicPay ?? "",
      PT: user?.salaryDetails?.PT ?? "",
      ESIC: user?.salaryDetails?.ESIC ?? "",
      UAN: user?.salaryDetails?.UAN ?? "",
      allowance: user?.salaryDetails?.allowance?.length
        ? user.salaryDetails.allowance
        : [{ name: "", amount: "" }],
    },
    hospitalised: {
      status: user?.hospitalised?.status || "no",
      text: user?.hospitalised?.text || "",
    },
    physically_disabled: {
      status: user?.physically_disabled?.status || "no",
      text: user?.physically_disabled?.text || "",
    },
    political_conn: {
      status: user?.political_conn?.status || "no",
      text: user?.political_conn?.text || "",
    },
  };
}

function AddEmp({
  type = "add",
  user = null,
  onSubmitEmp,
  onSuccess,
  userError,
  loading = false,
  storageKey: customStorageKey,
}) {
  const [uploading, setUploading] = useState(false);
  const { mutateAsync: uploadFileMutation } = useUploadFile();
  const { data: sites } = useGetSiteQuery();

  const sitesOptions =
    sites?.map((s) => ({ value: s._id, label: s.name })) || [];

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: getDefaults(user) });

  const storageKey =
    customStorageKey ||
    (type === "edit" && user?._id
      ? `form_edit_emp_${user._id}`
      : "form_add_emp");

  const { clearPersistedData } = useFormPersist(storageKey, watch, setValue, {
    enabled: type === "add" || type === "edit",
    excludeFields: ["password"],
  });

  useEffect(() => {
    reset(getDefaults(user));
  }, [user, type, reset]);

  const {
    fields: eduFields,
    append: appendEdu,
    remove: removeEdu,
  } = useFieldArray({ control, name: "eduDetails" });

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

  useEffect(() => {
    govtIdsArray.forEach((item) => {
      register(`govtIds.${item.numberField.name}`);
      register(`govtIds.${item.fileField.name}`);
    });
  }, [register]);

  const onSubmit = async (formData) => {
    const payload = { creds: formData, id: user?._id };
    try {
      const responseData = await onSubmitEmp?.(payload);
      toast.success(
        responseData?.msg || (type === "edit" ? "User Edited" : "User Created"),
      );
      clearPersistedData();
      onSuccess?.();
      reset();
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

      setValue(fieldName, fileUrl, { shouldDirty: true, shouldTouch: true });
      toast.success(successMessage);
    } catch {
      toast.error("File upload failed");
    } finally {
      e.target.value = "";
      setUploading(false);
    }
  };

  const resume = watch("resume");
  const same = watch("same");
  const presentAddress = watch("address.present");

  const hospitalised = watch("hospitalised.status");
  const physically_disabled = watch("physically_disabled.status");
  const political_conn = watch("political_conn.status");

  console.log(political_conn?.status);
  useEffect(() => {
    if (same) {
      setValue("address.permanent", presentAddress, { shouldValidate: true });
    }
  }, [same, setValue, presentAddress]);

  return (
    <div className="flex flex-col max-h-[82vh] m-1">
      <div className="flex items-center gap-3 pb-3 mb-4 border-b border-base-300 pr-8">
        <h3 className="font-bold text-xl capitalize">
          {type === "edit" ? "Edit Employee" : "Add New Employee"}
        </h3>
        {user && (
          <span
            className={`badge badge-sm ${user.active ? "badge-success" : "badge-ghost"
              }`}>
            {user.active ? "Active" : "Inactive"}
          </span>
        )}
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col flex-1 overflow-y-auto pr-1 gap-4">
        {/* Basic Info */}
        <div className="card bg-base-200 outline outline-gray-400 shadow-sm p-4 m-1">
          <h4 className="font-semibold text-lg mb-4">Basic Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
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
              required={true}
            />
            <InputField
              label="Email"
              name="email"
              type="email"
              required={true}
              register={register}
            />
            {type === "add" && (
              <InputField
                label="Password"
                name="password"
                type="password"
                required={true}
                register={register}
              />
            )}
            <InputField
              label="Phone"
              name="phone"
              type="tel"
              register={register}
            />
            <SelectField
              error={errors}
              options={roleOptions}
              register={register}
              name="role"
              validation={{ required: true }}
              label="Role"
            />
            <SelectField
              error={errors}
              options={religiousOptions}
              register={register}
              name="religion"
              validation={{ required: true }}
              label="Religion"
            />
            <SelectField
              error={errors}
              options={genderOptions}
              register={register}
              name="gender"
              label="Gender"
            />
            <InputField
              label="DOB"
              name="dob"
              type="date"
              register={register}
            />
            <SelectField
              label="Blood Group"
              name="bloodGroup"
              error={errors}
              options={bloodGroupOptions}
              register={register}
            />
            <div className="form-control gap-1">
              <input type="hidden" {...register("resume")} />
              <InputFile
                id="resume"
                label="Upload Resume"
                onChange={(e) =>
                  handleFileUpload(e, "resume", "Resume uploaded successfully!")
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
          </div>
        </div>

        {/* Addresses */}
        <div className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-2 outline outline-gray-400 p-4 m-1 rounded-md">
            <h3 className="col-span-full font-semibold text-lg mb-3">
              Present Address
            </h3>
            <InputField
              error={errors}
              showLabel={false}
              name="address.present.l1"
              label="ex: Room no / area / road"
              register={register}
            />
            <InputField
              error={errors}
              showLabel={false}
              name="address.present.l2"
              label="ex: near by/ landmark"
              register={register}
            />
            <InputField
              error={errors}
              showLabel={false}
              name="address.present.l3"
              label="Line 3"
              register={register}
            />
            <InputField
              error={errors}
              showLabel={false}
              name="address.present.state"
              label="State"
              register={register}
            />
            <InputField
              error={errors}
              showLabel={false}
              name="address.present.city"
              label="City"
              register={register}
            />
            <InputField
              error={errors}
              showLabel={false}
              name="address.present.pincode"
              label="Pincode"
              register={register}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-2 outline outline-gray-400 p-4 m-1 rounded-md">
            <h3 className="col-span-full font-semibold text-lg flex justify-between items-center mb-3">
              <span>Permanent Address</span>
              <label className="text-sm font-normal outline outline-gray-400 bg-gray-200 px-2 py-0.5 rounded-md flex items-center gap-2 cursor-pointer">
                <span>Same as above</span>
                <input
                  type="checkbox"
                  {...register("same")}
                  className="checkbox checkbox-sm"
                />
              </label>
            </h3>
            <InputField
              error={errors}
              showLabel={false}
              name="address.permanent.l1"
              label="ex: Room no / area / road"
              register={register}
            />
            <InputField
              error={errors}
              showLabel={false}
              name="address.permanent.l2"
              label="ex: near by/ landmark"
              register={register}
            />
            <InputField
              error={errors}
              showLabel={false}
              name="address.permanent.l3"
              label="Line 3"
              register={register}
            />
            <InputField
              error={errors}
              showLabel={false}
              name="address.permanent.state"
              label="State"
              register={register}
            />
            <InputField
              error={errors}
              showLabel={false}
              name="address.permanent.city"
              label="City"
              register={register}
            />
            <InputField
              error={errors}
              showLabel={false}
              name="address.permanent.pincode"
              label="Pincode"
              register={register}
            />
          </div>
        </div>

        {/* Professional Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-2 outline outline-gray-400 p-4 m-1 rounded-md">
          <h3 className="col-span-full text-lg font-semibold mb-4">
            Professionals info
          </h3>
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
            label="Department"
            name="department"
            type="text"
            register={register}
          />
        </div>

        {/* Government ID */}
        <div className="card bg-base-100 shadow-md border border-gray-400 p-3 m-1 md:p-5 rounded-xl space-y-4">
          <h3 className="font-bold text-lg">Government Identification</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 ">
            {govtIdsArray.map((item) => {
              const numberPath = `govtIds.${item.numberField.name}`;
              const filePath = `govtIds.${item.fileField.name}`;
              const fileVal = watch(filePath);

              return (
                <div
                  key={item.id}
                  className="bg-base-200/50 border p-4 rounded-lg flex flex-col gap-4 [&_input]:uppercase">
                  <h4 className="font-semibold">{item.title}</h4>
                  <InputField
                    label={item.numberField.label}
                    name={numberPath}
                    type="text"
                    register={register}
                    showLabel={false}
                  />
                  <input type="hidden" {...register(filePath)} />
                  {fileVal && (
                    <div className="flex flex-col gap-2">
                      <img
                        src={fileVal}
                        alt={item.title}
                        className="h-24 w-auto object-contain"
                      />
                      <button
                        type="button"
                        className="btn btn-xs btn-error"
                        onClick={() =>
                          setValue(filePath, "", { shouldDirty: true })
                        }>
                        Remove
                      </button>
                    </div>
                  )}
                  <InputFile
                    id={filePath}
                    label={item.fileField.label}
                    disabled={uploading}
                    onChange={(e) =>
                      handleFileUpload(
                        e,
                        filePath,
                        `${item.title} uploaded successfully!`,
                      )
                    }
                    type="btn"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Educational Details */}
        <div className="card bg-base-200 shadow-sm outline outline-gray-400 p-2 m-1 md:p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-lg">Educational Details</h4>
            <button
              type="button"
              className="btn btn-sm btn-outline btn-primary"
              onClick={() =>
                appendEdu({
                  degree: "",
                  year: "",
                  institute: "",
                  grade: "",
                  file: "",
                })
              }>
              + Add Education
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {eduFields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end bg-base-100 p-3 rounded-box">
                <div className="md:col-span-2">
                  <InputField
                    label="Degree"
                    name={`eduDetails.${index}.degree`}
                    register={register}
                    placeholder=" "
                  />
                </div>
                <InputField
                  label="Date/Year"
                  name={`eduDetails.${index}.year`}
                  register={register}
                  placeholder=" "
                />
                <div className="md:col-span-2">
                  <InputField
                    label="Institute"
                    name={`eduDetails.${index}.institute`}
                    register={register}
                    placeholder=" "
                  />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <InputField
                      label="Grade"
                      name={`eduDetails.${index}.grade`}
                      register={register}
                      placeholder="%"
                    />
                  </div>
                  {eduFields.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-square btn-error btn-sm"
                      onClick={() => removeEdu(index)}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certificate Details */}
        <div className="card bg-base-200 shadow-sm outline outline-gray-400 p-2 m-1 md:p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-lg">Certificate Details</h4>
            <button
              type="button"
              className="btn btn-sm btn-outline btn-primary"
              onClick={() => appendMedical({ name: "", number: "", file: "" })}>
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
                    placeholder="--"
                  />
                  <InputField
                    label="Number"
                    name={`medicalDetails.${index}.number`}
                    register={register}
                    placeholder="--"
                  />
                  <div className="flex gap-2 items-center">
                    <div className="flex-1">
                      <input
                        type="hidden"
                        {...register(`medicalDetails.${index}.file`)}
                      />
                      {fileValue ? (
                        <div className="flex items-center justify-between bg-base-200 rounded-box p-1">
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
                          id={`cert-file-${index}`}
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

        {/* Family Details */}
        <div className="card bg-base-200 outline outline-gray-400 shadow-sm p-2 m-1 md:p-4">
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
                className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center bg-base-100 p-2 rounded-box">
                <div className="flex items-start gap-2">
                  <label className="label flex flex-col cursor-pointer gap-2">
                    <span className="label-text font-semibold text-black text-sm">
                      Emergency
                    </span>
                    <input
                      type="checkbox"
                      {...register(`familyDetails.${index}.emergency`)}
                      className="checkbox checkbox-primary checkbox-sm"
                    />
                  </label>
                  <div className="flex-1">
                    <InputField
                      label="Relation"
                      name={`familyDetails.${index}.relation`}
                      register={register}
                    />
                  </div>
                </div>
                <InputField
                  label="Name"
                  name={`familyDetails.${index}.name`}
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

        {/* Bank Details */}
        <div className="card bg-base-200 outline outline-gray-400 shadow-sm p-2 m-1 md:p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-lg">Bank Details</h4>
            <button
              type="button"
              className="btn btn-sm btn-outline btn-primary"
              onClick={() => appendBank({ name: "", number: "", IFSC: "" })}>
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
                  placeholder="--"
                />
                <InputField
                  label="Account Number"
                  name={`bankDetails.${index}.number`}
                  register={register}
                  placeholder="--"
                />
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <InputField
                      label="IFSC Code"
                      name={`bankDetails.${index}.IFSC`}
                      register={register}
                      placeholder="--"
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

        {/* Salary Info */}
        <div className="card bg-base-200 outline outline-gray-400 shadow-sm p-2 m-1 md:p-4">
          <h4 className="font-semibold text-lg mb-4">Salary Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-4 mb-4">
            <InputField
              register={register}
              error={errors}
              label="Current Salary"
              name="salaryDetails.currentSalary"
              placeholder="--"
            />
            <InputField
              register={register}
              error={errors}
              label="Basic Salary"
              name="salaryDetails.basicPay"
              placeholder="--"
            />
            <InputField
              register={register}
              error={errors}
              label="Professional Tax"
              name="salaryDetails.PT"
              placeholder="--"
            />
            <InputField
              register={register}
              error={errors}
              label="ESIC"
              name="salaryDetails.ESIC"
              placeholder="--"
            />
            <InputField
              register={register}
              error={errors}
              label="UAN Number"
              name="salaryDetails.UAN"
              placeholder="--"
            />
          </div>

          <div className="bg-base-100 p-2 rounded-box">
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
                      label="Allowance Type"
                    />
                    <InputField
                      name={`salaryDetails.allowance.${index}.amount`}
                      register={register}
                      error={errors}
                      label="Allowance Amount"
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

        {/* Other Questions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-2 outline outline-gray-400 p-4 m-1 rounded-lg">
          <h3 className="col-span-full font-semibold text-lg mb-2">
            Other Questions
          </h3>
          <div>
            <SelectField
              error={errors}
              options={otherOptions}
              name="hospitalised.status"
              label="Hospitalsed Previously"
              register={register}
            />
            {hospitalised !== "no" && (
              <InputField
                error={errors}
                label={"Describe"}
                showLabel={false}
                register={register}
                name="hospitalised.text"
              />
            )}
          </div>
          <div>
            <SelectField
              error={errors}
              options={otherOptions}
              name="physically_disabled.status"
              label="Physically disabled"
              register={register}
            />
            {physically_disabled !== "no" && (
              <InputField
                error={errors}
                label={"Describe"}
                showLabel={false}
                register={register}
                name={"physically_disabled.text"}
              />
            )}
          </div>
          <div>
            <SelectField
              error={errors}
              options={otherOptions}
              name="political_conn.status"
              label="Political connection"
              register={register}
            />
            {political_conn !== "no" && (
              <InputField
                error={errors}
                label={"Describe"}
                register={register}
                showLabel={false}
                name={"political_conn.text"}
              />
            )}
          </div>
        </div>

        <div className="modal-action mt-2">
          {userError?.message && (
            <p className="text-red-600">{userError.message}</p>
          )}
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
  );
}

export default AddEmp;
