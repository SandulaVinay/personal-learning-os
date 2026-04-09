export default function NoteCard({ note, minimize = false }) {
  const tagColors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    reference: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden transition hover:shadow-md ${minimize ? 'p-4' : 'p-5'}`}>
       
       <div className="mb-3 flex justify-between items-start border-b border-slate-50 pb-3">
         <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${tagColors[note.tag]}`}>
           {note.tag}
         </span>
         <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
           {new Date(note.created_at).toLocaleDateString()}
         </span>
       </div>
       
       <div className={`prose prose-sm prose-slate max-w-none text-slate-800 font-medium leading-relaxed whitespace-pre-wrap ${minimize ? 'text-xs line-clamp-3' : 'text-[13px] mb-4'}`}>
          {note.content}
       </div>
       
       {!minimize && (
         <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <span>{note.source ? `From: ${note.source}` : 'General'}</span>
            <span>{note.tracks?.name ? `Track: ${note.tracks.name}` : ''}</span>
         </div>
       )}
    </div>
  );
}
