import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/UI/Dialog';
import { Button } from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Label from '@/components/UI/Label';
import { Textarea } from '@/components/UI/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/UI/Select';
import Checkbox from '@/components/UI/Checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/UI/Tabs';
import { Card, CardContent, CardHeader } from '@/components/UI/Card';
import { Badge } from '@/components/UI/Badge';
import { 
  FileText, 
  Download
} from 'lucide-react';
import { useReportTemplates } from '@/hooks/useReportTemplates';

interface CreateReportModalProps {
  open: boolean;
  onClose: () => void;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  report_type: string;
  format: string;
}

const CreateReportModal: React.FC<CreateReportModalProps> = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState('generate');
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportType, setReportType] = useState('');
  const [reportFormat, setReportFormat] = useState('pdf');
  const [isPublic, setIsPublic] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState('weekly');
  const [scheduleStartDate, setScheduleStartDate] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { getTemplates, createTemplate } = useReportTemplates();

  const loadTemplates = useCallback(async () => {
    try {
      const data = await getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  }, [getTemplates]);

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open, loadTemplates]);

  const handleCreateReport = async () => {
    if (!selectedTemplate && !reportName) {
      alert('Please select a template or provide a report name');
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 'template') {
        // Create new template
        await createTemplate({
          name: reportName,
          description: reportDescription,
          report_type: reportType,
          format: reportFormat,
          is_public: isPublic,
        });
      } else {
        // Generate report from template
        const response = await fetch(`/api/reports/templates/${selectedTemplate}/generate_report/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: reportName || 'Generated Report',
            description: reportDescription,
            parameters: {},
            scheduled: isScheduled,
            frequency: scheduleFrequency,
            start_date: scheduleStartDate,
            recipients: recipients,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to generate report');
        }
        
        const generatedReport = await response.json();
        console.log('Report generated:', generatedReport);
      }
      
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setActiveTab('generate');
    setSelectedTemplate('');
    setReportName('');
    setReportDescription('');
    setReportType('');
    setReportFormat('pdf');
    setIsPublic(false);
    setIsScheduled(false);
    setScheduleFrequency('weekly');
    setScheduleStartDate('');
    setRecipients([]);
  };

  const reportTypes = [
    { value: 'academic', label: 'Academic Report' },
    { value: 'attendance', label: 'Attendance Report' },
    { value: 'financial', label: 'Financial Report' },
    { value: 'performance', label: 'Performance Report' },
    { value: 'analytics', label: 'Analytics Report' },
    { value: 'custom', label: 'Custom Report' },
  ];

  const formats = [
    { value: 'pdf', label: 'PDF' },
    { value: 'excel', label: 'Excel' },
    { value: 'csv', label: 'CSV' },
    { value: 'json', label: 'JSON' },
    { value: 'html', label: 'HTML' },
  ];

  const frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  const getReportTypeColor = (type: string) => {
    const colors = {
      academic: 'bg-blue-100 text-blue-800',
      attendance: 'bg-green-100 text-green-800',
      financial: 'bg-purple-100 text-purple-800',
      performance: 'bg-orange-100 text-orange-800',
      analytics: 'bg-indigo-100 text-indigo-800',
      custom: 'bg-gray-100 text-gray-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Create Report
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Generate Report</TabsTrigger>
            <TabsTrigger value="template">Create Template</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            {/* Template Selection */}
            <div className="space-y-4">
              <Label>Select Template</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`cursor-pointer transition-colors ${
                      selectedTemplate === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <Card>
                      <CardHeader title={template.name} right={
                        <Badge className={getReportTypeColor(template.report_type)}>
                          {template.report_type}
                        </Badge>
                      } />
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>Format: {template.format.toUpperCase()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Report Configuration */}
            {selectedTemplate && (
              <div className="space-y-4">
                <Label>Report Configuration</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="report-name">Report Name</Label>
                    <Input
                      id="report-name"
                      value={reportName}
                      onChange={(e) => setReportName(e.target.value)}
                      placeholder="Enter report name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="report-description">Description</Label>
                    <Input
                      id="report-description"
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      placeholder="Enter description"
                    />
                  </div>
                </div>

                {/* Scheduling Options */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="schedule"
                      checked={isScheduled}
                      onChange={(e) => setIsScheduled(e.target.checked)}
                    />
                    <Label htmlFor="schedule">Schedule this report</Label>
                  </div>

                  {isScheduled && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Frequency</Label>
                        <Select value={scheduleFrequency} onValueChange={setScheduleFrequency}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {frequencies.map((freq) => (
                              <SelectItem key={freq.value} value={freq.value}>
                                {freq.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={scheduleStartDate}
                          onChange={(e) => setScheduleStartDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Recipients</Label>
                        <Input
                          placeholder="Enter email addresses"
                          value={recipients.join(', ')}
                          onChange={(e) => setRecipients(e.target.value.split(',').map(s => s.trim()))}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="template" className="space-y-6">
            {/* Template Creation Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="Enter template name"
                />
              </div>
              <div>
                <Label htmlFor="template-type">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="template-description">Description</Label>
              <Textarea
                id="template-description"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Enter template description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Output Format</Label>
                <Select value={reportFormat} onValueChange={setReportFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formats.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                                    <Checkbox
                      id="public"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                    />
                <Label htmlFor="public">Make template public</Label>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateReport} 
            disabled={loading || (!selectedTemplate && !reportName)}
            className="flex items-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                {activeTab === 'generate' ? <Download className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                {activeTab === 'generate' ? 'Generate Report' : 'Create Template'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateReportModal;
