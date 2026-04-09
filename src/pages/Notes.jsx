import { useState, useEffect } from 'react';
import { useNotes } from '../hooks/useNotes';
import NoteForm from '../components/notes/NoteForm';
import NotesList from '../components/notes/NotesList';
import ExportButton from '../components/notes/ExportButton';

export default function Notes() {
  const { getNotes } = useNotes();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotes().then(res => {
      setNotes(res);
      setLoading(false);
    });
  }, []);

  const handleAdded = (n) => setNotes([n, ...notes]);

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-200 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Notes Vault</h1>
          <p className="text-slate-500 mt-1.5 font-medium">Capture insights, edge cases, and references.</p>
        </div>
        <ExportButton notes={notes} />
      </div>

      <NoteForm onNoteAdded={handleAdded} />

      {loading ? (
         <div className="flex justify-center py-20 text-slate-400 font-medium">Loading your vault...</div>
      ) : (
         <NotesList notes={notes} />
      )}
    </div>
  )
}
