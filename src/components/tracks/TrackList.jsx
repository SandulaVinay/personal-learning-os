import TrackCard from './TrackCard';

export default function TrackList({ tracks }) {
  if (!tracks || tracks.length === 0) {
    return (
      <div className="text-center flex flex-col items-center justify-center py-20 px-4 bg-slate-50 rounded-2xl border-2 border-slate-200 border-dashed mt-6">
        <div className="text-4xl mb-3 opacity-80">🌱</div>
        <h3 className="text-xl font-bold text-slate-700">No tracks added yet</h3>
        <p className="text-slate-500 mt-2 max-w-sm mx-auto text-sm leading-relaxed">
          Create your first track above. Time-based tracks measure hours, Milestone tracks measure individual achievements.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
      {tracks.map(track => (
        <TrackCard key={track.id} track={track} />
      ))}
    </div>
  );
}
