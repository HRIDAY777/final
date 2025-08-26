import React, { useState, useEffect } from 'react';
import { useAIToolsStore } from '../../stores/aiToolsStore';
import { AIModel } from '../../stores/aiToolsStore';

const Models: React.FC = () => {
  const {
    models,
    modelsLoading,
    modelsError,
    fetchModels,
    createModel,
    updateModel,
    deleteModel,
    startTraining,
    clearErrors
  } = useAIToolsStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState<Partial<AIModel>>({
    name: '',
    description: '',
    model_type: 'quiz_generator' as const,
    version: '',
    is_active: true
  });

  const [trainingData, setTrainingData] = useState({
    epochs: 100,
    batch_size: 32,
    learning_rate: 0.001,
    training_data_size: 1000,
    validation_data_size: 200
  });

  useEffect(() => {
    fetchModels({ page: currentPage, search: searchTerm });
  }, [currentPage, searchTerm]);

  useEffect(() => {
    if (modelsError) {
      setTimeout(() => clearErrors(), 5000);
    }
  }, [modelsError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingModel) {
        await updateModel(editingModel.id, formData as Partial<AIModel>);
      } else {
        await createModel(formData as Partial<AIModel>);
      }
      setIsModalOpen(false);
      setEditingModel(null);
      resetForm();
    } catch (error) {
      console.error('Error saving model:', error);
    }
  };

  const handleTrainingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModel) return;

    try {
      await startTraining(selectedModel.id, trainingData);
      setIsTrainingModalOpen(false);
      setSelectedModel(null);
      resetTrainingForm();
    } catch (error) {
      console.error('Error starting training:', error);
    }
  };

  const handleEdit = (model: AIModel) => {
    setEditingModel(model);
    const formDataUpdate: Partial<AIModel> = {
      name: model.name,
      description: model.description,
      model_type: model.model_type,
      version: model.version,
      is_active: model.is_active
    };
    setFormData(formDataUpdate);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this model?')) {
      try {
        await deleteModel(id);
      } catch (error) {
        console.error('Error deleting model:', error);
      }
    }
  };

  const handleStartTraining = (model: AIModel) => {
    setSelectedModel(model);
    setIsTrainingModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      model_type: 'quiz_generator' as const,
      version: '',
      is_active: true
    });
  };

  const resetTrainingForm = () => {
    setTrainingData({
      epochs: 100,
      batch_size: 32,
      learning_rate: 0.001,
      training_data_size: 1000,
      validation_data_size: 200
    });
  };

  const openModal = () => {
    setIsModalOpen(true);
    setEditingModel(null);
    resetForm();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingModel(null);
    resetForm();
  };

  const closeTrainingModal = () => {
    setIsTrainingModalOpen(false);
    setSelectedModel(null);
    resetTrainingForm();
  };

  const getModelTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      quiz_generator: 'Quiz Generator',
      lesson_summarizer: 'Lesson Summarizer',
      performance_predictor: 'Performance Predictor',
      attendance_anomaly: 'Attendance Anomaly Detector',
      nl_query: 'Natural Language Query'
    };
    return labels[type] || type;
  };

  const getModelTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      quiz_generator: 'bg-blue-100 text-blue-800',
      lesson_summarizer: 'bg-green-100 text-green-800',
      performance_predictor: 'bg-yellow-100 text-yellow-800',
      attendance_anomaly: 'bg-red-100 text-red-800',
      nl_query: 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (modelsLoading && !models) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">AI Models</h1>
        <button
          onClick={openModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Model
        </button>
      </div>

      {modelsError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {modelsError}
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search models by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models?.results.map((model) => (
          <div key={model.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{model.name}</h3>
                <p className="text-gray-600 text-sm">{model.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(model)}
                  className="text-blue-600 hover:text-blue-900 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(model.id)}
                  className="text-red-600 hover:text-red-900 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Type</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getModelTypeColor(model.model_type)}`}>
                  {getModelTypeLabel(model.model_type)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Version</span>
                <span className="text-sm font-medium text-gray-900">{model.version}</span>
              </div>

              {model.accuracy_score && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Accuracy</span>
                  <span className="text-sm font-medium text-gray-900">{(model.accuracy_score * 100).toFixed(1)}%</span>
                </div>
              )}

              {model.training_data_size && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Training Data</span>
                  <span className="text-sm font-medium text-gray-900">{model.training_data_size.toLocaleString()}</span>
                </div>
              )}

              {model.last_trained && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Last Trained</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(model.last_trained).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mb-4">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                model.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {model.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleStartTraining(model)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium"
              >
                Train Model
              </button>
              <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm font-medium">
                Deploy
              </button>
            </div>
          </div>
        ))}
      </div>

      {modelsLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {models && models.results.length === 0 && !modelsLoading && (
        <div className="text-center py-8 text-gray-500">
          No models found.
        </div>
      )}

      {/* Pagination */}
      {models && models.count > 10 && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, models.count)} of {models.count} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!models.previous}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!models.next}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Model Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingModel ? 'Edit Model' : 'Add New Model'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Model Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Model Type</label>
                  <select
                    value={formData.model_type}
                    onChange={(e) => setFormData({ ...formData, model_type: e.target.value as 'quiz_generator' | 'lesson_summarizer' | 'performance_predictor' | 'attendance_anomaly' | 'nl_query' })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="quiz_generator">Quiz Generator</option>
                    <option value="lesson_summarizer">Lesson Summarizer</option>
                    <option value="performance_predictor">Performance Predictor</option>
                    <option value="attendance_anomaly">Attendance Anomaly Detector</option>
                    <option value="nl_query">Natural Language Query</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Version</label>
                  <input
                    type="text"
                    required
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="1.0.0"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Active Model
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {editingModel ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Training Modal */}
      {isTrainingModalOpen && selectedModel && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Train Model: {selectedModel.name}
              </h3>
              <form onSubmit={handleTrainingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Epochs</label>
                  <input
                    type="number"
                    required
                    value={trainingData.epochs}
                    onChange={(e) => setTrainingData({ ...trainingData, epochs: parseInt(e.target.value) })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Batch Size</label>
                  <input
                    type="number"
                    required
                    value={trainingData.batch_size}
                    onChange={(e) => setTrainingData({ ...trainingData, batch_size: parseInt(e.target.value) })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Learning Rate</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={trainingData.learning_rate}
                    onChange={(e) => setTrainingData({ ...trainingData, learning_rate: parseFloat(e.target.value) })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Training Data Size</label>
                    <input
                      type="number"
                      required
                      value={trainingData.training_data_size}
                      onChange={(e) => setTrainingData({ ...trainingData, training_data_size: parseInt(e.target.value) })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Validation Data Size</label>
                    <input
                      type="number"
                      required
                      value={trainingData.validation_data_size}
                      onChange={(e) => setTrainingData({ ...trainingData, validation_data_size: parseInt(e.target.value) })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeTrainingModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Start Training
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Models;
