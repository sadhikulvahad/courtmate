import { CreateCaseModalProps } from "@/types/Types";
import { XCircle } from "lucide-react";
import React from "react";

const CreateNewCaseModal: React.FC<CreateCaseModalProps> = ({
  setShowCreateForm,
  newCase,
  setNewCase,
  caseTypes,
  priorities,
  handleCreateCase,
  loading,
  selectedCase,
  setSelectedCase,
  handleUpdateCase,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedCase ? "Update Case Data" : "Create New Case"}
            </h2>
            <button
              onClick={() => {
                setShowCreateForm(false)
                setSelectedCase(null)
            }}
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
                value={selectedCase ? selectedCase.title : newCase.title}
                onChange={(e) =>
                  selectedCase
                    ? setSelectedCase({
                        ...selectedCase,
                        title: e.target.value,
                      })
                    : setNewCase({ ...newCase, title: e.target.value })
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
                value={
                  selectedCase ? selectedCase.clientName : newCase.clientName
                }
                onChange={(e) =>
                  selectedCase
                    ? setSelectedCase({
                        ...selectedCase,
                        clientName: e.target.value,
                      })
                    : setNewCase({ ...newCase, clientName: e.target.value })
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
                  value={
                    selectedCase ? selectedCase.caseType : newCase.caseType
                  }
                  onChange={(e) =>
                    selectedCase
                      ? setSelectedCase({
                          ...selectedCase,
                          caseType: e.target.value,
                        })
                      : setNewCase({ ...newCase, caseType: e.target.value })
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
                  value={
                    selectedCase ? selectedCase.priority : newCase.priority
                  }
                  onChange={(e) =>
                    selectedCase
                      ? setSelectedCase({
                          ...selectedCase,
                          priority: e.target.value,
                        })
                      : setNewCase({ ...newCase, priority: e.target.value })
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
                value={
                  selectedCase
                    ? selectedCase.nextHearingDate
                    : newCase.nextHearingDate
                }
                onChange={(e) =>
                  selectedCase
                    ? setSelectedCase({
                        ...selectedCase,
                        nextHearingDate: e.target.value,
                      })
                    : setNewCase({
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
                value={
                  selectedCase ? selectedCase.description : newCase.description
                }
                onChange={(e) =>
                  selectedCase
                    ? setSelectedCase({
                        ...selectedCase,
                        description: e.target.value,
                      })
                    : setNewCase({ ...newCase, description: e.target.value })
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter case description"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={selectedCase ? handleUpdateCase : handleCreateCase}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                disabled={loading}
              >
                {selectedCase ? "Update Case" : "Create Case"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedCase(null);
                  setShowCreateForm(false);
                }}
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
  );
};

export default CreateNewCaseModal;
