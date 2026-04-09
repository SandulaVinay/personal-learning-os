import { Download } from 'lucide-react';

export default function ExportButton({ notes }) {
  const handleExport = () => {
    let md = `# Personal Learning OS Vault\n*Exported on ${new Date().toLocaleDateString()}*\n\n---\n\n`;
    
    notes.forEach(n => {
       md += `### ${n.tracks?.name || 'General Topic'} - ${new Date(n.created_at).toLocaleDateString()}\n`;
       md += `- **Tag:** ${n.tag.toUpperCase()}\n`;
       if (n.source) md += `- **Source:** ${n.source}\n`;
       md += `\n${n.content}\n\n`;
       md += `---\n\n`;
    });
    
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learning_os_notes_${new Date().getTime()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-semibold text-sm rounded-lg hover:bg-slate-800 transition shadow-sm active:scale-95">
       <Download size={16}/> Export Markdown
    </button>
  );
}
