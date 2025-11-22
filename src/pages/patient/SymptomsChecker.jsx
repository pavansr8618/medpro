import { useState } from 'react'
import axios from 'axios'
import { FiSearch, FiAlertCircle } from 'react-icons/fi'

const SymptomsChecker = () => {
  const [symptoms, setSymptoms] = useState([])
  const [currentSymptom, setCurrentSymptom] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleAddSymptom = () => {
    if (currentSymptom.trim() && !symptoms.includes(currentSymptom.trim())) {
      setSymptoms([...symptoms, currentSymptom.trim()])
      setCurrentSymptom('')
    }
  }

  const handleRemoveSymptom = (symptom) => {
    setSymptoms(symptoms.filter(s => s !== symptom))
  }

  const handleCheck = async () => {
    if (symptoms.length === 0 || !age || !gender) {
      alert('Please add symptoms, age, and gender')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post('/api/symptoms/check', {
        symptoms,
        age: parseInt(age),
        gender,
      })
      setResult(response.data)
    } catch (error) {
      alert('Error checking symptoms: ' + (error.response?.data?.detail || error.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Symptoms Checker</h1>
        <p className="text-gray-600 mt-2">Enter your symptoms to get preliminary health information</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              min="1"
              max="120"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms</label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={currentSymptom}
              onChange={(e) => setCurrentSymptom(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSymptom()}
              placeholder="Enter a symptom..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            />
            <button
              onClick={handleAddSymptom}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {symptoms.map((symptom, index) => (
              <span
                key={index}
                className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm flex items-center"
              >
                {symptom}
                <button
                  onClick={() => handleRemoveSymptom(symptom)}
                  className="ml-2 text-primary-600 hover:text-primary-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={handleCheck}
          disabled={loading || symptoms.length === 0}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center"
        >
          <FiSearch className="mr-2" />
          {loading ? 'Checking...' : 'Check Symptoms'}
        </button>

        {result && (
          <div className="mt-6 p-6 bg-gray-50 rounded-lg">
            <div className="flex items-center mb-4">
              <FiAlertCircle className="text-primary-600 mr-2" />
              <h3 className="text-xl font-bold">Analysis Results</h3>
            </div>
            <div className="mb-4">
              <p className="font-medium mb-2">Severity: <span className={`font-bold ${
                result.severity === 'high' ? 'text-red-600' :
                result.severity === 'moderate' ? 'text-yellow-600' :
                'text-green-600'
              }`}>{result.severity.toUpperCase()}</span></p>
            </div>
            <div className="mb-4">
              <p className="font-medium mb-2">Possible Conditions:</p>
              <ul className="list-disc list-inside space-y-1">
                {result.possible_conditions.map((condition, index) => (
                  <li key={index}>
                    {condition.condition} ({condition.likelihood}% likelihood)
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-4 rounded border-l-4 border-primary-600">
              <p className="font-medium mb-1">Recommendation:</p>
              <p>{result.recommendation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SymptomsChecker

