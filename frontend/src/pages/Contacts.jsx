import { useEffect, useState, useCallback } from 'react';
import { Upload, Plus, Search, Tag, Trash2, Edit, X } from 'lucide-react';
import { contactAPI } from '../services/api';
import { toast } from 'react-toastify';

const Contacts = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    // const [showAddModal, setShowAddModal] = useState(false); // Feature not implemented yet
    const [showTagModal, setShowTagModal] = useState(false);
    const [tags, setTags] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

    const fetchContacts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await contactAPI.getAll({
                page: pagination.page,
                limit: 50,
                search: searchTerm,
            });
            setContacts(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            toast.error('Failed to load contacts');
        } finally {
            setLoading(false);
        }
    }, [pagination.page, searchTerm]);

    const fetchTags = useCallback(async () => {
        try {
            const response = await contactAPI.getTags();
            setTags(response.data.data);
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    }, []);

    useEffect(() => {
        fetchContacts();
        fetchTags();
    }, [fetchContacts, fetchTags]);

    const handleUpload = async (file) => {
        try {
            const response = await contactAPI.upload(file);
            toast.success(response.data.message);
            setShowUploadModal(false);
            fetchContacts();
            fetchTags();
        } catch (error) {
            console.error('Error uploading contacts:', error);
            toast.error(error.response?.data?.message || 'Failed to upload contacts');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this contact?')) return;

        try {
            await contactAPI.delete(id);
            toast.success('Contact deleted successfully');
            fetchContacts();
        } catch (error) {
            console.error('Error deleting contact:', error);
            toast.error('Failed to delete contact');
        }
    };

    const handleTagContacts = async (selectedTags) => {
        try {
            await contactAPI.tagContacts({
                contactIds: selectedContacts,
                tags: selectedTags,
            });
            toast.success('Contacts tagged successfully');
            setShowTagModal(false);
            setSelectedContacts([]);
            fetchContacts();
            fetchTags();
        } catch (error) {
            console.error('Error tagging contacts:', error);
            toast.error('Failed to tag contacts');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-wa-gray-600">Contacts</h1>
                    <p className="text-wa-gray-400 mt-1">
                        Manage your contact list ({pagination.total} contacts)
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => toast.info('Add Contact feature coming soon')}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Add Contact
                    </button>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Upload size={20} />
                        Upload CSV/Excel
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="card">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-wa-gray-300" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name or phone number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input pl-10"
                        />
                    </div>
                    {selectedContacts.length > 0 && (
                        <button
                            onClick={() => setShowTagModal(true)}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <Tag size={20} />
                            Tag Selected ({selectedContacts.length})
                        </button>
                    )}
                </div>
            </div>

            {/* Contacts Table */}
            <div className="card overflow-hidden p-0">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="loading-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                ) : contacts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-wa-gray-400">No contacts found</p>
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="btn-primary mt-4 mx-auto"
                        >
                            Upload Your First Contact List
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-wa-gray-50 border-b border-wa-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedContacts(contacts.map(c => c._id));
                                                } else {
                                                    setSelectedContacts([]);
                                                }
                                            }}
                                            checked={selectedContacts.length === contacts.length}
                                            className="rounded border-wa-gray-200 text-wa-teal focus:ring-wa-teal"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-wa-gray-400 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-wa-gray-400 uppercase tracking-wider">
                                        Phone Number
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-wa-gray-400 uppercase tracking-wider">
                                        Tags
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-wa-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-wa-gray-100">
                                {contacts.map((contact) => (
                                    <tr key={contact._id} className="hover:bg-wa-gray-50 transition-colors duration-150">
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedContacts.includes(contact._id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedContacts([...selectedContacts, contact._id]);
                                                    } else {
                                                        setSelectedContacts(selectedContacts.filter(id => id !== contact._id));
                                                    }
                                                }}
                                                className="rounded border-wa-gray-200 text-wa-teal focus:ring-wa-teal"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-wa-gray-600">{contact.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-wa-gray-400">{contact.phoneNumber}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {contact.tags?.map((tag, index) => (
                                                    <span key={index} className="badge bg-wa-gray-100 text-wa-gray-500 border border-wa-gray-200">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(contact._id)}
                                                className="text-wa-gray-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex justify-center gap-2">
                    <button
                        onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                        disabled={pagination.page === 1}
                        className="btn-secondary"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 text-wa-gray-500 bg-white border border-wa-gray-200 rounded-lg">
                        Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                        onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                        disabled={pagination.page === pagination.pages}
                        className="btn-secondary"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <UploadModal
                    onClose={() => setShowUploadModal(false)}
                    onUpload={handleUpload}
                />
            )}

            {/* Tag Modal */}
            {showTagModal && (
                <TagModal
                    onClose={() => setShowTagModal(false)}
                    onTag={handleTagContacts}
                    existingTags={tags}
                />
            )}
        </div>
    );
};

// Upload Modal Component
const UploadModal = ({ onClose, onUpload }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async () => {
        if (!file) {
            toast.error('Please select a file');
            return;
        }

        setUploading(true);
        await onUpload(file);
        setUploading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 border border-wa-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-wa-gray-600">Upload Contacts</h2>
                    <button onClick={onClose} className="text-wa-gray-400 hover:text-wa-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-wa-teal mb-2">Select CSV or Excel File</label>
                        <input
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-wa-teal file:text-white hover:file:bg-wa-dark"
                        />
                        <p className="text-xs text-wa-gray-400 mt-2">
                            Supported: .csv, .xlsx. Columns: Name, Phone
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button onClick={onClose} className="btn-secondary flex-1">
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={uploading}
                            className="btn-primary flex-1"
                        >
                            {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Tag Modal Component
const TagModal = ({ onClose, onTag, existingTags }) => {
    const [selectedTags, setSelectedTags] = useState([]);
    const [newTag, setNewTag] = useState('');

    const handleAddTag = () => {
        if (newTag && !selectedTags.includes(newTag)) {
            setSelectedTags([...selectedTags, newTag]);
            setNewTag('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 border border-wa-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-wa-gray-600">Tag Contacts</h2>
                    <button onClick={onClose} className="text-wa-gray-400 hover:text-wa-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-wa-teal mb-2">Add New Tag</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                                placeholder="Enter tag name"
                                className="input flex-1"
                            />
                            <button onClick={handleAddTag} className="btn-secondary">
                                Add
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-wa-gray-500 mb-2">Existing Tags</label>
                        <div className="flex flex-wrap gap-2">
                            {existingTags.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => {
                                        if (selectedTags.includes(tag)) {
                                            setSelectedTags(selectedTags.filter(t => t !== tag));
                                        } else {
                                            setSelectedTags([...selectedTags, tag]);
                                        }
                                    }}
                                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors
                                        ${selectedTags.includes(tag)
                                            ? 'bg-wa-teal text-white border-wa-teal'
                                            : 'bg-wa-gray-50 text-wa-gray-500 border-wa-gray-200 hover:bg-wa-gray-100'}`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-wa-gray-500 mb-2">Selected Tags</label>
                        <div className="flex flex-wrap gap-2 min-h-[32px]">
                            {selectedTags.map((tag) => (
                                <span key={tag} className="badge bg-wa-teal text-white border-wa-teal px-2 py-1 rounded-md">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button onClick={onClose} className="btn-secondary flex-1">
                            Cancel
                        </button>
                        <button
                            onClick={() => onTag(selectedTags)}
                            disabled={selectedTags.length === 0}
                            className="btn-primary flex-1"
                        >
                            Apply Tags
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contacts;
