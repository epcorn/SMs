import { useChangePassword, useEditUser, useMarkActiveMutation } from '@/hooks/empHooks';
import { useState } from 'react';
import InputField from '../form/InputField';
import AddEmp from './AddEmp';
import ModalButton from '../oth/ModalButton';
import EmpCard, { EmpDetails } from './EmpCard';
import { LockKeyholeOpenIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

function EmployeeList({ response, responding }) {
  const [selecteduser, setSelecteduser] = useState({});
  const [toggle, setToggle] = useState(false);

  const { mutateAsync: editUser, isFetching: editingUser } = useEditUser();
  const { mutateAsync: markActive } = useMarkActiveMutation();

  const { data: users } = response || {};

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="table">
          <thead className="bg-gray-200 rounded-md">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Site</th>
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
                  <td className="px-4 flex gap-2">
                    <div className="skeleton h-4 w-5"></div>
                    <div className="skeleton h-4 w-5"></div>
                    <div className="skeleton h-4 w-5"></div>
                  </td>
                </tr>
              ))
            ) : !users?.length ? (
              <tr>
                <td colSpan={4} className="text-center py-12">
                  No users found
                </td>
              </tr>
            ) : (
              users?.map((user, i) => (
                <tr key={user?._id} className={`relative ${user.active ? "" : "opacity-40"}`}>
                  <td>{i + 1}</td>
                  <td>
                    {user.firstname} {user.middlename} {user.lastname}
                  </td>
                  <td>{user?.email}</td>
                  <td>{user?.site?.name}</td>
                  <td
                    className="flex items-center gap-3 overflow-visible"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <AddEmp
                      type="edit"
                      user={user}
                      onSubmitEmp={editUser}
                      loading={editingUser}
                    />
                    <ModalButton
                      id={`view-emp-modal-${user._id}`}
                      title="Details"
                      onClick={() => {
                        setSelecteduser(user);
                        setToggle(false);
                      }}
                    >
                      {selecteduser?._id === user?._id && !toggle ? (
                        <EmpCard user={selecteduser} setToggle={setToggle} />
                      ) : (
                        <EmpDetails user={selecteduser} setToggle={setToggle} />
                      )}
                    </ModalButton>
                    <ModalButton
                      id={`cp-emp-modal-${user._id}`}
                      title={<LockKeyholeOpenIcon />}
                      onClick={() => setSelecteduser(user)}
                    >
                      {selecteduser?._id === user?._id && (
                        <ChangePassword user={user} />
                      )}
                    </ModalButton>

                    <input type="checkbox" checked={!!user?.active} className="toggle toggle-success" onChange={async () => {
                      console.log(user.active)
                      try {
                        const res = await markActive({ id: user._id, status: !user?.active })
                        toast.success(res.msg)
                      } catch (error) {
                        toast.error(error.message)
                      }
                    }} />
                    {/* <MarkAttendence user={user} /> */}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default EmployeeList


function ChangePassword({ user }) {
  const [resp, setResp] = useState({ res: {}, err: {} })
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
      setResp({ res, err: {} })
      toast.success("Password changed successfully");
      // document.getElementById(`cp-emp-modal-${user._id}`).close()
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
            <p className={`col-span-full badge mx-auto ${isError ? "badge-error" : "badge-success"}`}>
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

