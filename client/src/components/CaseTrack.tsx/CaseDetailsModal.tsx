import React from "react";
import {
  X,
  User,
  FileText,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  Plus,
  MapPin,
  Gavel,
  FileCheck,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Pause,
} from "lucide-react";
import { CaseDetailsModalProps } from "@/types/Types";
import Button from "@/components/ui/Button";

const CaseDetailsModal: React.FC<CaseDetailsModalProps> = ({
  isOpen,
  case_,
  onClose,
  onEdit,
  onDelete,
  onAddHearing,
  hearingDetails = [],
  onAddHearingDetail,
  onEditHearingDetail,
  onDeleteHearingDetail,
  loading,
  newHearingEntry,
  setNewHearingEntry,
}) => {
  if (!isOpen || !case_) return null;

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "Adjourned":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "Pending":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "Scheduled":
        return <Calendar className="w-4 h-4 text-blue-500" />;
      default:
        return <Pause className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Adjourned":
        return "bg-red-100 text-red-800 border-red-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold">{case_.title}</h2>
                <p className="text-blue-100 mt-1">Case Management Details</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border bg-white ${getPriorityColor(
                  case_.priority || "Medium"
                )
                  .replace("bg-", "text-")
                  .replace("text-", "bg-")}`}
              >
                {case_.priority || "Medium"} Priority
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-blue-100 hover:text-white transition-colors p-2 hover:bg-white hover:bg-opacity-20 rounded-lg"
              disabled={loading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[calc(95vh-140px)]">
          {/* Left Side - Case Details */}
          <div className="flex-1 p-6 overflow-y-auto border-r border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Case Information
              </h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => onEdit(case_)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 flex items-center gap-2"
                  disabled={loading}
                  label=""
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  onClick={() => onDelete(case_._id!)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 flex items-center gap-2"
                  disabled={loading}
                  label=""
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Basic Information Card */}
              <div className="bg-gray-50 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    Basic Information
                  </h4>

                  <span className="font-medium text-gray-800">
                    Case ID : {case_.caseId}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-green-500" />
                    <div>
                      <span className="text-sm text-gray-500">Client Name</span>
                      <p className="font-medium text-gray-900">
                        {case_.clientName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-purple-500" />
                    <div>
                      <span className="text-sm text-gray-500">Case Type</span>
                      <p className="font-medium text-gray-900">
                        {case_.caseType}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    <div>
                      <span className="text-sm text-gray-500">
                        Next Hearing
                      </span>
                      <p className="font-medium text-gray-900">
                        {new Date(case_.nextHearingDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {case_.createdAt && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-indigo-500" />
                      <div>
                        <span className="text-sm text-gray-500">
                          Created Date
                        </span>
                        <p className="font-medium text-gray-900">
                          {new Date(case_.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description Card */}
              <div className="bg-gray-50 rounded-lg p-5">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                  Case Description
                </h4>
                <div className="bg-white p-4 rounded-md border border-gray-200">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {case_.description}
                  </p>
                </div>
              </div>

              {/* Old Hearing History */}
              <div className="bg-gray-50 rounded-lg p-5">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Previous Hearing Dates
                </h4>
                {case_.hearingHistory.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {case_.hearingHistory.map((entry, index) => (
                      <div
                        key={index}
                        className="bg-white p-3 rounded-md shadow-sm border border-gray-200"
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(entry).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-md p-6 text-center border border-gray-200">
                    <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                      No previous hearing dates
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Hearing Details */}
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
            <div className="flex justify-between items-between mb-6 gap-3 w-full">
              <input
                type="date"
                value={newHearingEntry}
                onChange={(e) => setNewHearingEntry(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button
                onClick={onAddHearing}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 flex items-center gap-2"
                disabled={loading}
                label=""
              >
                <Plus className="w-4 h-4" />
                Add Hearing Date
              </Button>
            </div>

            <div className="space-y-4">
              {hearingDetails.length > 0 ? (
                <>
                  {hearingDetails.map((hearing, index) => (
                    <div
                      key={hearing._id || index}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
                    >
                      {/* --- Hearing Card Content --- */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(hearing.status)}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                              hearing.status
                            )}`}
                          >
                            {hearing.status}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => onEditHearingDetail(hearing)}
                            className="text-blue-500 hover:text-blue-700 p-1"
                            title="Edit Hearing"
                            disabled={loading}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteHearingDetail(hearing._id!)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Delete Hearing"
                            disabled={loading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* --- Date / Time / Court / Judge --- */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <div>
                            <span className="text-xs text-gray-500">Date</span>
                            <p className="text-sm font-medium">
                              {new Date(hearing.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {hearing.time && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-orange-500" />
                            <div>
                              <span className="text-xs text-gray-500">
                                Time
                              </span>
                              <p className="text-sm font-medium">
                                {hearing.time}
                              </p>
                            </div>
                          </div>
                        )}

                        {hearing.courtName && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-green-500" />
                            <div>
                              <span className="text-xs text-gray-500">
                                Court
                              </span>
                              <p className="text-sm font-medium">
                                {hearing.courtName}
                              </p>
                            </div>
                          </div>
                        )}

                        {hearing.judgeName && (
                          <div className="flex items-center gap-2">
                            <Gavel className="w-4 h-4 text-purple-500" />
                            <div>
                              <span className="text-xs text-gray-500">
                                Judge
                              </span>
                              <p className="text-sm font-medium">
                                {hearing.judgeName}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* --- Notes / Outcome / Instructions --- */}
                      {hearing.advocateNotes && (
                        <div className="mb-3">
                          <span className="text-xs text-gray-500">
                            Advocate Notes
                          </span>
                          <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mt-1">
                            {hearing.advocateNotes}
                          </p>
                        </div>
                      )}

                      {hearing.hearingOutcome && (
                        <div className="mb-3">
                          <span className="text-xs text-gray-500">Outcome</span>
                          <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mt-1">
                            {hearing.hearingOutcome}
                          </p>
                        </div>
                      )}

                      {hearing.clientInstructions && (
                        <div className="mb-3">
                          <span className="text-xs text-gray-500">
                            Client Instructions
                          </span>
                          <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mt-1">
                            {hearing.clientInstructions}
                          </p>
                        </div>
                      )}

                      {hearing.documentsSubmitted.length > 0 && (
                        <div>
                          <span className="text-xs text-gray-500">
                            Documents Submitted
                          </span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {hearing.documentsSubmitted.map((doc, docIndex) => (
                              <span
                                key={docIndex}
                                className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs flex items-center gap-1"
                              >
                                <FileCheck className="w-3 h-3" />
                                {doc}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* ✅ Single button below all hearings */}
                  <div className="mt-4 text-center">
                    <Button
                      onClick={onAddHearingDetail}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 flex items-center gap-2 mx-auto"
                      disabled={loading}
                      label=""
                    >
                      <Plus className="w-4 h-4" />
                      Add Hearing
                    </Button>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    No Hearing Details
                  </h4>
                  <p className="text-gray-500 mb-4">
                    Add hearing details to track court proceedings
                  </p>
                  <Button
                    onClick={onAddHearingDetail}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 flex items-center gap-2 mx-auto"
                    disabled={loading}
                    label=""
                  >
                    <Plus className="w-4 h-4" />
                    Add First Hearing
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetailsModal;
