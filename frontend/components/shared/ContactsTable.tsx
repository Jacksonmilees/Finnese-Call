
import React, { useState } from 'react';
import { CrmContact } from '../../types/index';
import { Edit, Trash2, Search, BookUser } from 'lucide-react';

interface ContactsTableProps {
  contacts: CrmContact[];
  onEdit: (contact: CrmContact) => void;
  onDelete: (contact: CrmContact) => void;
}

const ContactsTable: React.FC<ContactsTableProps> = ({ contacts, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm)
  );
  
  const crmLogo: {[key: string]: string} = {
    Salesforce: "https://i.imgur.com/kQZ1G3B.png", 
    HubSpot: "https://i.imgur.com/iC3gT2F.png",
    Zoho: "https://i.imgur.com/WSSf24X.png"
  }


  return (
    <div className="space-y-4">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
            type="search"
            placeholder="Search contacts by name, company, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
        </div>

        {filteredContacts.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
                <BookUser className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-2 text-lg font-medium text-slate-800">No Contacts Found</h3>
                <p className="mt-1 text-sm text-slate-500">Try adjusting your search or add a new contact.</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email & Phone</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">CRM</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                    {filteredContacts.map(contact => (
                        <tr key={contact.id} className="hover:bg-slate-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{contact.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{contact.company}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                <div>{contact.email}</div>
                                <div>{contact.phone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                <img src={crmLogo[contact.crmType]} alt={`${contact.crmType} logo`} className="h-5" />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-4">
                                <button onClick={() => onEdit(contact)} className="text-blue-600 hover:text-blue-900 transition-colors" aria-label={`Edit ${contact.name}`}>
                                <Edit className="h-5 w-5" />
                                </button>
                                <button onClick={() => onDelete(contact)} className="text-red-600 hover:text-red-900 transition-colors" aria-label={`Delete ${contact.name}`}>
                                <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
  );
};

export default ContactsTable;
