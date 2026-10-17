import AdminMap from "@/components/gps/AdminMap";
import { useGetAllUsers } from "@/hooks/empHooks";

function GPS() {
  const { data: users } = useGetAllUsers({
    page: 1,
    limit: 70,
  });
 

  return (
    <div>
      <AdminMap users={users?.data} />
    </div>
  );
}

export default GPS;
