import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";

// --- MOCK DATA, TYPES, AND STATE MANAGEMENT (Simulating Redux) ---

/**
 * Mock Song Type Definition
 */
type Song = {
  _id: string;
  Title: string;
  Artist: string;
  Album: string;
  Genre: string;
};

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// Generate a large, diverse set of mock data to ensure scrolling
const genres = ['Rock', 'Pop', 'Jazz', 'Electronic', 'Classical', 'Hip Hop', 'Indie'];
const artists = ['Queen', 'The Beatles', 'Nirvana', 'Michael Jackson', 'Led Zeppelin', 'Daft Punk', 'Mozart', 'Taylor Swift'];
const albums = ['A Night at the Opera', 'Abbey Road', 'Nevermind', 'Thriller', 'IV', 'Discovery', 'Requiem', '1989'];

const generateMockSongs = (count: number): Song[] => {
  const songs: Song[] = [];
  for (let i = 1; i <= count; i++) {
    const genre = genres[i % genres.length];
    const artist = artists[Math.floor(i / 10) % artists.length];
    const album = albums[Math.floor(i / 15) % albums.length];
    
    songs.push({
      _id: String(Date.now() + i),
      Title: `Mock Track ${i}`,
      Artist: artist,
      Album: album,
      Genre: genre,
    });
  }
  return songs;
};

const initialSongs: Song[] = [
    // Keep a few classics at the top
    { _id: '1', Title: 'Bohemian Rhapsody', Artist: 'Queen', Album: 'A Night at the Opera', Genre: 'Rock' },
    { _id: '2', Title: 'Imagine', Artist: 'John Lennon', Album: 'Imagine', Genre: 'Pop' },
    { _id: '3', Title: 'Smells Like Teen Spirit', Artist: 'Nirvana', Album: 'Nevermind', Genre: 'Grunge' },
    ...generateMockSongs(100) // Generate 100 additional songs
];

/**
 * Global State Context (Replaces Redux Store)
 */
const SongContext = createContext<{
  songs: Song[];
  addSong: (song: Omit<Song, '_id'>) => void;
  updateSong: (song: Song) => void;
  deleteSong: (id: string) => void;
}>({
  songs: [],
  addSong: () => {},
  updateSong: () => {},
  deleteSong: () => {},
});

const SongProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [songs, setSongs] = useState<Song[]>(initialSongs);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate API calls delay and ID generation
  const addSong = useCallback((newSongData: Omit<Song, '_id'>) => {
    setIsLoading(true);
    setTimeout(() => {
      const newSong: Song = {
        ...newSongData,
        _id: String(Date.now()), // Simple ID generation
      };
      setSongs(prev => [...prev, newSong]);
      setIsLoading(false);
    }, 500);
  }, []);

  const updateSong = useCallback((updatedSong: Song) => {
    setIsLoading(true);
    setTimeout(() => {
      setSongs(prev => prev.map(s => (s._id === updatedSong._id ? updatedSong : s)));
      setIsLoading(false);
    }, 500);
  }, []);

  const deleteSong = useCallback((id: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setSongs(prev => prev.filter(s => s._id !== id));
      setIsLoading(false);
    }, 300);
  }, []);

  const contextValue = useMemo(() => ({ songs, addSong, updateSong, deleteSong, isLoading }), [songs, addSong, updateSong, deleteSong, isLoading]);

  return (
    <SongContext.Provider value={contextValue as any}>
      {children}
    </SongContext.Provider>
  );
};

// --- SongForm Component (Consolidated from SongForm.tsx) ---

interface SongFormProps {
  songToEdit?: Song;
  onUpdate: (updatedSong: Song) => void;
  onSave: (newSong: Omit<Song, "_id">) => void;
  onClose?: () => void;
  isLoading: boolean;
}

const SongForm: React.FC<SongFormProps> = ({ songToEdit, onUpdate, onClose, onSave, isLoading }) => {
  const [song, setSong] = useState<Omit<Song, "_id">>({
    Title: "",
    Artist: "",
    Album: "",
    Genre: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (songToEdit) {
      setSong({
        Title: songToEdit.Title,
        Artist: songToEdit.Artist,
        Album: songToEdit.Album,
        Genre: songToEdit.Genre,
      });
    } else {
      setSong({ Title: "", Artist: "", Album: "", Genre: "" });
    }
  }, [songToEdit]);

  // Validation logic
  const validateField = (name: keyof Omit<Song, "_id">, value: string) => {
    let error = "";
    if (!value.trim()) {
      error = `${name} is required`;
    }
    // Only check for non-alphanumeric characters in Title and Artist
    else if (
      (name === "Title" || name === "Artist") &&
      /[^a-zA-Z0-9\s]/.test(value)
    ) {
      error = `${name} can only contain letters, numbers, and spaces`;
    }
    
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error === "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSong((prev) => ({ ...prev, [name as keyof Omit<Song, "_id">]: value }));
    validateField(name as keyof Omit<Song, "_id">, value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const isValid =
      validateField("Title", song.Title) &&
      validateField("Artist", song.Artist) &&
      validateField("Album", song.Album) &&
      validateField("Genre", song.Genre);

    if (!isValid || isLoading) return;

    if (songToEdit) {
      onUpdate({ ...songToEdit, ...song });
    } else {
      onSave(song);
    }

    // Reset and close form
    setSong({ Title: "", Artist: "", Album: "", Genre: "" });
    onClose?.();
  };

  const getInputClass = (name: keyof Omit<Song, '_id'>) => {
    const base =
      "w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-150 shadow-sm text-gray-800 placeholder-gray-400";
    const errorClasses = "border-red-500 focus:ring-red-200";
    const defaultClasses = "border-gray-300 focus:ring-blue-300";

    return `${base} ${errors[name] ? errorClasses : defaultClasses}`;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 shadow-xl rounded-xl space-y-4 max-w-lg mx-auto border border-gray-200"
    >
      <h2 className="text-2xl font-extrabold text-gray-800 mb-4 border-b pb-2">
        {songToEdit ? "✍️ Edit Song Details" : "✨ Add New Song"}
      </h2>

      {/* Input Group: Title */}
      <div>
        <input
          type="text"
          name="Title"
          placeholder="Song Title (e.g., Yesterday)"
          value={song.Title}
          onChange={handleChange}
          className={getInputClass('Title')}
          disabled={isLoading}
        />
        {errors.Title && (
          <p className="text-red-500 text-sm mt-1 font-medium">{errors.Title}</p>
        )}
      </div>

      {/* Input Group: Artist */}
      <div>
        <input
          type="text"
          name="Artist"
          placeholder="Artist Name (e.g., The Beatles)"
          value={song.Artist}
          onChange={handleChange}
          className={getInputClass('Artist')}
          disabled={isLoading}
        />
        {errors.Artist && (
          <p className="text-red-500 text-sm mt-1 font-medium">{errors.Artist}</p>
        )}
      </div>

      {/* Input Group: Album */}
      <div>
        <input
          type="text"
          name="Album"
          placeholder="Album Name (e.g., Help!)"
          value={song.Album}
          onChange={handleChange}
          className={getInputClass('Album')}
          disabled={isLoading}
        />
        {errors.Album && (
          <p className="text-red-500 text-sm mt-1 font-medium">{errors.Album}</p>
        )}
      </div>

      {/* Input Group: Genre */}
      <div>
        <input
          type="text"
          name="Genre"
          placeholder="Genre (e.g., Classic Rock)"
          value={song.Genre}
          onChange={handleChange}
          className={getInputClass('Genre')}
          disabled={isLoading}
        />
        {errors.Genre && (
          <p className="text-red-500 text-sm mt-1 font-medium">{errors.Genre}</p>
        )}
      </div>

      {/* Button Group */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition duration-200 shadow-lg text-lg disabled:bg-blue-400 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : (
            songToEdit ? "💾 Update Song" : "➕ Add Song"
          )}
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg hover:bg-gray-400 transition duration-200 shadow-md text-lg disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};


// --- SongManager Component (The Main App) ---

const SongManager: React.FC = () => {
  // Use Context instead of Redux hooks
  const { songs, addSong, updateSong, deleteSong, isLoading } = useContext(SongContext) as any;

  // Form & Modal States
  const [showForm, setShowForm] = useState(false);
  const [editSong, setEditSong] = useState<Song | null>(null);
  const [deleteSongId, setDeleteSongId] = useState<string | null>(null);

  // Filter States
  const [filterText, setFilterText] = useState("");
  const [filterField, setFilterField] = useState<
    "Title" | "Artist" | "Album" | "Genre"
  >("Title");

  // Detail stats toggle
  const [showDetailStats, setShowDetailStats] = useState(true); // Show stats by default
  
  // Ref for statistics section to enable smooth scrolling jump
  const statsRef = React.useRef<HTMLDivElement>(null);


  // Handlers using Context actions
  const handleEdit = (song: Song) => {
    setEditSong(song);
    setShowForm(true);
  };

  const handleUpdate = (updatedSong: Song) => {
    updateSong(updatedSong);
    setEditSong(null);
    setShowForm(false);
  };

  const handleAddNew = () => {
    setEditSong(null);
    setShowForm(!showForm);
  };

  const handleSave = (newSongData: Omit<Song, "_id">) => {
    addSong(newSongData);
    setShowForm(false);
  };
  
  const handleDeleteConfirm = () => {
    if (deleteSongId) {
      deleteSong(deleteSongId);
    }
    setDeleteSongId(null);
  }
  
  const handleScrollToStats = () => {
    if (statsRef.current) {
        statsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };


  // Filtered songs
  const filteredSongs = useMemo(() => {
    return songs.filter((song: Song) => {
      const value = song[filterField] as string;
      return value.toLowerCase().includes(filterText.toLowerCase());
    });
  }, [songs, filterField, filterText]);

  // Statistics calculation (memoized for performance)
  const { totalSongs, uniqueArtists, uniqueAlbums, genreCount, artistStatsCount, albumStats, mostCommonGenre } = useMemo(() => {
    const totalSongs = songs.length;
    const uniqueArtists = Array.from(new Set(songs.map((s: Song) => s.Artist))).length;
    const uniqueAlbums = Array.from(new Set(songs.map((s: Song) => s.Album))).length;

    // Genre count
    const genreCount: Record<string, number> = {};
    songs.forEach((s: Song) => {
      genreCount[s.Genre] = (genreCount[s.Genre] || 0) + 1;
    });
    const mostCommonGenre =
      Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

    // Artist stats
    const artistStats: Record<string, { songs: number; albums: Set<string> }> = {};
    songs.forEach((s: Song) => {
      if (!artistStats[s.Artist])
        artistStats[s.Artist] = { songs: 0, albums: new Set() };
      artistStats[s.Artist].songs += 1;
      artistStats[s.Artist].albums.add(s.Album);
    });
    const artistStatsCount = Object.entries(artistStats).map(([artist, data]) => ({
      artist,
      songs: data.songs,
      albums: data.albums.size,
    }));

    // Album stats
    const albumStats: Record<string, number> = {};
    songs.forEach((s: Song) => {
      albumStats[s.Album] = (albumStats[s.Album] || 0) + 1;
    });

    return { totalSongs, uniqueArtists, uniqueAlbums, genreCount, artistStatsCount, albumStats, mostCommonGenre };
  }, [songs]);


  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-['Inter']">
      <div className="max-w-6xl mx-auto">
        
        {/* Floating Jump Button for Large Lists (Restored) */}
        <button
            onClick={handleScrollToStats}
            title="Jump to Statistics Report"
            className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:bg-indigo-700 transition duration-300 transform hover:scale-110"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-8v8m-4-8v8m9-5a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v10z"></path></svg>
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-lg border-t-4 border-indigo-500">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-4 sm:mb-0">
            🎶 Music Catalog Manager
          </h1>
          {/* Add/Close Button */}
          <button
            onClick={handleAddNew}
            className={`px-6 py-3 font-semibold rounded-full text-lg transition duration-300 shadow-md transform hover:scale-[1.05] ${
              showForm
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-indigo-500 hover:bg-indigo-600 text-white"
            }`}
            disabled={isLoading}
          >
            {showForm ? "❌ Close Form" : "➕ Add New Song"}
          </button>
        </div>

        {/* Song Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <SongForm
                songToEdit={editSong || undefined}
                onUpdate={handleUpdate}
                onSave={handleSave}
                onClose={() => setShowForm(false)}
                isLoading={isLoading}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter */}
        <div className="flex flex-col gap-3 mb-6 items-center p-4 bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="w-full text-gray-700 font-medium flex flex-col sm:flex-row items-center gap-3">
            <label className="whitespace-nowrap w-full sm:w-auto">
              Filter by:
              <select
                value={filterField}
                onChange={(e) => setFilterField(e.target.value as any)}
                className="ml-2 p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                disabled={isLoading}
              >
                <option value="Title">Title</option>
                <option value="Artist">Artist</option>
                <option value="Album">Album</option>
                <option value="Genre">Genre</option>
              </select>
            </label>

            <input
              type="text"
              placeholder={`Search songs by ${filterField}...`}
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 w-full shadow-inner text-gray-800"
              disabled={isLoading}
            />
          </div>
        </div>
        
        {/* Loading Indicator for List (when operations are pending) */}
        {isLoading && (
            <div className="flex items-center justify-center p-4 bg-indigo-50 rounded-xl mb-4 text-indigo-700 font-semibold shadow-inner">
                <svg className="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating catalog...
            </div>
        )}

        {/* Song List (Restored Update/Delete Buttons) */}
        <div className="space-y-4">
          {filteredSongs.length === 0 ? (
            <p className="text-center text-gray-500 py-8 text-xl font-medium border border-dashed p-6 rounded-xl">
              No songs found matching the current filter criteria.
            </p>
          ) : (
            filteredSongs.map((song: Song) => (
              <motion.div
                key={song._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-5 rounded-xl shadow-lg flex flex-col lg:flex-row justify-between items-start lg:items-center transition hover:shadow-xl border-l-8 border-blue-500"
              >
                {/* Song Info Grid */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 md:grid-cols-4 md:gap-x-12 md:gap-y-0 text-left mb-3 lg:mb-0 w-full lg:w-3/4">
                  {[
                    { label: "Title", field: song.Title },
                    { label: "Artist", field: song.Artist },
                    { label: "Album", field: song.Album },
                    { label: "Genre", field: song.Genre },
                  ].map((item, index) => (
                    <div key={index} className="flex flex-col truncate">
                      <span className="text-xs font-semibold text-gray-500 uppercase">
                        {item.label}
                      </span>
                      <span className="text-base font-medium text-gray-800 truncate">
                        {item.field}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons (Restored) */}
                <div className="flex space-x-2 mt-4 lg:mt-0 w-full lg:w-auto justify-end">
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center text-sm disabled:bg-yellow-300"
                    onClick={() => handleEdit(song)}
                    disabled={isLoading}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                      <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                    </svg>
                    Edit
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center text-sm disabled:bg-red-300"
                    onClick={() => setDeleteSongId(song._id)}
                    disabled={isLoading}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 10-2 0v6a1 1 0 102 0V8z" clipRule="evenodd" />
                    </svg>
                    Remove
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* --- STATISTICS REPORT SECTION (Targeted by Jump Button) --- */}
        <div ref={statsRef} className="pt-8">
            <h2 className="text-3xl font-extrabold text-gray-800 mt-12 mb-6">📊 Catalog Statistics Report</h2>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
          {[
            {
              icon: "🎵",
              number: totalSongs,
              label: "Total Songs",
              color: "purple",
            },
            {
              icon: "🎤",
              number: uniqueArtists,
              label: "Unique Artists",
              color: "pink",
            },
            {
              icon: "💿",
              number: uniqueAlbums,
              label: "Unique Albums",
              color: "orange",
            },
            {
              icon: "🎧",
              number: mostCommonGenre,
              label: "Most Common Genre",
              color: "teal",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className={`bg-white p-5 rounded-xl shadow-lg text-center border-b-4 border-${stat.color}-400 hover:scale-[1.02] transition duration-200 cursor-default`}
            >
              <div className={`mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-${stat.color}-100 text-2xl mb-2`}>
                {stat.icon}
              </div>
              <p className="text-3xl font-extrabold text-gray-800 truncate">{stat.number}</p>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Toggle Button for Detailed Stats */}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setShowDetailStats(!showDetailStats)}
            className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-semibold py-3 px-6 rounded-full transition duration-300 shadow-md flex items-center text-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 transition-transform ${showDetailStats ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
            </svg>
            {showDetailStats
              ? "Hide Detailed Statistics"
              : "Show Detailed Statistics"}
          </button>
        </div>

        {/* Detailed Stats Section */}
        <AnimatePresence>
        {showDetailStats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6 max-h-[500px] overflow-y-auto p-6 bg-white rounded-xl shadow-2xl border border-gray-100">

              <h3 className="col-span-full text-xl font-bold text-gray-700 mb-2 border-b border-gray-200 pb-2">Genre Counts</h3>
              {Object.entries(genreCount).map(([genre, count]) => (
                <div
                  key={genre}
                  className="bg-green-50 p-4 rounded-lg shadow-sm text-left border-l-4 border-green-400"
                >
                  <p className="text-sm text-gray-500 font-medium uppercase truncate">
                    {genre}
                  </p>
                  <p className="text-3xl font-extrabold text-gray-800">{count}</p>
                </div>
              ))}

              <h3 className="col-span-full text-xl font-bold text-gray-700 mt-6 mb-2 border-b border-gray-200 pb-2">Artist Breakdown</h3>
              {artistStatsCount.map(({ artist, songs, albums }) => (
                <div
                  key={artist}
                  className="bg-yellow-50 p-4 rounded-lg shadow-sm text-left border-l-4 border-yellow-400"
                >
                  <p className="text-sm text-gray-500 font-medium truncate">
                    {artist}
                  </p>
                  <p className="text-xl font-bold text-gray-800">
                    {songs} <span className="text-sm font-normal text-gray-500">Songs</span> / {albums} <span className="text-sm font-normal text-gray-500">Albums</span>
                  </p>
                </div>
              ))}
              
              <h3 className="col-span-full text-xl font-bold text-gray-700 mt-6 mb-2 border-b border-gray-200 pb-2">Album Track Counts</h3>
              {Object.entries(albumStats).map(([album, count]) => (
                <div
                  key={album}
                  className="bg-blue-50 p-4 rounded-lg shadow-sm text-left border-l-4 border-blue-400"
                >
                  <p className="text-sm text-gray-500 font-medium truncate">
                    {album}
                  </p>
                  <p className="text-3xl font-extrabold text-gray-800">{count}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
        </AnimatePresence>


        {/* Delete Modal */}
        <AnimatePresence>
        {deleteSongId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 transition-opacity p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full transform"
            >
              <h4 className="text-2xl font-bold text-red-600 mb-3">Confirm Deletion</h4>
              <p className="text-lg text-gray-700 mb-8">
                Are you sure you want to delete this song? This action cannot be undone.
              </p>
              {/* Modal Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition duration-150 shadow-md text-base disabled:bg-red-400"
                  onClick={handleDeleteConfirm}
                  disabled={isLoading}
                >
                  Yes, Delete It
                </button>
                <button
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-3 px-6 rounded-lg transition duration-150 shadow-md text-base disabled:bg-gray-200"
                  onClick={() => setDeleteSongId(null)}
                  disabled={isLoading}
                >
                  No, Keep It
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// The main default export wraps SongManager with the state provider
export default function App() {
  // Load Tailwind CSS and the necessary script for the environment
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdn.tailwindcss.com";
    document.head.appendChild(script);
    
    // Set smooth scrolling behavior on the body element
    document.body.style.scrollBehavior = 'smooth';
  }, []);
  
  return (
    <SongProvider>
      <SongManager />
    </SongProvider>
  );
}
