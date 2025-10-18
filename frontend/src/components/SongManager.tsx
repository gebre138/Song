/** @jsxImportSource @emotion/react */
import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import {
  fetchSongsRequest,
  deleteSongRequest,
  updateSongRequest,
} from "../redux/songs/songsSlice";
import { Song } from "../types/song";
import SongForm from "./SongForm";
import {
  Container,
  Header,
  Title,
  AddButton,
  ListContainer,
  SongCard,
  SongInfo,
  SongLabel,
  SongField,
  SongFieldWrapper,
  Button, // keep for edit/delete
  StatsContainer,
  StatCard,
  StatNumber,
  StatLabel,
  StatIconCircle, // Imported component
  ModalOverlay,
  ModalContent,
  ModalButtons,
  ModalButtonConfirm,
  ModalButtonCancel,
  ToggleButton, // use this for toggle
} from "./styles2";

const SongManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const songs = useSelector((state: RootState) => state.songs.songs);

  // Form & Modal States
  const [showForm, setShowForm] = useState(false);
  const [editSong, setEditSong] = useState<Song | null>(null);
  const [deleteSongId, setDeleteSongId] = useState<string | null>(null);

  // Filter States
  const [filterText, setFilterText] = useState("");
  const [filterField, setFilterField] = useState<"Title" | "Artist" | "Album" | "Genre">("Title");

  // Detail stats toggle
  const [showDetailStats, setShowDetailStats] = useState(false);

  // Fetch songs on mount
  useEffect(() => {
    dispatch(fetchSongsRequest());
  }, [dispatch]);

  const handleEdit = (song: Song) => {
    setEditSong(song);
    setShowForm(true);
  };

  const handleUpdate = (updatedSong: Song) => {
    dispatch(updateSongRequest(updatedSong));
    setEditSong(null);
    setShowForm(false);
  };

  const handleAddNew = () => {
    setEditSong(null);
    setShowForm(!showForm);
  };

  // Filtered songs
  const filteredSongs = songs.filter((song) => {
    const value = song[filterField] as string;
    return value.toLowerCase().includes(filterText.toLowerCase());
  });

  // Statistics
  const totalSongs = songs.length;
  const uniqueArtists = Array.from(new Set(songs.map((s) => s.Artist))).length;
  const uniqueAlbums = Array.from(new Set(songs.map((s) => s.Album))).length;

  // Genre count
  const genreCount: Record<string, number> = {};
  songs.forEach((s) => {
    genreCount[s.Genre] = (genreCount[s.Genre] || 0) + 1;
  });
  const mostCommonGenre = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

  // Artist stats
  const artistStats: Record<string, { songs: number; albums: Set<string> }> = {};
  songs.forEach((s) => {
    if (!artistStats[s.Artist]) artistStats[s.Artist] = { songs: 0, albums: new Set() };
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
  songs.forEach((s) => {
    albumStats[s.Album] = (albumStats[s.Album] || 0) + 1;
  });

  return (
    <Container>
      {/* Header */}
      <Header>
        <Title>🎵 Registered Songs</Title>
        <AddButton onClick={handleAddNew}>
          {showForm ? "❌ Close" : "➕ Add New Song"}
        </AddButton>
      </Header>

      {/* Song Form */}
      <AnimatePresence>
        {showForm && (
          <SongForm
            songToEdit={editSong || undefined}
            onUpdate={handleUpdate}
            onClose={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>

      {/* Filter */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px", alignItems: "center" }}>
        <label>
          Filter by:
          <select
            value={filterField}
            onChange={(e) => setFilterField(e.target.value as any)}
            style={{ marginLeft: "6px", padding: "4px 8px", borderRadius: "4px" }}
          >
            <option value="Title">Title</option>
            <option value="Artist">Artist</option>
            <option value="Album">Album</option>
            <option value="Genre">Genre</option>
          </select>
        </label>

        <input
          type="text"
          placeholder={`Search ${filterField}...`}
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "14px",
          }}
        />
      </div>

      {/* Song List */}
      <ListContainer>
        {filteredSongs.length === 0 && <p>No songs found.</p>}
        {filteredSongs.map((song: Song) => (
          <SongCard
            key={song._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <SongInfo>
              <SongFieldWrapper>
                <SongLabel>🎵 Title:</SongLabel>
                <SongField>{song.Title}</SongField>
              </SongFieldWrapper>
              <SongFieldWrapper>
                <SongLabel>👤 Artist:</SongLabel>
                <SongField>{song.Artist}</SongField>
              </SongFieldWrapper>
              <SongFieldWrapper>
                <SongLabel>💿 Album:</SongLabel>
                <SongField>{song.Album}</SongField>
              </SongFieldWrapper>
              <SongFieldWrapper>
                <SongLabel>🎧 Genre:</SongLabel>
                <SongField>{song.Genre}</SongField>
              </SongFieldWrapper>
            </SongInfo>

            <div>
              <Button className="edit" onClick={() => handleEdit(song)}>Edit</Button>
              <Button className="delete" onClick={() => setDeleteSongId(song._id)}>Remove</Button>
            </div>
          </SongCard>
        ))}
      </ListContainer>

      {/* Summary Stats */}
      <StatsContainer>
        <StatCard>
          <StatIconCircle>🎵</StatIconCircle>
          <StatNumber>{totalSongs}</StatNumber>
          <StatLabel>Total Songs</StatLabel>
        </StatCard>
        <StatCard>
          <StatIconCircle>🎤</StatIconCircle>
          <StatNumber>{uniqueArtists}</StatNumber>
          <StatLabel>Unique Artists</StatLabel>
        </StatCard>
        <StatCard>
          <StatIconCircle>💿</StatIconCircle>
          <StatNumber>{uniqueAlbums}</StatNumber>
          <StatLabel>Unique Albums</StatLabel>
        </StatCard>
        <StatCard>
          <StatIconCircle>🎧</StatIconCircle>
          <StatNumber>{mostCommonGenre}</StatNumber>
          <StatLabel>Most Common Genre</StatLabel>
        </StatCard>
      </StatsContainer>

      {/* Toggle Button */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
        <ToggleButton onClick={() => setShowDetailStats(!showDetailStats)}>
          {showDetailStats ? "Hide Detailed Music Statistics" : "Show Detailed Music Statistics"}
        </ToggleButton>
      </div>

      {/* Detailed Stats */}
      {showDetailStats && (
        <StatsContainer style={{ marginTop: "16px", maxHeight: "400px", overflowY: "auto" }}>
          {/* Songs per genre */}
          {Object.entries(genreCount).map(([genre, count]) => (
            <StatCard key={genre}>
              {/* Removed StatIconCircle here for a simpler look */}
              <StatNumber>{count}</StatNumber>
              <StatLabel>{genre} Songs</StatLabel>
            </StatCard>
          ))}

          {/* Songs & albums per artist */}
          {artistStatsCount.map(({ artist, songs, albums }) => (
            <StatCard key={artist}>
              <StatNumber>{songs}</StatNumber>
              <StatLabel>{artist} Songs / {albums} Albums</StatLabel>
            </StatCard>
          ))}

          {/* Songs per album */}
          {Object.entries(albumStats).map(([album, count]) => (
            <StatCard key={album}>
              <StatNumber>{count}</StatNumber>
              <StatLabel>{album} Songs</StatLabel>
            </StatCard>
          ))}
        </StatsContainer>
      )}

      {/* Delete Modal */}
      {deleteSongId && (
        <ModalOverlay>
          <ModalContent>
            <p>Are you sure you want to delete this song?</p>
            <ModalButtons>
              <ModalButtonConfirm
                onClick={() => {
                  dispatch(deleteSongRequest(deleteSongId));
                  setDeleteSongId(null);
                }}
              >
                Yes
              </ModalButtonConfirm>
              <ModalButtonCancel onClick={() => setDeleteSongId(null)}>No</ModalButtonCancel>
            </ModalButtons>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default SongManager;