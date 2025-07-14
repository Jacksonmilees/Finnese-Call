import React, { useState, useEffect } from 'react';
import { Phone, PhoneCall, Settings, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import apiService from '../../services/api';

interface ATStatus {
  apiKey: string;
  username: string;
  callerId: string;
  testNumber: string;
}

const AfricaTalkingTest: React.FC = () => {
  const [status, setStatus] = useState<ATStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [testNumber, setTestNumber] = useState('+254700088271');
  const [callResult, setCallResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const response = await apiService.getATStatus();
      setStatus(response.status);
      setError(null);
    } catch (err) {
      setError('Failed to check Africa\'s Talking status');
      console.error('Status check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const testCall = async () => {
    if (!testNumber) {
      setError('Please enter a phone number');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiService.testATCall(testNumber);
      setCallResult(response);
    } catch (err) {
      setError('Failed to make test call');
      console.error('Test call error:', err);
    } finally {
      setLoading(false);
    }
  };

  const testInboundCall = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.testATInboundCall(testNumber);
      setCallResult(response);
    } catch (err) {
      setError('Failed to test inbound call');
      console.error('Inbound call test error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'Configured') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (status === 'Not configured') {
      return <XCircle className="h-5 w-5 text-red-500" />;
    } else {
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Phone className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="text-xl font-bold text-slate-900">Africa's Talking Test</h3>
            <p className="text-sm text-slate-500">Test your Africa's Talking integration</p>
          </div>
        </div>

        {/* Status Section */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-slate-800 mb-3">Configuration Status</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {status ? (
              <>
                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                  {getStatusIcon(status.apiKey)}
                  <div>
                    <p className="font-medium text-slate-700">API Key</p>
                    <p className="text-sm text-slate-500">{status.apiKey}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                  {getStatusIcon(status.username)}
                  <div>
                    <p className="font-medium text-slate-700">Username</p>
                    <p className="text-sm text-slate-500">{status.username}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                  {getStatusIcon(status.callerId)}
                  <div>
                    <p className="font-medium text-slate-700">Caller ID</p>
                    <p className="text-sm text-slate-500">{status.callerId}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                  <Phone className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-slate-700">Test Number</p>
                    <p className="text-sm text-slate-500">{status.testNumber}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="col-span-full text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-slate-500 mt-2">Loading status...</p>
              </div>
            )}
          </div>
        </div>

        {/* Test Call Section */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-slate-800 mb-3">Test Calls</h4>
          <div className="space-y-4">
            <div>
              <label htmlFor="testNumber" className="block text-sm font-medium text-slate-700 mb-1">
                Phone Number to Call
              </label>
              <input
                id="testNumber"
                type="tel"
                value={testNumber}
                onChange={(e) => setTestNumber(e.target.value)}
                placeholder="+254700088271"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={testCall}
                disabled={loading || !testNumber}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors disabled:bg-slate-400"
              >
                <PhoneCall className="h-5 w-5" />
                <span>{loading ? 'Making Call...' : 'Test Outbound Call'}</span>
              </button>
              <button
                onClick={testInboundCall}
                disabled={loading || !testNumber}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:bg-slate-400"
              >
                <Phone className="h-5 w-5" />
                <span>{loading ? 'Testing...' : 'Test Inbound Call'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {callResult && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-slate-800 mb-3">Call Result</h4>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Call Initiated Successfully</span>
              </div>
              <pre className="text-sm text-green-700 bg-green-100 p-3 rounded overflow-x-auto">
                {JSON.stringify(callResult, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Error Section */}
        {error && (
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">Error</span>
              </div>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-blue-800 mb-2">Setup Instructions</h4>
          <div className="space-y-2 text-sm text-blue-700">
            <p>1. Update your backend <code>.env</code> file with your Africa's Talking credentials</p>
            <p>2. Configure your webhook URL in Africa's Talking dashboard</p>
            <p>3. Test incoming calls by calling your Africa's Talking number</p>
            <p>4. Use this interface to test both outbound and inbound calls</p>
            <p>5. For inbound testing, use the "Test Inbound Call" button to simulate a call to your number</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AfricaTalkingTest; 