
import React, { useState, useEffect } from 'react';
import { CrmContact } from '../../types/index';
import { X, User, Briefcase, Mail, Phone } from 'lucide-react';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contactData: Omit<CrmContact, 'lastInteraction'>) => void;
  contactToEdit?: CrmContact;
}

const ContactFormModal: React.FC<ContactFormModalProps> = ({ isOpen, onClose, onSave, contactToEdit }) => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [crmType, setCrmType] = useState<CrmContact['crmType']>('HubSpot');

  useEffect(() => {
    if (contactToEdit) {
      setName(contactToEdit.name);
      setCompany(contactToEdit.company);
      setEmail(contactToEdit.email);
      setPhone(contactToEdit.phone);
      setNotes(contactToEdit.notes);
      setCrmType(contactToEdit.crmType);
    } else {
      setName('');
      setCompany('');
      setEmail('');
      setPhone('');
      setNotes('');
      setCrmType('HubSpot');
    }
  }, [contactToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: contactToEdit?.id,
      name,
      company,
      email,
      phone,
      notes,
      crmType
    });
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all animate-in fade-in-0 zoom-in-95 duration-300">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">
              {contactToEdit ? 'Edit Contact' : 'Create New Contact'}
            </h2>
            <button type="button" onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="contact-name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input id="contact-name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., John Doe" required className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                    </div>
                 </div>
                 <div>
                    <label htmlFor="contact-company" className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                    <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input id="contact-company" type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g., Acme Inc." required className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                    </div>
                 </div>
             </div>
             <div>
                <label htmlFor="contact-email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input id="contact-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g., j.doe@acme.com" required className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                </div>
             </div>
              <div>
                <label htmlFor="contact-phone" className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input id="contact-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g., +1-202-555-0125" required className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                </div>
             </div>
             <div>
              <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Add notes for this contact..."
              />
            </div>
             <div>
              <label htmlFor="crm-type" className="block text-sm font-medium text-slate-700">CRM System</label>
              <select
                id="crm-type"
                value={crmType}
                onChange={(e) => setCrmType(e.target.value as CrmContact['crmType'])}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
              >
                <option value="HubSpot">HubSpot</option>
                <option value="Salesforce">Salesforce</option>
                <option value="Zoho">Zoho</option>
              </select>
            </div>
          </div>
          
          <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-xl flex justify-end space-x-3">
             <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-slate-700 border border-slate-300 font-semibold rounded-md hover:bg-slate-50 transition-colors active:scale-95">
                Cancel
             </button>
             <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors active:scale-95 disabled:bg-slate-400">
                {contactToEdit ? 'Save Changes' : 'Create Contact'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactFormModal;
