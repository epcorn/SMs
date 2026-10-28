import { Eye, Plus, SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import AddEmp from "@/components/employee/AddEmp";
import Search from "@/components/form/Search";
import AddSite from "@/components/oth/AddSite";
import ModalButton from "@/components/oth/ModalButton";
import ShowSites from "@/components/oth/ShowSites";
import { useAddUser, useGetAllUsers } from "@/hooks/empHooks";
import EmployeeList from "@/components/employee/EmployeeList";

function Employees() {
  const [toggle, setToggle] = useState(false)
  useEffect(() => {
    document.title = "SMs | Employees"
  }, [])

  const [empData, setEmpData] = useState({
    name: "",
    email: "",
    limit: 12,
    page: 1,
  });

  const { data: response, isFetching: responding } = useGetAllUsers({
    email: empData.email,
    limit: empData.limit,
    name: empData.name,
    page: empData.page,
  });
  const { mutateAsync: addUser, isFetching: addingUser } = useAddUser();

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const search = (data) => {
    setEmpData((prev) => ({ ...prev, ...data, page: 1 }));
  };

  return (
    <div className="flex flex-col max-h-dvh">
      <div className="fab">
        <div tabIndex={0} role="button" className="btn btn-lg btn-circle btn-info">S</div>

        <div className="fab-close">
          Close <span className="btn btn-circle btn-lg btn-error">✕</span>
        </div>

        <div>Add emp
          <AddEmp type="add" onSubmitEmp={addUser} loading={addingUser} /></div>
        <div>Show Sites<ModalButton id="showSiteModal" title={<span><Eye className="h-4 w-4" /> </span>} btn="btn-secondary btn-md btn-square">
          <ShowSites />
        </ModalButton></div>
        <div>Add Site<ModalButton id="addSiteModal" title={<Plus className="w-4 h-4" />} btn="btn-sm btn-primary">
          <AddSite />
        </ModalButton></div>
      </div>
      <div className="flex justify-end items-center gap-3 mb-4 p-2">
        <h3 className="text-2xl font-semibold mr-auto">Employees</h3>
        <div className="flex ml-auto items-center gap-3">
          <button className="btn btn-neutral btn-square" onClick={() => setToggle(!toggle)}>
            <SearchIcon />
          </button>

        </div>
      </div >
      {toggle && <div className="mb-4">
        <Search
          register={register}
          errors={errors}
          onSubmit={handleSubmit(search)}
        />
      </div>}
      {/* Added min-h-[350px] or padding-bottom to give room for dropdowns */}
      <EmployeeList response={response} responding={responding} />
    </div>
  );
}

export default Employees;


