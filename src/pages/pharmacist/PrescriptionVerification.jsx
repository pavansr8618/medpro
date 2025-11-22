import { useState } from 'react'
import { FiFileCheck, FiCheck, FiX } from 'react-icons/fi'

const PrescriptionVerification = () => {
  const [prescriptionId, setPrescriptionId] = useState('')
  const [verificationResult, setVerificationResult] = useState(null)

  const handleVerify = () => {
    // In a real app, this would verify prescription with backend
    if (prescriptionId) {
      setVerificationResult({
        valid: true,
        prescription: {
          id: prescriptionId,
          doctor: 'Dr. John Doe',
          patient: 'Patient #123',
          date: new Date().toLocaleDateString(),
          medications: ['Medication A', 'Medication B'],
        },
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Prescription Verification</h1>
        <p className="text-gray-600 mt-2">Verify patient prescriptions before dispensing medicines</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center">
          <FiFileCheck className="mr-2" />
          Verify Prescription
        </h2>
        <div className="flex space-x-2">
          <input
            type="text"
            value={prescriptionId}
            onChange={(e) => setPrescriptionId(e.target.value)}
            placeholder="Enter prescription ID"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={handleVerify}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Verify
          </button>
        </div>

        {verificationResult && (
          <div className={`mt-6 p-4 rounded-lg ${
            verificationResult.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center mb-2">
              {verificationResult.valid ? (
                <FiCheck className="text-green-600 text-xl mr-2" />
              ) : (
                <FiX className="text-red-600 text-xl mr-2" />
              )}
              <h3 className="font-bold">
                {verificationResult.valid ? 'Valid Prescription' : 'Invalid Prescription'}
              </h3>
            </div>
            {verificationResult.valid && verificationResult.prescription && (
              <div className="mt-4 space-y-2">
                <p><strong>Doctor:</strong> {verificationResult.prescription.doctor}</p>
                <p><strong>Patient:</strong> {verificationResult.prescription.patient}</p>
                <p><strong>Date:</strong> {verificationResult.prescription.date}</p>
                <div>
                  <strong>Medications:</strong>
                  <ul className="list-disc list-inside ml-4">
                    {verificationResult.prescription.medications.map((med, idx) => (
                      <li key={idx}>{med}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PrescriptionVerification

