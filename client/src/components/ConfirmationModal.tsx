import { ModalProps } from "@/types/Types";
import { AlertTriangle, X } from "lucide-react";
import ReactDOM from "react-dom";

export default function ConfirmationModal({
  title,
  description,
  isOpen,
  onCancel,
  onConfirm,
}: ModalProps) {
  if (!isOpen) return null;
  
  // Use portal to render the modal outside the normal DOM hierarchy
  // This prevents event bubbling issues with nested modals
  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]"
      onClick={onCancel}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-3 border-b bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 rounded-t-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-gray-600" size={22} />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <button 
            onClick={onCancel} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="px-6 py-5 text-gray-700 leading-relaxed">
          {description}
        </div>
        
        <div className="px-6 py-4 flex justify-end space-x-4">
          <button 
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 transition-colors bg-white hover:bg-gray-200"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-700 shadow-sm transition-all hover:shadow"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>,
    document.body // Render directly into the body element
  );
}