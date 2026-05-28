import { useState } from 'react'
import { Plus, Edit2, Trash2, X, HelpCircle, Save, ChevronDown, ChevronUp, GripVertical } from 'lucide-react'
import { useData } from '../context/DataContext'

export default function Quiz() {
  const { quiz: questions, addQuizQuestion, updateQuizQuestion, deleteQuizQuestion } = useData()
  const [expanded, setExpanded] = useState(null)
  const [showDelete, setShowDelete] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newQ, setNewQ] = useState({ question: '', icon: '❓', options: [
    { id: '', label: '', icon: '' },
    { id: '', label: '', icon: '' },
    { id: '', label: '', icon: '' },
    { id: '', label: '', icon: '' },
  ]})

  const updateQuestion = (id, field, value) => {
    updateQuizQuestion(id, { [field]: value })
  }

  const updateOption = (qId, optIdx, field, value) => {
    const q = questions.find(q => q.id === qId)
    if (!q) return
    const opts = [...q.options]
    opts[optIdx] = { ...opts[optIdx], [field]: value }
    updateQuizQuestion(qId, { options: opts })
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const deleteQuestion = () => {
    deleteQuizQuestion(showDelete)
    setShowDelete(null)
  }

  const addQuestion = () => {
    if (!newQ.question.trim()) return
    addQuizQuestion({
      question: newQ.question,
      icon: newQ.icon || '❓',
      options: newQ.options.map((o, i) => ({
        id: `new_${Date.now()}_${i}`,
        label: o.label || `Option ${i + 1}`,
        icon: o.icon || ['🏢', '🏡', '🌆', '🌿'][i] || '📌',
      })),
    })
    setShowAdd(false)
    setNewQ({ question: '', icon: '❓', options: [
      { id: '', label: '', icon: '' },
      { id: '', label: '', icon: '' },
      { id: '', label: '', icon: '' },
      { id: '', label: '', icon: '' },
    ]})
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quiz Questions</h1>
          <p className="text-gray-500 mt-1">Manage the 5-step property recommendation quiz</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSave} className={`btn-primary flex items-center gap-2 ${saved ? 'bg-green-600' : ''}`}>
            {saved ? <><Check className="w-4 h-4" />Saved!</> : <><Save className="w-4 h-4" />Save All</>}
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
        <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
        <p className="text-sm text-blue-800">These 5 questions are shown as a step-by-step wizard quiz on the frontend. Each question has exactly 4 options. Click a question to expand and edit.</p>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {questions.map((q, qi) => (
          <div key={q.id} className="card overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === q.id ? null : q.id)}
              className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-2xl">{q.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">Step {qi + 1}</span>
                  <h3 className="font-semibold text-gray-900">{q.question}</h3>
                </div>
                <p className="text-sm text-gray-500 mt-1">{q.options.length} options</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={(e) => { e.stopPropagation(); setShowDelete(q.id) }} className="p-1.5 rounded-md hover:bg-red-50 text-red-400"><Trash2 className="w-4 h-4" /></button>
                {expanded === q.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </div>
            </button>

            {expanded === q.id && (
              <div className="border-t border-gray-100 p-4 space-y-4 bg-gray-50/50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Question Text</label>
                    <input
                      type="text"
                      value={q.question}
                      onChange={e => updateQuestion(q.id, 'question', e.target.value)}
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Icon (emoji)</label>
                    <input
                      type="text"
                      value={q.icon}
                      onChange={e => updateQuestion(q.id, 'icon', e.target.value)}
                      className="input-field text-sm w-20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Options (4 required)</label>
                  <div className="grid grid-cols-2 gap-3">
                    {q.options.map((opt, oi) => (
                      <div key={opt.id} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
                        <input
                          type="text"
                          value={opt.icon}
                          onChange={e => updateOption(q.id, oi, 'icon', e.target.value)}
                          className="w-10 text-center text-lg border border-gray-200 rounded-md py-1"
                          title="Icon"
                        />
                        <input
                          type="text"
                          value={opt.label}
                          onChange={e => updateOption(q.id, oi, 'label', e.target.value)}
                          className="flex-1 text-sm input-field py-1.5"
                          placeholder={`Option ${oi + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add New Question */}
      {!showAdd ? (
        <button onClick={() => setShowAdd(true)} className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex items-center justify-center gap-2 text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-colors">
          <Plus className="w-5 h-5" /> Add New Question
        </button>
      ) : (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">New Question</h3>
            <button onClick={() => setShowAdd(false)} className="p-1 rounded-md hover:bg-gray-100"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Question</label>
              <input type="text" value={newQ.question} onChange={e => setNewQ({ ...newQ, question: e.target.value })} className="input-field" placeholder="What's your ideal...?" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Icon</label>
              <input type="text" value={newQ.icon} onChange={e => setNewQ({ ...newQ, icon: e.target.value })} className="input-field w-20" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {newQ.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={opt.icon}
                  onChange={e => {
                    const opts = [...newQ.options]
                    opts[i] = { ...opts[i], icon: e.target.value }
                    setNewQ({ ...newQ, options: opts })
                  }}
                  className="w-10 text-center text-lg border border-gray-200 rounded-md py-1"
                  placeholder="🏠"
                />
                <input
                  type="text"
                  value={opt.label}
                  onChange={e => {
                    const opts = [...newQ.options]
                    opts[i] = { ...opts[i], label: e.target.value }
                    setNewQ({ ...newQ, options: opts })
                  }}
                  className="flex-1 input-field text-sm py-1.5"
                  placeholder={`Option ${i + 1}`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
            <button onClick={addQuestion} className="btn-primary flex items-center gap-1"><Plus className="w-4 h-4" />Add Question</button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full text-center">
            <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Question?</h3>
            <p className="text-sm text-gray-500 mb-6">This will remove a step from the quiz wizard. This action cannot be undone.</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setShowDelete(null)} className="btn-secondary">Cancel</button>
              <button onClick={deleteQuestion} className="btn-danger">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Check({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}