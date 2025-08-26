import React, { useEffect, useState } from 'react';
import { Card, CardHeader } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import {
  FingerPrintIcon,
  FaceSmileIcon,
  WifiIcon,
  CogIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserIcon,
  DevicePhoneMobileIcon,
  SignalIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface BiometricDevice {
  id: string;
  name: string;
  type: 'fingerprint' | 'face_recognition' | 'rfid';
  location: string;
  status: 'online' | 'offline' | 'maintenance' | 'error';
  lastSync: string;
  batteryLevel: number;
  signalStrength: number;
  enrolledUsers: number;
  totalCapacity: number;
  firmwareVersion: string;
  ipAddress: string;
  macAddress: string;
}

interface EnrollmentRecord {
  id: string;
  studentName: string;
  studentId: string;
  deviceType: 'fingerprint' | 'face_recognition' | 'rfid';
  deviceName: string;
  enrollmentDate: string;
  status: 'active' | 'pending' | 'expired' | 'disabled';
  lastUsed: string;
  templateQuality: number;
  biometricData: string;
}

interface SyncLog {
  id: string;
  deviceName: string;
  syncType: 'attendance' | 'enrollment' | 'configuration' | 'firmware';
  status: 'success' | 'failed' | 'pending';
  timestamp: string;
  recordsCount: number;
  errorMessage?: string;
}

interface AttendanceEvent {
  id: string;
  studentName: string;
  studentId: string;
  deviceType: 'fingerprint' | 'face_recognition' | 'rfid';
  deviceName: string;
  eventType: 'check_in' | 'check_out' | 'verification_failed';
  timestamp: string;
  confidence: number;
  location: string;
  status: 'success' | 'failed' | 'pending';
}

const BiometricIntegration: React.FC = () => {
  const [devices, setDevices] = useState<BiometricDevice[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [attendanceEvents, setAttendanceEvents] = useState<AttendanceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'devices' | 'enrollments' | 'sync' | 'events'>('devices');
  const [selectedDevice, setSelectedDevice] = useState<BiometricDevice | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    const mockDevices: BiometricDevice[] = [
      {
        id: '1',
        name: 'Fingerprint Scanner - Main Gate',
        type: 'fingerprint',
        location: 'Main Entrance',
        status: 'online',
        lastSync: '2024-01-15T10:30:00Z',
        batteryLevel: 85,
        signalStrength: 95,
        enrolledUsers: 245,
        totalCapacity: 500,
        firmwareVersion: 'v2.1.4',
        ipAddress: '192.168.1.101',
        macAddress: '00:1B:44:11:3A:B7'
      },
      {
        id: '2',
        name: 'Face Recognition Camera - Library',
        type: 'face_recognition',
        location: 'Library Entrance',
        status: 'online',
        lastSync: '2024-01-15T10:28:00Z',
        batteryLevel: 92,
        signalStrength: 88,
        enrolledUsers: 189,
        totalCapacity: 300,
        firmwareVersion: 'v1.8.2',
        ipAddress: '192.168.1.102',
        macAddress: '00:1B:44:11:3A:B8'
      },
      {
        id: '3',
        name: 'RFID Reader - Science Lab',
        type: 'rfid',
        location: 'Science Laboratory',
        status: 'maintenance',
        lastSync: '2024-01-15T09:15:00Z',
        batteryLevel: 45,
        signalStrength: 72,
        enrolledUsers: 156,
        totalCapacity: 200,
        firmwareVersion: 'v1.5.1',
        ipAddress: '192.168.1.103',
        macAddress: '00:1B:44:11:3A:B9'
      },
      {
        id: '4',
        name: 'Fingerprint Scanner - Canteen',
        type: 'fingerprint',
        location: 'Canteen',
        status: 'offline',
        lastSync: '2024-01-15T08:45:00Z',
        batteryLevel: 12,
        signalStrength: 0,
        enrolledUsers: 98,
        totalCapacity: 150,
        firmwareVersion: 'v2.0.1',
        ipAddress: '192.168.1.104',
        macAddress: '00:1B:44:11:3A:BA'
      }
    ];

    const mockEnrollments: EnrollmentRecord[] = [
      {
        id: '1',
        studentName: 'Ahmed Khan',
        studentId: '10A001',
        deviceType: 'fingerprint',
        deviceName: 'Fingerprint Scanner - Main Gate',
        enrollmentDate: '2024-01-10T14:30:00Z',
        status: 'active',
        lastUsed: '2024-01-15T08:15:00Z',
        templateQuality: 95,
        biometricData: 'encrypted_fingerprint_template_001'
      },
      {
        id: '2',
        studentName: 'Fatima Rahman',
        studentId: '8B015',
        deviceType: 'face_recognition',
        deviceName: 'Face Recognition Camera - Library',
        enrollmentDate: '2024-01-12T10:20:00Z',
        status: 'active',
        lastUsed: '2024-01-15T09:30:00Z',
        templateQuality: 88,
        biometricData: 'encrypted_face_template_002'
      },
      {
        id: '3',
        studentName: 'Mohammed Ali',
        studentId: '9C023',
        deviceType: 'rfid',
        deviceName: 'RFID Reader - Science Lab',
        enrollmentDate: '2024-01-08T16:45:00Z',
        status: 'pending',
        lastUsed: '2024-01-14T15:20:00Z',
        templateQuality: 100,
        biometricData: 'rfid_card_003'
      }
    ];

    const mockSyncLogs: SyncLog[] = [
      {
        id: '1',
        deviceName: 'Fingerprint Scanner - Main Gate',
        syncType: 'attendance',
        status: 'success',
        timestamp: '2024-01-15T10:30:00Z',
        recordsCount: 45
      },
      {
        id: '2',
        deviceName: 'Face Recognition Camera - Library',
        syncType: 'enrollment',
        status: 'success',
        timestamp: '2024-01-15T10:28:00Z',
        recordsCount: 3
      },
      {
        id: '3',
        deviceName: 'RFID Reader - Science Lab',
        syncType: 'configuration',
        status: 'failed',
        timestamp: '2024-01-15T09:15:00Z',
        recordsCount: 0,
        errorMessage: 'Network timeout during configuration sync'
      }
    ];

    const mockAttendanceEvents: AttendanceEvent[] = [
      {
        id: '1',
        studentName: 'Ahmed Khan',
        studentId: '10A001',
        deviceType: 'fingerprint',
        deviceName: 'Fingerprint Scanner - Main Gate',
        eventType: 'check_in',
        timestamp: '2024-01-15T08:15:00Z',
        confidence: 95.2,
        location: 'Main Entrance',
        status: 'success'
      },
      {
        id: '2',
        studentName: 'Fatima Rahman',
        studentId: '8B015',
        deviceType: 'face_recognition',
        deviceName: 'Face Recognition Camera - Library',
        eventType: 'check_in',
        timestamp: '2024-01-15T09:30:00Z',
        confidence: 87.8,
        location: 'Library Entrance',
        status: 'success'
      },
      {
        id: '3',
        studentName: 'Unknown User',
        studentId: 'N/A',
        deviceType: 'fingerprint',
        deviceName: 'Fingerprint Scanner - Main Gate',
        eventType: 'verification_failed',
        timestamp: '2024-01-15T08:45:00Z',
        confidence: 23.1,
        location: 'Main Entrance',
        status: 'failed'
      }
    ];

    setTimeout(() => {
      setDevices(mockDevices);
      setEnrollments(mockEnrollments);
      setSyncLogs(mockSyncLogs);
      setAttendanceEvents(mockAttendanceEvents);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    const colors = {
      online: 'bg-green-100 text-green-800',
      offline: 'bg-red-100 text-red-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      error: 'bg-orange-100 text-orange-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getDeviceIcon = (type: string) => {
    const icons = {
      fingerprint: <FingerPrintIcon className="h-5 w-5" />,
      face_recognition: <FaceSmileIcon className="h-5 w-5" />,
      rfid: <WifiIcon className="h-5 w-5" />
    };
    return icons[type as keyof typeof icons];
  };

  const getBatteryColor = (level: number) => {
    if (level > 80) return 'text-green-600';
    if (level > 50) return 'text-yellow-600';
    if (level > 20) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSignalColor = (strength: number) => {
    if (strength > 80) return 'text-green-600';
    if (strength > 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleDeviceSelect = (device: BiometricDevice) => {
    setSelectedDevice(device);
  };

  const handleSyncDevice = (deviceId: string) => {
    // TODO: Implement device sync
    console.log('Syncing device:', deviceId);
  };

  const handleRestartDevice = (deviceId: string) => {
    // TODO: Implement device restart
    console.log('Restarting device:', deviceId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Biometric Integration</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage fingerprint, face recognition, and RFID attendance systems
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowPathIcon className="h-4 w-4" />
            Sync All Devices
          </Button>
          <Button className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            Add Device
          </Button>
        </div>
      </div>

      {/* Device Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FingerPrintIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Devices</p>
                <p className="text-2xl font-bold text-gray-900">{devices.length}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Online Devices</p>
                <p className="text-2xl font-bold text-gray-900">
                  {devices.filter(d => d.status === 'online').length}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UserIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Enrolled Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {devices.reduce((sum, device) => sum + device.enrolledUsers, 0)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ChartBarIcon className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Today's Events</p>
                <p className="text-2xl font-bold text-gray-900">
                  {attendanceEvents.filter(e => e.timestamp.includes('2024-01-15')).length}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'devices', label: 'Devices', icon: CogIcon },
            { id: 'enrollments', label: 'Enrollments', icon: UserIcon },
            { id: 'sync', label: 'Sync Logs', icon: ArrowPathIcon },
            { id: 'events', label: 'Attendance Events', icon: ClockIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'devices' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {devices.map((device) => (
              <Card key={device.id}>
                <CardHeader 
                  title={device.name}
                  right={
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(device.status)}`}>
                        {device.status}
                      </span>
                      {getDeviceIcon(device.type)}
                    </div>
                  }
                />
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium text-gray-900">{device.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Sync</p>
                      <p className="font-medium text-gray-900">
                        {new Date(device.lastSync).toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Battery</p>
                      <p className={`font-medium ${getBatteryColor(device.batteryLevel)}`}>
                        {device.batteryLevel}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Signal</p>
                      <p className={`font-medium ${getSignalColor(device.signalStrength)}`}>
                        {device.signalStrength}%
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Enrolled Users</span>
                      <span className="font-medium">{device.enrolledUsers}/{device.totalCapacity}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(device.enrolledUsers / device.totalCapacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-600">Firmware</p>
                      <p className="font-medium">{device.firmwareVersion}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">IP Address</p>
                      <p className="font-medium">{device.ipAddress}</p>
                    </div>
                  </div>

                                     <div className="flex gap-2">
                     <Button 
                       variant="outline" 
                       onClick={() => handleSyncDevice(device.id)}
                       className="flex items-center gap-2 text-sm px-3 py-1"
                     >
                       <ArrowPathIcon className="h-4 w-4" />
                       Sync
                     </Button>
                     <Button 
                       variant="outline" 
                       onClick={() => handleRestartDevice(device.id)}
                       className="flex items-center gap-2 text-sm px-3 py-1"
                     >
                       <WrenchScrewdriverIcon className="h-4 w-4" />
                       Restart
                     </Button>
                     <Button 
                       variant="outline" 
                       className="flex items-center gap-2 text-sm px-3 py-1"
                     >
                       <EyeIcon className="h-4 w-4" />
                       Details
                     </Button>
                   </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'enrollments' && (
        <Card>
          <CardHeader title="Biometric Enrollments" />
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrollment Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quality</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{enrollment.studentName}</p>
                          <p className="text-sm text-gray-500">{enrollment.studentId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(enrollment.deviceType)}
                          <span className="text-sm text-gray-900 capitalize">
                            {enrollment.deviceType.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {enrollment.deviceName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(enrollment.status)}`}>
                          {enrollment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {enrollment.templateQuality}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-900">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'sync' && (
        <Card>
          <CardHeader title="Sync Logs" />
          <div className="p-4">
            <div className="space-y-4">
              {syncLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      log.status === 'success' ? 'bg-green-100' : 
                      log.status === 'failed' ? 'bg-red-100' : 'bg-yellow-100'
                    }`}>
                      {log.status === 'success' ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      ) : log.status === 'failed' ? (
                        <XCircleIcon className="h-5 w-5 text-red-600" />
                      ) : (
                        <ClockIcon className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{log.deviceName}</p>
                      <p className="text-sm text-gray-600">
                        {log.syncType} sync • {log.recordsCount} records
                      </p>
                      {log.errorMessage && (
                        <p className="text-sm text-red-600">{log.errorMessage}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'events' && (
        <Card>
          <CardHeader title="Recent Attendance Events" />
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confidence</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendanceEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{event.studentName}</p>
                          <p className="text-sm text-gray-500">{event.studentId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(event.deviceType)}
                          <span className="text-sm text-gray-900 capitalize">
                            {event.eventType.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.deviceName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(event.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.confidence}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BiometricIntegration;
