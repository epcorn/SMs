import { Eye } from "lucide-react";
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
    <>
      <div className="flex justify-end items-center gap-3 mb-4">
        <h3 className="text-2xl font-semibold mr-auto">Employees</h3>
        <AddEmp type="add" onSubmitEmp={addUser} loading={addingUser} />
        <ModalButton id="showSiteModal" title={<span><Eye /> Show Sites</span>} btn="btn-secondary">
          <ShowSites />
        </ModalButton>
        <ModalButton id="addSiteModal" title={'+ Add Site'} >
          <AddSite />
        </ModalButton>
      </div>
      <div className="mb-4">
        <Search
          register={register}
          errors={errors}
          onSubmit={handleSubmit(search)}
        />
      </div>
      {/* Added min-h-[350px] or padding-bottom to give room for dropdowns */}
      <EmployeeList response={response} responding={responding} />
    </>
  );
}

export default Employees;


