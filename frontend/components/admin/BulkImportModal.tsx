'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, FileSpreadsheet, Download, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { importFacilitiesCSV } from '@/lib/api';

interface BulkImportModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface PreviewRow {
  name: string;
  type: string;
  latitude: string;
  longitude: string;
  address: string;
  condition: string;
  availability: string;
  wheelchair: string;
}

export default function BulkImportModal({ onClose, onSuccess }: BulkImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate & download sample CSV template
  const handleDownloadTemplate = () => {
    const csvContent =
      'name,type,latitude,longitude,address,condition,availability,wheelchairAccessible\n' +
      'Marine Drive Public Restroom,toilet,9.9798,76.2755,"Marine Drive Walkway, Kochi",clean,24/7,true\n' +
      'Infopark Drinking Water Kiosk,drinking_water,10.0125,76.3621,"Infopark Phase 1, Kakkanad",usable,24/7,false\n' +
      'Kaloor Metro Station Toilet,toilet,9.9982,76.2941,"Kaloor Metro Ground Level, Kochi",clean,6:00 AM - 10:00 PM,true\n' +
      'Fort Kochi Beach Water Fountain,drinking_water,9.9654,76.2412,"Kamalakadavu, Fort Kochi",usable,24/7,true\n' +
      'Vyttila Mobility Hub Restroom,toilet,9.9689,76.3188,"Vyttila Hub Bus Bay, Kochi",usable,24/7,true';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'civiclens_facilities_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Parse CSV client-side for immediate visual verification preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setParseError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setErrorMsg('Please select a valid .csv file.');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length <= 1) {
          setParseError('The uploaded CSV file is empty or missing data rows.');
          return;
        }

        const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
        const rows: PreviewRow[] = [];

        // Preview up to 5 rows
        for (let i = 1; i < Math.min(lines.length, 6); i++) {
          // Simple split handling quotes
          const raw = lines[i];
          const cols: string[] = [];
          let current = '';
          let inQuotes = false;
          for (let c = 0; c < raw.length; c++) {
            const char = raw[c];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              cols.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          cols.push(current.trim());

          const rowData: Record<string, string> = {};
          headers.forEach((h, idx) => {
            rowData[h.toLowerCase()] = cols[idx]?.replace(/^["']|["']$/g, '') || '';
          });

          rows.push({
            name: rowData['name'] || `Row ${i}`,
            type: rowData['type'] || 'toilet',
            latitude: rowData['latitude'] || rowData['lat'] || '0.0',
            longitude: rowData['longitude'] || rowData['lng'] || '0.0',
            address: rowData['address'] || '-',
            condition: rowData['condition'] || 'usable',
            availability: rowData['availability'] || '24/7',
            wheelchair: rowData['wheelchairaccessible'] || rowData['wheelchair'] || 'false',
          });
        }

        setPreviewRows(rows);
      } catch (err: any) {
        console.error('CSV parse error', err);
        setParseError('Failed to parse CSV preview. File format might be corrupted.');
      }
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setErrorMsg(null);

    try {
      const res = await importFacilitiesCSV(selectedFile);
      if (res.success) {
        alert(`Successfully imported ${res.importedCount} facility positions!`);
        onSuccess();
        onClose();
      } else {
        const errors = res.errors && res.errors.length > 0 ? res.errors.join('; ') : res.message;
        setErrorMsg(`Import failed: ${errors}`);
      }
    } catch (err: any) {
      console.error('Import failure', err);
      setErrorMsg(err.message || 'Failed to import CSV. Please ensure the backend server is reachable.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#F5EDF7] to-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#3D1860] flex items-center justify-center text-white shadow-md">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">Bulk Import Facilities</h2>
              <p className="text-xs text-gray-500 font-medium">
                Upload CSV dataset of toilets and drinking water locations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Template Info Card */}
          <div className="bg-[#F5EDF7]/60 border border-[#BB99CD]/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-[#3D1860] mb-0.5">Need the CSV file format?</h3>
              <p className="text-[11px] text-gray-600">
                Columns: <code>name, type, latitude, longitude, address, condition, availability, wheelchairAccessible</code>
              </p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center space-x-1.5 bg-white hover:bg-gray-50 text-[#3D1860] border border-[#BB99CD] px-3 py-1.5 rounded-xl font-bold text-xs shadow-2xs transition shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Template</span>
            </button>
          </div>

          {/* Upload Drop Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center ${
              selectedFile
                ? 'border-emerald-400 bg-emerald-50/40'
                : 'border-gray-300 hover:border-[#643579] bg-gray-50/60 hover:bg-[#F5EDF7]/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center text-[#643579] mb-3">
              {selectedFile ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              ) : (
                <Upload className="w-6 h-6 text-[#643579]" />
              )}
            </div>
            {selectedFile ? (
              <div>
                <p className="text-sm font-bold text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Click to choose a different file
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-bold text-gray-800">Click or drop your CSV file here</p>
                <p className="text-xs text-gray-500 mt-1">Supports standard CSV with UTF-8 encoding</p>
              </div>
            )}
          </div>

          {/* Parse or Upload Errors */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl flex items-start space-x-2.5 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {parseError && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3.5 rounded-xl flex items-start space-x-2.5 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Table Preview */}
          {previewRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">Preview (First {previewRows.length} entries)</span>
                <span className="text-[10px] text-gray-500 font-medium">Ready for municipal database import</span>
              </div>
              <div className="border border-gray-200 rounded-xl overflow-x-auto max-h-48 text-xs">
                <table className="w-full text-left divide-y divide-gray-200">
                  <thead className="bg-gray-50 text-[11px] font-black text-gray-600 uppercase tracking-wider">
                    <tr>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Coordinates</th>
                      <th className="px-3 py-2">Condition</th>
                      <th className="px-3 py-2">Accessible</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {previewRows.map((r, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/80">
                        <td className="px-3 py-2 font-semibold text-gray-900 truncate max-w-[140px]">{r.name}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.type === 'toilet'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-cyan-100 text-cyan-700'
                            }`}
                          >
                            {r.type}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-500 text-[11px] font-mono">
                          {r.latitude}, {r.longitude}
                        </td>
                        <td className="px-3 py-2 text-gray-700 capitalize">{r.condition}</td>
                        <td className="px-3 py-2 text-gray-700">{r.wheelchair}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-200 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="inline-flex items-center space-x-2 bg-[#3D1860] hover:bg-[#643579] disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition cursor-pointer"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Importing Dataset...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Confirm &amp; Import Facilities</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
