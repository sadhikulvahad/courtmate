// src/components/Calendar/ViewToggle.tsx
interface ViewToggleProps {
  currentView: "calendar" | "bookings";
  isAdvocate: boolean | null;
  onViewChange: (view: "calendar" | "bookings") => void;
}

const ViewToggle = ({
  currentView,
  isAdvocate,
  onViewChange,
}: ViewToggleProps) => {
  return (
    <div className="flex space-x-4 mb-6">
      <button
        onClick={() => {
          onViewChange("calendar");
        }}
        className={`px-4 py-2 rounded ${
          currentView === "calendar"
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-700"
        }`}
      >
        {isAdvocate ? "Manage Availability" : "View Calendar"}
      </button>

      <button
        onClick={() => {
          onViewChange("bookings");
        }}
        className={`px-4 py-2 rounded ${
          currentView === "bookings"
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-700"
        }`}
      >
        {isAdvocate ? "My Slots" : "My Bookings"}
      </button>
    </div>
  );
};

export default ViewToggle;
