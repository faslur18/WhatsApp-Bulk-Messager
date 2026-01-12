import { useEffect, useState } from 'react';
import { Users, Send, TrendingUp, MessageCircle, Activity } from 'lucide-react';
import { analyticsAPI } from '../services/api';
import { toast } from 'react-toastify';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
        // Refresh stats every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const response = await analyticsAPI.getSummary();
            setStats(response.data.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
            toast.error('Failed to load dashboard statistics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        );
    }

    const statCards = [
        {
            name: 'Total Contacts',
            value: stats?.totalContacts || 0,
            icon: Users,
            color: 'text-wa-teal',
            bgColor: 'bg-wa-gray-50',
        },
        {
            name: 'Total Campaigns',
            value: stats?.totalCampaigns || 0,
            icon: Send,
            color: 'text-wa-teal',
            bgColor: 'bg-wa-gray-50',
        },
        {
            name: 'Active Campaigns',
            value: stats?.activeCampaigns || 0,
            icon: Activity,
            color: 'text-wa-teal',
            bgColor: 'bg-wa-gray-50',
        },
        {
            name: 'Total Messages',
            value: stats?.totalMessages || 0,
            icon: MessageCircle,
            color: 'text-wa-teal',
            bgColor: 'bg-wa-gray-50',
        },
    ];

    const messageStats = [
        { label: 'Queued', value: stats?.messageStats?.queued || 0, color: 'bg-wa-gray-300' },
        { label: 'Sending', value: stats?.messageStats?.sending || 0, color: 'bg-blue-400' },
        { label: 'Sent', value: stats?.messageStats?.sent || 0, color: 'bg-yellow-400' },
        { label: 'Delivered', value: stats?.messageStats?.delivered || 0, color: 'bg-wa-light' },
        { label: 'Read', value: stats?.messageStats?.read || 0, color: 'bg-blue-500' },
        { label: 'Failed', value: stats?.messageStats?.failed || 0, color: 'bg-red-500' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-wa-gray-600">Dashboard</h1>
                <p className="text-wa-gray-400 text-sm mt-1">
                    Overview of your WhatsApp bulk messaging campaigns
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => (
                    <div
                        key={stat.name}
                        className="card hover:shadow-md transition-shadow duration-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-wa-gray-400 font-medium">{stat.name}</p>
                                <p className="text-2xl font-bold mt-1 text-wa-gray-600">
                                    {stat.value.toLocaleString()}
                                </p>
                            </div>
                            <div className={`p-3 rounded-full ${stat.bgColor}`}>
                                <stat.icon className={stat.color} size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Message Status Breakdown */}
            <div className="card">
                <h2 className="text-lg font-bold text-wa-gray-600 mb-6">
                    Message Status Breakdown
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {messageStats.map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className="flex items-center justify-center mb-2">
                                <div className={`w-3 h-3 rounded-full ${stat.color} mr-2`}></div>
                                <p className="text-sm font-medium text-wa-gray-500">{stat.label}</p>
                            </div>
                            <p className="text-xl font-bold text-wa-gray-600">
                                {stat.value.toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Queue Status */}
            {stats?.queueStats && (
                <div className="card">
                    <h2 className="text-lg font-bold text-wa-gray-600 mb-6">
                        Queue Status
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center">
                            <p className="text-sm text-wa-gray-500 mb-1">Waiting</p>
                            <p className="text-xl font-bold text-wa-gray-600">
                                {stats.queueStats.waiting || 0}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-wa-gray-500 mb-1">Active</p>
                            <p className="text-xl font-bold text-blue-500">
                                {stats.queueStats.active || 0}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-wa-gray-500 mb-1">Completed</p>
                            <p className="text-xl font-bold text-wa-teal">
                                {stats.queueStats.completed || 0}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-wa-gray-500 mb-1">Failed</p>
                            <p className="text-xl font-bold text-red-500">
                                {stats.queueStats.failed || 0}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-wa-gray-500 mb-1">Delayed</p>
                            <p className="text-xl font-bold text-yellow-500">
                                {stats.queueStats.delayed || 0}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="card">
                <h2 className="text-lg font-bold text-wa-gray-600 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a
                        href="/contacts"
                        className="flex items-center gap-3 p-4 rounded-lg border border-wa-gray-200 hover:border-wa-teal hover:bg-wa-gray-50 transition-all duration-200"
                    >
                        <Users className="text-wa-teal" size={24} />
                        <div>
                            <p className="font-medium text-wa-gray-600">Manage Contacts</p>
                            <p className="text-xs text-wa-gray-400">Upload and organize contacts</p>
                        </div>
                    </a>
                    <a
                        href="/campaigns"
                        className="flex items-center gap-3 p-4 rounded-lg border border-wa-gray-200 hover:border-wa-teal hover:bg-wa-gray-50 transition-all duration-200"
                    >
                        <Send className="text-wa-teal" size={24} />
                        <div>
                            <p className="font-medium text-wa-gray-600">Create Campaign</p>
                            <p className="text-xs text-wa-gray-400">Send bulk messages</p>
                        </div>
                    </a>
                    <a
                        href="/analytics"
                        className="flex items-center gap-3 p-4 rounded-lg border border-wa-gray-200 hover:border-wa-teal hover:bg-wa-gray-50 transition-all duration-200"
                    >
                        <TrendingUp className="text-wa-teal" size={24} />
                        <div>
                            <p className="font-medium text-wa-gray-600">View Analytics</p>
                            <p className="text-xs text-wa-gray-400">Detailed message reports</p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
