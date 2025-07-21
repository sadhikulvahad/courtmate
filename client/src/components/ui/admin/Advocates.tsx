import React, { useEffect, useState } from "react";
import { Tab } from "@headlessui/react";
import AdvocateModal from "./AdvocateModal";
import { toast } from "sonner";
import { AdvocateProps } from "@/types/Types";
import SearchBar from "@/components/SearchBar";
import { getAllAdminAdvocates } from "@/api/admin/advocatesApi";

const Advocates: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [advocates, setAdvocates] = useState<AdvocateProps[]>([]);
  const [selectedAdvocate, setSelectedAdvocate] =
    useState<AdvocateProps | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  useEffect(() => {
    const fetchAdvocates = async (page: number = 1) => {
      try {
        const response = await getAllAdminAdvocates({
          page: page,
          limit: 10,
          searchTerm: searchTerm,
          activeTab: selectedTab,
        });

        if (response?.status === 200) {
          setAdvocates(response.data.advocates);
          setPagination({
            currentPage: response.data.pagination.currentPage,
            totalPages: response.data.pagination.totalPages,
            totalItems: response.data.pagination.totalItems,
            itemsPerPage: response.data.pagination.itemsPerPage,
          });
        } else {
          toast.error(response?.data.error);
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to fetch advocates");
      }
    };
    fetchAdvocates(pagination.currentPage);
  }, [searchTerm, selectedTab, pagination.currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, currentPage: newPage });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Search */}
      <div className="flex gap-4 flex-row items-center md:justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">
          Advocates
        </h2>
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>

      {/* Tabs */}
      <div className="mb-4">
        <Tab.Group>
          <Tab.List className="flex space-x-3 bg-white rounded-xl overflow-x-auto">
            {["All", "Request", "Accepted", "Pending", "Rejected"].map(
              (tab) => (
                <Tab
                  key={tab}
                  className={({ selected }) =>
                    `py-2.5 px-3 text-sm font-medium leading-5 rounded-lg whitespace-nowrap flex-shrink-0
                  ${
                    selected
                      ? "bg-gray-900 text-white shadow"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                  }
                  onClick={() => setSelectedTab(tab.toLowerCase())}
                >
                  {tab}
                </Tab>
              )
            )}
          </Tab.List>
        </Tab.Group>
      </div>

      {/* Responsive Table/List */}
      <div className="pb-4">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto rounded-lg shadow">
          <table className="w-full bg-white">
            <thead>
              <tr className="bg-gray-100 text-gray-700 font-medium">
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Category</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Join Date</th>
                <th className="p-4 text-left">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {advocates?.map((advocate) => (
                <tr key={advocate.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{advocate.name}</div>
                    </div>
                  </td>
                  <td className="p-4">{advocate.email}</td>
                  <td className="p-4">{advocate.category || "Not Provided"}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        advocate.isVerified
                          ? "bg-green-100 text-green-900"
                          : "bg-yellow-100 text-yellow-900"
                      }`}
                    >
                      {advocate.isVerified ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td className="p-4">
                    {new Date(advocate.verifiedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedAdvocate(advocate)}
                      className="px-3 py-1 text-sm text-white bg-gray-900 rounded-md hover:bg-gray-800"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List */}
        <div className="md:hidden space-y-3">
          {advocates?.map((advocate) => (
            <div
              key={advocate.id}
              className="bg-white rounded-lg shadow p-3 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div>
                    <div className="font-medium">{advocate.name}</div>
                    <div className="text-sm text-gray-500">
                      {advocate.email}
                    </div>
                  </div>
                </div>
                <span
                  className={`(px-3 py-1 rounded-full text-sm font-semibold ${
                    advocate.isVerified
                      ? "bg-green-100 text-green-900"
                      : "bg-yellow-100 text-yellow-900"
                  }`}
                >
                  {advocate.isVerified ? "Verified" : "Pending"}
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex">
                  <span>Category:</span>
                  <span className="px-2">
                    {advocate.category || "Not Provided"}
                  </span>
                </div>
                <div className="flex">
                  <span>Joined:</span>
                  <span className="px-2">
                    {new Date(advocate.verifiedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => setSelectedAdvocate(advocate)}
                  className="w-full px-3 py-2 text-sm text-white bg-gray-900 rounded-md hover:bg-gray-800"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {advocates?.length === 0 && (
          <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow">
            No advocates found matching your criteria.
          </div>
        )}
      </div>

      {/* Pagination */}
      {advocates?.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {selectedAdvocate && (
        <AdvocateModal
          advocate={selectedAdvocate}
          isOpen={true}
          onClose={() => setSelectedAdvocate(null)}
        />
      )}
    </div>
  );
};

export default Advocates;
