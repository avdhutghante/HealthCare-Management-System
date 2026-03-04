import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator, TrendingUp, Activity } from 'lucide-react'
import Button from '../Button'
import Card from '../Card'

const BMICalculator = ({ user }) => {
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [unit, setUnit] = useState('metric')
  const [result, setResult] = useState(null)

  const calculateBMI = (e) => {
    e.preventDefault()
    let bmi
    if (unit === 'metric') {
      const heightInMeters = parseFloat(height) / 100
      bmi = parseFloat(weight) / (heightInMeters * heightInMeters)
    } else {
      bmi = (parseFloat(weight) / (parseFloat(height) * parseFloat(height))) * 703
    }

    let category = ''
    let color = ''
    let recommendation = ''

    if (bmi < 18.5) {
      category = 'Underweight'
      color = 'text-blue-600'
      recommendation = 'Consider increasing caloric intake with nutrient-rich foods. Consult a nutritionist for a personalized meal plan.'
    } else if (bmi >= 18.5 && bmi < 25) {
      category = 'Normal weight'
      color = 'text-success'
      recommendation = 'Great! Maintain your current lifestyle with regular exercise and balanced nutrition.'
    } else if (bmi >= 25 && bmi < 30) {
      category = 'Overweight'
      color = 'text-warning'
      recommendation = 'Consider incorporating more physical activity and monitoring portion sizes. Consult with a healthcare provider.'
    } else {
      category = 'Obese'
      color = 'text-danger'
      recommendation = 'We recommend consulting with a healthcare provider for a comprehensive health assessment and personalized weight management plan.'
    }

    const bmiResult = {
      bmi: bmi.toFixed(1),
      category,
      color,
      recommendation,
      calculatedAt: new Date().toISOString()
    }
    setResult(bmiResult)
    localStorage.setItem('latestBMI', JSON.stringify(bmiResult))
  }

  const bmiRanges = [
    { range: 'Below 18.5', category: 'Underweight', color: 'bg-blue-500' },
    { range: '18.5 - 24.9', category: 'Normal weight', color: 'bg-success' },
    { range: '25.0 - 29.9', category: 'Overweight', color: 'bg-warning' },
    { range: '30.0 and above', category: 'Obese', color: 'bg-danger' }
  ]

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">BMI Calculator</h1>
          <p className="text-lg text-gray-600">Calculate your Body Mass Index and get health insights</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-8">
            <div className="flex items-center space-x-3 mb-6">
              <Calculator className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold text-gray-900">Calculate BMI</h2>
            </div>

            <form onSubmit={calculateBMI} className="space-y-6">
              <div>
                <label className="label">Unit System</label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setUnit('metric')}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all duration-200 ${
                      unit === 'metric'
                        ? 'border-primary bg-secondary text-gray-900'
                        : 'border-gray-200 text-gray-700 hover:border-primary'
                    }`}
                  >
                    Metric (kg, cm)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnit('imperial')}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all duration-200 ${
                      unit === 'imperial'
                        ? 'border-primary bg-secondary text-gray-900'
                        : 'border-gray-200 text-gray-700 hover:border-primary'
                    }`}
                  >
                    Imperial (lbs, in)
                  </button>
                </div>
              </div>

              <div>
                <label className="label">
                  Height {unit === 'metric' ? '(cm)' : '(inches)'}
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="input-field"
                  placeholder={unit === 'metric' ? '170' : '67'}
                  step="0.1"
                  required
                />
              </div>

              <div>
                <label className="label">
                  Weight {unit === 'metric' ? '(kg)' : '(lbs)'}
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="input-field"
                  placeholder={unit === 'metric' ? '70' : '154'}
                  step="0.1"
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Calculate BMI
              </Button>
            </form>

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-sky-100 rounded-xl"
              >
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 mb-2">Your BMI</p>
                  <p className={`text-5xl font-bold ${result.color} mb-2`}>{result.bmi}</p>
                  <p className={`text-xl font-semibold ${result.color}`}>{result.category}</p>
                </div>
                <div className="pt-4 border-t border-gray-300">
                  <p className="text-sm text-gray-700 leading-relaxed">{result.recommendation}</p>
                </div>
              </motion.div>
            )}
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Activity className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-bold text-gray-900">BMI Categories</h3>
              </div>
              <div className="space-y-4">
                {bmiRanges.map((range, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center space-x-4"
                  >
                    <div className={`w-4 h-4 rounded-full ${range.color}`} />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{range.category}</p>
                      <p className="text-sm text-gray-600">{range.range}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-bold text-gray-900">Health Tips</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Maintain a balanced diet with fruits, vegetables, and whole grains</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Exercise regularly - aim for at least 150 minutes per week</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Stay hydrated by drinking 8 glasses of water daily</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Get 7-9 hours of quality sleep each night</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Regular health check-ups are essential for early detection</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BMICalculator