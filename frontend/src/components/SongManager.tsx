import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import {
  fetchSongsRequest,
  deleteSongRequest,
  updateSongRequest,
  addSongRequest,
} from "../redux/songs/songsSlice";
import { Song } from "../types/song";
import SongForm from "./SongForm";

const SongManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const songs = useSelector((state: RootState) => state.songs.songs);

  const [showForm, setShowForm] = useState(false);
  const [editSong, setEditSong] = useState<Song | null>(null);
  const [deleteSongId, setDeleteSongId] = useState<string | null>(null);
  const [filterText, setFilterText] = useState("");
  const [filterField, setFilterField] = useState<"Title" | "Artist" | "Album" | "Genre">("Title");
  const [showDetailStats, setShowDetailStats] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => { dispatch(fetchSongsRequest()); }, [dispatch]);

  const handleEdit = (song: Song) => {
    setEditSong(song); 
    setShowForm(true); 
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };
  const handleAddNew = () => {
    setEditSong(null); 
    setShowForm(!showForm); 
    if (!showForm) setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };
  const handleSave = (newSong: Omit<Song, "_id">) => { dispatch(addSongRequest(newSong)); setShowForm(false); };
  const handleUpdate = (updatedSong: Song) => { dispatch(updateSongRequest(updatedSong)); setEditSong(null); setShowForm(false); };
  const handleJumpToStats = () => statsRef.current?.scrollIntoView({ behavior: "smooth" });

  const filteredSongs = songs.filter((s) => (s[filterField] as string).toLowerCase().includes(filterText.toLowerCase()));

  const stats = [
    { icon: "🎵", value: songs.length, label: "Total Songs", color: "purple" },
    { icon: "🎤", value: new Set(songs.map((s) => s.Artist)).size, label: "Unique Artists", color: "pink" },
    { icon: "💿", value: new Set(songs.map((s) => s.Album)).size, label: "Unique Albums", color: "yellow" },
    { icon: "🎧", value: Object.entries(songs.reduce((acc: Record<string, number>, s) => { acc[s.Genre] = (acc[s.Genre] || 0) + 1; return acc; }, {})).sort((a,b)=>b[1]-a[1])[0]?.[0] || "-", label: "Most Common Genre", color: "green" },
  ];

  const genreCount = songs.reduce((acc: Record<string, number>, s) => { acc[s.Genre]=(acc[s.Genre]||0)+1; return acc; }, {});
  const artistStats = Object.values(songs.reduce((acc: Record<string, { artist:string; songs:number; albums:Set<string> }>, s) => { if(!acc[s.Artist]) acc[s.Artist]={artist:s.Artist,songs:0,albums:new Set()}; acc[s.Artist].songs+=1; acc[s.Artist].albums.add(s.Album); return acc; }, {})).map(a=>({...a,albums:a.albums.size}));
  const albumStats = songs.reduce((acc: Record<string, number>, s)=>{ acc[s.Album]=(acc[s.Album]||0)+1; return acc; }, {});

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center bg-gray-50 rounded-2xl shadow-md p-6 gap-4 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-tl-2xl"></div>
        <h1 className="flex items-center text-2xl font-bold text-black gap-3"><span className="text-purple-600 text-3xl">🎵</span> Music Catalog Manager</h1>
        <div className="flex gap-3 flex-wrap">
          <button className="bg-blue-600 text-white px-5 py-2 rounded-xl shadow-md transition font-medium flex items-center justify-center gap-2" onClick={handleAddNew}>{showForm?"Close Form":"+ Add New Song"}</button>
          <button className="bg-gray-200 text-black px-4 py-2 rounded-xl shadow-md transition font-medium flex items-center justify-center gap-2" onClick={handleJumpToStats}>📊 Statistics</button>
        </div>
      </header>

      {/* Song Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div ref={formRef} initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}} transition={{duration:0.3}}>
            <SongForm songToEdit={editSong||undefined} onSave={handleSave} onUpdate={handleUpdate} onClose={()=>setShowForm(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 bg-gray-50 p-4 rounded-xl shadow-md">
        <label className="flex items-center gap-2 text-black font-semibold">Filter by:
          <select value={filterField} onChange={e=>setFilterField(e.target.value as any)} className="border rounded-lg px-3 py-1">
            <option value="Title">Title</option>
            <option value="Artist">Artist</option>
            <option value="Album">Album</option>
            <option value="Genre">Genre</option>
          </select>
        </label>
        <input type="text" placeholder="Search songs..." value={filterText} onChange={e=>setFilterText(e.target.value)} className="flex-1 border rounded-lg px-4 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-300"/>
      </div>

      {/* Song List */}
      <div className="space-y-2">
        {filteredSongs.length===0?<p className="text-black text-center">No songs found.</p>:filteredSongs.map((song,index)=>(
          <div key={song._id} className={`flex flex-col md:flex-row justify-between items-center rounded-2xl shadow-sm p-4 gap-4 ${index%2===0?"bg-gray-50":"bg-gray-100"}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-black flex-1 w-full">
              {["Title","Artist","Album","Genre"].map((field)=>(
                <div key={field}><div className="text-xs uppercase font-bold text-black/70">{field}</div><div className="font-medium text-black">{song[field as keyof Song]}</div></div>
              ))}
            </div>
            <div className="flex gap-2 mt-2 md:mt-0 w-48">
              <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-xl shadow-sm hover:bg-blue-700 transition font-medium" onClick={()=>handleEdit(song)}>Edit</button>
              <button className="flex-1 bg-red-600 text-white px-4 py-2 rounded-xl shadow-sm hover:bg-red-700 transition font-medium" onClick={()=>setDeleteSongId(song._id??null)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Main Statistics */}
      <div ref={statsRef} className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({icon,value,label,color})=>(
          <motion.div key={label} whileHover={{scale:1.05}} className={`relative bg-${color}-100 border border-${color}-300 rounded-xl shadow-md p-4 flex flex-col items-center text-center`}>
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-${color}-400 to-${color}-600 rounded-tl-xl`}></div>
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-xl font-bold text-black">{value}</div>
            <div className="text-sm font-semibold text-black">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Toggle Detail */}
      <div className="flex justify-center mt-4">
        <button className="bg-gray-200 text-black px-6 py-2 rounded-full shadow-sm hover:bg-gray-300 transition font-medium" onClick={()=>setShowDetailStats(!showDetailStats)}>
          {showDetailStats?"Hide Detailed Statistics":"View Detailed Statistics"}
        </button>
      </div>

      {/* Detailed Statistics */}
      <AnimatePresence>
        {showDetailStats && (
          <motion.section initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:20}} transition={{duration:0.3}} className="mt-6 space-y-4">
            {[
              { title:"Genre Counts", data: genreCount, color:"green" },
              { title:"Artist Breakdown", data:Object.fromEntries(artistStats.map(a=>[a.artist,`${a.albums} Albums | ${a.songs} Songs`])), color:"pink" },
              { title:"Album Breakdown", data: albumStats, color:"yellow" }
            ].map(({title,data,color})=>(
              <div key={title}>
                <h2 className="text-lg font-bold border-b pb-2 text-black">{title}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(data).map(([key,val])=>(
                    <motion.div key={key} whileHover={{scale:1.03}} className={`bg-${color}-100 border border-${color}-300 rounded-xl shadow-md p-2 flex flex-col items-center justify-center text-black text-sm`}>
                      <div className="font-bold">{key}</div>
                      <div>{val}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </motion.section>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      {deleteSongId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-80">
            <p className="mb-4 text-black font-medium">Are you sure you want to delete this song?</p>
            <div className="flex justify-between gap-3">
              <button className="flex-1 px-5 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium" onClick={()=>{dispatch(deleteSongRequest(deleteSongId)); setDeleteSongId(null);}}>Yes</button>
              <button className="flex-1 px-5 py-2 bg-gray-200 text-black rounded-xl hover:bg-gray-300 transition font-medium" onClick={()=>setDeleteSongId(null)}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SongManager;
