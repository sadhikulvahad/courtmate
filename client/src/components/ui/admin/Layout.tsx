
import { Outlet } from "react-router-dom";
import AdvocateAdminSidebar from "../AdvocateAdminSidebar";

const Layout = () => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <AdvocateAdminSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="py-2 md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
