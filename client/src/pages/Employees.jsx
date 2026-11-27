import { Eye, Plus, PlusIcon, SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import Search from "@/components/form/Search";
import AddSite from "@/components/oth/AddSite";
import ModalButton from "@/components/oth/ModalButton";
import ShowSites from "@/components/oth/ShowSites";
import { useAddUser, useGetAllUsers } from "@/hooks/empHooks";
import EmployeeList from "@/components/employee/EmployeeList";

function Employees() {
  const [toggle, setToggle] = useState({ search: false, sites: false });
  const [editingUserObj, setEditingUserObj] = useState(null);
  const [modalState, setModalState] = useState({ type: null, user: null });

  useEffect(() => {
    document.title = "SMs | Employees";
  }, []);

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

  const {
    mutateAsync: addUser,
    isPending: addingUser,
    error: addUserError,
  } = useAddUser();

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const openModal = (type, user = null) => {
    if (type === "edit" && user) {
      setEditingUserObj(user);
    }
    setModalState({ type, user });
  };

  const closeModal = () => {
    setEditingUserObj(null);
    setModalState({ type: null, user: null });
  };

  const search = (data) => {
    setEmpData((prev) => ({ ...prev, ...data, page: 1 }));
  };

  return (
    <div className="h-dvh overflow-hidden flex flex-col p-1">
      <div className="fab">
        <div
          tabIndex={0}
          role="button"
          className="btn btn-lg btn-circle bg-theme-bg text-white"
        >
          <PlusIcon />
        </div>

        <div className="fab-close">
          Close <span className="btn btn-circle btn-lg bg-theme-hover text-white">✕</span>
        </div>

        <div className="bg-blue-300 pl-1 rounded-md flex items-center justify-between gap-3 w-fit">
          <span className="text-sm font-medium">Add Employee</span>
          <button
            type="button"
            className="btn btn-primary btn-md text-base btn-square"
            onClick={() => openModal("add", null)}
          >
            +
          </button>
        </div>

        <div className="bg-blue-300 pl-1 rounded-md flex items-center justify-between gap-3 w-fit">
          <span className="text-sm font-medium">Show Sites</span>
          <ModalButton
            id="showSiteModal"
            onClick={() => {
              setToggle((prev) => ({ ...prev, sites: !prev.sites }));
            }}
            title={
              <span>
                <Eye className="h-4 w-4" />
              </span>
            }
            btn="btn-secondary btn-md btn-square"
          >
            <ShowSites show={toggle.sites} />
          </ModalButton>
        </div>

        <div className="bg-blue-300 pl-1 rounded-md flex items-center justify-between gap-3 w-fit">
          <span className="text-sm font-medium">Add Site</span>
          <ModalButton
            id="addSiteModal"
            onClick={() => {
              setToggle((prev) => ({ ...prev, sites: !prev.sites }));
            }}
            title={<Plus className="w-4 h-4" />}
            btn="btn-md btn-primary"
          >
            <AddSite />
          </ModalButton>
        </div>
      </div>

      <header className="shrink-0 flex justify-end items-center gap-1 p-2">
        <h3 className="text-2xl font-semibold mr-auto">Employees</h3>
        <div className="flex ml-auto items-center gap-3">
          <button
            type="button"
            className="btn btn-neutral btn-square"
            popoverTarget="popover-1"
            style={{ anchorName: "--anchor-1" }}
          >
            <SearchIcon />
          </button>
        </div>
      </header>

      <div
        className="dropdown dropdown-end menu bg-theme-bg rounded-box shadow-md p-4 mt-2"
        popover="auto"
        id="popover-1"
        style={{ positionAnchor: "--anchor-1" }}
      >
        <Search
          register={register}
          errors={errors}
          onSubmit={handleSubmit(search)}
        />
      </div>

      <EmployeeList
        response={response}
        responding={responding}
        editingUserObj={editingUserObj}
        setEditingUserObj={setEditingUserObj}
        modalState={modalState}
        openModal={openModal}
        closeModal={closeModal}
        addUser={addUser}
        addingUser={addingUser}
        addUserError={addUserError}
      />
    </div>
  );
}

export default Employees;