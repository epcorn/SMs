import { useForm } from "react-hook-form";
import InputField from "../form/InputField";
import SelectField from "../form/SelectField";
import { useAddDuty } from "@/hooks/empHooks";

function ChangeDutyTime({ user, sites }) {
  const defaultVals = {
    site: user?.site?._id || user?.site?.id || "",
  };

  const { mutateAsync: addDuty, isPending: addingDuty } = useAddDuty()
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({ defaultValues: defaultVals });

  //eslint-disable-next-line
  const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Completed", value: "completed" },
    { label: "Missed", value: "missed" },
  ];

  
  const siteOptions =
    sites?.map((s) => ({ label: s?.name, value: s?._id })) || [];

  const submit = async (data) => {
    const payload = {
      ...data,
      id: user._id,
    };
    const result = await addDuty(payload)

    console.log(result);
  };

  return (
    <div className="mt-5 ">
      <h3 className="text-2xl font-semibold text-center underline mb-2">
        {" "}
        Change Duty Time
      </h3>
      <form onSubmit={handleSubmit(submit)} className="px-3 flex flex-col">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ">
          <InputField
            name={"instruction"}
            register={register}
            error={errors}
            label={"Enter Instruction"}
          />
          <InputField
            type="datetime-local"
            name={"startTime"}
            register={register}
            error={errors}
            label={"Choose Start Date"}
          />
          <InputField
            type="datetime-local"
            name={"endTime"}
            register={register}
            error={errors}
            label={"Choose End Time"}
          />
          <SelectField
            error={errors}
            register={register}
            options={siteOptions}
            label="Select Site"
            name="site"
          />
        </div>

        <button className="btn btn-info mx-auto my-4 disabled:opacity-80">{addingDuty ? "Saving..." : "Save"}</button>
      </form>
    </div>
  );
}


export default ChangeDutyTime;