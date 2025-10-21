/** @jsxImportSource @emotion/react */
import React, { useState, useEffect, useRef, useMemo } from "react";
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
import { css } from "@emotion/react";

// --- Reusable CSS Styles ---

const cardBase = css({
  position: "relative",
  borderRadius: "1rem",
  padding: "1rem",
  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
});

const buttonBase = css({
  padding: "0.6rem 1.4rem",
  borderRadius: "1rem",
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s",
  border: "none",
  outline: "none",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
});

const primaryButton = css(buttonBase, {
  backgroundColor: "#2563eb",
  color: "#fff",
  "&:hover": { backgroundColor: "#1d4ed8" },
});

const secondaryButton = css(buttonBase, {
  backgroundColor: "#e5e7eb",
  color: "#000",
  "&:hover": { backgroundColor: "#d1d5db" },
});

// --- Custom Chart Components (Unchanged for functionality) ---

// 1. Horizontal Bar Chart (Used for Genre Counts)
const BarChart: React.FC<{ data: Record<string, number>, color: string, maxItems?: number }> = ({ data, color, maxItems = 5 }) => {
  const sortedData = useMemo(() => 
    Object.entries(data).sort(([, a], [, b]) => b - a).slice(0, maxItems),
    [data, maxItems]
  );
  if (sortedData.length === 0) return <div css={{ padding: '1rem', color: '#6b7280' }}>No data to display.</div>;

  const maxCount = sortedData[0]?.[1] || 1;

  return (
    <div css={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem', backgroundColor: '#fff', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
      {sortedData.map(([key, count]) => {
        const percentage = (count / maxCount) * 100;
        return (
          <motion.div 
            key={key} 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            css={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <span css={{ fontSize: '0.75rem', fontWeight: 600, width: '4rem', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{key}</span>
            <div css={{ flex: 1, height: '0.75rem', backgroundColor: '#f3f4f6', borderRadius: '0.25rem', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, delay: 0.1 }}
                css={{ height: '100%', backgroundColor: color, borderRadius: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '0.25rem' }}
              />
            </div>
            <span css={{ fontSize: '0.75rem', fontWeight: 700, width: '1.5rem', flexShrink: 0, textAlign: 'right' }}>{count}</span>
          </motion.div>
        );
      })}
    </div>
  );
};

// 2. Donut Chart (Used for Artist Song Breakdown - CSS-only)
const DonutChart: React.FC<{ data: Record<string, number>, color: string, total: number }> = ({ data, color, total }) => {
    const sortedData = useMemo(() => 
        Object.entries(data).sort(([, a], [, b]) => b - a).slice(0, 3), // Show top 3, group the rest
        [data]
    );

    let currentAngle = 0;
    const slices = sortedData.map(([key, count], index) => {
        const percentage = (count / total) * 100;
        const angle = (count / total) * 360;
        const slice = {
            key,
            count,
            percentage: percentage.toFixed(1),
            start: currentAngle,
            end: currentAngle + angle,
            color: index === 0 ? color : (index === 1 ? '#6366f1' : '#f97316'), 
        };
        currentAngle += angle;
        return slice;
    });

    const remaining = total - sortedData.reduce((sum, [, count]) => sum + count, 0);
    if (remaining > 0) {
        const remainingAngle = (remaining / total) * 360;
        slices.push({
            key: 'Other',
            count: remaining,
            percentage: ((remaining / total) * 100).toFixed(1),
            start: currentAngle,
            end: 360,
            color: '#d1d5db',
        });
    }

    const conics = slices.map(s => `${s.color} ${s.start}deg ${s.end}deg`).join(', ');

    return (
        <div css={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.75rem', backgroundColor: '#fff', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
            {/* Chart */}
            <div css={{ 
                width: '5rem', 
                height: '5rem', 
                borderRadius: '50%', 
                background: `conic-gradient(${conics})`,
                position: 'relative',
                boxShadow: '0 0 0 4px #e5e7eb inset',
                flexShrink: 0,
            }}>
                {/* Center Hole */}
                <div css={{ 
                    position: 'absolute', 
                    inset: '1.5rem', 
                    backgroundColor: '#fff', 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: color,
                }}>
                    {total}
                </div>
            </div>

            {/* Legend */}
            <div css={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                {slices.map((s) => (
                    <div key={s.key} css={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', fontWeight: 500 }}>
                        <span css={{ height: '0.5rem', width: '0.5rem', backgroundColor: s.color, borderRadius: '50%', marginRight: '0.5rem' }}></span>
                        <span css={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{s.key}</span>
                        <span css={{ fontWeight: 700, flexShrink: 0 }}>{s.percentage}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


// 3. Simple Stacked Bar Chart (Used for Album Breakdown)
const StackedBarChart: React.FC<{ data: Record<string, number>, color: string, maxItems?: number, total: number }> = ({ data, color, maxItems = 5, total }) => {
    const sortedData = useMemo(() => 
        Object.entries(data).sort(([, a], [, b]) => b - a).slice(0, maxItems),
        [data, maxItems]
    );
    if (sortedData.length === 0) return <div css={{ padding: '1rem', color: '#6b7280' }}>No data to display.</div>;

    let currentOffset = 0;
    const segments = sortedData.map(([key, count], index) => {
        const width = (count / total) * 100;
        const segment = {
            key,
            count,
            width,
            offset: currentOffset,
            color: index === 0 ? color : (index === 1 ? '#f97316' : '#8b5cf6'),
        };
        currentOffset += width;
        return segment;
    });

    return (
        <div css={{ padding: '0.75rem', backgroundColor: '#fff', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
            <div css={{ display: 'flex', height: '1.5rem', borderRadius: '0.5rem', overflow: 'hidden', marginBottom: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1) inset' }}>
                {segments.map((s) => (
                    <motion.div
                        key={s.key}
                        initial={{ width: 0 }}
                        animate={{ width: `${s.width}%` }}
                        transition={{ duration: 0.5, delay: s.offset / 100 }}
                        css={{ 
                            height: '100%', 
                            backgroundColor: s.color, 
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    />
                ))}
            </div>
            {/* Legend/Labels */}
            <div css={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {segments.map((s) => (
                    <div key={s.key} css={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <div css={{ display: 'flex', alignItems: 'center' }}>
                            <span css={{ height: '0.5rem', width: '0.5rem', backgroundColor: s.color, borderRadius: '50%', marginRight: '0.5rem' }}></span>
                            <span css={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.key}</span>
                        </div>
                        <span css={{ fontWeight: 700 }}>{s.count} songs</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- SongManager Component ---

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

  const handleSave = (newSong: Omit<Song, "_id">) => { 
    dispatch(addSongRequest(newSong)); 
    setShowForm(false); 
  };

  const handleUpdate = (updatedSong: Song) => { 
    dispatch(updateSongRequest(updatedSong)); 
    setEditSong(null); 
    setShowForm(false); 
  };

  const handleJumpToStats = () => statsRef.current?.scrollIntoView({ behavior: "smooth" });

  const filteredSongs = songs.filter((s) => (s[filterField] as string).toLowerCase().includes(filterText.toLowerCase()));

  // --- Data Preparation for Charts (consolidated) ---
  const totalSongs = songs.length;
  const genreCount = useMemo(() => songs.reduce((acc: Record<string, number>, s) => { acc[s.Genre] = (acc[s.Genre] || 0) + 1; return acc; }, {}), [songs]);
  const artistSongCount = useMemo(() => songs.reduce((acc: Record<string, number>, s) => { acc[s.Artist] = (acc[s.Artist] || 0) + 1; return acc; }, {}), [songs]);
  const albumSongCount = useMemo(() => songs.reduce((acc: Record<string, number>, s) => { acc[s.Album] = (acc[s.Album] || 0) + 1; return acc; }, {}), [songs]);

  const stats = useMemo(() => [
    { icon: "🎵", value: totalSongs, label: "Total Songs", color: "#8b5cf6" },
    { icon: "🎤", value: new Set(songs.map((s) => s.Artist)).size, label: "Unique Artists", color: "#ec4899" },
    { icon: "💿", value: new Set(songs.map((s) => s.Album)).size, label: "Unique Albums", color: "#facc15" },
    { icon: "🎧", value: Object.entries(genreCount).sort((a,b)=>b[1]-a[1])[0]?.[0] || "-", label: "Most Common Genre", color: "#22c55e" },
  ], [totalSongs, songs, genreCount]);
  // --- End Data Preparation ---

  const songActionBase = css({
    width: "5.5rem", 
    padding: "0.5rem 0.8rem", 
    borderRadius: "0.75rem", 
    fontWeight: 500, 
    cursor: "pointer", 
    transition: "all 0.2s", 
    border: "none", 
    outline: "none",
  });
  
  const editButtonCss = css(songActionBase, {
    backgroundColor: "#2563eb", 
    color: "#fff", 
    "&:hover":{ backgroundColor:"#1d4ed8" }
  });
  
  const deleteButtonCss = css(songActionBase, {
    backgroundColor: "#dc2626", 
    color: "#fff", 
    "&:hover":{ backgroundColor:"#b91c1c" }
  });

  return (
    <div css={{ maxWidth: "72rem", margin: "0 auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <header css={css(cardBase, { 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        padding: "1.5rem", 
        backgroundColor: "#f9fafb", 
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      })}>
        <div css={{ position: "absolute", top: 0, left: 0, width: "100%", height: "0.25rem", borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem", background: "linear-gradient(to right, #8b5cf6, #6366f1)" }} />
        <h1 css={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "1.5rem", fontWeight: 700, color: "#000", marginRight: "1rem" }}>
          <span css={{ fontSize: "2rem", color: "#8b5cf6" }}>🎵</span> Music Catalog Manager
        </h1>
        <div css={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", flexShrink: 0 }}>
          <button onClick={handleAddNew} css={primaryButton}>
            {showForm ? "Close Form" : "+ Add New Song"}
          </button>
          <button onClick={handleJumpToStats} css={secondaryButton}>
            📊 Statistics
          </button>
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

      {/* Filter */}
      <div css={css(cardBase, { display:"flex", gap:"0.75rem", padding:"1rem", backgroundColor:"#f9fafb" })}>
        <label css={{ display:"flex", alignItems:"center", gap:"0.5rem", fontWeight:600, color:"#000" }}>Filter by:
          <select value={filterField} onChange={e=>setFilterField(e.target.value as any)} css={{ borderRadius:"0.5rem", padding:"0.25rem 0.5rem", border:"1px solid #d1d5db" }}>
            {["Title", "Artist", "Album", "Genre"].map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </label>
        <input type="text" placeholder="Search songs..." value={filterText} onChange={e=>setFilterText(e.target.value)} css={{ flex:1, borderRadius:"0.5rem", padding:"0.5rem", border:"1px solid #d1d5db", outline:"none", boxShadow:"inset 0 1px 2px rgba(0,0,0,0.05)" }} />
      </div>

      {/* Song List */}
      <div css={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
        {filteredSongs.map((song, index) => (
          <div key={song._id} css={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"1rem", borderRadius:"1rem", backgroundColor:index%2===0?"#f9fafb":"#f3f4f6", boxShadow:"0 1px 2px rgba(0,0,0,0.05)" }}>
            <div css={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:"1rem", flex:1 }}>
              {["Title","Artist","Album","Genre"].map(field => (
                <div key={field}>
                  <div css={{ fontSize:"0.625rem", fontWeight:700, textTransform:"uppercase", color:"rgba(0,0,0,0.7)" }}>{field}</div>
                  <div css={{ fontWeight:500 }}>{song[field as keyof Song]}</div>
                </div>
              ))}
            </div>
            <div css={{ display:"flex", gap:"0.5rem", flexShrink:0 }}>
              <button onClick={() => handleEdit(song)} css={editButtonCss}>Edit</button>
              <button onClick={() => setDeleteSongId(song._id??null)} css={deleteButtonCss}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Main Statistics */}
      <div ref={statsRef} css={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:"0.75rem", marginTop:"1.5rem" }}>
        {stats.map(({icon,value,label,color}) => (
          <motion.div 
            key={label} 
            whileHover={{scale:1.05}} 
            css={css(cardBase, { 
              backgroundColor:`${color}20`, 
              border:`1px solid ${color}`, 
              display:"flex", 
              flexDirection:"column", 
              alignItems:"center", 
              textAlign:"center",
              overflow: "hidden" 
            })}
          >
            <div css={{ position:"absolute", top:0, left:0, width:"100%", height:"0.25rem", borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem", background:color }} />
            <div css={{ fontSize:"1.5rem", marginBottom:"0.25rem" }}>{icon}</div>
            <div css={{ fontSize:"1.25rem", fontWeight:700, color:"#000" }}>{value}</div>
            <div css={{ fontSize:"0.875rem", fontWeight:600, color:"#000" }}>{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Toggle Detailed Stats */}
      <div css={{ display:"flex", justifyContent:"center", marginTop:"1rem" }}>
        <button onClick={()=>setShowDetailStats(!showDetailStats)} css={css(secondaryButton, { borderRadius:"9999px" })}>
          {showDetailStats ? "Hide Detailed Statistics" : "View Detailed Statistics"}
        </button>
      </div>

      {/* Detailed Statistics - Charts */}
      <AnimatePresence>
        {showDetailStats && (
          <motion.section initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:20}} transition={{duration:0.3}} css={{ marginTop:"1.5rem", display:"flex", flexDirection:"column", gap:"1.5rem" }}>
            <h2 css={{ fontSize:"1.25rem", fontWeight:700, color:"#000", marginBottom:"0.5rem" }}>Detailed Breakdown 📈</h2>
            
            {/* Genre Counts - Bar Chart */}
            <div>
              <h3 css={{ fontSize:"1rem", fontWeight:600, borderBottom:"1px solid #d1d5db", paddingBottom:"0.25rem", marginBottom: "0.5rem", color:"#22c55e" }}>Top Genres by Song Count</h3>
              <BarChart data={genreCount} color="#22c55e" maxItems={5} />
            </div>

            {/* Artist Breakdown - Donut Chart */}
            <div>
              <h3 css={{ fontSize:"1rem", fontWeight:600, borderBottom:"1px solid #d1d5db", paddingBottom:"0.25rem", marginBottom: "0.5rem", color:"#ec4899" }}>Artist Song Distribution (Top 3)</h3>
              <DonutChart data={artistSongCount} color="#ec4899" total={totalSongs} />
            </div>

            {/* Album Breakdown - Stacked Bar Chart */}
            <div>
              <h3 css={{ fontSize:"1rem", fontWeight:600, borderBottom:"1px solid #d1d5db", paddingBottom:"0.25rem", marginBottom: "0.5rem", color:"#facc15" }}>Album Song Comparison (Top 5)</h3>
              <StackedBarChart data={albumSongCount} color="#facc15" total={totalSongs} maxItems={5} />
            </div>
            
          </motion.section>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      {deleteSongId && (
        <div css={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50 }}>
          <div css={{ backgroundColor:"#fff", padding:"1.5rem", borderRadius:"1rem", boxShadow:"0 6px 12px rgba(0,0,0,0.2)", width:"20rem" }}>
            <p css={{ marginBottom:"1rem", color:"#000", fontWeight:500 }}>Are you sure you want to delete this song?</p>
            <div css={{ display:"flex", justifyContent:"space-between", gap:"0.5rem" }}>
              <button 
                onClick={()=>{dispatch(deleteSongRequest(deleteSongId)); setDeleteSongId(null);}} 
                css={{ flex:1, padding:"0.5rem", backgroundColor:"#dc2626", color:"#fff", borderRadius:"0.75rem", fontWeight:500, cursor:"pointer", border:"none", "&:hover":{ backgroundColor:"#b91c1c" } }}
              >
                Yes
              </button>
              <button 
                onClick={()=>setDeleteSongId(null)} 
                css={{ flex:1, padding:"0.5rem", backgroundColor:"#e5e7eb", color:"#000", borderRadius:"0.75rem", fontWeight:500, cursor:"pointer", border:"none", "&:hover":{ backgroundColor:"#d1d5db" } }}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default SongManager;