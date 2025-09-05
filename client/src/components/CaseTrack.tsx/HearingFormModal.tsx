import React, { useState, useEffect } from "react";
import { X, Calendar, MapPin, MessageSquare } from "lucide-react";
import Button from "@/components/ui/Button";
import { HearingDetailsProps } from "@/types/Types";

interface HearingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (hearingData: HearingDetailsProps) => Promise<void>;
  caseId: string;
  advocateId: string;
  editingHearing?: HearingDetailsProps | null;
  loading: boolean;
}

const HearingFormModal: React.FC<HearingFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  caseId,
  advocateId,
  editingHearing = null,
  loading,
}) => {
  const [formData, setFormData] = useState<HearingDetailsProps>({
    caseId,
    advocateId,
    date: "",
    time: "",
    courtName: "",
    courtRoom: "",
    judgeName: "",
    status: "Scheduled",
    nextHearingDate: "",
    hearingOutcome: "",
    isClosed: false,
    advocateNotes: "",
    clientInstructions: "",
    documentsSubmitted: [],
  });

  //   const [newDocument, setNewDocument] = useState("");

  useEffect(() => {
    if (editingHearing) {
      setFormData({
        ...editingHearing,
        date:
          editingHearing.date instanceof Date
            ? editingHearing.date.toISOString().slice(0, 16)
            : editingHearing.date
            ? new Date(editingHearing.date as string | number)
                .toISOString()
                .slice(0, 16)
            : "",
        nextHearingDate: editingHearing.nextHearingDate
          ? editingHearing.nextHearingDate instanceof Date
            ? editingHearing.nextHearingDate.toISOString().slice(0, 16)
            : new Date(editingHearing.nextHearingDate as string | number)
                .toISOString()
                .slice(0, 16)
          : "",
      });
    } else {
      setFormData({
        caseId,
        advocateId,
        date: "",
        time: "",
        courtName: "",
        courtRoom: "",
        judgeName: "",
        status: "Scheduled",
        nextHearingDate: "",
        hearingOutcome: "",
        isClosed: false,
        advocateNotes: "",
        clientInstructions: "",
        documentsSubmitted: [],
      });
    }
  }, [editingHearing, caseId, advocateId, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date) {
      alert("Please select a hearing date");
      return;
    }
    const dateObj = new Date(formData.date);

    const timeString = dateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const updatedFormData = {
      ...formData,
      time: timeString,
    };
    onSave(updatedFormData);
  };

  const handleInputChange = (
    field: keyof HearingDetailsProps,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  //   const addDocument = () => {
  //     if (newDocument.trim()) {
  //       setFormData((prev) => ({
  //         ...prev,
  //         documentsSubmitted: [...prev.documentsSubmitted, newDocument.trim()],
  //       }));
  //       setNewDocument("");
  //     }
  //   };

  //   const removeDocument = (index: number) => {
  //     setFormData((prev) => ({
  //       ...prev,
  //       documentsSubmitted: prev.documentsSubmitted.filter((_, i) => i !== index),
  //     }));
  //   };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">
                {editingHearing ? "Edit Hearing Details" : "Add New Hearing"}
              </h2>
              <p className="text-green-100 mt-1">
                {editingHearing
                  ? "Update hearing information"
                  : "Schedule a new court hearing"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-green-100 hover:text-white transition-colors p-2 hover:bg-white hover:bg-opacity-20 rounded-lg"
              disabled={loading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hearing Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={typeof formData.date === "string" ? formData.date : ""}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    handleInputChange(
                      "status",
                      e.target.value as HearingDetailsProps["status"]
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Adjourned">Adjourned</option>
                </select>
              </div>
            </div>
          </div>

          {/* Court Information */}
          <div className="bg-gray-50 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-500" />
              Court Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Court Name
                </label>
                <input
                  type="text"
                  value={formData.courtName}
                  onChange={(e) =>
                    handleInputChange("courtName", e.target.value)
                  }
                  placeholder="e.g., High Court of Kerala"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Court Room
                </label>
                <input
                  type="text"
                  value={formData.courtRoom}
                  onChange={(e) =>
                    handleInputChange("courtRoom", e.target.value)
                  }
                  placeholder="e.g., Court Room No. 5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judge Name
                </label>
                <input
                  type="text"
                  value={formData.judgeName}
                  onChange={(e) =>
                    handleInputChange("judgeName", e.target.value)
                  }
                  placeholder="e.g., Hon'ble Justice Smith"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Next Hearing Date
                </label>
                <input
                  type="datetime-local"
                  value={typeof formData.nextHearingDate === "string" ? formData.nextHearingDate : ""}
                  onChange={(e) =>
                    handleInputChange("nextHearingDate", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Notes and Outcome */}
          <div className="bg-gray-50 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-orange-500" />
              Notes & Outcome
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Advocate Notes
                </label>
                <textarea
                  value={formData.advocateNotes}
                  onChange={(e) =>
                    handleInputChange("advocateNotes", e.target.value)
                  }
                  placeholder="Notes for the advocate..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Instructions
                </label>
                <textarea
                  value={formData.clientInstructions}
                  onChange={(e) =>
                    handleInputChange("clientInstructions", e.target.value)
                  }
                  placeholder="Instructions from the client..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hearing Outcome
                </label>
                <textarea
                  value={formData.hearingOutcome}
                  onChange={(e) =>
                    handleInputChange("hearingOutcome", e.target.value)
                  }
                  placeholder="Outcome of the hearing..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Documents */}
          {/* <div className="bg-gray-50 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              Documents Submitted
            </h3>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDocument}
                  onChange={(e) => setNewDocument(e.target.value)}
                  placeholder="Document name or description"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addDocument())
                  }
                />
                <Button
                  type="button"
                  onClick={addDocument}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                  disabled={loading || !newDocument.trim()}
                  label=""
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {formData.documentsSubmitted.length > 0 && (
                <div className="space-y-2">
                  {formData.documentsSubmitted.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-900">{doc}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocument(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                        disabled={loading}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div> */}

          {/* Case Closed Toggle */}
          <div className="bg-gray-50 rounded-lg p-5">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isClosed"
                checked={formData.isClosed}
                onChange={(e) =>
                  handleInputChange("isClosed", e.target.checked)
                }
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                disabled={loading}
              />
              <label
                htmlFor="isClosed"
                className="text-sm font-medium text-gray-700"
              >
                Mark this hearing as case closed
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2"
              disabled={loading}
              label="Cancel"
            />
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
              disabled={loading}
              label={
                loading
                  ? "Saving..."
                  : editingHearing
                  ? "Update Hearing"
                  : "Add Hearing"
              }
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default HearingFormModal;
