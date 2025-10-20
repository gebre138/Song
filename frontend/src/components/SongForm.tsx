/** @jsxImportSource @emotion/react */
import React, { useState, useEffect } from "react";
import { Song } from "../types/song";

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

interface SongFormProps {
  songToEdit?: Song;
  onUpdate?: (updatedSong: Song) => void;
  onSave?: (newSong: Omit<Song, "_id">) => void;
  onClose?: () => void;
}

const fields: (keyof Omit<Song, "_id">)[] = ["Title", "Artist", "Album", "Genre"];

const SongForm: React.FC<SongFormProps> = ({ songToEdit, onUpdate, onSave, onClose }) => {
  const [song, setSong] = useState<Omit<Song, "_id">>({ Title: "", Artist: "", Album: "", Genre: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (songToEdit) setSong({ ...songToEdit });
  }, [songToEdit]);

  const validateField = (name: string, value: string) => {
    let error = "";
    if (!value.trim()) error = `${name} is required`;
    else if ((name === "Title" || name === "Artist") && /[^a-zA-Z\s]/.test(value))
      error = `${name} can only contain letters and spaces`;
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSong(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate all fields before submitting
    if (!fields.every(f => validateField(f, song[f]))) return;
    
    // Perform save or update action
    songToEdit ? onUpdate?.({ ...songToEdit, ...song }) : onSave?.(song);
    
    // Reset state and close form
    setSong({ Title: "", Artist: "", Album: "", Genre: "" });
    onClose?.();
  };

  return (
    <form
      onSubmit={handleSubmit}
      css={{
        backgroundColor: "#fff",
        padding: "1.5rem",
        borderRadius: "1rem",
        boxShadow: "0 10px 15px rgba(0,0,0,0.1)",
        maxWidth: "32rem",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
      }}
    >
      <h2
        css={{
          fontSize: "1.25rem",
          fontWeight: 700,
          color: "#1f2937",
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        {songToEdit ? "Edit Song" : "Add New Song"}
      </h2>

      {fields.map(f => (
        <div key={f}>
          <input
            type="text"
            name={f}
            placeholder={f}
            value={song[f]}
            onChange={handleChange}
            css={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              border: errors[f] ? "1px solid #ef4444" : "1px solid #d1d5db",
              outline: "none",
              fontSize: "1rem",
              boxShadow: errors[f] ? "0 0 0 3px rgba(248,113,113,0.3)" : "none",
              transition: "all 0.2s",
              "&:focus": {
                // Keep focus ring for input fields
                boxShadow: errors[f] ? "0 0 0 3px rgba(248,113,113,0.3)" : "0 0 0 3px rgba(59,130,246,0.3)",
                borderColor: errors[f] ? "#ef4444" : "#3b82f6",
              },
            }}
          />
          {errors[f] && (
            <p css={{ color: "#ef4444", fontSize: "0.875rem", marginTop: "0.25rem" }}>{errors[f]}</p>
          )}
        </div>
      ))}

      <div css={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        {/* Submit Button */}
        <button
          type="submit"
          css={{
            flex: 1,
            padding: "0.75rem",
            borderRadius: "0.5rem",
            fontWeight: 600,
            backgroundColor: "#2563eb",
            color: "#fff",
            cursor: "pointer",
            transition: "all 0.2s",
            // Removed default border/outline
            border: "none", 
            outline: "none",
            "&:hover": { backgroundColor: "#1d4ed8" },
          }}
        >
          {songToEdit ? "Update Song" : "Add Song"}
        </button>

        {/* Cancel Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            css={{
              flex: 1,
              padding: "0.75rem",
              borderRadius: "0.5rem",
              fontWeight: 600,
              backgroundColor: "#d1d5db",
              color: "#374151",
              cursor: "pointer",
              transition: "all 0.2s",
              // Removed default border/outline
              border: "none", 
              outline: "none",
              "&:hover": { backgroundColor: "#9ca3af" },
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default SongForm;