import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  FileText,
  XCircle,
  Edit2,
} from "lucide-react";
import { AxiosError } from "axios";
import { CaseProps } from "@/types/Types";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  createCase,
  deleteCase,
  getAllCase,
  updateCase,
  updateHearing,
} from "@/api/caseApi";
import { toast } from "sonner";
import ConfirmationModal from "@/components/ConfirmationModal";

const CaseTracker = () => {
  const [cases, setCases] = useState<CaseProps[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedCase, setSelectedCase] = useState<CaseProps | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // New state for modal
  const [caseIdToDelete, setCaseIdToDelete] = useState<string | null>(null); // New state for caseId
  const [newCase, setNewCase] = useState<CaseProps>({
    title: "",
    clientName: "",
    caseType: "",
    priority: "Medium",
    nextHearingDate: "",
    description: "",
    hearingHistory: [],
  });
  const [newHearingEntry, setNewHearingEntry] = useState("");
  const { user, token } = useSelector((state: RootState) => state.auth);

  const caseTypes = [
    "Civil",
    "Criminal",
    "Family",
    "Corporate",
    "Tax",
    "Property",
    "Labor",
  ];
  const priorities = ["Low", "Medium", "High", "Urgent"];
  const statuses = ["All", "Active", "Pending", "Closed", "On Hold"];

  // Fetch all cases on component mount
  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const response = await getAllCase(token, user?.id);
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
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data?.error || "Failed to fetch cases");
      } else {
        toast.error("An unexpected error occurred");
      }
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

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
      const response = await createCase(newCase, token);
      if (response?.status === 201) {
        setCases([...cases, response?.data.data]);
        setNewCase({
          title: "",
          clientName: "",
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
      const response = await updateCase(selectedCase, token);
      setCases(
        cases.map((c) => (c._id === selectedCase._id ? response?.data.data : c))
      );
      setShowUpdateForm(false);
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

  const handleDeleteCase = (caseId: string) => {
    setCaseIdToDelete(caseId); // Store caseId
    setIsConfirmModalOpen(true); // Open modal
  };

  const confirmDeleteCase = async () => {
    if (!caseIdToDelete) return;
    setLoading(true);
    try {
      const response = await deleteCase(caseIdToDelete, token);
      if (response?.status === 200) {
        setCases(cases.filter((c) => c._id !== caseIdToDelete));
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
      setIsConfirmModalOpen(false); // Close modal
      setCaseIdToDelete(null); // Clear caseId
    }
  };

  const cancelDeleteCase = () => {
    setIsConfirmModalOpen(false); // Close modal
    setCaseIdToDelete(null); // Clear caseId
  };

  const handleEditCase = (caseData: CaseProps) => {
    setSelectedCase(caseData);
    setShowUpdateForm(true);
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
        const response = await updateHearing(
          selectedCase._id,
          newHearingEntry,
          token
        );
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
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
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
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 text-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        )}

        {/* Filters and Search */}
        {!loading && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
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
        )}

        {/* Cases Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
            {cases
              .filter((case_) => case_ && case_.priority)
              .map((case_) => (
                <div
                  key={case_._id}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200 border border-gray-100"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(
                          case_.priority || "Medium"
                        )}`}
                      >
                        {case_.priority || "Medium"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditCase(case_)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Edit Case"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCase(case_._id!)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete Case"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                    {case_.title}
                  </h3>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <User className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">{case_.clientName}</span>
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

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      Created:{" "}
                      {new Date(case_.createdAt || "").toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Create Case Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Create New Case
                  </h2>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Case Title
                    </label>
                    <input
                      type="text"
                      required
                      value={newCase.title}
                      onChange={(e) =>
                        setNewCase({ ...newCase, title: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter case title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newCase.clientName}
                      onChange={(e) =>
                        setNewCase({ ...newCase, clientName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter client name"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Case Type
                      </label>
                      <select
                        required
                        value={newCase.caseType}
                        onChange={(e) =>
                          setNewCase({ ...newCase, caseType: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select case type</option>
                        {caseTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        value={newCase.priority}
                        onChange={(e) =>
                          setNewCase({ ...newCase, priority: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {priorities.map((priority) => (
                          <option key={priority} value={priority}>
                            {priority}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Next Hearing Date
                    </label>
                    <input
                      type="date"
                      required
                      value={newCase.nextHearingDate}
                      onChange={(e) =>
                        setNewCase({
                          ...newCase,
                          nextHearingDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Case Description
                    </label>
                    <textarea
                      required
                      value={newCase.description}
                      onChange={(e) =>
                        setNewCase({ ...newCase, description: e.target.value })
                      }
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter case description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hearing History
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="date"
                        value={newHearingEntry}
                        onChange={(e) => setNewHearingEntry(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => handleAddHearing()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        disabled={loading}
                      >
                        Add
                      </button>
                    </div>
                    {newCase.hearingHistory.length > 0 && (
                      <ul className="text-sm text-gray-600 list-disc pl-4">
                        {newCase.hearingHistory.map((entry, index) => (
                          <li key={index}>
                            {new Date(entry).toLocaleDateString()}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={handleCreateCase}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                      disabled={loading}
                    >
                      Create Case
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors duration-200"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Update Case Modal */}
        {showUpdateForm && selectedCase && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Update Case
                  </h2>
                  <button
                    onClick={() => setShowUpdateForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Case Title
                    </label>
                    <input
                      type="text"
                      required
                      value={selectedCase.title}
                      onChange={(e) =>
                        setSelectedCase({
                          ...selectedCase,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter case title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client Name
                    </label>
                    <input
                      type="text"
                      required
                      value={selectedCase.clientName}
                      onChange={(e) =>
                        setSelectedCase({
                          ...selectedCase,
                          clientName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter client name"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Case Type
                      </label>
                      <select
                        required
                        value={selectedCase.caseType}
                        onChange={(e) =>
                          setSelectedCase({
                            ...selectedCase,
                            caseType: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select case type</option>
                        {caseTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        value={selectedCase.priority}
                        onChange={(e) =>
                          setSelectedCase({
                            ...selectedCase,
                            priority: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {priorities.map((priority) => (
                          <option key={priority} value={priority}>
                            {priority}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Next Hearing Date
                    </label>
                    <input
                      type="date"
                      required
                      value={selectedCase.nextHearingDate.split("T")[0]}
                      onChange={(e) =>
                        setSelectedCase({
                          ...selectedCase,
                          nextHearingDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Case Description
                    </label>
                    <textarea
                      required
                      value={selectedCase.description}
                      onChange={(e) =>
                        setSelectedCase({
                          ...selectedCase,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter case description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hearing History
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="date"
                        value={newHearingEntry}
                        onChange={(e) => setNewHearingEntry(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => handleAddHearing(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        disabled={loading}
                      >
                        Add
                      </button>
                    </div>
                    {selectedCase.hearingHistory.length > 0 && (
                      <ul className="text-sm text-gray-600 list-disc pl-4">
                        {selectedCase.hearingHistory.map((entry, index) => (
                          <li key={index}>
                            {new Date(entry).toLocaleDateString()}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={handleUpdateCase}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                      disabled={loading}
                    >
                      Update Case
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUpdateForm(false)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors duration-200"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal for Deletion */}
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          title="Confirm Case Deletion"
          description="Are you sure you want to delete this case? This action cannot be undone."
          onConfirm={confirmDeleteCase}
          onCancel={cancelDeleteCase}
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
    </div>
  );
};

export default CaseTracker;
