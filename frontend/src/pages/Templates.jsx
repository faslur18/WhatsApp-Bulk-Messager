import { useEffect, useState } from 'react';
import { MessageSquare, Copy, Share2, Check } from 'lucide-react';
import { whatsappAPI } from '../services/api';
import { toast } from 'react-toastify';

const Templates = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shareLink, setShareLink] = useState('');
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const response = await whatsappAPI.getTemplates();
            setTemplates(response.data.data || []);
        } catch (error) {
            console.error('Error fetching templates:', error);
            toast.error('Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateShareLink = async (template, message) => {
        try {
            const response = await whatsappAPI.generateShareLink({ message });
            setShareLink(response.data.data.shareLink);
            setSelectedTemplate(template);
            setShowShareModal(true);
        } catch (error) {
            console.error('Error generating share link:', error);
            toast.error('Failed to generate share link');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const getStatusBadge = (status) => {
        return status === 'APPROVED' ? 'badge bg-wa-chat text-wa-dark border border-wa-teal/20' :
            status === 'PENDING' ? 'badge bg-yellow-50 text-yellow-600 border border-yellow-200' :
                'badge bg-red-50 text-red-600 border border-red-200';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-wa-gray-600">Message Templates</h1>
                <p className="text-wa-gray-400 mt-1">
                    Manage your WhatsApp message templates
                </p>
            </div>

            {/* Info Card */}
            <div className="card bg-blue-50/50 border-blue-100">
                <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                        <MessageSquare size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-blue-900 mb-1">About Templates</h3>
                        <p className="text-sm text-blue-800/80 leading-relaxed">
                            Marketing messages on WhatsApp must use pre-approved templates from Meta.
                            Templates must be created and approved in your Meta Business Manager before
                            they can be used in campaigns.
                        </p>
                        <a
                            href="https://business.facebook.com/wa/manage/message-templates/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 font-medium mt-3 inline-block hover:underline"
                        >
                            Create Templates in Meta Business Manager →
                        </a>
                    </div>
                </div>
            </div>

            {/* Templates Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            ) : templates.length === 0 ? (
                <div className="card text-center py-12">
                    <p className="text-wa-gray-400 mb-2">No templates found</p>
                    <p className="text-sm text-wa-gray-300">
                        Create templates in Meta Business Manager first
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                        <div key={template.id} className="card hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-wa-gray-600 line-clamp-1" title={template.name}>{template.name}</h3>
                                    <p className="text-xs text-wa-gray-400 mt-1">Language: {template.language}</p>
                                </div>
                                <span className={getStatusBadge(template.status)}>
                                    {template.status}
                                </span>
                            </div>

                            <div className="bg-wa-gray-50 rounded-lg p-3 mb-4 flex-grow border border-wa-gray-100">
                                <p className="text-sm text-wa-gray-600 whitespace-pre-wrap line-clamp-4">
                                    {template.components?.find(c => c.type === 'BODY')?.text || 'No content'}
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    const bodyText = template.components?.find(c => c.type === 'BODY')?.text || '';
                                    handleGenerateShareLink(template, bodyText);
                                }}
                                className="btn-secondary w-full flex items-center justify-center gap-2 text-sm mt-auto"
                                disabled={template.status !== 'APPROVED'}
                            >
                                <Share2 size={16} />
                                Generate Share Link
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Share Link Modal */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full border border-wa-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-wa-gray-600">WhatsApp Share Link</h2>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-wa-teal mb-2">Template: {selectedTemplate?.name}</label>
                                <p className="text-xs text-wa-gray-400">
                                    Use this link to manually share the message to WhatsApp groups
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-wa-gray-500 mb-2">Share Link</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={shareLink}
                                        readOnly
                                        className="input flex-1 text-sm text-wa-gray-500"
                                    />
                                    <button
                                        onClick={() => copyToClipboard(shareLink)}
                                        className="btn-secondary"
                                    >
                                        {copied ? <Check size={20} className="text-wa-teal" /> : <Copy size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <p className="text-xs text-yellow-800 leading-relaxed">
                                    <strong>Note:</strong> WhatsApp API cannot send messages to groups.
                                    Click this link on your phone to manually forward the message to your groups.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowShareModal(false)}
                                    className="btn-secondary flex-1"
                                >
                                    Close
                                </button>
                                <a
                                    href={shareLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-primary flex-1 text-center"
                                >
                                    Open in WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Templates;
