'use client';

import { Filter, X, Search } from 'lucide-react';
import { useState } from 'react';

export interface FilterState {
  type: string;
  condition: string;
  availability: string;
  wheelchairAccessible: boolean;
  radius: number;
}

interface FiltersPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function FiltersPanel({ filters, onFilterChange, searchQuery, onSearchChange }: FiltersPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, type: e.target.value });
  };

  const handleConditionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, condition: e.target.value });
  };

  const handleAvailabilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, availability: e.target.value });
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, radius: parseInt(e.target.value, 10) });
  };

  const handleAccessibilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, wheelchairAccessible: e.target.checked });
  };

  return (
    <div className="absolute top-4 left-4 z-40 flex flex-col space-y-3">
      {/* Search Bar */}
      <div className="bg-white rounded-full shadow-lg flex items-center px-4 py-2 w-72 md:w-96 border focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
        <Search className="w-5 h-5 text-gray-400 mr-2" />
        <input 
          type="text" 
          placeholder="Search facility name or address..." 
          className="bg-transparent border-none outline-none flex-1 text-sm text-gray-800"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button onClick={() => onSearchChange('')} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Filters Button / Panel */}
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-white px-4 py-2 rounded-full shadow-lg flex items-center hover:bg-gray-50 transition-colors w-max text-sm font-medium text-gray-700"
          aria-label="Open filters"
        >
          <Filter className="w-4 h-4 mr-2 text-blue-600" />
          Filters
        </button>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl w-72 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Filters</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                <select 
                  value={filters.type} 
                  onChange={handleTypeChange}
                  className="w-full rounded-lg border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white p-2 border"
                >
                  <option value="all">All</option>
                  <option value="toilet">Toilets</option>
                  <option value="drinking_water">Water</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Distance</label>
                <select 
                  value={filters.radius} 
                  onChange={handleRadiusChange}
                  className="w-full rounded-lg border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white p-2 border"
                >
                  <option value="250">250 m</option>
                  <option value="500">500 m</option>
                  <option value="1000">1 km</option>
                  <option value="2000">2 km</option>
                  <option value="5000">5 km</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Condition</label>
                <select 
                  value={filters.condition} 
                  onChange={handleConditionChange}
                  className="w-full rounded-lg border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white p-2 border"
                >
                  <option value="all">Any</option>
                  <option value="usable">Usable</option>
                  <option value="broken">Broken</option>
                  <option value="locked">Locked</option>
                  <option value="no_water">No Water</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Availability</label>
                <select 
                  value={filters.availability} 
                  onChange={handleAvailabilityChange}
                  className="w-full rounded-lg border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white p-2 border"
                >
                  <option value="all">Any</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
            </div>

            <div className="flex items-center pt-2">
              <input
                id="wheelchair"
                type="checkbox"
                checked={filters.wheelchairAccessible}
                onChange={handleAccessibilityChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="wheelchair" className="ml-2 block text-sm text-gray-700">
                Wheelchair Accessible Only
              </label>
            </div>
            
            <button 
              onClick={() => onFilterChange({
                type: 'all', condition: 'all', availability: 'all', wheelchairAccessible: false, radius: 1000
              })}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-800 pt-2 border-t border-gray-100"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
