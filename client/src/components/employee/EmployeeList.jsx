import { useChangePassword, useEditUser, useMarkActiveMutation, } from "@/hooks/empHooks";
import { useState } from "react";
import InputField from "../form/InputField";
import AddEmp from "./AddEmp";
import ModalButton from "../oth/ModalButton";
import EmpCard, { EmpDetails } from "./EmpCard";
import { Eye, IndianRupee, LockKeyholeOpenIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { dateFormat } from "@/utils/helperfn";

function EmployeeList({ response, responding }) {
  const [selecteduser, setSelecteduser] = useState({});
  const [toggle, setToggle] = useState(false);

  const { mutateAsync: editUser, isFetching: editingUser } = useEditUser();
  const { mutateAsync: markActive } = useMarkActiveMutation();

  const { data: users } = response || {};

  return (
    <div className="flex-1 m-1 flex flex-col overflow-hidden shadow-lg">
      {/* Scrollable container for tbody */}
      <div className="overflow-y-auto max-h-[calc(100dvh-200px)] w-full">
        <table className="table table-pin-rows  w-full min-w-5xl">
          <thead className="bg-gray-200 text-center ">
            <tr className="bg-gray-200">
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Site</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {responding ? (
              Array.from({ length: 8 }, (_, index) => (
                <tr key={index} className="h-12 border-b border-base-200">
                  <td className="px-4">
                    <div className="skeleton h-4 w-12"></div>
                  </td>
                  <td className="px-4">
                    <div className="skeleton h-4 w-32"></div>
                  </td>
                  <td className="px-4">
                    <div className="skeleton h-4 w-24"></div>
                  </td>
                  <td className="px-4 flex gap-2" colSpan={3}>
                    <div className="skeleton h-4 w-20"></div>
                  </td>
                </tr>
              ))
            ) : !users?.length ? (
              <tr>
                <td colSpan={6} className="text-center py-12">
                  No users found
                </td>
              </tr>
            ) : (
              users?.map((user, i) => (
                <tr
                  key={user?._id}
                  className={`relative ${user.active ? "" : "opacity-40"}`}>
                  <td>{i + 1}</td>
                  <td>
                    {user.firstname} {user.middlename} {user.lastname}
                  </td>
                  <td>{user?.email}</td>
                  <td>{user?.site?.name}</td>
                  <td><p className="badge badge-sm badge-accent capitalize">{user?.role}</p></td>
                  <td
                    className="flex items-center gap-3 overflow-visible"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}>
                    <div className="tooltip" data-tip='Edit'>
                      <AddEmp
                        type="edit"
                        user={user}
                        onSubmitEmp={editUser}
                        loading={editingUser}
                      />
                    </div>

                    <div className="tooltip" data-tip='View'>
                      <ModalButton
                        id={`view-emp-modal-${user._id}`}
                        btn="btn-secondary btn-sm"
                        title={<Eye className="h-5" />}
                        onClick={() => {
                          setSelecteduser(user);
                          setToggle(false);
                        }}>
                        {selecteduser?._id === user?._id && !toggle ? (
                          <EmpCard user={selecteduser} setToggle={setToggle} />
                        ) : (
                          <EmpDetails user={selecteduser} setToggle={setToggle} />
                        )}
                      </ModalButton>
                    </div>
                    <div className="tooltip" data-tip='change password'>
                      <ModalButton
                        id={`cp-emp-modal-${user._id}`}
                        title={<LockKeyholeOpenIcon className="h-4" />}
                        btn="btn-accent btn-sm"
                        onClick={() => setSelecteduser(user)}>
                        {selecteduser?._id === user?._id && (
                          <ChangePassword user={selecteduser} />
                        )}
                      </ModalButton>
                    </div>
                    <div className="tooltip" data-tip='Add Advance'>
                      <ModalButton id={`advance-emp-modal-${user._id}`} btn="btn-success btn-sm" title={<IndianRupee className="h-4" />} onClick={() => setSelecteduser(user)}>
                        {selecteduser?._id === user?._id &&
                          <AdvanceForm emp={selecteduser} editUser={editUser} />
                        }
                      </ModalButton>
                    </div>

                    <div className="tooltip tooltip-left" data-tip='Mark Active/Inactive'>
                      <input
                        type="checkbox"
                        checked={!!user?.active}
                        className="toggle toggle-success"
                        onChange={async () => {
                          const confirm = window.confirm(`Are you sure want to mark user as ${!user.active ? "Active" : "InActive"}`);
                          if (confirm) {
                            try {
                              const res = await markActive({
                                id: user._id,
                                status: !user?.active,
                              });
                              toast.success(res.msg);
                            } catch (error) {
                              toast.error(error.message);
                            }
                          }
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EmployeeList;

function ChangePassword({ user }) {
  const [resp, setResp] = useState({ res: {}, err: {} });
  const { mutateAsync: changePassword } = useChangePassword();
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    defaultValues: {
      name: `${user?.firstname} ${user?.lastname}`,
      email: user.email || "",
      password: user.password || "",
    },
  });

  const submit = async (data) => {
    try {
      const res = await changePassword(data);
      setResp({ res, err: {} });
      toast.success("Password changed successfully");
    } catch (err) {
      setResp({ err: err, res: {} });
      toast.error("Failed to change password");
    }
  };
  const message = resp?.res?.msg || resp?.err?.msg || resp?.err?.message || "";
  const isError = !!resp?.err?.msg || !!resp?.err?.message;

  return (
    <div>
      <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
        <h3 className="text-2xl font-semibold mb-5">Change password</h3>
        <div className="grid grid-cols-3 gap-3">
          <InputField
            register={register}
            disabled={true}
            error={errors}
            label={"Name"}
            name={"name"}
          />
          <InputField
            register={register}
            error={errors}
            label={"Email"}
            type="email"
            disabled={true}
            name={"email"}
          />
          <InputField
            register={register}
            error={errors}
            label={"Password"}
            type="password"
            name={"password"}
          />

          {message && (
            <p
              className={`col-span-full badge mx-auto ${isError ? "badge-error" : "badge-success"}`}>
              {message}
            </p>
          )}
        </div>
        <button type="submit" className="btn btn-accent">
          Submit
        </button>
      </form>
    </div>
  );
}

function AdvanceForm({ emp, editUser }) {
  const { register, handleSubmit, } = useForm();

  const submit = async (data) => {
    data.advance = true
    const payload = { creds: data, id: emp._id }
    console.log(payload)
    const res = await editUser(payload)
    console.log(res)
  };

  const fullName = [emp?.firstname, emp?.middlename, emp?.lastname].filter(Boolean).join(" ");

  return (
    <div className="card bg-base-100 max-w-2xl min-w-xl w-full p-6 shadow-xl border border-base-300">
      <h3 className="font-bold text-2xl mb-3">Advance Details</h3>
      <p className="text-sm text-base-content font-bold mb-4">
        Employee: <span className="font-semibold text-base-content/80">{fullName || "N/A"}</span>
      </p>

      {/* Table Section */}
      <div className="overflow-x-auto scrollbar-none max-h-72 rounded-lg border border-base-300 mb-6">
        <table className="table table-pin-rows w-full">
          <thead className="[&_th]:bg-gray-700 text-white">
            <tr>
              <th>Date</th>
              <th>Given By</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {!emp?.advance?.length ? (
              <tr>
                <td colSpan={3} className="text-center text-base-content/50 py-6">
                  No advance taken
                </td>
              </tr>
            ) : (
              emp.advance.map((ad) => (
                <tr key={ad._id}>
                  <td>{dateFormat(ad.date)?.fullDateAndTime || "N/A"}</td>
                  <td>
                    {ad.givenBy?.firstname
                      ? `${ad.givenBy.firstname} ${ad.givenBy.lastname || ""}`
                      : "System"}
                  </td>
                  <td className="font-semibold text-right">{ad.amount} ₹</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit(submit)} className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="form-control w-full">
          <label className="input input-lg pb-1 border border-black ">
            <IndianRupee className="w-5 h-5" />
            <input
              type="number"
              required
              placeholder="Amount in Rupees..."
              className="placeholder:text-gray-600 text-xl w-full"
              {...register("amount", { required: true })}
            />
          </label>
        </div>
        <button type="submit" className="btn btn-primary w-full sm:w-auto mt-auto">
          Give Advance
        </button>
      </form>
    </div>
  );
}