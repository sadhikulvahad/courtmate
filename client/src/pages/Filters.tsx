import React, { useEffect, useState } from "react";
import { Plus, X, Edit2, Trash2 } from "lucide-react";
import {
  addCategory,
  createFilter,
  deleteCategory,
  deleteFilter,
  getAllFilters,
} from "@/api/filterApi";
import axios from "axios";
import { toast } from "sonner";

interface Filter {
  _id: string;
  type: string;
  options: string[];
}

interface FilterCardProps {
  filter: Filter;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

interface CreateButtonProps {
  onClick: () => void;
}

interface FilterModalProps {
  filter: Filter | null;
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (filterId: string, categoryName: string) => void;
  onDeleteCategory: (filterId: string, categoryName: string) => void;
}

interface CreateFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFilter: (type: string, name: string) => void;
}

const FilterCard: React.FC<FilterCardProps> = ({
  filter,
  onClick,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer group relative">
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 text-gray-500 hover:text-red-600 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div onClick={onClick} className="pt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {filter.type}
        </h3>
        <p className="text-sm text-gray-600">
          {filter?.options?.length}{" "}
          {filter?.options?.length === 1 ? "option" : "options"}
        </p>
        <div className="mt-3 flex flex-wrap gap-1">
          {filter?.options?.slice(0, 3)?.map((option, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {option}
            </span>
          ))}
          {filter?.options?.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{filter.options.length - 3} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const CreateFilterButton: React.FC<CreateButtonProps> = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-gray-50 rounded-lg shadow-md border border-dashed border-gray-300 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-400 hover:bg-blue-50 flex flex-col items-center justify-center min-h-[140px]"
    >
      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
        <Plus className="text-blue-600" size={24} />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-1">
        Create Filter
      </h3>
      <p className="text-sm text-gray-500 text-center">Add a new filter type</p>
    </div>
  );
};

const FilterModal: React.FC<FilterModalProps> = ({
  filter,
  isOpen,
  onClose,
  onAddCategory,
  onDeleteCategory,
}) => {
  const [newOptionName, setNewOptionName] = useState<string>("");
  const [isAddingOption, setIsAddingOption] = useState<boolean>(false);

  if (!isOpen || !filter) return null;

  const handleAddOption = () => {
    if (
      newOptionName.trim() &&
      !filter.options.includes(newOptionName.trim())
    ) {
      onAddCategory(filter._id, newOptionName.trim());
      setNewOptionName("");
      setIsAddingOption(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">{filter.type}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-800">Options</h3>
            <button
              onClick={() => setIsAddingOption(true)}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <Plus size={16} />
              Add Option
            </button>
          </div>

          {isAddingOption && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <input
                type="text"
                value={newOptionName}
                onChange={(e) => setNewOptionName(e.target.value)}
                placeholder="Option name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddOption();
                  }
                }}
                autoFocus
              />
              {newOptionName.trim() &&
                filter.options.includes(newOptionName.trim()) && (
                  <p className="text-red-500 text-xs mb-2">
                    This option already exists
                  </p>
                )}
              <div className="flex gap-2">
                <button
                  onClick={handleAddOption}
                  disabled={
                    !newOptionName.trim() ||
                    filter.options.includes(newOptionName.trim())
                  }
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setIsAddingOption(false);
                    setNewOptionName("");
                  }}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {filter.options.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No options yet</p>
            ) : (
              filter.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-gray-800">{option}</span>
                  <button
                    onClick={() => onDeleteCategory(filter._id, option)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateFilterModal: React.FC<CreateFilterModalProps> = ({
  isOpen,
  onClose,
  onCreateFilter,
}) => {
  const [filterType, setFilterType] = useState<string>("");
  const [filterName, setFilterName] = useState<string>("");

  if (!isOpen) return null;

  const handleCreate = () => {
    if (filterType.trim()) {
      onCreateFilter(filterType.trim().toLowerCase(), filterName.trim());
      setFilterType("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Create New Filter
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <label
            htmlFor="filterName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Filter Name
          </label>
          <input
            id="filterName"
            type="text"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            placeholder="Enter filter Name (e.g., Category, Brand, Size)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleCreate();
              }
            }}
            autoFocus
          />
          <label
            htmlFor="filterType"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Filter Type
          </label>
          <input
            id="filterType"
            type="text"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            placeholder="Enter filter type (In small letters)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleCreate();
              }
            }}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Filters: React.FC = () => {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<Filter | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // fetch filters when component mounts
  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      setLoading(true);
      const data = await getAllFilters();
      setFilters(data.filters || data); // handle both possible response structures
    } catch (error) {
      toast.error("Failed to fetch filters");
      console.error("Error fetching filters:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFilter = async (type: string, name: string) => {
    try {
      const response = await createFilter(name, type);

      // Show toast message from response or default
      if (response?.message) {
        toast.success(response.message);
      } else {
        toast.success(`Filter "${type}" created successfully`);
      }

      await fetchFilters(); // refresh list
    } catch (err) {
      let errorMessage = "Failed to create filter";

      if (axios.isAxiosError(err)) {
        errorMessage =
          err.response?.data?.message || err.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
      console.error("Error creating filter:", err);
    }
  };

  const handleAddCategory = async (filterId: string, optionName: string) => {
    try {
      const response = await addCategory(filterId, optionName);

      // Show toast message from response or default
      if (response?.message) {
        toast.success(response.message);
      } else {
        toast.success(`Option "${optionName}" added successfully`);
      }

      await fetchFilters();

      // update selected filter too
      if (selectedFilter && selectedFilter._id === filterId) {
        const data = await getAllFilters();
        const updated =
          (data.filters || data).find((f: Filter) => f._id === filterId) ||
          null;
        setSelectedFilter(updated);
      }
    } catch (err) {
      let errorMessage = "Failed to add option";

      if (axios.isAxiosError(err)) {
        errorMessage =
          err.response?.data?.message || err.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
      console.error("Error adding category:", err);
    }
  };

  const handleDeleteCategory = async (filterId: string, optionName: string) => {
    try {
      const response = await deleteCategory(filterId, optionName);

      // Show toast message from response or default
      if (response?.message) {
        toast.success(response.message);
      } else {
        toast.success(`Option "${optionName}" deleted successfully`);
      }

      await fetchFilters();

      if (selectedFilter && selectedFilter._id === filterId) {
        const data = await getAllFilters();
        const updated =
          (data.filters || data).find((f: Filter) => f._id === filterId) ||
          null;
        setSelectedFilter(updated);
      }
    } catch (err) {
      let errorMessage = "Failed to delete option";

      if (axios.isAxiosError(err)) {
        errorMessage =
          err.response?.data?.message || err.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
      console.error("Error deleting category:", err);
    }
  };

  const handleDeleteFilter = async (filterId: string) => {
    const filterToDelete = filters.find((f) => f._id === filterId);
    const filterName = filterToDelete?.type || "Filter";

    try {
      const response = await deleteFilter(filterId);
      if (response?.message) {
        toast.success(response.message);
      } else {
        toast.success(`${filterName} deleted successfully`);
      }

      if (selectedFilter && selectedFilter._id === filterId) {
        setIsFilterModalOpen(false);
        setSelectedFilter(null);
      }

      await fetchFilters();
    } catch (err) {
      let errorMessage = "Failed to delete filter";

      if (axios.isAxiosError(err)) {
        errorMessage =
          err.response?.data?.message || err.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
      console.error("Error deleting filter:", err);
    }
  };

  const handleFilterClick = (filter: Filter) => {
    setSelectedFilter(filter);
    setIsFilterModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading filters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Filter Management
          </h1>
          <p className="text-gray-600">Manage your filters and options</p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <CreateFilterButton onClick={() => setIsCreateModalOpen(true)} />
          {filters?.map((filter) => (
            <FilterCard
              key={filter._id}
              filter={filter}
              onClick={() => handleFilterClick(filter)}
              onEdit={() => console.log("Edit filter", filter._id)}
              onDelete={() => handleDeleteFilter(filter._id)}
            />
          ))}
        </div>

        <FilterModal
          filter={selectedFilter}
          isOpen={isFilterModalOpen}
          onClose={() => {
            setIsFilterModalOpen(false);
            setSelectedFilter(null);
          }}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
        />

        <CreateFilterModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateFilter={handleCreateFilter}
        />
      </div>
    </div>
  );
};

export default Filters;
