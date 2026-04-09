import { useState, useEffect } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import TrackForm from '../components/tracks/TrackForm';
import TrackList from '../components/tracks/TrackList';

export default function Tracks() {
  const { getTracks } = useSupabase();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    const data = await getTracks();
    setTracks(data);
    setLoading(false);
  };

  const handleTrackAdded = (newTrack) => {
    // Optimistically insert at the top of the list
    setTracks([newTrack, ...tracks]);
  };

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Tracks</h1>
          <p className="text-slate-500 mt-1.5 font-medium">Manage and measure your learning paths.</p>
        </div>
      </div>

      <TrackForm onTrackAdded={handleTrackAdded} />

      {loading ? (
        <div className="flex justify-center py-20 text-slate-400 font-medium">
          Loading your tracks...
        </div>
      ) : (
        <TrackList tracks={tracks} />
      )}
    </div>
  );
}
