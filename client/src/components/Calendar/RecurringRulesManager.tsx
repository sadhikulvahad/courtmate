import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, Edit, Trash2, AlertCircle, X, Plus } from 'lucide-react';

interface RecurringRulesManagerProps {
  rules: any[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddException: (id: string, date: Date) => void;
}

const RecurringRulesManager: React.FC<RecurringRulesManagerProps> = ({
  rules,
  onEdit,
  onDelete,
  onAddException,
}) => {
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [exceptionDate, setExceptionDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [showExceptionForm, setShowExceptionForm] = useState(false);

  const handleAddException = () => {
    if (selectedRuleId && exceptionDate) {
      onAddException(selectedRuleId, new Date(exceptionDate));
      setShowExceptionForm(false);
      setExceptionDate(format(new Date(), 'yyyy-MM-dd'));
    }
  };

  return (
    <div className="space-y-6">
      {rules.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
          <Calendar className="w-12 h-12 mx-auto text-gray-400" />
          <h3 className="mt-2 text-base font-medium text-gray-900">No recurring availability</h3>
          <p className="mt-1 text-sm text-gray-500">
            Add recurring patterns to automatically create available time slots
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="p-4 border rounded-lg bg-white hover:bg-gray-50 transition"
            >
              <div className="flex justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{rule.description}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {format(parseISO(rule.startDate), 'MMM d, yyyy')} - 
                    {format(parseISO(rule.endDate), 'MMM d, yyyy')}
                  </p>
                  
                  {/* Exceptions list */}
                  {rule.exceptions && rule.exceptions.length > 0 && (
                    <div className="mt-2">
                      <h5 className="text-xs font-medium text-gray-700 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1 text-amber-500" />
                        Exceptions:
                      </h5>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {rule.exceptions.map((exception: Date, idx: number) => (
                          <span 
                            key={idx} 
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                          >
                            {format(new Date(exception), 'MMM d, yyyy')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedRuleId(rule.id);
                      setShowExceptionForm(true);
                    }}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    title="Add exception"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onEdit(rule.id)}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDelete(rule.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Exception Form */}
              {showExceptionForm && selectedRuleId === rule.id && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-grow">
                      <label htmlFor="exceptionDate" className="block text-xs font-medium text-gray-700 mb-1">
                        Add exception date
                      </label>
                      <input
                        id="exceptionDate"
                        type="date"
                        value={exceptionDate}
                        onChange={(e) => setExceptionDate(e.target.value)}
                        className="rounded-md border border-gray-300 py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex ml-2 space-x-1">
                      <button
                        onClick={handleAddException}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setShowExceptionForm(false)}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecurringRulesManager;