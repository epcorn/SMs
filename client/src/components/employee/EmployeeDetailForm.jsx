import { dateFormat } from "@/utils/helperfn";
import { differenceInYears, parseISO } from "date-fns";

function EmployeeDetailForm({ user }) {
  const {
    firstname,
    middlename,
    lastname,
    dob,
    gender,
    religion,
    address,
    bloodGroup,
    eduDetails,
    email,
    govtIds,
    phone,
    photo,
    policeVerification,
    resume,
    medicalDetails,
    familyDetails,
    joiningDate,
    site,
    hospitalized,
    physically_disabled,
    political_conn,

  } = user || {};

  const age = dob ? differenceInYears(new Date(), parseISO(dob)) : "N/A";
  const formattedDob = dob ? dateFormat(dob)?.date : "N/A";

  const presentAdrs =
    [
      address?.present?.l1,
      address?.present?.l2,
      address?.present?.l3,
      address?.present?.city,
      address?.present?.state,
      address?.present?.pincode,
    ]
      .filter(Boolean)
      .join(", ") || "N/A";

  const permanentAdrs =
    [
      address?.permanent?.l1,
      address?.permanent?.l2,
      address?.permanent?.l3,
      address?.permanent?.city,
      address?.permanent?.state,
      address?.permanent?.pincode,
    ]
      .filter(Boolean)
      .join(", ") || "N/A";

  return (
    <div className="max-w-4xl mx-auto bg-white text-black p-2 border border-gray-400 print:border-0 print:p-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-gray-800 pb-3 mb-5">
        <div>
          <h3 className="font-bold text-2xl tracking-tight">
            Employee Details Form
          </h3>
          <p className="text-xs text-gray-600">Official Personnel Record</p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="px-3 py-1.5 text-sm font-medium border border-gray-700 rounded hover:bg-gray-100 print:hidden">
          Print Form
        </button>
      </div>

      {/* Personal Details */}
      <section className="mb-5 break-inside-avoid bg-gray-100">
        <h4 className="text-base font-bold uppercase tracking-wider bg-gray-100 py-1.5 mb-3">
          1. Personal Information
        </h4>
        <div className="flex justify-between gap-4 pl-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 flex-1 text-sm">
            <p className="border-b border-dotted border-gray-300 pb-1">
              <strong className="font-semibold">First Name: </strong>
              <span>{firstname || "N/A"}</span>
            </p>
            <p className="border-b border-dotted border-gray-300 pb-1">
              <strong className="font-semibold">Middle Name: </strong>
              <span>{middlename || "N/A"}</span>
            </p>
            <p className="border-b border-dotted border-gray-300 pb-1">
              <strong className="font-semibold">Last Name: </strong>
              <span>{lastname || "N/A"}</span>
            </p>
            <p className="border-b border-dotted border-gray-300 pb-1">
              <strong className="font-semibold">Email: </strong>
              <span>{email || "N/A"}</span>
            </p>
            <p className="border-b border-dotted border-gray-300 pb-1">
              <strong className="font-semibold">Phone Number: </strong>
              <span>{phone || "N/A"}</span>
            </p>
            <p className="border-b border-dotted border-gray-300 pb-1">
              <strong className="font-semibold">Police Verification: </strong>
              <span>
                {policeVerification === "notDone" ? "Not Done" : "Done"}
              </span>
            </p>
          </div>

          {photo && (
            <div className="shrink-0 border border-gray-400 p-1">
              <img
                src={photo}
                className="h-40 w-32 object-cover"
                alt={`${firstname || "Employee"} photo`}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-sm border border-gray-300 p-2.5">
          <p>
            <strong>Gender: </strong>
            <span>{gender || "N/A"}</span>
          </p>
          <p>
            <strong>DOB: </strong>
            <span>{formattedDob}</span>
          </p>
          <p>
            <strong>Age: </strong>
            <span>{age}</span>
          </p>
          <p>
            <strong>Religion: </strong>
            <span>{religion || "N/A"}</span>
          </p>
          <p>
            <strong>Blood Group: </strong>
            <span>{bloodGroup || "N/A"}</span>
          </p>
          <p className="col-span-2 sm:col-span-3">
            <strong>Working On: </strong>
            <span>{site?.name || "N/A"}</span>
          </p>
        </div>
      </section>

      {/* Documents */}
      <section className="mb-5 break-inside-avoid bg-gray-100">
        <h4 className="text-base font-bold uppercase tracking-wider bg-gray-100 py-1.5 mb-3">
          2. Documents Attached
        </h4>
        <div className="text-sm pl-5">
          <p>
            <strong>Resume / CV: </strong>
            {resume ? (
              <a
                href={resume}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-700 print:text-black print:no-underline">
                View Document
              </a>
            ) : (
              "N/A"
            )}
          </p>
        </div>
      </section>

      {/* Address */}
      <section className="mb-5 break-inside-avoid bg-gray-100">
        <h4 className="text-base  font-bold uppercase tracking-wider py-1.5 mb-3">
          3. Address Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-5 text-sm">
          <div className="border border-gray-300 p-3">
            <strong className="block mb-1">Current Address</strong>
            <p className="text-gray-800">{presentAdrs}</p>
          </div>
          <div className="border border-gray-300 p-3">
            <strong className="block mb-1">Permanent Address</strong>
            <p className="text-gray-800">{permanentAdrs}</p>
          </div>
        </div>
      </section>

      {/* Education */}
      <section className="mb-5 break-inside-avoid bg-gray-100">
        <h4 className="text-base font-bold uppercase tracking-wider bg-gray-100 py-1.5 mb-3">
          4. Education Details
        </h4>
        <div className="overflow-x-auto pl-5">
          <table className="table border border-gray-400">
            <thead className="bg-gray-400 border-b border-gray-300 text-left">
              <tr>
                <th className="p-2 border-r border-gray-300">Degree</th>
                <th className="p-2 border-r border-gray-300">Institute Name</th>
                <th className="p-2 border-r border-gray-300">Grade</th>
                <th className="p-2 print:hidden">Certificate</th>
              </tr>
            </thead>
            <tbody>
              {eduDetails?.length > 0 ? (
                eduDetails.map((ed, idx) => (
                  <tr
                    key={ed.id || idx}
                    className="border-b border-gray-200 break-inside-avoid">
                    <td className="p-2 border-r border-gray-300">
                      {ed.degree || "N/A"}
                    </td>
                    <td className="p-2 border-r border-gray-300">
                      {ed.institute || "N/A"}
                    </td>
                    <td className="p-2 border-r border-gray-300">
                      {ed.grade || "N/A"}
                    </td>
                    <td className="p-2 print:hidden">
                      {ed.certificate ? (
                        <a
                          href={ed.certificate}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-blue-700">
                          Download
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-3 text-center text-gray-600">
                    No education details available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Government IDs */}
      <section className="mb-5 break-inside-avoid bg-gray-100">
        <h4 className="text-base font-bold uppercase tracking-wider bg-gray-100 py-1.5 mb-3">
          5. Government IDs
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm border border-gray-300 pl-5">
          <p>
            <strong>Aadhaar Card: </strong>
            <span>{govtIds?.adhaar_number || "N/A"}</span>
          </p>
          <p>
            <strong>PAN Card: </strong>
            <span className="uppercase">{govtIds?.pan_number || "N/A"}</span>
          </p>
          <p>
            <strong>Voter Card: </strong>
            <span>{govtIds?.voting_number || "N/A"}</span>
          </p>
        </div>
      </section>

      {/* medical certificate */}
      <section className="my-5 ">
        <h4 className="text-base font-bold uppercase tracking-wider bg-gray-100 py-1.5 mb-3">Family details</h4>

        <div className="ml-5">
          <table className="table rounded-md border border-gray-400">
            <thead className="bg-gray-400">
              <tr>
                <th>Emergency</th>
                <th>relation</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {familyDetails.length > 0 ? familyDetails.map(fm => (
                <tr>
                  <td>{fm?.emergency ? "✔️" : ""}</td>
                  <td className="capitalize">{fm.relation}</td>
                  <td className="capitalize">{fm.name}</td>
                  <td>{fm.email}</td>
                  <td>{fm.phone}</td>
                </tr>
              )) :
                <tr>
                  <td colSpan={5}> No family details addeed</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      {/* medical certificate */}
      <section>
        <h4></h4>
      </section>

      <section className="mb-5 break-inside-avoid bg-gray-100">
        <h4 className="text-base font-semibold">6. General Questions</h4>
        <div className="pl-5 *:flex *:flex-col">
          <p>
            <strong>
              1. Do you have any ailments and have you been hospitalized
              previously?
            </strong>
            <span className="ml-5 w-lg min-w-fit border-b">
              {hospitalized?.status} - {hospitalized?.text}
            </span>
          </p>
          <p>
            <strong>2. Do you have any physical disability?</strong>{" "}
            <span className="ml-5 w-lg min-w-fit border-b">
              {physically_disabled?.status} - {physically_disabled?.text}
            </span>{" "}
          </p>
          <p>
            <strong>
              3. Have you been connected with any political activities? Specify:
            </strong>
            <span className="ml-5 w-lg min-w-fit border-b">
              {political_conn?.status} - {political_conn?.text}
            </span>
          </p>
          <p>
            <strong>4. Time required to join (If selected)</strong>
          </p>
        </div>
      </section>

    </div>
  );
}

export default EmployeeDetailForm;
