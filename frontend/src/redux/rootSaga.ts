import { all, takeEvery, put, call } from "redux-saga/effects";
import axios, { AxiosResponse } from "axios";
import { Song } from "../types/song";
import {
  fetchSongsRequest,
  fetchSongsSuccess,
  addSongRequest,
  addSongSuccess,
  deleteSongRequest,
  deleteSongSuccess,
  updateSongRequest,
  updateSongSuccess,
} from "./songs/songsSlice";

const API_URL = "http://localhost:5000/songs";

// Type helper for generator
type SagaReturnType<T> = Generator<any, T, any>;

// Fetch songs
function* fetchSongsSaga(): SagaReturnType<void> {
  const response: AxiosResponse<Song[]> = yield call(() => axios.get<Song[]>(API_URL));
  yield put(fetchSongsSuccess(response.data));
}

// Add song
function* addSongSaga(action: ReturnType<typeof addSongRequest>): SagaReturnType<void> {
  const response: AxiosResponse<Song> = yield call(() => axios.post<Song>(API_URL, action.payload));
  yield put(addSongSuccess(response.data));
}

// Delete song
function* deleteSongSaga(action: ReturnType<typeof deleteSongRequest>): SagaReturnType<void> {
  yield call(() => axios.delete(`${API_URL}/${action.payload}`));
  yield put(deleteSongSuccess(action.payload));
}

// Update song
function* updateSongSaga(action: ReturnType<typeof updateSongRequest>): SagaReturnType<void> {
  const response: AxiosResponse<Song> = yield call(() =>
    axios.put<Song>(`${API_URL}/${action.payload._id}`, action.payload)
  );
  yield put(updateSongSuccess(response.data));
}

// Root saga
export default function* rootSaga(): SagaReturnType<void> {
  yield all([
    takeEvery(fetchSongsRequest.type, fetchSongsSaga),
    takeEvery(addSongRequest.type, addSongSaga),
    takeEvery(deleteSongRequest.type, deleteSongSaga),
    takeEvery(updateSongRequest.type, updateSongSaga),
  ]);
}
