import React, { useState, useEffect } from 'react';
import { Card } from '../../components/UI/Card';
import { PageHeader } from '../../components/UI/Page';
import { FilterBar } from '../../components/UI/FilterBar';
import { Pagination } from '../../components/UI/Pagination';
import { Button } from '../../components/UI/Button';
import { Skeleton } from '../../components/UI/Skeleton';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  DocumentTextIcon,
  DocumentIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';

interface GuardianDocument {
  id: string;
  guardian: {
    id: string;
    name: string;
    guardian_id: string;
  };
  document_type: string;
  title: string;
  file_name: string;
  file_size: number;
  file_type: string;
  description: string;
  expiry_date: string | null;
  is_verified: boolean;
  verified_by: string | null;
  verified_date: string | null;
  created_at: string;
  updated_at: string;
}

const GuardianDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<GuardianDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<GuardianDocument | null>(null);

  const [formData, setFormData] = useState({
    guardian_id: '',
    document_type: 'id_proof',
    title: '',
    description: '',
    expiry_date: '',
    file: null as File | null
  });

  // Mock data
  useEffect(() => {
    const mockDocuments: GuardianDocument[] = [
      {
        id: '1',
        guardian: {
          id: '1',
          name: 'আব্দুল রহমান',
          guardian_id: 'G001'
        },
        document_type: 'id_proof',
        title: 'National ID Card',
        file_name: 'national_id_card.pdf',
        file_size: 2048576,
        file_type: 'pdf',
        description: 'National ID card for verification',
        expiry_date: '2030-12-31',
        is_verified: true,
        verified_by: 'Admin User',
        verified_date: '2024-01-15T10:00:00Z',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        guardian: {
          id: '1',
          name: 'আব্দুল রহমান',
          guardian_id: 'G001'
        },
        document_type: 'address_proof',
        title: 'Utility Bill',
        file_name: 'utility_bill.pdf',
        file_size: 1048576,
        file_type: 'pdf',
        description: 'Electricity bill for address verification',
        expiry_date: null,
        is_verified: false,
        verified_by: null,
        verified_date: null,
        created_at: '2024-01-16T14:30:00Z',
        updated_at: '2024-01-16T14:30:00Z'
      },
      {
        id: '3',
        guardian: {
          id: '2',
          name: 'ফাতেমা বেগম',
          guardian_id: 'G002'
        },
        document_type: 'income_certificate',
        title: 'Income Certificate',
        file_name: 'income_certificate.pdf',
        file_size: 1536000,
        file_type: 'pdf',
        description: 'Income certificate from employer',
        expiry_date: '2025-06-30',
        is_verified: true,
        verified_by: 'Admin User',
        verified_date: '2024-01-20T09:15:00Z',
        created_at: '2024-01-20T09:15:00Z',
        updated_at: '2024-01-20T09:15:00Z'
      }
    ];

    setTimeout(() => {
      setDocuments(mockDocuments);
      setLoading(false);
      setTotalPages(1);
    }, 1000);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Document data:', formData);
    setIsModalOpen(false);
    setEditingDocument(null);
    resetForm();
  };

  const handleEdit = (document: GuardianDocument) => {
    setEditingDocument(document);
    setFormData({
      guardian_id: document.guardian.id,
      document_type: document.document_type,
      title: document.title,
      description: document.description,
      expiry_date: document.expiry_date || '',
      file: null
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      console.log('Deleting document:', id);
    }
  };

  const handleVerify = async (id: string) => {
    console.log('Verifying document:', id);
  };

  const resetForm = () => {
    setFormData({
      guardian_id: '',
      document_type: 'id_proof',
      title: '',
      description: '',
      expiry_date: '',
      file: null
    });
  };

  const getDocumentTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'id_proof': 'ID Proof',
      'address_proof': 'Address Proof',
      'income_certificate': 'Income Certificate',
      'employment_certificate': 'Employment Certificate',
      'marriage_certificate': 'Marriage Certificate',
      'divorce_certificate': 'Divorce Certificate',
      'death_certificate': 'Death Certificate',
      'guardianship_certificate': 'Guardianship Certificate',
      'other': 'Other'
    };
    return types[type] || type;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocuments = documents.filter(document => {
    const matchesSearch = document.guardian.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         document.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         document.guardian.guardian_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || document.document_type === typeFilter;
    const matchesVerification = verificationFilter === 'all' || 
                               (verificationFilter === 'verified' && document.is_verified) ||
                               (verificationFilter === 'unverified' && !document.is_verified);
    return matchesSearch && matchesType && matchesVerification;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <PageHeader title="Guardian Documents" subtitle="Manage guardian documents and verification" />
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <PageHeader 
          title="Guardian Documents" 
          subtitle="Manage guardian documents and verification"
          actions={
            <Button onClick={() => setIsModalOpen(true)}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          }
        />
      </Card>

      <Card>
        <FilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          right={
            <div className="flex gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="id_proof">ID Proof</option>
                <option value="address_proof">Address Proof</option>
                <option value="income_certificate">Income Certificate</option>
                <option value="employment_certificate">Employment Certificate</option>
                <option value="marriage_certificate">Marriage Certificate</option>
                <option value="guardianship_certificate">Guardianship Certificate</option>
                <option value="other">Other</option>
              </select>
              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
          }
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDocuments.map((document) => (
          <Card key={document.id} className="hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <DocumentIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {document.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {document.guardian.name} ({document.guardian.guardian_id})
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {document.is_verified ? (
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full flex items-center">
                    <CheckCircleIcon className="w-3 h-3 mr-1" />
                    Verified
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full flex items-center">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    Pending
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <DocumentTextIcon className="w-4 h-4 mr-2" />
                {getDocumentTypeLabel(document.document_type)}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">File:</span> {document.file_name} ({formatFileSize(document.file_size)})
              </div>
              {document.description && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Description:</span> {document.description}
                </div>
              )}
              {document.expiry_date && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Expires:</span> {new Date(document.expiry_date).toLocaleDateString()}
                </div>
              )}
              {document.is_verified && document.verified_by && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Verified by:</span> {document.verified_by} on {new Date(document.verified_date!).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Uploaded: {new Date(document.created_at).toLocaleDateString()}
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                                          <ArrowDownTrayIcon className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEdit(document)}>
                  <PencilIcon className="w-4 h-4" />
                </Button>
                {!document.is_verified && (
                  <Button variant="outline" size="sm" onClick={() => handleVerify(document.id)}>
                    <CheckCircleIcon className="w-4 h-4" />
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => handleDelete(document.id)}>
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria.</p>
            <Button onClick={() => setIsModalOpen(true)}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Upload First Document
            </Button>
          </div>
        </Card>
      )}

      {totalPages > 1 && (
        <Card>
          <Pagination
            page={currentPage}
            pageSize={10}
            total={documents.length}
            onPageChange={setCurrentPage}
          />
        </Card>
      )}

      {/* Document Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingDocument ? 'Edit Document' : 'Upload New Document'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guardian *
                  </label>
                  <select
                    required
                    value={formData.guardian_id}
                    onChange={(e) => setFormData({...formData, guardian_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Guardian</option>
                    <option value="1">আব্দুল রহমান (G001)</option>
                    <option value="2">ফাতেমা বেগম (G002)</option>
                    <option value="3">মোহাম্মদ আলী (G003)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Type *
                  </label>
                  <select
                    required
                    value={formData.document_type}
                    onChange={(e) => setFormData({...formData, document_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="id_proof">ID Proof</option>
                    <option value="address_proof">Address Proof</option>
                    <option value="income_certificate">Income Certificate</option>
                    <option value="employment_certificate">Employment Certificate</option>
                    <option value="marriage_certificate">Marriage Certificate</option>
                    <option value="divorce_certificate">Divorce Certificate</option>
                    <option value="death_certificate">Death Certificate</option>
                    <option value="guardianship_certificate">Guardianship Certificate</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document File *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <ArrowUpTrayIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      {editingDocument ? 'Current file: ' + editingDocument.file_name : 'Click to upload or drag and drop'}
                    </p>
                    <input
                      type="file"
                      required={!editingDocument}
                      onChange={(e) => setFormData({...formData, file: e.target.files?.[0] || null})}
                      className="mt-2 w-full"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingDocument(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingDocument ? 'Update Document' : 'Upload Document'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuardianDocuments;

