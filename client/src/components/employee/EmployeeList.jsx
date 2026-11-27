import {
  useChangePassword,
  useEditUser,
  useMarkActiveMutation,
} from "@/hooks/empHooks";
import { useEffect, useRef, useState } from "react";
import InputField from "../form/InputField";
import AddEmp from "./AddEmp";
import EmpCard, { EmpDetails } from "./EmpCard";
import {
  AlarmClock,
  Eye,
  IndianRupee,
  LockKeyholeOpenIcon,
  Notebook,
  Pencil,
} from "lucide-react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { dateFormat } from "@/utils/helperfn";
import ChangeDutyTime from "./ChangeDutyTime";
import { useGetSiteQuery } from "@/hooks/siteHooks";
import EmployeeDetailForm from "./EmployeeDetailForm";


const badgeClr = {
  admin: "badge-primary",
  operator: "badge-info",
  employee: "badge-outline"
}

function EmployeeList({
  response,
  responding,
  editingUserObj,
  modalState,
  openModal,
  closeModal,
  addUser,
  addingUser,
  addUserError,
}) {
  const [toggle, setToggle] = useState(false);
  const dialogRef = useRef(null);

  const { mutateAsync: editUser, isFetching: editingUser } = useEditUser();
  const { mutateAsync: markActive } = useMarkActiveMutation();
  const { data: sites } = useGetSiteQuery();

  const { data: users } = response || {};

  useEffect(() => {
    if (modalState?.type && dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    } else if (!modalState?.type && dialogRef.current?.open) {
      dialogRef.current.close();
    }
  }, [modalState?.type, modalState?.user]);

  const handleOpen = (type, user = null) => {
    if (type === "view") setToggle(false);
    openModal(type, user);
  };

  const activeUser = modalState?.user || editingUserObj;

  return (
    <div className="flex-1 min-h-0 m-1 flex flex-col overflow-hidden shadow-lg">
      <div className="flex-1 overflow-auto w-full max-h-[calc(100%-4.5rem)] md:max-h-full">
        <table className="table table-pin-rows w-full min-w-max border-2 border-theme-bg">
          <thead>
            <tr className="bg-theme-bg-light text-base">
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
                  <td className="px-4 ">
                    <div className="skeleton h-4 w-20"></div>
                  </td>
                  <td className="px-4 ">
                    <div className="skeleton h-4 w-20"></div>
                  </td>
                  <td className="px-4 ">
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
                  className={`relative ${user.active ? "" : "opacity-40"} text-base`}
                >
                  <td>{i + 1}</td>
                  <td>
                    {user.firstname} {user.middlename} {user.lastname}
                  </td>
                  <td>{user?.email}</td>
                  <td>{user?.site?.name}</td>
                  <td>
                    <p className={`badge badge-md badge-info ${badgeClr[user?.role.toLowerCase()]} capitalize`}>
                      {user?.role}
                    </p>
                  </td>
                  <td
                    className="flex items-center justify-center gap-3 overflow-visible"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Edit */}
                    <div className="tooltip" data-tip="Edit">
                      <button
                        type="button"
                        className="btn btn-outline btn-sm btn-info"
                        onClick={() => handleOpen("edit", user)}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>

                    {/* View */}
                    <div className="tooltip" data-tip="View">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpen("view", user)}
                      >
                        <Eye className="h-5" />
                      </button>
                    </div>

                    {/* Change Duty Time */}
                    <div className="tooltip" data-tip="change Duty time">
                      <button
                        type="button"
                        className="btn btn-info btn-sm"
                        onClick={() => handleOpen("duty", user)}
                      >
                        <AlarmClock className="h-4.5" />
                      </button>
                    </div>

                    {/* Change Password */}
                    <div className="tooltip" data-tip="change password">
                      <button
                        type="button"
                        className="btn btn-accent btn-sm"
                        onClick={() => handleOpen("password", user)}
                      >
                        <LockKeyholeOpenIcon className="h-4" />
                      </button>
                    </div>

                    {/* Add Advance */}
                    <div className="tooltip" data-tip="Add Advance">
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={() => handleOpen("advance", user)}
                      >
                        <IndianRupee className="h-4" />
                      </button>
                    </div>

                    {/* Active Toggle */}
                    <div
                      className="tooltip tooltip-left"
                      data-tip="Mark Active/Inactive"
                    >
                      <input
                        type="checkbox"
                        checked={!!user?.active}
                        className="toggle toggle-success"
                        onChange={async () => {
                          const confirmed = window.confirm(
                            `Are you sure want to mark user as ${!user.active ? "Active" : "InActive"
                            }`
                          );
                          if (confirmed) {
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

      {/* Shared modal for Add/Edit Employee and row actions */}
      {modalState?.type && (activeUser || modalState.type === "add") && (
        <dialog ref={dialogRef} onClose={closeModal} className="modal">
          <div className="modal-box max-w-4xl relative">
            <button
              type="button"
              onClick={closeModal}
              className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 z-10"
            >
              ✕
            </button>

            {modalState.type === "view" &&
              activeUser &&
              <>
                {/* (!toggle ? (
                 <EmpCard user={activeUser} setToggle={setToggle} />
               ) : (
                 <EmpDetails user={activeUser} setToggle={setToggle} />
               ))
               */}
                <EmployeeDetailForm user={activeUser} />
              </>
            }
            {modalState.type === "duty" && activeUser && (
              <ChangeDutyTime
                user={activeUser}
                sites={sites}
                onSuccess={closeModal}
              />
            )}

            {modalState.type === "password" && activeUser && (
              <ChangePassword user={activeUser} />
            )}

            {modalState.type === "advance" && activeUser && (
              <AdvanceForm emp={activeUser} editUser={editUser} />
            )}

            {modalState.type === "add" && (
              <AddEmp
                type="add"
                onSubmitEmp={addUser}
                userError={addUserError}
                loading={addingUser}
                onSuccess={closeModal}
              />
            )}

            {modalState.type === "edit" && activeUser && (
              <AddEmp
                type="edit"
                user={activeUser}
                onSubmitEmp={editUser}
                loading={editingUser}
                onSuccess={closeModal}
              />
            )}
          </div>
          <form method="dialog" className="modal-backdrop">
            <button type="submit" onClick={closeModal}>
              close
            </button>
          </form>
        </dialog>
      )}
    </div>
  );
}

export default EmployeeList;

function ChangePassword({ user }) {
  const [resp, setResp] = useState({ res: {}, err: {} });
  const { mutateAsync: changePassword } = useChangePassword();
  const { register, formState: { errors }, handleSubmit, } = useForm({
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
      <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4 px-8">
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
            placeholder='*******'
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
  const { register, handleSubmit, reset } = useForm();

  const submit = async (data) => {
    data.advance = true;
    const payload = { creds: data, id: emp._id };
    try {
      await editUser(payload);
      toast.success("Advance added successfully");
      reset();
    } catch (error) {
      toast.error(error?.message || "Failed to add advance");
    }
  };

  const fullName = [emp?.firstname, emp?.middlename, emp?.lastname].filter(Boolean).join(" ");

  return (
    <div className="card bg-base-100 w-full max-w-2xl p-6 shadow-xl border border-base-300">
      <h3 className="font-bold text-2xl mb-1">Advance Details</h3>
      <p className="text-sm text-base-content font-bold mb-4">
        Employee: <span className="font-semibold text-base-content/80">{fullName || "N/A"}</span>
      </p>

      {/* Form Section */}
      <form onSubmit={handleSubmit(submit)} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center mb-6">
        <label className="input input-bordered flex items-center gap-2 md:col-span-4 h-12 w-full">
          <IndianRupee className="w-5 h-5 text-gray-500 shrink-0" />
          <input
            type="number"
            required
            placeholder="Amount..."
            className="w-full text-base bg-transparent focus:outline-none"
            {...register("amount", { required: true })}
          />
        </label>

        <label className="input input-bordered flex items-center gap-2 md:col-span-5 h-12 w-full">
          <Notebook className="w-5 h-5 text-gray-500 shrink-0" />
          <input
            type="text"
            required
            placeholder="Note..."
            className="w-full text-base bg-transparent focus:outline-none"
            {...register("note", { required: true })}
          />
        </label>

        <button type="submit" className="btn btn-primary md:col-span-3 h-12 w-full">
          Add Advance
        </button>
      </form>

      {/* Table Section */}
      <div className="overflow-x-auto max-h-72 rounded-lg border border-base-300">
        <table className="table table-pin-rows w-full">
          <thead className="[&_th]:bg-gray-700 text-white">
            <tr>
              <th>Date</th>
              <th>Given By</th>
              <th>Note</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {!emp?.advance?.length ? (
              <tr>
                <td colSpan={4} className="text-center py-6">
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
                  <td>{ad.note || "N/A"}</td>
                  <td className="font-semibold text-right">{ad.amount} ₹</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}