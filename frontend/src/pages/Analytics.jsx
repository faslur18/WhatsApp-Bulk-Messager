import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { analyticsAPI } from '../services/api';
import { toast } from 'react-toastify';

const Analytics = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        startDate: '',
        endDate: '',
    });
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoading(true);
                const response = await analyticsAPI.getLogs({
                    page: pagination.page,
                    limit: 50,
                    ...filters,
                });
                setLogs(response.data.data);
                setPagination(response.data.pagination);
            } catch (error) {
                console.error('Error fetching logs:', error);
                toast.error('Failed to load analytics');
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [filters, pagination.page]);

    const getStatusBadge = (status) => {
        const badges = {
            queued: 'badge bg-wa-gray-200 text-wa-gray-600 border border-wa-gray-300',
            sending: 'badge bg-yellow-100 text-yellow-700 border border-yellow-200',
            sent: 'badge bg-blue-100 text-blue-700 border border-blue-200',
            delivered: 'badge bg-wa-chat text-wa-dark border border-wa-teal/20',
            read: 'badge bg-wa-teal text-white border border-wa-teal',
            failed: 'badge bg-red-100 text-red-700 border border-red-200',
        };
        return badges[status] || 'badge bg-wa-gray-100 text-wa-gray-600';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-wa-gray-600">Analytics</h1>
                <p className="text-wa-gray-400 mt-1">
                    Detailed message delivery logs and analytics
                </p>
            </div>

            {/* Filters */}
            <div className="card">
                <h2 className="text-lg font-bold mb-4 text-wa-gray-600">Filters</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-wa-gray-500 mb-1">Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="input"
                        >
                            <option value="">All Statuses</option>
                            <option value="queued">Queued</option>
                            <option value="sending">Sending</option>
                            <option value="sent">Sent</option>
                            <option value="delivered">Delivered</option>
                            <option value="read">Read</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-wa-gray-500 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            className="input"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-wa-gray-500 mb-1">End Date</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            className="input"
                        />
                    </div>
                </div>
            </div>

            {/* Message Logs */}
            <div className="card overflow-hidden p-0 border border-wa-gray-100">
                <div className="p-6 border-b border-wa-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-lg font-bold text-wa-gray-600">Message Logs ({pagination.total})</h2>
                    <button className="btn-secondary flex items-center gap-2 text-sm">
                        <Download size={16} />
                        Export
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="loading-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-wa-gray-400">No logs found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-wa-gray-50 border-b border-wa-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-wa-gray-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-wa-gray-500 uppercase tracking-wider">
                                        Phone Number
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-wa-gray-500 uppercase tracking-wider">
                                        Template
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-wa-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-wa-gray-500 uppercase tracking-wider">
                                        Sent At
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-wa-gray-500 uppercase tracking-wider">
                                        Delivered At
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-wa-gray-100">
                                {logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-wa-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-wa-gray-700">
                                                {log.contactId?.name || 'Unknown'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-wa-gray-500 font-mono text-sm">
                                            {log.phoneNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-wa-gray-600">
                                            {log.templateName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={getStatusBadge(log.status)}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-wa-gray-500">
                                            {log.sentAt ? new Date(log.sentAt).toLocaleString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-wa-gray-500">
                                            {log.deliveredAt ? new Date(log.deliveredAt).toLocaleString() : '-'}
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
                    <span className="px-4 py-2 text-wa-gray-600 font-medium">
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
        </div>
    );
};

export default Analytics;
