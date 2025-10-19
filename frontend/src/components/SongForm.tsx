import React, { useState, useEffect } from "react";

// REDUX IMPORTS REMOVED TO PREVENT COMPILATION ERRORS in isolated environment
// import { useDispatch } from "react-redux";
// import { AppDispatch } from "../redux/store";
// import { addSongRequest } from "../redux/songs/songsSlice";

// Mock types for the environment where external dependencies are not available
type Song = {
  _id?: string;
  Title: string;
  Artist: string;
  Album: string;
  Genre: string;
};
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

interface SongFormProps {
  songToEdit?: Song;
  onUpdate?: (updatedSong: Song) => void;
  // New prop to handle both Add and Update actions locally for compilation
  onSave: (newSong: Omit<Song, "_id">) => void;
  onClose?: () => void;
}

const SongForm: React.FC<SongFormProps> = ({ songToEdit, onUpdate, onClose, onSave }) => {
  // const dispatch = useDispatch<AppDispatch>(); // Redux dispatch removed

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
    }
  }, [songToEdit]);

  // Validation logic remains pure JavaScript, independent of styling
  const validateField = (name: string, value: string) => {
    let error = "";
    if (!value.trim()) {
      error = `${name} is required`;
    } else if (
      (name === "Title" || name === "Artist") &&
      /[^a-zA-Z\s]/.test(value)
    ) {
      error = `${name} can only contain letters and spaces`;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error === "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSong((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const isValid =
      validateField("Title", song.Title) &&
      validateField("Artist", song.Artist) &&
      validateField("Album", song.Album) &&
      validateField("Genre", song.Genre);

    if (!isValid) return;

    if (songToEdit && onUpdate) {
      onUpdate({ ...songToEdit, ...song });
    } else {
      // dispatch(addSongRequest(song as Song)); // Replaced with local prop call
      onSave(song);
    }

    setSong({ Title: "", Artist: "", Album: "", Genre: "" });
    onClose?.();
  };

  // Helper function to build the input class string using Tailwind
  const getInputClass = (name: keyof Omit<Song, '_id'>) => {
    const base =
      "w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-150 shadow-sm text-gray-800";
    const errorClasses = "border-red-500 focus:ring-red-200";
    const defaultClasses = "border-gray-300 focus:ring-blue-300";

    return `${base} ${errors[name] ? errorClasses : defaultClasses}`;
  };

  return (
    // Replaced <Form> with a responsive, shadowed Tailwind form
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 shadow-xl rounded-xl space-y-4 max-w-lg mx-auto border border-gray-200"
    >
      <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
        {songToEdit ? "Edit Song" : "Add New Song"}
      </h2>

      {/* Input Group: Title */}
      <div>
        <input
          type="text"
          name="Title"
          placeholder="Title"
          value={song.Title}
          onChange={handleChange}
          className={getInputClass('Title')}
        />
        {errors.Title && (
          // Replaced <ErrorText> with Tailwind classes
          <p className="text-red-500 text-sm mt-1 font-medium">{errors.Title}</p>
        )}
      </div>

      {/* Input Group: Artist */}
      <div>
        <input
          type="text"
          name="Artist"
          placeholder="Artist"
          value={song.Artist}
          onChange={handleChange}
          className={getInputClass('Artist')}
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
          placeholder="Album"
          value={song.Album}
          onChange={handleChange}
          className={getInputClass('Album')}
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
          placeholder="Genre"
          value={song.Genre}
          onChange={handleChange}
          className={getInputClass('Genre')}
        />
        {errors.Genre && (
          <p className="text-red-500 text-sm mt-1 font-medium">{errors.Genre}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        // Replaced <Button> with Tailwind classes
        className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition duration-200 shadow-lg mt-4"
      >
        {songToEdit ? "Update Song" : "Add Song"}
      </button>

      {/* Optional Close Button (styled with secondary colors) */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="w-full bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-400 transition duration-200 mt-2 shadow-md"
        >
          Cancel
        </button>
      )}
    </form>
  );
};

export default SongForm;
