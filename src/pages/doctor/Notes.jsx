import { useState } from 'react'
import { FiEdit, FiSave } from 'react-icons/fi'

const Notes = () => {
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    // In a real app, save to backend
    localStorage.setItem('doctor_notes', notes)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
          <p className="text-gray-600 mt-2">Keep personal notes and reminders</p>
        </div>
        <button
          onClick={handleSave}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center"
        >
          <FiSave className="mr-2" />
          {saved ? 'Saved!' : 'Save Notes'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Write your notes here..."
          className="w-full h-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>
    </div>
  )
}

export default Notes

