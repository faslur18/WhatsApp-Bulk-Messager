import { useEffect, useState } from 'react';
import { Plus, Send, Eye } from 'lucide-react';
import { campaignAPI, contactAPI, whatsappAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Campaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const response = await campaignAPI.getAll();
            setCampaigns(response.data.data);
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            toast.error('Failed to load campaigns');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            draft: 'badge bg-wa-gray-200 text-wa-gray-600 border border-wa-gray-300',
            scheduled: 'badge bg-yellow-100 text-yellow-700 border border-yellow-200',
            in_progress: 'badge bg-blue-100 text-blue-700 border border-blue-200',
            completed: 'badge bg-wa-chat text-wa-dark border border-wa-teal/20',
            failed: 'badge bg-red-100 text-red-700 border border-red-200',
        };
        return badges[status] || 'badge bg-wa-gray-100 text-wa-gray-600';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-wa-gray-600">Campaigns</h1>
                    <p className="text-wa-gray-400 mt-1">Manage your bulk messaging campaigns</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={20} />
                    Create Campaign
                </button>
            </div>

            {/* Campaigns List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="loading-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="card text-center py-12">
                        <p className="text-wa-gray-400 mb-4">No campaigns found</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="btn-primary mx-auto"
                        >
                            Create Your First Campaign
                        </button>
                    </div>
                ) : (
                    campaigns.map((campaign) => (
                        <div key={campaign._id} className="card hover:shadow-md transition-shadow duration-200">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-wa-gray-600">{campaign.name}</h3>
                                        <span className={getStatusBadge(campaign.status)}>
                                            {campaign.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p className="text-wa-gray-500 text-sm mb-3">{campaign.description}</p>
                                    <div className="flex flex-wrap gap-4 text-xs text-wa-gray-400">
                                        <span className="flex items-center gap-1">
                                            Template: <strong className="text-wa-gray-500">{campaign.templateName}</strong>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            Contacts: <strong className="text-wa-gray-500">{campaign.totalContacts}</strong>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            Created: <strong className="text-wa-gray-500">{new Date(campaign.createdAt).toLocaleDateString()}</strong>
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3 min-w-[200px]">
                                    <div className="grid grid-cols-3 gap-2 text-center text-xs bg-wa-gray-50 p-2 rounded-lg border border-wa-gray-100 current-stats">
                                        <div>
                                            <p className="text-wa-gray-400 mb-1">Sent</p>
                                            <p className="font-bold text-wa-teal">{campaign.stats.sent}</p>
                                        </div>
                                        <div>
                                            <p className="text-wa-gray-400 mb-1">Delivered</p>
                                            <p className="font-bold text-blue-500">{campaign.stats.delivered}</p>
                                        </div>
                                        <div>
                                            <p className="text-wa-gray-400 mb-1">Failed</p>
                                            <p className="font-bold text-red-500">{campaign.stats.failed}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/campaigns/${campaign._id}`)}
                                        className="btn-secondary flex items-center justify-center gap-2 text-sm w-full"
                                    >
                                        <Eye size={16} />
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Campaign Modal */}
            {showCreateModal && (
                <CreateCampaignModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchCampaigns();
                    }}
                />
            )}
        </div>
    );
};

// Create Campaign Modal
const CreateCampaignModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        templateName: '',
        templateLanguage: 'en',
        targetTags: [],
        variables: [''],
    });
    const [templates, setTemplates] = useState([]);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTemplates();
        fetchTags();
    }, []);

    const fetchTemplates = async () => {
        try {
            const response = await whatsappAPI.getTemplates();
            setTemplates(response.data.data || []);
        } catch (error) {
            console.error('Error fetching templates:', error);
            toast.error('Failed to load templates');
        }
    };

    const fetchTags = async () => {
        try {
            const response = await contactAPI.getTags();
            setTags(response.data.data || []);
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.templateName) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            await campaignAPI.create({
                ...formData,
                variables: formData.variables.filter(v => v.trim() !== ''),
            });
            toast.success('Campaign created and messages queued!');
            onSuccess();
        } catch (error) {
            console.error('Error creating campaign:', error);
            toast.error(error.response?.data?.message || 'Failed to create campaign');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-wa-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-wa-gray-600">Create New Campaign</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-wa-teal mb-2">Campaign Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="input"
                            placeholder="e.g., Product Launch 2026"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-wa-gray-500 mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="input"
                            rows="3"
                            placeholder="Brief description of this campaign"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-wa-teal mb-2">WhatsApp Template *</label>
                        <select
                            value={formData.templateName}
                            onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                            className="input"
                            required
                        >
                            <option value="">Select a template</option>
                            {templates.map((template) => (
                                <option key={template.id} value={template.name}>
                                    {template.name} ({template.language})
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-wa-gray-400 mt-1">
                            Templates must be pre-approved in Meta Business Manager
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-wa-gray-500 mb-2">Target Tags (Optional)</label>
                        <div className="flex flex-wrap gap-2">
                            {tags.length === 0 ? (
                                <p className="text-sm text-wa-gray-400">No tags available</p>
                            ) : (
                                tags.map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => {
                                            if (formData.targetTags.includes(tag)) {
                                                setFormData({
                                                    ...formData,
                                                    targetTags: formData.targetTags.filter(t => t !== tag)
                                                });
                                            } else {
                                                setFormData({
                                                    ...formData,
                                                    targetTags: [...formData.targetTags, tag]
                                                });
                                            }
                                        }}
                                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors
                                            ${formData.targetTags.includes(tag)
                                                ? 'bg-wa-teal text-white border-wa-teal'
                                                : 'bg-wa-gray-50 text-wa-gray-500 border-wa-gray-200 hover:bg-wa-gray-100'}`}
                                    >
                                        {tag}
                                    </button>
                                ))
                            )}
                        </div>
                        <p className="text-xs text-wa-gray-400 mt-1">
                            Leave empty to send to all contacts
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-wa-gray-500 mb-2">Template Variables (Optional)</label>
                        <div className="space-y-2">
                            {formData.variables.map((variable, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    value={variable}
                                    onChange={(e) => {
                                        const newVariables = [...formData.variables];
                                        newVariables[index] = e.target.value;
                                        setFormData({ ...formData, variables: newVariables });
                                    }}
                                    className="input"
                                    placeholder={`Variable ${index + 1}`}
                                />
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, variables: [...formData.variables, ''] })}
                            className="text-sm text-wa-teal hover:text-wa-dark mt-2 font-medium"
                        >
                            + Add Variable
                        </button>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                            <Send size={20} />
                            {loading ? 'Creating...' : 'Create & Send'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Campaigns;
