import React, { useCallback, useEffect, useState } from "react";
import { User } from "lucide-react";
import UserModal from "./UserModal";
import { getAllUsers } from "@/api/admin/usersAPI";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useNavigate } from "react-router-dom";
import { UserData } from "@/types/Types";
import SearchBar from "@/components/SearchBar";
import { useDebounce } from "@/utils/debouncing";
import Pagination from "../Pagination";

const Users: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);

  const { token, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate("/signup");
      return;
    }

    const getUsers = async () => {
      try {
        const response = await getAllUsers();

        if (response?.status === 200 && response?.data?.success) {
          const rawUsers = response.data.data.users;

          const formattedUsers: UserData[] = rawUsers.map((user: UserData) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            isBlocked: user.isBlocked,
            role: user.role,
          }));

          setUsers(formattedUsers);
          setTotalItems(formattedUsers.length || 0);
          setTotalPages(Math.ceil(formattedUsers.length / itemsPerPage) || 1);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setTotalItems(0);
        setTotalPages(1);
      }
    };

    getUsers();
  }, [isAuthenticated, token, navigate]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleItemsPerPageChange = useCallback((value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1 ) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Users</h2>
        <div>
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="grid grid-cols-5 gap-4 p-4 font-medium text-gray-500 bg-gray-50 rounded-t-lg">
          <div>Name</div>
          <div>Email</div>
          <div></div>
          {/* <div>Status</div> */}
          {/* <div>Phone</div> */}
          <div>Actions</div>
        </div>
        <div className="divide-y divide-gray-200">
          {paginatedUsers.map((user) => (
            <div
              key={user?.id}
              className="grid grid-cols-5 gap-4 p-4 hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-400" />
                {user?.name}
              </div>
              <div>{user?.email}</div>
              <div>
                {/* <span className="px-2 py-1 text-sm text-green-700 bg-green-100 rounded-full">
                  {user?.status }
                </span> */}
              </div>
              {/* <div>{user?.phone}</div> */}
              <div>
                <button
                  onClick={() => setSelectedUser(user)}
                  className="px-3 py-1 text-sm text-white bg-gray-900 rounded-md hover:bg-gray-800"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedUser && (
        <UserModal
          user={selectedUser}
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          token={token}
        />
      )}

      {totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}
    </div>
  );
};

export default Users;
