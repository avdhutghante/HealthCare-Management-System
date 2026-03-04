import React, { useState } from 'react';
import { heartDiseaseAPI } from '../utils/api';
import Card from '../Card';
import Button from '../Button';

const HeartDisease = ({ user }) => {
  const [formData, setFormData] = useState({
    age: '', sex: '', cp: '', trestbps: '', chol: '', fbs: '', restecg: '', thalach: '',
    exang: '', oldpeak: '', slope: '', ca: '', thal: ''
  });
  const [prediction, setPrediction] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPrediction('');

    // Basic validation
    if (!Object.values(formData).every(val => val !== '' && !isNaN(val))) {
      setError('Please fill all fields with valid numbers.');
      setLoading(false);
      return;
    }

    try {
      const response = await heartDiseaseAPI.predict(formData);
      const prediction = response.data?.data?.prediction || response.data?.prediction || '';
      if (prediction) {
        setPrediction(prediction);
      } else {
        setError('No prediction received. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      age: '', sex: '', cp: '', trestbps: '', chol: '', fbs: '', restecg: '', thalach: '',
      exang: '', oldpeak: '', slope: '', ca: '', thal: ''
    });
    setPrediction('');
    setError('');
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-blue-50 to-sky-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-900 dark:text-white">
          ❤️ Heart Disease Prediction
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
          AI-powered heart disease risk assessment based on medical parameters
        </p>
        
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Information Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Note:</strong> This tool provides health insights based on medical parameters. Always consult with a healthcare professional for accurate diagnosis.
              </p>
            </div>

            {/* Row 1: Age & Sex */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age</label>
                <input type="number" name="age" value={formData.age} onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 63" min="0" max="150" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sex (1=Male, 0=Female)</label>
                <input type="number" name="sex" value={formData.sex} onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1 or 0" min="0" max="1" required />
              </div>
            </div>

            {/* Row 2: CP & Trestbps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chest Pain Type (0-3)</label>
                <select name="cp" value={formData.cp} onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select chest pain type</option>
                  <option value="0">0 - Typical Angina</option>
                  <option value="1">1 - Atypical Angina</option>
                  <option value="2">2 - Non-anginal Pain</option>
                  <option value="3">3 - Asymptomatic</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resting BP (mm Hg)</label>
                <input type="number" name="trestbps" value={formData.trestbps} onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 145" min="0" required />
              </div>
            </div>

            {/* Row 3: Chol & Fbs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cholesterol (mg/dl)</label>
                <input type="number" name="chol" value={formData.chol} onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 233" min="0" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fasting Blood Sugar 120 (1=True, 0=False)</label>
                <input type="number" name="fbs" value={formData.fbs} onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1 or 0" min="0" max="1" required />
              </div>
            </div>

            {/* Row 4: Restecg & Thalach */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resting ECG (0-2)</label>
                <select name="restecg" value={formData.restecg} onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select resting ECG</option>
                  <option value="0">0 - Normal</option>
                  <option value="1">1 - ST-T Abnormality</option>
                  <option value="2">2 - LV Hypertrophy</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Heart Rate</label>
                <input type="number" name="thalach" value={formData.thalach} onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 150" min="0" max="250" required />
              </div>
            </div>

            {/* Row 5: Exang & Oldpeak */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exercise Angina (1=Yes, 0=No)</label>
                <input type="number" name="exang" value={formData.exang} onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1 or 0" min="0" max="1" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ST Depression</label>
                <input type="number" name="oldpeak" value={formData.oldpeak} onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 2.3" min="0" step="0.1" required />
              </div>
            </div>

            {/* Row 6: Slope & Ca */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ST Slope (0-2)</label>
                <select name="slope" value={formData.slope} onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select ST slope</option>
                  <option value="0">0 - Upsloping</option>
                  <option value="1">1 - Flat</option>
                  <option value="2">2 - Downsloping</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Major Vessels (0-3)</label>
                <input type="number" name="ca" value={formData.ca} onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0-3" min="0" max="3" required />
              </div>
            </div>

            {/* Row 7: Thal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Thalassemia (1=Normal, 2=Fixed Defect, 3=Reversible Defect)
              </label>
              <select name="thal" value={formData.thal} onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Select thalassemia type</option>
                <option value="1">1 - Normal</option>
                <option value="2">2 - Fixed Defect</option>
                <option value="3">3 - Reversible Defect</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-6">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Analyzing...' : '🧠 Predict Heart Disease'}
              </Button>
              <Button type="button" onClick={resetForm} className="flex-1 bg-gray-400 hover:bg-gray-500">
                Clear Form
              </Button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {/* Prediction Result */}
          {prediction && (
            <div className={`mt-6 p-6 rounded-lg border-2 ${
              prediction.includes('HAS') 
                ? 'bg-red-100 border-red-400 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300' 
                : 'bg-green-100 border-green-400 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
            }`}>
              <h3 className="font-bold text-2xl mb-3">🔍 Result:</h3>
              <p className="text-lg font-semibold">{prediction}</p>
            </div>
          )}
        </Card>

        {/* Information Section */}
        <Card className="p-6 mt-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Parameter Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white mb-2">Common Parameters:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Age:</strong> Patient age in years</li>
                <li><strong>Sex:</strong> 1 for male, 0 for female</li>
                <li><strong>Chest Pain:</strong> Type of chest pain experienced</li>
                <li><strong>Resting BP:</strong> Blood pressure at rest</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white mb-2">Clinical Parameters:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Cholesterol:</strong> Serum cholesterol level</li>
                <li><strong>Heart Rate:</strong> Maximum heart rate achieved</li>
                <li><strong>ECG:</strong> Electrocardiographic results</li>
                <li><strong>ST Depression:</strong> Exercise-induced ST depression</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HeartDisease;
