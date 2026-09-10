import React, { useState } from 'react';

const UploadSongModal = ({ isOpen, onClose, onUpload }) => {
  const [form, setForm] = useState({
    name: '',
    desc: '',
    album: '',
    lyrics: '',
    audio: null,
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onUpload(form);
      onClose();
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl shadow-lg p-8 w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold"
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-white text-center">Upload New Song</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white mb-1">Song Name</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-700 bg-gray-800 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter song name"
            />
          </div>
          <div>
            <label htmlFor="desc" className="block text-sm font-medium text-white mb-1">Description</label>
            <input
              id="desc"
              name="desc"
              type="text"
              required
              value={form.desc}
              onChange={handleChange}
              className="w-full border border-gray-700 bg-gray-800 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Short description"
            />
          </div>
          <div>
            <label htmlFor="album" className="block text-sm font-medium text-white mb-1">Album</label>
            <input
              id="album"
              name="album"
              type="text"
              required
              value={form.album}
              onChange={handleChange}
              className="w-full border border-gray-700 bg-gray-800 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Album name"
            />
          </div>
          <div>
            <label htmlFor="lyrics" className="block text-sm font-medium text-white mb-1">Lyrics (optional)</label>
            <textarea
              id="lyrics"
              name="lyrics"
              value={form.lyrics}
              onChange={handleChange}
              className="w-full border border-gray-700 bg-gray-800 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Paste lyrics here"
              rows={3}
            />
          </div>
          <div>
            <label htmlFor="audio" className="block text-sm font-medium text-white mb-1">Audio File</label>
            <input
              id="audio"
              name="audio"
              type="file"
              accept="audio/*"
              required
              onChange={handleChange}
              className="w-full border border-gray-700 bg-gray-800 text-white px-3 py-2 rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-green-500 file:text-black"
            />
          </div>
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-white mb-1">Cover Image</label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              required
              onChange={handleChange}
              className="w-full border border-gray-700 bg-gray-800 text-white px-3 py-2 rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-green-500 file:text-black"
            />
          </div>
          {error && <div className="text-red-500 text-center">{error}</div>}
          <div className="flex gap-3 mt-4 justify-center">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-full bg-green-500 text-black font-semibold hover:bg-green-400 transition"
            >
              {loading ? 'Uploading...' : 'Upload'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-full bg-gray-700 text-white font-semibold hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadSongModal;