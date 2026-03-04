import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, AlertCircle, User, Calendar, Activity, Stethoscope, CheckCircle, XCircle, Loader } from 'lucide-react'
import Button from '../Button'
import Card from '../Card'
import { aiAPI } from '../utils/api'

const AISymptomChecker = ({ user }) => {
  const [symptoms, setSymptoms] = useState('')
  const [age, setAge] = useState(user?.age || '')
  const [gender, setGender] = useState(user?.gender || '')
  const [existingConditions, setExistingConditions] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showRecommendation, setShowRecommendation] = useState(false)

  const handleAnalyze = async (e) => {
    e.preventDefault()
    
    if (!symptoms.trim()) {
      setError('Please describe your symptoms')
      return
    }

    setLoading(true)
    setError('')
    setAnalysis(null)

    try {
      const response = await aiAPI.analyzeSymptoms({
        symptoms,
        age: age || 'Not specified',
        gender: gender || 'Not specified',
        existingConditions: existingConditions ? existingConditions.split(',').map(c => c.trim()) : []
      })

      if (response.data.success) {
        setAnalysis(response.data.data)
        setShowRecommendation(false)
      } else {
        setError('Failed to analyze symptoms. Please try again.')
      }
    } catch (err) {
      console.error('Symptom Analysis Error:', err)
      setError('Unable to analyze symptoms. Please try again or consult a healthcare professional.')
    } finally {
      setLoading(false)
    }
  }

  const handleGetDoctorRecommendation = async () => {
    setLoading(true)
    try {
      const response = await aiAPI.recommendDoctor({
        symptoms,
        medicalHistory: existingConditions
      })

      if (response.data.success) {
        setAnalysis(prev => ({
          ...prev,
          doctorRecommendation: response.data.recommendation,
          specialistType: response.data.specialistType
        }))
        setShowRecommendation(true)
      }
    } catch (err) {
      console.error('Doctor Recommendation Error:', err)
      setError('Failed to get doctor recommendation')
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'severe':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'moderate':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'mild':
        return 'text-green-600 bg-green-50 border-green-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'emergency':
        return 'text-red-600 bg-red-50'
      case 'urgent':
        return 'text-orange-600 bg-orange-50'
      case 'routine':
        return 'text-blue-600 bg-blue-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-10 h-10 text-purple-600" />
            <h1 className="text-4xl font-heading font-bold text-gray-900">AI Symptom Checker</h1>
          </div>
          <p className="text-lg text-gray-600">Describe your symptoms and get AI-powered analysis</p>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Disclaimer:</strong> This is an AI-powered tool for informational purposes only. 
              It is NOT a substitute for professional medical advice, diagnosis, or treatment. 
              Always seek the advice of your physician or qualified health provider.
            </p>
          </div>
        </motion.div>

        <Card className="mb-8">
          <form onSubmit={handleAnalyze} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe Your Symptoms *
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="E.g., I have a headache, fever, and sore throat for 2 days..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Your age"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Existing Medical Conditions (Optional)
              </label>
              <input
                type="text"
                value={existingConditions}
                onChange={(e) => setExistingConditions(e.target.value)}
                placeholder="E.g., Diabetes, Hypertension (comma separated)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5 mr-2" />
                  Analyze Symptoms
                </>
              )}
            </Button>
          </form>
        </Card>

        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Activity className="w-6 h-6 text-purple-600" />
                Analysis Results
              </h2>

              {/* Severity & Urgency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className={`p-4 border rounded-lg ${getSeverityColor(analysis.severity)}`}>
                  <p className="text-sm font-medium">Severity Level</p>
                  <p className="text-2xl font-bold capitalize">{analysis.severity || 'Unknown'}</p>
                </div>
                <div className={`p-4 border rounded-lg ${getUrgencyColor(analysis.urgency)}`}>
                  <p className="text-sm font-medium">Urgency</p>
                  <p className="text-2xl font-bold capitalize">{analysis.urgency || 'Unknown'}</p>
                </div>
              </div>

              {/* Recommended Specialist */}
              {analysis.recommendedSpecialist && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Stethoscope className="w-5 h-5 text-blue-600" />
                    <p className="font-semibold text-blue-900">Recommended Specialist</p>
                  </div>
                  <p className="text-lg font-bold text-blue-700">{analysis.recommendedSpecialist}</p>
                </div>
              )}

              {/* Full Analysis */}
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {analysis.fullAnalysis}
                </div>
              </div>

              {/* Doctor Recommendation */}
              {!showRecommendation && (
                <div className="mt-6">
                  <Button
                    onClick={handleGetDoctorRecommendation}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin mr-2" />
                        Getting Recommendation...
                      </>
                    ) : (
                      <>
                        <Stethoscope className="w-5 h-5 mr-2" />
                        Get Doctor Recommendation
                      </>
                    )}
                  </Button>
                </div>
              )}

              {showRecommendation && analysis.doctorRecommendation && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg"
                >
                  <h3 className="text-xl font-bold text-green-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6" />
                    Doctor Recommendation
                  </h3>
                  <div className="whitespace-pre-wrap text-gray-700">
                    {analysis.doctorRecommendation}
                  </div>
                </motion.div>
              )}
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default AISymptomChecker
