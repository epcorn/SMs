import { dateFormat } from '@/utils/helperfn';
import { differenceInYears } from 'date-fns';
import { Download } from 'lucide-react';

const defaultPhoto =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRE90TDdHxK9BwLoldB7X6SHDKEUKsMOfsaIsLb2ghnqg&s";

// Mock or pass down download handler if not globally defined
const downloadDocument = (url, filename) => {
  if (!url) return;
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const getUserTypeBadge = (type) => {
  switch (type?.toLowerCase()) {
    case "trainee":
      return "bg-blue-100 text-blue-700";
    case "apprentice":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

// Reusable read-only field
const Field = ({ label, value, classes }) => (
  <div className={`space-y-1 ${classes}`}>
    <label className="text-sm font-medium text-gray-600">
      {label}
    </label>
    <div className="min-h-10 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-900 wrap-break-word">
      {value || "N/A"}
    </div>
  </div>
);

// Reusable section
const Section = ({ title, children }) => (
  <section className="mb-6">
    <h3 className="text-base font-semibold text-gray-800 pb-3 mb-4 border-b border-gray-200">
      {title}
    </h3>
    {children}
  </section>
);

// Reusable document link
const DocumentLink = ({ url, title = "View Document" }) => (
  url ? (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
    >
      {title} ↗
    </a>
  ) : (
    <span className="text-sm text-gray-400">
      Not Uploaded
    </span>
  )
);

const Show = ({ label, value, classes }) => (
  <section className={classes}>
    <p className='font-bold'>{label}</p>
    <p className='text-sm pl-'>
      <span className='inline-block rotate-180'>↵</span> {value}
    </p>
  </section>
);

export function EmpDetails({ user = {}, setToggle }) {
  const familyList = user?.familyDetails?.filter(
    f => f?.name || f?.relation || f?.phone
  ) || [];

  const bankList = user?.bankDetails?.filter(
    b => b?.name || b?.number || b?.IFSC
  ) || [];

  const medicalList = user?.medicalDetails?.filter(
    m => m?.name || m?.number || m?.file
  ) || [];

  const present = user?.address?.present || {};
  const permanent = user?.address?.permanent || {};
  const govtIds = user?.govtIds || {};
  const salary = user?.salaryDetails || {};

  const addressText = (address) =>
    [
      address?.l1,
      address?.l2,
      address?.l3,
      address?.city,
      address?.state,
      address?.pincode
    ].filter(Boolean).join(", ") || "N/A";

  return (
    <div className="max-w-6xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm p-5 md:p-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Employee Details
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Employee information and records
          </p>
        </div>

        <span className={`px-3 py-1 rounded text-sm font-medium ${user?.active
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
          }`}>
          {user?.active ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Employee Profile */}
      <div className="flex flex-col sm:flex-row gap-5 items-start mb-8">
        <img
          src={user?.photo || defaultPhoto}
          alt="Employee"
          className="w-42 h-54 rounded-md border border-gray-300 object-cover"
        />

        <div className="flex-1 space-y-2">
          <h3 className="text-xl font-semibold text-gray-900">
            {[
              user?.firstname,
              user?.middlename,
              user?.lastname
            ].filter(Boolean).join(" ") || "Employee"}
          </h3>

          <p className="text-sm text-gray-500">
            {user?.email || "No email provided"}
          </p>

          <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${getUserTypeBadge(user?.userType)}`}>
            {user?.userType || "Employee"}
          </span>
        </div>
      </div>

      {/* Personal Information */}
      <Section title="Personal Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="First Name" value={user?.firstname} />
          <Field label="Middle Name" value={user?.middlename} />
          <Field label="Last Name" value={user?.lastname} />
          <Field label="Email Address" value={user?.email} />
          <Field label="Date of Birth" value={user?.dob?.split("T")[0]} />

          <Field
            label="Age"
            value={
              user?.dob
                ? `${differenceInYears(new Date(), new Date(user.dob))} Years`
                : "N/A"
            }
          />

          <Field label="Blood Group" value={user?.bloodGroup} />
          <Field label="Joining Date" value={user?.joiningDate ? dateFormat(user.joiningDate).date : "N/A"} />

          <Field
            label="Police Verification"
            value={
              user?.policeVerification === "done"
                ? "Verified"
                : "Pending"
            }
          />
        </div>
      </Section>

      {/* Government IDs */}
      <Section title="Government Identification">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Aadhaar Number" value={govtIds?.adhaar_number || "N/A"} />
          <Field label="PAN Number" value={govtIds?.pan_number} classes='[&>div:last-child]:uppercase'/>
          <Field label="Voter ID Number" value={govtIds?.voter_number} />

          {[
            { label: "Aadhaar Card", url: govtIds?.adhaar_card },
            { label: "PAN Card", url: govtIds?.pan_card },
            { label: "Voter Card", url: govtIds?.voter_card }
          ].map((doc) => (
            <div
              key={doc.label}
              className="flex flex-col gap-3 border border-gray-200 rounded-md p-4 bg-white"
            >
              <p className="text-sm font-medium text-gray-700">
                {doc.label}
              </p>

              <DocumentLink url={doc.url} />

              <button
                type="button"
                disabled={!doc.url}
                onClick={() =>
                  downloadDocument(
                    doc.url,
                    `${doc.label.replaceAll(" ", "_")}.pdf`
                  )
                }
                className="btn btn-accent btn-sm w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Download size={16} />
                Download
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* Address */}
      <Section title="Address Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Residential Address"
            value={addressText(present)}
          />
          <Field
            label="Permanent Address"
            value={addressText(permanent)}
          />
        </div>
      </Section>

      {/* Salary */}
      <Section title="Salary & Statutory Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Current Salary" value={salary?.currentSalary ? `₹ ${salary.currentSalary}` : "N/A"} />
          <Field label="Basic Pay" value={salary?.basicPay ? `₹ ${salary.basicPay}` : "N/A"} />
          <Field label="Professional Tax" value={salary?.PT ? `₹ ${salary.PT}` : "N/A"} />
          <Field label="ESIC" value={salary?.ESIC ? `₹ ${salary.ESIC}` : "N/A"} />
          <Field label="UAN Number" value={salary?.UAN} />
        </div>

        {salary?.allowance?.length > 0 && (
          <div className="mt-5">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Allowance Details
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-3 border">Allowance</th>
                    <th className="p-3 border">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {salary.allowance.map((item, index) => (
                    <tr key={item?._id || index}>
                      <td className="p-3 border">{item?.name}</td>
                      <td className="p-3 border">₹ {item?.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Section>

      {/* Professional Certificates */}
      <Section title="Professional Certificates">
        {medicalList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3 border">Certificate Name</th>
                  <th className="p-3 border">Registration Number</th>
                  <th className="p-3 border">Attachment</th>
                </tr>
              </thead>
              <tbody>
                {medicalList.map((med, index) => (
                  <tr key={med?._id || index}>
                    <td className="p-3 border">{med?.name}</td>
                    <td className="p-3 border">{med?.number || "N/A"}</td>
                    <td className="p-3 border">
                      <DocumentLink url={med?.file} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No certificate records found.
          </p>
        )}
      </Section>

      {/* Family */}
      <Section title="Family & Emergency Contacts">
        {familyList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3 border">Name</th>
                  <th className="p-3 border">Relation</th>
                  <th className="p-3 border">Phone</th>
                  <th className="p-3 border">Emergency</th>
                </tr>
              </thead>
              <tbody>
                {familyList.map((fam, index) => (
                  <tr key={fam?._id || index}>
                    <td className="p-3 border">{fam?.name}</td>
                    <td className="p-3 border">{fam?.relation}</td>
                    <td className="p-3 border">{fam?.phone}</td>
                    <td className="p-3 border">
                      {fam?.emergency ? "Yes" : "No"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No family records found.
          </p>
        )}
      </Section>

      {/* Bank Details */}
      <Section title="Bank Account Information">
        {bankList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3 border">Account Holder</th>
                  <th className="p-3 border">Account Number</th>
                  <th className="p-3 border">IFSC Code</th>
                </tr>
              </thead>
              <tbody>
                {bankList.map((bank, index) => (
                  <tr key={bank?._id || index}>
                    <td className="p-3 border">{bank?.name}</td>
                    <td className="p-3 border">{bank?.number}</td>
                    <td className="p-3 border">{bank?.IFSC}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No bank records found.
          </p>
        )}
      </Section>

      {/* Footer */}
      <div className="flex justify-end pt-5 border-t border-gray-200">
        <button
          type="button"
          onClick={() => setToggle(false)}
          className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-md text-sm font-medium transition"
        >
          Back
        </button>
      </div>
    </div>
  );
}

// Employee Summary Card
export function EmpCard({ user = {}, setToggle }) {
  const emergencyContact =
    user?.familyDetails?.find(f => f?.emergency) ||
    user?.familyDetails?.[0];

  return (
    <div className="max-w-4xl mx-auto bg-white border border-gray-400 rounded-lg shadow-sm p-2 md:p-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-2">
        <img
          src={user?.photo || defaultPhoto}
          alt="Employee"
          className="w-24 h-24 rounded-md object-cover border border-gray-300"
        />

        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-xl font-semibold text-gray-900">
            {[
              user?.firstname,
              user?.middlename,
              user?.lastname
            ].filter(Boolean).join(" ")}
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {user?.email || "N/A"}
          </p>

          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
            <span className={`px-3 py-1 rounded text-xs font-medium ${getUserTypeBadge(user?.userType)}`}>
              {user?.userType || "Employee"}
            </span>

            <span className={`px-3 py-1 rounded text-xs font-medium ${user?.active
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
              }`}>
              {user?.active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3 pt-5">
        <Show label="Blood Group" value={user?.bloodGroup} />
        <Show
          label="Age"
          value={
            user?.dob
              ? `${differenceInYears(new Date(), new Date(user.dob))} Years`
              : "N/A"
          }
        />
        <Show
          label="Joining Date"
          value={user?.joiningDate ? dateFormat(user.joiningDate).date : "N/A"}
        />
        <Show
          label="Duty Time"
          value={
            user?.duty?.startTime
              ? `${user.duty.startTime} - ${user?.duty?.endTime}`
              : "N/A"
          }
        />
        <Show label="Department" value={user?.department} />
        <Show
          label="Police Verification"
          value={user?.policeVerification === "notDone" ? "Not Done" : "Done"}
        />
        <Show
          label="Aadhaar Number"
          value={user?.govtIds?.adhaar_number || "N/A"}
          classes='col-span-full'
        />
        <Show label="PAN Number" value={user?.govtIds?.pan_number} classes='col-span-full [&>p:last-child]:uppercase' />
      </div>


      {emergencyContact && (
        <div className="mt-5 p-4 bg-gray-50 border border-gray-200 rounded-md">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Emergency Contact
          </h4>

          <p className="text-sm text-gray-900">
            {emergencyContact?.name} ({emergencyContact?.relation})
          </p>

          <p className="text-sm text-gray-600 mt-1">
            {emergencyContact?.phone}
          </p>
        </div>
      )}

      <div className="mt-6 pt-5 border-t border-gray-200">
        <button
          type="button"
          onClick={() => setToggle(true)}
          className="w-full sm:w-auto px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-md transition"
        >
          View Employee Details
        </button>
      </div>
    </div>
  );
}

export default EmpCard;