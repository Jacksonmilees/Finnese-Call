
import React, { useState } from 'react';
import { PhoneCall, AtSign, KeyRound, LogIn, Phone, Loader2 } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await onLogin(username, password);
    setLoading(false);
    if (!success) {
      setError('Invalid username or password. Please try again.');
    }
  };

  const handleCallAdmin = () => {
    window.open(`tel:+254700088271`, '_self');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center items-center space-x-3 mb-8">
          <PhoneCall className="h-10 w-10 text-blue-600" />
          <h1 className="text-4xl font-bold text-slate-900">FinesseCall</h1>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-8">
          <h2 className="text-2xl font-semibold text-center text-slate-800 mb-1">Welcome Back</h2>
          <p className="text-sm text-center text-slate-500 mb-8">Login to access your dashboard.</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                        id="username" 
                        type="text" 
                        value={username} 
                        onChange={e => setUsername(e.target.value)} 
                        placeholder="admin or your_sip_username" 
                        required 
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                </div>
            </div>
            
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                        id="password" 
                        type="password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        placeholder="••••••••" 
                        required 
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md text-sm">
                    <p>{error}</p>
                </div>
            )}

            <div>
                 <button 
                    type="submit" 
                    className="w-full flex justify-center items-center space-x-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors active:scale-95 disabled:bg-slate-400"
                    disabled={!username || !password || loading}
                >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Logging in...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="h-5 w-5" />
                        <span>Login</span>
                      </>
                    )}
                 </button>
            </div>
          </form>
        </div>
        
        {/* Contact Admin Section */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-4">
          <div className="text-center">
            <h3 className="text-sm font-medium text-slate-700 mb-2">Need Help?</h3>
            <p className="text-xs text-slate-500 mb-3">Contact your administrator for support</p>
            <button
              onClick={handleCallAdmin}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span>Call Admin: +254700088271</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
