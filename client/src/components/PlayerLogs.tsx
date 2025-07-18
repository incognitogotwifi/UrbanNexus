import { useState, useEffect } from 'react';
import { AdminRoleType } from '../types/game';
import { hasPermission } from '../lib/adminRoles';

interface PlayerLogsProps {
  onClose: () => void;
  userRole: AdminRoleType;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  playerId: string;
  playerName: string;
  action: string;
  details: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: 'connection' | 'gameplay' | 'chat' | 'admin' | 'system';
  ip?: string;
  location?: string;
}

export default function PlayerLogs({ onClose, userRole }: PlayerLogsProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, selectedCategory, selectedSeverity, searchTerm, dateRange]);

  const loadLogs = () => {
    // Mock log data
    const mockLogs: LogEntry[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        playerId: 'player1',
        playerName: 'jarredmilam5',
        action: 'Player Connected',
        details: 'Player connected to server',
        severity: 'info',
        category: 'connection',
        ip: '192.168.1.100',
        location: 'New York, US'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        playerId: 'player2',
        playerName: 'testuser',
        action: 'Chat Message',
        details: 'Sent message: "Hello everyone!"',
        severity: 'info',
        category: 'chat'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        playerId: 'player3',
        playerName: 'griefer123',
        action: 'Team Kill',
        details: 'Killed teammate player4',
        severity: 'warning',
        category: 'gameplay'
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 20 * 60 * 1000),
        playerId: 'player3',
        playerName: 'griefer123',
        action: 'Spam Detection',
        details: 'Sent 10 messages in 30 seconds',
        severity: 'warning',
        category: 'chat'
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 25 * 60 * 1000),
        playerId: 'player5',
        playerName: 'hacker_user',
        action: 'Speed Hack Detected',
        details: 'Player speed exceeded maximum threshold',
        severity: 'error',
        category: 'gameplay'
      },
      {
        id: '6',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        playerId: 'player1',
        playerName: 'jarredmilam5',
        action: 'Admin Command',
        details: 'Executed command: /heal player2',
        severity: 'info',
        category: 'admin'
      },
      {
        id: '7',
        timestamp: new Date(Date.now() - 35 * 60 * 1000),
        playerId: 'system',
        playerName: 'SYSTEM',
        action: 'Server Restart',
        details: 'Server restarted due to maintenance',
        severity: 'critical',
        category: 'system'
      },
      {
        id: '8',
        timestamp: new Date(Date.now() - 40 * 60 * 1000),
        playerId: 'player6',
        playerName: 'cheater_bot',
        action: 'Auto-Click Detection',
        details: 'Detected inhuman clicking pattern',
        severity: 'error',
        category: 'gameplay'
      },
      {
        id: '9',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        playerId: 'player7',
        playerName: 'toxic_player',
        action: 'Inappropriate Language',
        details: 'Used banned words in chat',
        severity: 'warning',
        category: 'chat'
      },
      {
        id: '10',
        timestamp: new Date(Date.now() - 50 * 60 * 1000),
        playerId: 'player2',
        playerName: 'testuser',
        action: 'Player Disconnected',
        details: 'Player disconnected from server',
        severity: 'info',
        category: 'connection'
      }
    ];

    setLogs(mockLogs);
  };

  const filterLogs = () => {
    let filtered = [...logs];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(log => log.category === selectedCategory);
    }

    // Filter by severity
    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(log => log.severity === selectedSeverity);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date range
    if (dateRange.start) {
      filtered = filtered.filter(log => log.timestamp >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      filtered = filtered.filter(log => log.timestamp <= new Date(dateRange.end));
    }

    setFilteredLogs(filtered);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info': return 'text-blue-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'connection': return '🔗';
      case 'gameplay': return '🎮';
      case 'chat': return '💬';
      case 'admin': return '⚡';
      case 'system': return '🖥️';
      default: return '📝';
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Player', 'Action', 'Details', 'Severity', 'Category', 'IP', 'Location'],
      ...filteredLogs.map(log => [
        log.timestamp.toISOString(),
        log.playerName,
        log.action,
        log.details,
        log.severity,
        log.category,
        log.ip || '',
        log.location || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `player_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!hasPermission(userRole, 'view_logs')) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-900 text-white p-6 rounded-lg max-w-md w-full mx-4">
          <h2 className="text-xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-300 mb-4">You don't have permission to view player logs.</p>
          <button onClick={onClose} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white p-6 rounded-lg max-w-7xl max-h-[90vh] overflow-hidden w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Player Logs</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">✕</button>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="all">All Categories</option>
                <option value="connection">Connection</option>
                <option value="gameplay">Gameplay</option>
                <option value="chat">Chat</option>
                <option value="admin">Admin</option>
                <option value="system">System</option>
              </select>
            </div>

            {/* Severity Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Severity</label>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="all">All Severities</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search logs..."
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>

            {/* Export */}
            <div>
              <label className="block text-sm font-medium mb-2">Actions</label>
              <button
                onClick={exportLogs}
                className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
              >
                Export CSV
              </button>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input
                type="datetime-local"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="datetime-local"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-800 rounded p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{filteredLogs.length}</div>
            <div className="text-sm text-gray-400">Total Logs</div>
          </div>
          <div className="bg-gray-800 rounded p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {filteredLogs.filter(log => log.severity === 'warning').length}
            </div>
            <div className="text-sm text-gray-400">Warnings</div>
          </div>
          <div className="bg-gray-800 rounded p-4 text-center">
            <div className="text-2xl font-bold text-red-400">
              {filteredLogs.filter(log => log.severity === 'error').length}
            </div>
            <div className="text-sm text-gray-400">Errors</div>
          </div>
          <div className="bg-gray-800 rounded p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {filteredLogs.filter(log => log.severity === 'critical').length}
            </div>
            <div className="text-sm text-gray-400">Critical</div>
          </div>
          <div className="bg-gray-800 rounded p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {new Set(filteredLogs.map(log => log.playerId)).size}
            </div>
            <div className="text-sm text-gray-400">Unique Players</div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-700 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-600">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-700">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                      {log.timestamp.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                      <div className="flex items-center">
                        <span className="font-medium">{log.playerName}</span>
                        {log.ip && (
                          <span className="ml-2 text-xs text-gray-400">({log.ip})</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                      {log.action}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-300 max-w-xs truncate">
                      {log.details}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <span className={`font-medium ${getSeverityColor(log.severity)}`}>
                        {log.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                      <span className="flex items-center">
                        {getCategoryIcon(log.category)} {log.category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No logs found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}