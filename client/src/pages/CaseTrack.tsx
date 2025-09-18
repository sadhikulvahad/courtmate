import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Filter, Calendar, User, FileText } from "lucide-react";
import { AxiosError } from "axios";
import { CaseProps, CaseTypeProps, HearingDetailsProps } from "@/types/Types";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  addHearing,
  createCase,
  deleteCase,
  deleteHearingData,
  getAllCase,
  getHearingData,
  updateCase,
  updateHearing,
  updateHearingData,
} from "@/api/caseApi";
import { toast } from "sonner";
import ConfirmationModal from "@/components/ConfirmationModal";
import Pagination from "@/components/ui/Pagination";
import CreateNewCaseModal from "@/components/CaseTrack.tsx/CreateNewCaseModal";
import { getAllFilters } from "@/api/filterApi";
import CaseDetailsModal from "@/components/CaseTrack.tsx/CaseDetailsModal";
import HearingFormModal from "@/components/CaseTrack.tsx/HearingFormModal";

const CaseTracker = () => {
  const [cases, setCases] = useState<CaseProps[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [caseDetailModal, setCaseDetailsModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState<CaseProps | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [hearingDetails, setHearingDetails] = useState<HearingDetailsProps[]>(
    []
  );
  const [showHearingForm, setShowHearingForm] = useState(false);
  const [editingHearing, setEditingHearing] =
    useState<HearingDetailsProps | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [caseIdToDelete, setCaseIdToDelete] = useState<string | null>(null);
  const [newCase, setNewCase] = useState<CaseProps>({
    title: "",
    clientName: "",
    caseType: "",
    caseId: "",
    priority: "Medium",
    nextHearingDate: "",
    description: "",
    hearingHistory: [],
  });
  const [caseTypes, setCaseTypes] = useState<string[]>([]);
  const [newHearingEntry, setNewHearingEntry] = useState("");
  const { user } = useSelector((state: RootState) => state.auth);

  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const priorities = ["Low", "Medium", "High", "Urgent"];
  const statuses = ["All", "Active", "Pending", "Closed", "On Hold"];

  // Fetch all cases on component mount
  useEffect(() => {
    fetchCases();
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    setLoading(true);

    try {
      const response = await getAllFilters();
      response.filters.map((item: CaseTypeProps) => {
        if (item.type === "category") {
          setCaseTypes(item.options);
        }
      });
    } catch (err) {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data?.error || "Failed to fetch cases");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const fetchHearingDetails = async (caseId: string) => {
    const response = await getHearingData(caseId);

    if (response?.data.status) {
      setHearingDetails(response.data.hearingData);
    }
  };

  const fetchCases = async () => {
    setLoading(true);
    try {
      const response = await getAllCase(user?.id);
      // Filter out invalid cases
      const validCases = response?.data.data.filter(
        (caseItem: CaseProps) =>
          caseItem &&
          caseItem._id &&
          caseItem.title &&
          caseItem.clientName &&
          caseItem.caseType &&
          caseItem.priority &&
          caseItem.nextHearingDate &&
          caseItem.description &&
          Array.isArray(caseItem.hearingHistory)
      );
      setCases(validCases || []);
      setTotalItems(validCases.length || 0);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data?.error || "Failed to fetch cases");
      } else {
        toast.error("An unexpected error occurred");
      }
      setCases([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Apply search & filter
  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c?.clientName?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Apply pagination
  const paginatedCases = filteredCases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    setTotalItems(filteredCases.length);
  }, [filteredCases.length]);

  useEffect(() => {
    setTotalPages(Math.ceil(cases.length / itemsPerPage) || 1);
  }, [cases, itemsPerPage]);

  const handleItemsPerPageChange = useCallback((value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const getPriorityColor = (priority: string | undefined) => {
    switch (priority) {
      case "Urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "High":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Medium":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Low":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleCreateCase = async () => {
    if (
      !newCase.title.trim() ||
      !newCase.clientName.trim() ||
      !newCase.caseType.trim() ||
      !newCase.nextHearingDate.trim() ||
      !newCase.description.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      const response = await createCase(newCase);
      if (response?.status === 201) {
        setCases([...cases, response?.data.data]);
        setNewCase({
          title: "",
          clientName: "",
          caseId: "",
          caseType: "",
          priority: "Medium",
          nextHearingDate: "",
          description: "",
          hearingHistory: [],
        });
        setNewHearingEntry("");
        setShowCreateForm(false);
      } else {
        toast.error(response?.data.error);
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data?.error || "Failed to create case");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCase = async () => {
    if (!selectedCase || !selectedCase._id) return;
    if (
      !selectedCase.title.trim() ||
      !selectedCase.clientName.trim() ||
      !selectedCase.caseType.trim() ||
      !selectedCase.nextHearingDate.trim() ||
      !selectedCase.description.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const response = await updateCase(selectedCase);
      setCases(
        cases.map((c) => (c._id === selectedCase._id ? response?.data.data : c))
      );
      setShowCreateForm(false);
      setSelectedCase(null);
      setNewHearingEntry("");
    } catch (err) {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data?.error || "Failed to update case");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewCase = (caseData: CaseProps) => {
    setSelectedCase(caseData);
    setCaseDetailsModal(true);
    fetchHearingDetails(caseData._id!);
  };

  const handleEditHearingDetail = (hearing: HearingDetailsProps) => {
    setEditingHearing(hearing);
    setShowHearingForm(true);
  };

  const handleDeleteHearingDetail = async (hearingId: string) => {
    // Add your API call here to delete hearing detail
    try {
      const response = await deleteHearingData(hearingId);

      if (response?.data.status) {
        setHearingDetails((prev) => prev.filter((h) => h._id !== hearingId));
        toast.success("Hearing detail deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting hearing detail:", error);
      toast.error("Failed to delete hearing detail");
    }
  };

  const handleSaveHearingDetail = async (hearingData: HearingDetailsProps) => {
    try {
      if (editingHearing) {
        // Update existing hearing
        await updateHearingData(editingHearing._id!, hearingData);

        setHearingDetails((prev) =>
          prev.map((h) =>
            h._id === editingHearing._id
              ? { ...hearingData, _id: editingHearing._id }
              : h
          )
        );
        toast.success("Hearing updated successfully");
      } else {
        // Create new hearing
        const response = await addHearing(hearingData);
        console.log(response)
        if (response?.data.success) {
          const newHearing = { ...hearingData, _id: Date.now().toString() }; // Temporary ID
          setHearingDetails((prev) => [...prev, newHearing]);
          toast.success("Hearing added successfully");
        }
      }

      setShowHearingForm(false);
      setEditingHearing(null);
    } catch (error) {
      console.error("Error saving hearing detail:", error);
      toast.error("Failed to save hearing detail");
    }
  };

  const closeHearingForm = () => {
    setShowHearingForm(false);
    setEditingHearing(null);
  };

  const handleDeleteCase = (caseId: string) => {
    setCaseIdToDelete(caseId); // Store caseId
    setIsConfirmModalOpen(true); // Open modal
  };

  const confirmDeleteCase = async () => {
    if (!caseIdToDelete) return;
    setLoading(true);
    try {
      const response = await deleteCase(caseIdToDelete);
      if (response?.status === 200) {
        setCases(paginatedCases.filter((c) => c._id !== caseIdToDelete));
        toast.success(response.data.message || "Case deleted successfully");
      } else {
        toast.error(response?.data.message || "Error with deleting case");
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data?.error || "Failed to delete case");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
      setIsConfirmModalOpen(false);
      setCaseIdToDelete(null);
    }
  };

  const cancelDeleteCase = () => {
    setIsConfirmModalOpen(false);
    setCaseIdToDelete(null);
  };

  const handleEditCase = (caseData: CaseProps) => {
    setSelectedCase(caseData);
    setShowCreateForm(true);
  };

  const handleAddHearingDetail = () => {
    setEditingHearing(null);
    setShowHearingForm(true);
  };

  const handleAddHearing = async (isUpdate: boolean = false) => {
    if (!newHearingEntry) {
      toast.error("Please select a hearing date");
      return;
    }
    const hearingDate = new Date(newHearingEntry);
    if (isNaN(hearingDate.getTime())) {
      toast.error("Invalid hearing date");
      return;
    }
    if (isUpdate && selectedCase && selectedCase._id) {
      setLoading(true);
      try {
        const response = await updateHearing(selectedCase._id, newHearingEntry);
        setSelectedCase({
          ...selectedCase,
          hearingHistory: [...selectedCase.hearingHistory, newHearingEntry],
        });
        setCases(
          cases.map((c) =>
            c._id === selectedCase._id
              ? { ...c, hearingHistory: [...c.hearingHistory, newHearingEntry] }
              : c
          )
        );
        toast.success(
          response?.data.message || "Hearing date added successfully"
        );
      } catch (err) {
        if (err instanceof AxiosError) {
          toast.error(
            err.response?.data?.error || "Failed to add hearing date"
          );
        } else {
          toast.error("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    } else {
      setNewCase({
        ...newCase,
        hearingHistory: [...newCase.hearingHistory, newHearingEntry],
      });
    }
    setNewHearingEntry("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-3 mb-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Case Management System
              </h1>
              <p className="text-gray-600 mt-2">
                Track and manage all your legal cases
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-md"
              disabled={loading}
            >
              <Plus className="w-5 h-5" />
              Create New Case
            </button>
          </div>

          <div className="p-2 mt-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search cases by title, client, or case ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[140px]"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 text-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        )}

        {/* Cases Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
            {paginatedCases
              .filter((case_) => case_ && case_.priority)
              .map((case_) => (
                <div
                  key={case_._id}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200 border border-gray-100"
                  onClick={() => handleViewCase(case_)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                      {case_.title}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(
                        case_.priority || "Medium"
                      )}`}
                    >
                      {case_.priority || "Medium"}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm text-gray-700">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">{case_.clientName}</span>
                      </div>

                      <span className="font-medium text-Black">
                        ID :{"  "}
                        <span className="text-gray-800">{case_.caseId}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <FileText className="w-4 h-4 text-green-500" />
                      <span>{case_.caseType}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <Calendar className="w-4 h-4 text-orange-500" />
                      <span>
                        Next:{" "}
                        {new Date(case_.nextHearingDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {case_.description}
                  </p>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Hearing History
                    </h4>
                    {case_.hearingHistory.length > 0 ? (
                      <ul className="text-sm text-gray-600 list-disc pl-4">
                        {case_.hearingHistory.map((entry, index) => (
                          <li key={index}>
                            {new Date(entry).toLocaleDateString()}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No hearing history
                      </p>
                    )}
                  </div>

                  <div className="gap-4 flex justify-between items-center pt-4 border-t border-gray-100 w-full">
                    <span className="text-xs text-gray-500">
                      Created:{" "}
                      {new Date(case_.createdAt || "").toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}

        {showCreateForm && (
          <CreateNewCaseModal
            setShowCreateForm={setShowCreateForm}
            newCase={newCase}
            setNewCase={setNewCase}
            caseTypes={caseTypes}
            priorities={priorities}
            handleCreateCase={handleCreateCase}
            loading={loading}
            selectedCase={selectedCase}
            setSelectedCase={setSelectedCase}
            handleUpdateCase={handleUpdateCase}
          />
        )}

        {/* Confirmation Modal for Deletion */}
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          title="Confirm Case Deletion"
          description="Are you sure you want to delete this case? This action cannot be undone."
          onConfirm={confirmDeleteCase}
          onCancel={cancelDeleteCase}
        />

        <HearingFormModal
          isOpen={showHearingForm}
          onClose={closeHearingForm}
          onSave={handleSaveHearingDetail}
          caseId={selectedCase?._id || ""}
          advocateId={user?.id || ""}
          editingHearing={editingHearing}
          loading={loading}
        />

        <CaseDetailsModal
          isOpen={caseDetailModal}
          case_={selectedCase}
          onClose={() => {
            setCaseDetailsModal(false);
            setSelectedCase(null);
            setHearingDetails([]);
          }}
          onEdit={(caseData) => {
            setCaseDetailsModal(false);
            handleEditCase(caseData);
          }}
          onDelete={(caseId) => {
            setCaseDetailsModal(false);
            setSelectedCase(null);
            handleDeleteCase(caseId);
          }}
          onAddHearing={handleAddHearing}
          hearingDetails={hearingDetails}
          onAddHearingDetail={handleAddHearingDetail}
          onEditHearingDetail={handleEditHearingDetail}
          onDeleteHearingDetail={handleDeleteHearingDetail}
          loading={loading}
          newHearingEntry={newHearingEntry}
          setNewHearingEntry={setNewHearingEntry}
        />

        {!loading && cases.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Cases Found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== "All"
                ? "Try adjusting your search or filter criteria"
                : "Get started by creating your first case"}
            </p>
            {!searchTerm && statusFilter === "All" && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors duration-200"
                disabled={loading}
              >
                <Plus className="w-5 h-5" />
                Create Your First Case
              </button>
            )}
          </div>
        )}
      </div>

      {totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          onPageChange={handlePageChange}
          totalItems={totalItems}
          totalPages={totalPages}
        />
      )}
    </div>
  );
};

export default CaseTracker;
