import React, { useState, useEffect } from "react";
import { Song } from "../types/song";
import '../index.css';

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
    if (!fields.every(f => validateField(f, song[f]))) return;
    songToEdit ? onUpdate?.({ ...songToEdit, ...song }) : onSave?.(song);
    setSong({ Title: "", Artist: "", Album: "", Genre: "" });
    onClose?.();
  };

  const getInputClass = (name: keyof Omit<Song, "_id">) =>
    `w-full p-3 rounded-lg shadow-sm text-gray-800 border ${errors[name] ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-300"} focus:outline-none focus:ring-2 transition`;

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-xl rounded-xl space-y-4 max-w-lg mx-auto border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">{songToEdit ? "Edit Song" : "Add New Song"}</h2>

      {fields.map(f => (
        <div key={f}>
          <input
            type="text"
            name={f}
            placeholder={f}
            value={song[f]}
            onChange={handleChange}
            className={getInputClass(f)}
          />
          {errors[f] && <p className="text-red-500 text-sm mt-1 font-medium">{errors[f]}</p>}
        </div>
      ))}

      <div className="flex justify-center gap-4 mt-4">
        <button type="submit" className="w-1/2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-lg">
          {songToEdit ? "Update Song" : "Add Song"}
        </button>
        {onClose && (
          <button type="button" onClick={onClose} className="w-1/2 px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition shadow-md">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default SongForm;
