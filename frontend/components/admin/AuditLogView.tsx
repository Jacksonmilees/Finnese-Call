import React, { useState, useEffect } from 'react';
import { FileText, User, Calendar, Activity } from 'lucide-react';

interface AuditLogEntry {
  _id: string;
  userId: {
    name: string;
  };
  action: string;
  details: any;
  createdAt: string;
  organizationId: {
    name: string;
  };
}

interface AuditLogViewProps {
  getAuditLog: () => Promise<AuditLogEntry[]>;
}

const AuditLogView: React.FC<AuditLogViewProps> = ({ getAuditLog }) => {
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAuditLog();
  }, []);

  const loadAuditLog = async () => {
    try {
      setLoading(true);
      const data = await getAuditLog();
      setAuditLog(data);
    } catch (err) {
      setError('Failed to load audit log');
      console.error('Failed to load audit log:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create_agent':
      case 'update_agent':
      case 'delete_agent':
        return <User className="h-4 w-4" />;
      case 'create_organization':
      case 'update_organization':
        return <Activity className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatAction = (action: string) => {
    return action.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={loadAuditLog}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-xl font-bold text-slate-900">Audit Log</h3>
        <p className="text-sm text-slate-500 mt-1">System activity and user actions</p>
      </div>
      
      <div className="overflow-x-auto">
        {auditLog.length > 0 ? (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {auditLog.map((entry) => (
                <tr key={entry._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getActionIcon(entry.action)}
                      <span className="text-sm font-medium text-slate-900">
                        {formatAction(entry.action)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {entry.userId?.name || 'System'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div className="max-w-xs truncate">
                      {entry.details ? (
                        <span title={JSON.stringify(entry.details, null, 2)}>
                          {typeof entry.details === 'object' 
                            ? Object.entries(entry.details).map(([key, value]) => `${key}: ${value}`).join(', ')
                            : entry.details
                          }
                        </span>
                      ) : (
                        <span className="text-slate-400">No details</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>{new Date(entry.createdAt).toLocaleString()}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16 text-slate-500">
            <FileText className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-lg font-medium text-slate-800">No Audit Log Entries</h3>
            <p className="mt-1 text-sm text-slate-500">System activity will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogView; 