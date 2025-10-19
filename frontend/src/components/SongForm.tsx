/** @jsxImportSource @emotion/react */
import React, { useState, useEffect } from "react";
import { Form, Input, ErrorText, Button } from "./styles";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../redux/store";
import { addSongRequest } from "../redux/songs/songsSlice";
import { Song } from "../types/song";

interface SongFormProps {
  songToEdit?: Song;
  onUpdate?: (updatedSong: Song) => void;
  onClose?: () => void;
}

const SongForm: React.FC<SongFormProps> = ({ songToEdit, onUpdate, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();

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

  const validateField = (name: string, value: string) => {
    let error = "";
    if (!value.trim()) {
      error = `${name} is required`;
    } else if ((name === "Title" || name === "Artist") && /[^a-zA-Z\s]/.test(value)) {
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
      dispatch(addSongRequest(song as Song)); // backend assigns _id
    }

    setSong({ Title: "", Artist: "", Album: "", Genre: "" });
    onClose?.();
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div>
        <Input
          type="text"
          name="Title"
          placeholder="Title"
          value={song.Title}
          onChange={handleChange}
          hasError={!!errors.Title}
        />
        {errors.Title && <ErrorText>{errors.Title}</ErrorText>}
      </div>
      <div>
        <Input
          type="text"
          name="Artist"
          placeholder="Artist"
          value={song.Artist}
          onChange={handleChange}
          hasError={!!errors.Artist}
        />
        {errors.Artist && <ErrorText>{errors.Artist}</ErrorText>}
      </div>
      <div>
        <Input
          type="text"
          name="Album"
          placeholder="Album"
          value={song.Album}
          onChange={handleChange}
          hasError={!!errors.Album}
        />
        {errors.Album && <ErrorText>{errors.Album}</ErrorText>}
      </div>
      <div>
        <Input
          type="text"
          name="Genre"
          placeholder="Genre"
          value={song.Genre}
          onChange={handleChange}
          hasError={!!errors.Genre}
        />
        {errors.Genre && <ErrorText>{errors.Genre}</ErrorText>}
      </div>
      <Button type="submit">{songToEdit ? "Update Song" : "Add Song"}</Button>
    </Form>
  );
};

export default SongForm;
