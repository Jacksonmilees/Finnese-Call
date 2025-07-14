
import React, { useState, useEffect } from 'react';
import { CrmContext } from '../../types/index';
import { X, User, Briefcase, Mail, Phone, Clock, ArrowDownLeft, ArrowUpRight, FileText, Video, Sparkles } from 'lucide-react';
import useGemini from '../../hooks/useGemini';

interface CrmContextModalProps {
  context: CrmContext;
  onClose: (callId: string, disposition: string, notes: string) => void;
}

const CrmContextModal: React.FC<CrmContextModalProps> = ({ context, onClose }) => {
  const [disposition, setDisposition] = useState('');
  const [notes, setNotes] = useState('');
  const [isRecordingScreen, setIsRecordingScreen] = useState(true);
  
  const { call, contact } = context;
  const { generateSummary, isSummarizing, summaryError } = useGemini();

  useEffect(() => {
    if (call.transcript) {
        generateSummary(call.transcript).then(summary => {
            if (summary) {
                setNotes(summary);
            }
        });
    }
  }, [call.transcript, generateSummary]);

  const handleClose = () => {
    onClose(context.callId, disposition, notes);
  };

  const crmLogo: {[key: string]: string} = {
    Salesforce: "https://i.imgur.com/kQZ1G3B.png", // Salesforce logo
    HubSpot: "https://i.imgur.com/iC3gT2F.png", // HubSpot logo
    Zoho: "https://i.imgur.com/WSSf24X.png" // Zoho logo
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center space-x-3">
             {call.direction === 'inbound' ? 
                <ArrowDownLeft className="h-7 w-7 text-blue-500 p-1 bg-blue-100 rounded-full" /> : 
                <ArrowUpRight className="h-7 w-7 text-green-500 p-1 bg-green-100 rounded-full" />}
            <h2 className="text-xl font-bold text-slate-900">
              Log Call Details
            </h2>
            <span className="text-lg font-mono text-slate-600">{call.phoneNumber}</span>
          </div>
          <button onClick={handleClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">CRM Context</h3>
                {contact && <img src={crmLogo[contact.crmType]} alt={`${contact.crmType} logo`} className="h-6" />}
            </div>
            {contact ? (
                <>
                <div className="space-y-3 text-sm">
                    <div className="flex items-center text-slate-700"><User className="w-4 h-4 mr-3 text-slate-400"/><span>{contact.name}</span></div>
                    <div className="flex items-center text-slate-700"><Briefcase className="w-4 h-4 mr-3 text-slate-400"/><span>{contact.company}</span></div>
                    <div className="flex items-center text-slate-700"><Mail className="w-4 h-4 mr-3 text-slate-400"/><span>{contact.email}</span></div>
                    <div className="flex items-center text-slate-700"><Clock className="w-4 h-4 mr-3 text-slate-400"/><span>Last interaction: {contact.lastInteraction}</span></div>
                </div>
                <div className="pt-4 border-t border-slate-200">
                    <h4 className="text-md font-semibold text-slate-800 mb-2">Previous Notes</h4>
                    <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 max-h-24 overflow-y-auto">
                        <p>{contact.notes}</p>
                    </div>
                </div>
                </>
            ) : (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-r-lg">
                    <p className="font-semibold">Contact Not Found</p>
                    <p className="text-sm">This contact may have been deleted.</p>
                </div>
            )}
          </div>

          {/* Call Disposition */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Call Disposition</h3>
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                <div className="flex items-center">
                    <Video className="w-5 h-5 mr-3 text-slate-500"/>
                    <span className="text-sm font-medium text-slate-700">Screen Recording</span>
                </div>
                <label htmlFor="screen-recording-toggle" className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="screen-recording-toggle" className="sr-only peer" checked={isRecordingScreen} onChange={() => setIsRecordingScreen(!isRecordingScreen)} />
                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>
            <div>
              <label htmlFor="disposition" className="block text-sm font-medium text-slate-700">Outcome</label>
              <select
                id="disposition"
                value={disposition}
                onChange={(e) => setDisposition(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
              >
                <option value="" disabled>Select call outcome...</option>
                <option value="Sale Made">Sale Made</option>
                <option value="Follow-up Required">Follow-up Required</option>
                <option value="Resolved Issue">Resolved Issue</option>
                <option value="Lead Generated">Lead Generated</option>
                <option value="Technical Support">Technical Support</option>
                <option value="Billing Inquiry">Billing Inquiry</option>
                <option value="Information Requested">Information Requested</option>
                <option value="Not Interested">Not Interested</option>
                <option value="No Answer">No Answer</option>
                <option value="Wrong Number">Wrong Number</option>
              </select>
            </div>
            <div>
              <label htmlFor="notes" className="flex items-center space-x-2 text-sm font-medium text-slate-700">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span>AI-Assisted Notes</span>
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder={isSummarizing ? 'Generating summary with AI...' : summaryError ? 'AI summary failed. Please enter notes manually.' : 'Add notes for this call...'}
                disabled={isSummarizing}
              />
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-slate-50 border-t border-slate-200 rounded-b-xl">
           <button 
                onClick={handleClose} 
                className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-slate-400 flex items-center justify-center space-x-2 transition-all duration-300 transform active:scale-95"
                disabled={!disposition}
            >
              <FileText className="h-5 w-5" />
              <span>Log Call & End</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default CrmContextModal;
