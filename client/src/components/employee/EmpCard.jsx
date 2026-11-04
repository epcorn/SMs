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
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md border border-slate-400 text-slate-900 font-normal">
      
      {/* Corporate Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-slate-300 pb-4 mb-6 gap-4">
        <div className="flex items-center gap-4">
          <img
            src={user?.photo || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRE90TDdHxK9BwLoldB7X6SHDKEUKsMOfsaIsLb2ghnqg&s"}
            alt="Employee"
            className="h-16 w-16 object-cover rounded border border-slate-400"
          />
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-slate-900 capitalize">
                {user?.firstname} {user?.middlename} {user?.lastname}
              </h3>
              <span className="px-2 py-0.5 bg-slate-200 border border-slate-400 text-xs font-bold uppercase rounded">
                {user?.userType || "Employee"}
              </span>
            </div>
            <p className="text-sm text-slate-700 mt-1">{user?.email || "No email provided"}</p>
          </div>
        </div>
        <div>
          {user?.active ? (
            <span className="px-3 py-1 bg-green-100 border border-green-600 text-green-900 text-sm font-bold rounded">Active Staff</span>
          ) : (
            <span className="px-3 py-1 bg-red-100 border border-red-600 text-red-900 text-sm font-bold rounded">Inactive</span>
          )}
        </div>
      </div>

      {/* Employment & Personal Details */}
      <div className="mb-6">
        <h4 className="text-sm font-bold uppercase tracking-wide text-slate-900 border-b border-slate-300 pb-1 mb-3">Employment & Personal Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-100 p-4 rounded border border-slate-400 text-sm">
          <div>
            <span className="text-xs block font-bold text-slate-700 uppercase">Date of Birth</span>
            <span className="font-medium text-slate-900">{user?.dob ? user.dob.split("T")[0] : "N/A"}</span>
          </div>
          <div>
            <span className="text-xs block font-bold text-slate-700 uppercase">Joining Date</span>
            <span className="font-medium text-slate-900">{user?.joiningDate ? user.joiningDate.split("T")[0] : "N/A"}</span>
          </div>
          <div>
            <span className="text-xs block font-bold text-slate-700 uppercase">Blood Group</span>
            <span className="font-medium text-slate-900">{user?.bloodGroup || "N/A"}</span>
          </div>
          <div>
            <span className="text-xs block font-bold text-slate-700 uppercase">Police Verification</span>
            <span className={`font-bold ${user?.policeVerification === "done" ? "text-green-800" : "text-amber-800"}`}>
              {user?.policeVerification === "done" ? "Verified Done" : "Pending Review"}
            </span>
          </div>
          <div>
            <span className="text-xs block font-bold text-slate-700 uppercase">Govt ID ({user?.govtIds?.name || "ID"})</span>
            <span className="font-medium text-slate-900">{user?.govtIds?.id || "N/A"}</span>
          </div>
          <div>
            <span className="text-xs block font-bold text-slate-700 uppercase">Resume Document</span>
            {user?.resume ? (
              <a href={user?.resume} target="_blank" rel="noopener noreferrer" className="text-blue-700 font-bold underline">
                View File ↗
              </a>
            ) : (
              <span className="text-slate-600">Not Uploaded</span>
            )}
          </div>
          <div className="md:col-span-3 pt-2 border-t border-slate-300">
            <span className="text-xs block font-bold text-slate-700 uppercase mb-1">Residential Address</span>
            <span className="font-medium text-slate-900">{user?.residAddress || "N/A"}</span>
          </div>
          <div className="md:col-span-3">
            <span className="text-xs block font-bold text-slate-700 uppercase mb-1">Current Address</span>
            <span className="font-medium text-slate-900">{user?.currAddress || "N/A"}</span>
          </div>
        </div>
      </div>

      {/* Compensation & Statutory Info */}
      <div className="mb-6">
        <h4 className="text-sm font-bold uppercase tracking-wide text-slate-900 border-b border-slate-300 pb-1 mb-3">Compensation & Statutory Info</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-slate-100 p-4 rounded border border-slate-400 text-center text-sm">
          <div className="bg-white p-2.5 rounded border border-slate-400">
            <span className="text-xs block uppercase font-bold text-slate-700">Current Salary</span>
            <span className="font-bold text-slate-900">{user?.salaryDetails?.currentSalary ? `₹${user.salaryDetails.currentSalary}` : "N/A"}</span>
          </div>
          <div className="bg-white p-2.5 rounded border border-slate-400">
            <span className="text-xs block uppercase font-bold text-slate-700">Basic Pay</span>
            <span className="font-bold text-slate-900">{user?.salaryDetails?.basicPay ? `₹${user.salaryDetails.basicPay}` : "N/A"}</span>
          </div>
          <div className="bg-white p-2.5 rounded border border-slate-400">
            <span className="text-xs block uppercase font-bold text-slate-700">Professional Tax</span>
            <span className="font-bold text-slate-900">{user?.salaryDetails?.PT ? `₹${user.salaryDetails.PT}` : "N/A"}</span>
          </div>
          <div className="bg-white p-2.5 rounded border border-slate-400">
            <span className="text-xs block uppercase font-bold text-slate-700">ESIC</span>
            <span className="font-bold text-slate-900">{user?.salaryDetails?.ESIC ? `₹${user.salaryDetails.ESIC}` : "N/A"}</span>
          </div>
          <div className="bg-white p-2.5 rounded border border-slate-400 col-span-2 md:col-span-1">
            <span className="text-xs block uppercase font-bold text-slate-700">UAN Number</span>
            <span className="font-bold text-slate-900">{user?.salaryDetails?.UAN || "N/A"}</span>
          </div>

          <div className="col-span-full grid grid-cols-3 gap-2 pt-2 border-t border-slate-300 mt-2">
            <h5 className="col-span-full text-left font-bold text-sm uppercase text-slate-800">Allowance Details</h5>
            {user?.salaryDetails?.allowance?.map(al => (
              <div key={al?.name} className="bg-white p-2 rounded border border-slate-400 text-left">
                <span className="text-xs block uppercase font-bold text-slate-700">{al.name}</span>
                <span className="font-bold text-slate-900">{al.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Professional Certificates */}
      <div className="mb-6">
        <h4 className="text-sm font-bold uppercase tracking-wide text-slate-900 border-b border-slate-300 pb-1 mb-3">Professional Certificates</h4>
        {medicalList?.length > 0 ? (
          <div className="overflow-x-auto rounded border border-slate-400">
            <table className="w-full bg-white text-sm text-left">
              <thead>
                <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-400">
                  <th className="p-2.5">Certificate Title</th>
                  <th className="p-2.5">Registration No.</th>
                  <th className="p-2.5">Attachment</th>
                </tr>
              </thead>
              <tbody>
                {medicalList.map((med) => (
                  <tr key={med?._id || med?.name} className="uppercase border-t border-slate-300">
                    <td className="p-2.5 font-bold text-slate-900">{med?.name}</td>
                    <td className="p-2.5 font-medium text-slate-800">{med?.number || "N/A"}</td>
                    <td className="p-2.5">
                      {med?.file ? (
                        <a href={med.file} target="_blank" rel="noopener noreferrer" className="text-blue-700 font-bold underline">
                          View File ↗
                        </a>
                      ) : (
                        <span className="text-slate-600">No file</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-700 text-sm font-medium">No certificate records found.</p>
        )}
      </div>

      {/* Family Details & Emergency Contacts */}
      <div className="mb-6">
        <h4 className="text-sm font-bold uppercase tracking-wide text-slate-900 border-b border-slate-300 pb-1 mb-3">Family & Emergency Contacts</h4>
        {familyList?.length > 0 ? (
          <div className="overflow-x-auto rounded border border-slate-400">
            <table className="w-full bg-white text-sm text-left">
              <thead>
                <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-400">
                  <th className="p-2.5">Dependent Name</th>
                  <th className="p-2.5">Relation</th>
                  <th className="p-2.5">Contact Number</th>
                  <th className="p-2.5">Emergency Status</th>
                </tr>
              </thead>
              <tbody>
                {familyList.map((fam) => (
                  <tr key={fam?._id || fam?.name} className={`uppercase border-t border-slate-300 ${fam.emergency ? "bg-red-50 font-bold" : ""}`}>
                    <td className="p-2.5 font-bold text-slate-900">{fam?.name}</td>
                    <td className="p-2.5 font-medium text-slate-800">{fam?.relation}</td>
                    <td className="p-2.5 font-medium text-slate-800">{fam?.phone}</td>
                    <td className="p-2.5">
                      {fam.emergency ? (
                        <span className="px-2 py-0.5 bg-red-200 border border-red-600 text-red-900 text-xs font-bold rounded">Emergency</span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-700 text-sm font-medium">No family records found.</p>
        )}
      </div>

      {/* Bank Account Information */}
      <div className="mb-6">
        <h4 className="text-sm font-bold uppercase tracking-wide text-slate-900 border-b border-slate-300 pb-1 mb-3">Bank Account Information</h4>
        {bankList?.length > 0 ? (
          <div className="overflow-x-auto rounded border border-slate-400">
            <table className="w-full bg-white text-sm text-left">
              <thead>
                <tr className="bg-slate-200 text-slate-900 font-bold border-b border-slate-400">
                  <th className="p-2.5">Account Holder</th>
                  <th className="p-2.5">Account Number</th>
                  <th className="p-2.5">IFSC Code</th>
                </tr>
              </thead>
              <tbody>
                {bankList.map((bank) => (
                  <tr key={bank?._id || bank?.number} className="uppercase border-t border-slate-300">
                    <td className="p-2.5 font-bold text-slate-900">{bank?.name}</td>
                    <td className="p-2.5 font-bold text-slate-900 font-mono">{bank?.number}</td>
                    <td className="p-2.5 font-bold text-slate-900 font-mono">{bank?.IFSC}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-700 text-sm font-medium">No bank records found.</p>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-between items-center pt-4 border-t-2 border-slate-300">
        <button type="button" className="px-4 py-2 bg-slate-200 hover:bg-slate-300 border border-slate-400 font-bold text-slate-900 text-sm rounded" onClick={() => setToggle(false)}>
          ← Back to ID Card
        </button>
        <button type="button" className="hidden px-4 py-2 bg-slate-800 text-white font-bold text-sm rounded" onClick={() => setToggle(false)}>
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