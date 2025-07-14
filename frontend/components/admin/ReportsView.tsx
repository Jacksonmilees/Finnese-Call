import React, { useState } from 'react';
import { FileText, Download, Calendar, BarChart3, Users, Phone } from 'lucide-react';

interface ReportsViewProps {
  downloadCallsReport: (format: 'csv' | 'pdf') => Promise<void>;
}

const ReportsView: React.FC<ReportsViewProps> = ({ downloadCallsReport }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'pdf'>('csv');

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadCallsReport(selectedFormat);
    } catch (error) {
      console.error('Failed to download report:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const reportTypes = [
    {
      id: 'calls',
      name: 'Call Reports',
      description: 'Detailed call logs with agent performance',
      icon: <Phone className="h-6 w-6" />,
      formats: ['csv', 'pdf']
    },
    {
      id: 'agents',
      name: 'Agent Reports',
      description: 'Agent performance and activity reports',
      icon: <Users className="h-6 w-6" />,
      formats: ['csv', 'pdf']
    },
    {
      id: 'analytics',
      name: 'Analytics Reports',
      description: 'Call volume and performance analytics',
      icon: <BarChart3 className="h-6 w-6" />,
      formats: ['csv', 'pdf']
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-slate-900">Reports & Analytics</h3>
        <p className="text-sm text-slate-500 mt-1">Generate and download various reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => (
          <div key={report.id} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                {report.icon}
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">{report.name}</h4>
                <p className="text-sm text-slate-500">{report.description}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Format
                </label>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value as 'csv' | 'pdf')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="csv">CSV</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>

              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
              >
                {isDownloading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Download Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h4 className="font-semibold text-slate-900 mb-4">Report Types</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium text-slate-900 mb-2">Call Reports</h5>
            <ul className="space-y-1 text-slate-600">
              <li>• Call duration and outcomes</li>
              <li>• Agent performance metrics</li>
              <li>• Call disposition breakdown</li>
              <li>• Queue performance data</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-slate-900 mb-2">Agent Reports</h5>
            <ul className="space-y-1 text-slate-600">
              <li>• Individual agent statistics</li>
              <li>• Call handling efficiency</li>
              <li>• Customer satisfaction scores</li>
              <li>• Training and development needs</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Report Generation</h4>
            <p className="text-sm text-blue-700 mt-1">
              Reports are generated based on your organization's data and include all relevant metrics and analytics. 
              CSV files are best for data analysis, while PDF files are ideal for presentations and sharing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsView; 