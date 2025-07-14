import React, { useState, useEffect } from 'react';
import { Phone, PhoneCall, Settings, CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import apiService from '../services/api';

interface ATStatus {
  apiKey: string;
  username: string;
  callerId: string;
  testNumber: string;
}

const ATTestPage: React.FC = () => {
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
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-800"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="h-10 w-10 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Africa's Talking Test</h1>
              <p className="text-slate-500">Test your Africa's Talking integration</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Configuration Status</h3>
            <div className="space-y-4">
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
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-slate-500 mt-2">Loading status...</p>
                </div>
              )}
            </div>
          </div>

          {/* Test Call Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Test Outgoing Call</h3>
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
              <button
                onClick={testCall}
                disabled={loading || !testNumber}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors disabled:bg-slate-400"
              >
                <PhoneCall className="h-5 w-5" />
                <span>{loading ? 'Making Call...' : 'Test Call'}</span>
              </button>
            </div>

            {/* Results */}
            {callResult && (
              <div className="mt-6">
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

            {/* Error */}
            {error && (
              <div className="mt-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-red-800">Error</span>
                  </div>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Setup Instructions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <h4 className="font-medium mb-2">1. Backend Configuration</h4>
              <ul className="space-y-1">
                <li>• Update your backend <code>.env</code> file</li>
                <li>• Add your Africa's Talking API Key</li>
                <li>• Add your Africa's Talking Username</li>
                <li>• Add your test phone number as CALLER_ID</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">2. Africa's Talking Dashboard</h4>
              <ul className="space-y-1">
                <li>• Go to https://account.africastalking.com/</li>
                <li>• Configure webhook URL for incoming calls</li>
                <li>• Set webhook to: <code>http://your-domain.com/api/at/incoming-call</code></li>
                <li>• Test incoming calls by calling your AT number</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ATTestPage; 