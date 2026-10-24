import { dateFormat } from '@/utils/helperfn';
import { differenceInYears } from 'date-fns';

const getUserTypeBadge = (type) => {
  switch (type?.toLowerCase()) {
    case "trainee":
      return { badge: "badge-primary", bg: "bg-slate-800 text-white" };
    case "apprentice":
      return { badge: "badge-secondary", bg: "bg-slate-700 text-white" };
    default:
      return { badge: "badge-neutral", bg: "bg-slate-900 text-white" };
  }
};

export function EmpDetails({ user = {}, setToggle }) {
  const familyList = user?.familyDetails?.filter(
    (f) => f?.name || f?.relation || f?.phone
  );
  const bankList = user?.bankDetails?.filter(
    (b) => b?.name || b?.number || b?.IFSC
  );
  const medicalList = user?.medicalDetails?.filter(
    (m) => m?.name || m?.number || m?.file
  );

  const userBadge = getUserTypeBadge(user?.userType);

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-xl shadow-xl border border-slate-200 text-slate-800">
      {/* Corporate Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-6 mb-6 gap-4">
        <div className="flex items-center gap-5">
          <img
            src={user?.photo || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRE90TDdHxK9BwLoldB7X6SHDKEUKsMOfsaIsLb2ghnqg&s"}
            alt="Employee"
            className="h-20 w-20 object-cover rounded-lg shadow-sm border border-slate-300"
          />
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-bold tracking-tight text-slate-900 capitalize">
                {user?.firstname} {user?.middlename} {user?.lastname}
              </h3>
              <span className={`badge ${userBadge.badge} badge-sm uppercase font-medium`}>
                {user?.userType || "Employee"}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">{user?.email || "No email provided"}</p>
          </div>
        </div>
        <div>
          {user?.active ? (
            <span className="badge badge-success badge-md font-semibold text-white px-3 py-2">Active Staff</span>
          ) : (
            <span className="badge badge-error badge-md font-semibold text-white px-3 py-2">Inactive</span>
          )}
        </div>
      </div>

      {/* Corporate Information Grid */}
      <div className="mb-8">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Employment & Personal Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-lg border border-slate-200 text-sm">
          <div>
            <span className="text-xs block font-medium uppercase">Date of Birth</span>
            <span className="font-semibold text-slate-700">{user?.dob ? user.dob.split("T")[0] : "N/A"}</span>
          </div>
          <div>
            <span className="text-xs block font-medium uppercase">Joining Date</span>
            <span className="font-semibold text-slate-700">{user?.joiningDate ? user.joiningDate.split("T")[0] : "N/A"}</span>
          </div>
          <div>
            <span className="text-xs block font-medium uppercase">Blood Group</span>
            <span className="font-semibold text-slate-700">{user?.bloodGroup || "N/A"}</span>
          </div>
          <div>
            <span className="text-xs block font-medium uppercase">Police Verification</span>
            <span className={`font-semibold ${user?.policeVerification === "done" ? "text-emerald-600" : "text-amber-600"}`}>
              {user?.policeVerification === "done" ? "Verified Done" : "Pending Review"}
            </span>
          </div>
          <div>
            <span className="text-xs block font-medium uppercase">Govt ID ({user?.govtIds?.name || "ID"})</span>
            <span className="font-semibold text-slate-700">{user?.govtIds?.id || "N/A"}</span>
          </div>
          <div>
            <span className="text-xs block font-medium uppercase">Resume Document</span>
            {user?.resume ? (
              <a href={user?.resume} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold underline">
                View File ↗
              </a>
            ) : (
              <span className="text-slate-400">Not Uploaded</span>
            )}
          </div>
          <div className="md:col-span-3 pt-2 border-t border-slate-200">
            <span className="text-xs block font-medium uppercase mb-1">Residential Address</span>
            <span className="font-medium text-slate-700">{user?.residAddress || "N/A"}</span>
          </div>
          <div className="md:col-span-3">
            <span className="text-xs block font-medium uppercase mb-1">Current Address</span>
            <span className="font-medium text-slate-700">{user?.currAddress || "N/A"}</span>
          </div>
        </div>
      </div>

      {/* Salary Structure Section */}
      <div className="mb-8">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Compensation & Statutory Info</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-slate-300 p-4 rounded-lg border border-slate-200 text-center text-sm">
          <div className="bg-white p-3 rounded border border-slate-200">
            <span className="text-[11px] block uppercase font-semibold">Current Salary</span>
            <span className="font-bold text-slate-800">{user?.salaryDetails?.currentSalary ? `₹${user.salaryDetails.currentSalary}` : "N/A"}</span>
          </div>
          <div className="bg-white p-3 rounded border border-slate-200">
            <span className="text-[11px] block uppercase font-semibold">Basic Pay</span>
            <span className="font-bold text-slate-800">{user?.salaryDetails?.basicPay ? `₹${user.salaryDetails.basicPay}` : "N/A"}</span>
          </div>
          <div className="bg-white p-3 rounded border border-slate-200">
            <span className="text-[11px] block uppercase font-semibold">Professional Tax</span>
            <span className="font-bold text-slate-800">{user?.salaryDetails?.PT ? `₹${user.salaryDetails.PT}` : "N/A"}</span>
          </div>
          <div className="bg-white p-3 rounded border border-slate-200">
            <span className="text-[11px] block uppercase font-semibold">ESIC</span>
            <span className="font-bold text-slate-800">{user?.salaryDetails?.ESIC ? `₹${user.salaryDetails.ESIC}` : "N/A"}</span>
          </div>
          <div className="bg-white p-3 rounded border border-slate-200 col-span-2 md:col-span-1">
            <span className="text-[11px] block uppercase font-semibold">UAN Number</span>
            <span className="font-bold text-slate-800">{user?.salaryDetails?.UAN || "N/A"}</span>
          </div>

          <div className='col-span-full grid grid-cols-3'>
            <h3 className='col-span-full text-left font-semibold text-base capitalize '>allowance Details</h3>
            {user?.salaryDetails?.allowance?.map(al => (
              <div key={al?.name} className="bg-white p-3 rounded border">
                <span className="text-[11px]  block uppercase font-semibold">{al.name}</span>
                <span className="font-bold text-slate-800">{al.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Certificate Details Section */}
      <div className="mb-8">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Professional Certificates</h4>
        {medicalList?.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-slate-400">
            <table className="table w-full bg-white text-sm">
              <thead>
                <tr className="bg-slate-300 text-slate-600 font-semibold">
                  <th>Certificate Title</th>
                  <th>Registration No.</th>
                  <th>Attachment</th>
                </tr>
              </thead>
              <tbody>
                {medicalList.map((med) => (
                  <tr key={med?._id || med?.name} className="uppercase border-t border-slate-100">
                    <td className="font-medium text-slate-800">{med?.name}</td>
                    <td className="text-slate-600">{med?.number || "N/A"}</td>
                    <td>
                      {med?.file ? (
                        <a href={med.file} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold lowercase underline">
                          View File ↗
                        </a>
                      ) : (
                        <span className="text-slate-400 lowercase">No file</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-400 text-sm italic">No certificate records found.</p>
        )}
      </div>

      {/* Family Details Section */}
      <div className="mb-8">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Family & Emergency Contacts</h4>
        {familyList?.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-slate-400">
            <table className="table w-full bg-white text-sm">
              <thead>
                <tr className="bg-slate-300 text-slate-600 font-semibold">
                  <th>Dependent Name</th>
                  <th>Relation</th>
                  <th>Contact Number</th>
                  <th>Emergency Status</th>
                </tr>
              </thead>
              <tbody>
                {familyList.map((fam) => (
                  <tr key={fam?._id || fam?.name} className={`uppercase border-t border-slate-100 ${fam.emergency ? "bg-red-50/70 font-semibold" : ""}`}>
                    <td className="font-medium text-slate-800">{fam?.name}</td>
                    <td className="text-slate-600">{fam?.relation}</td>
                    <td className="text-slate-600">{fam?.phone}</td>
                    <td>
                      {fam.emergency ? (
                        <span className="badge badge-error badge-sm text-white font-medium">Emergency</span>
                      ) : (
                        <span className="text-slate-400 font-normal">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-400 text-sm italic">No family records found.</p>
        )}
      </div>

      {/* Bank Details Section */}
      <div className="mb-6">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Bank Account Information</h4>
        {bankList?.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-slate-400">
            <table className="table w-full bg-white text-sm">
              <thead>
                <tr className="bg-slate-300 text-slate-600 font-semibold">
                  <th>Account Holder</th>
                  <th>Account Number</th>
                  <th>IFSC Code</th>
                </tr>
              </thead>
              <tbody>
                {bankList.map((bank) => (
                  <tr key={bank?._id || bank?.number} className="uppercase border-t border-slate-100">
                    <td className="font-medium text-slate-800">{bank?.name}</td>
                    <td className="text-slate-600 font-mono tracking-wide">{bank?.number}</td>
                    <td className="text-slate-600 font-mono tracking-wide">{bank?.IFSC}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-400 text-sm italic">No bank records found.</p>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-between items-center pt-5 border-t border-slate-200">
        <button type="button" className="btn btn-sm btn-outline border-slate-300 text-slate-600 hover:bg-slate-100" onClick={() => setToggle(false)}>
          ← Back to ID Card
        </button>
        <button type="button" className="btn hidden btn-sm btn-neutral text-white" onClick={() => setToggle(false)}>
          Close Dossier
        </button>
      </div>
    </div>
  );
}

export function EmpCard({ user = {}, setToggle }) {

  const defaultPhoto = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRE90TDdHxK9BwLoldB7X6SHDKEUKsMOfsaIsLb2ghnqg&s";
  const emergencyContact = user?.familyDetails?.find((f) => f?.emergency) || user?.familyDetails?.[0];
  const userBadge = getUserTypeBadge(user?.userType);

  return (
    <div className="card w-85 bg-white shadow-2xl border border-slate-300 rounded-xl overflow-hidden mx-auto text-slate-900">
      {/* Corporate ID Header */}
      <div className={`${userBadge.bg} px-4 py-3.5 text-center`}>
        <h3 className="font-extrabold tracking-widest text-xs uppercase">Squad Management System</h3>
      </div>

      {/* Avatar Section */}
      <figure className="px-6 pt-6 flex flex-col items-center">
        <img
          className="h-28 w-28 object-cover rounded-xl border-2 border-slate-300 shadow-md"
          src={user?.photo || defaultPhoto}
          alt={user?.firstname || "Employee"}
        />
        <h2 className="card-title text-lg font-bold mt-3 text-center text-slate-900 tracking-tight uppercase">
          {user?.firstname || ""} {user?.middlename || ""} {user?.lastname || ""}
        </h2>
        <span className={`badge ${userBadge.badge} badge-sm font-bold mt-1 uppercase tracking-wider px-3 py-2`}>
          {user?.userType || "Employee"}
        </span>
      </figure>

      {/* ID Card Body */}
      <div className="card-body px-6 py-4 text-sm space-y-3">
        <div className="divider my-0 border-slate-300"></div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-slate-800">
          <div>
            <span className="text-xs text-slate-500 uppercase font-bold tracking-wide block mb-0.5">Email</span>
            <span className="font-semibold text-slate-900 truncate block max-w-[140px]" title={user?.email}>
              {user?.email || "N/A"}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 uppercase font-bold tracking-wide block mb-0.5">Blood Group</span>
            <span className="font-semibold text-slate-900">
              {user?.bloodGroup && user?.bloodGroup !== "N/A" ? user.bloodGroup : "N/A"}
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-500 uppercase font-bold tracking-wide block mb-0.5">Age</span>
            <span className="font-semibold text-slate-900">
              {user?.dob ? `${differenceInYears(new Date(), new Date(user.dob))} Yrs` : "N/A"}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 uppercase font-bold tracking-wide block mb-0.5">Joining Date</span>
            <span className="font-semibold text-slate-900">
              {user?.joiningDate ? dateFormat(user.joiningDate).date : "N/A"}
            </span>
          </div>

          <div className="col-span-2">
            <span className="text-xs text-slate-500 uppercase font-bold tracking-wide block mb-0.5">
              Govt ID ({user?.govtIds?.name || "ID"})
            </span>
            <span className="font-bold text-slate-900 tracking-wider bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block">
              {user?.govtIds?.id || "N/A"}
            </span>
          </div>

          <div className="col-span-2">
            <span className="text-xs text-slate-500 uppercase font-bold tracking-wide block mb-0.5">Police Verification</span>
            <span className={`badge badge-sm font-bold tracking-wide px-2.5 py-2 ${user?.policeVerification === "notDone"
              ? "bg-rose-100 text-rose-700 border border-rose-300"
              : "bg-emerald-100 text-emerald-800 border border-emerald-300"
              }`}>
              {user?.policeVerification === "notDone" ? "Verification Pending" : "Verified & Validated"}
            </span>
          </div>

          {emergencyContact && (
            <div className="col-span-2 bg-rose-50/60 p-3 rounded-lg border border-rose-200 mt-1">
              <span className="text-xs text-rose-700 font-extrabold uppercase tracking-wide block mb-0.5">Emergency Contact</span>
              <span className="font-bold text-slate-900 block">
                {emergencyContact.name} ({emergencyContact.relation})
              </span>
              <span className="font-bold text-rose-700 tracking-wide text-xs">
                {emergencyContact.phone}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="card-actions bg-slate-100 px-6 py-4 border-t border-slate-200 flex justify-end items-center">
        <button
          type="button"
          className="btn btn-md btn-neutral w-full font-bold shadow-md hover:scale-[1.01] active:scale-95 transition-all text-sm"
          onClick={() => setToggle(true)}
        >
          View Full Details →
        </button>
      </div>
    </div>
  );
}

export default EmpCard;