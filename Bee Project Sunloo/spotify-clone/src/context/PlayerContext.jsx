import React, { createContext, useCallback, useEffect, useRef, useState } from "react";
import { songsData as fallbackSongs } from "../assets/assets";
import { API_URL } from "../config/api";
import useLiveSongs from "../hooks/useLiveSongs";
import pubsub from "../utils/pubsub";

export const PlayerContext = createContext();

const PlayerContextProvider = (props) => {

  const audioRef = useRef();
  const seekBg = useRef();
  const seekBar = useRef();

  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [track, setTrack] = useState(null);
  const [playStatus, setPlayStatus] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLoop, setIsLoop] = useState(false);
  const [volume, setVolume] = useState(1); // 0 to 1
  const [showQueue, setShowQueue] = useState(false);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);
  const [lyrics, setLyrics] = useState("");
  const [lyricsStatus, setLyricsStatus] = useState("idle"); // idle | loading | error | empty | loaded | unavailable
  const [time, setTime] = useState({
    currentTime: {
      second: 0,
      minute: 0
    },
    totalTime: {
      second: 0,
      minute: 0
    }
  })
  const lyricsAbortRef = useRef(null);
  const [showLyricsPane, setShowLyricsPane] = useState(false);
  const [selectedSongDetail, setSelectedSongDetail] = useState(null);
  const [authToken, setAuthToken] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''));
  const fetchLyrics = useCallback(async (songId, fallbackLyrics = "") => {
    if (lyricsAbortRef.current) {
      lyricsAbortRef.current.abort();
    }

    if (!songId && !fallbackLyrics) {
      setLyrics("");
      setLyricsStatus("unavailable");
      return;
    }

    if (!songId && fallbackLyrics) {
      setLyrics(fallbackLyrics);
      setLyricsStatus("loaded");
      return;
    }

    const controller = new AbortController();
    lyricsAbortRef.current = controller;
    setLyricsStatus("loading");

    try {
      const res = await fetch(`${API_URL}/api/song/${songId}/lyrics`, {
        signal: controller.signal
      });

      if (!res.ok) {
        throw new Error("Failed to load lyrics");
      }

      const data = await res.json();
      if (controller.signal.aborted) return;

      const text = data?.lyrics || "";
      setLyrics(text);
      setLyricsStatus(text ? "loaded" : "empty");
    } catch (error) {
      if (controller.signal.aborted) return;
      setLyrics("");
      setLyricsStatus("error");
    }
  }, []);

  // Keep auth token in sync across components (login/logout)
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const syncToken = (value) => {
      setAuthToken(value ?? localStorage.getItem('token') ?? '');
    };
    const handleAuthEvent = (event) => {
      if (event?.detail && Object.prototype.hasOwnProperty.call(event.detail, 'token')) {
        syncToken(event.detail.token || '');
      } else {
        syncToken();
      }
    };
    const handleStorage = () => syncToken();
    window.addEventListener('auth-token-changed', handleAuthEvent);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('auth-token-changed', handleAuthEvent);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const handleLiveSong = useCallback((incomingSong) => {
    if (!incomingSong) return;
    const normalizedId = incomingSong._id || incomingSong.id;
    if (!normalizedId) return;
    const normalizedSong = { ...incomingSong, _id: normalizedId };
    let added = false;
    setSongs((prev = []) => {
      const list = Array.isArray(prev) ? prev : [];
      const exists = list.some(song => (song?._id || song?.id) === normalizedId);
      if (exists) {
        return list.map(song => ((song?._id || song?.id) === normalizedId ? { ...song, ...normalizedSong } : song));
      }
      added = true;
      return [...list, normalizedSong];
    });
    if (added) {
      setTrack((current) => current || normalizedSong);
    }
  }, []);

  useLiveSongs(authToken, handleLiveSong);

  useEffect(() => {
    if (!track) return;
    pubsub.publish('now-playing', {
      song: track.name || track.title || "Unknown Song",
      artist: track.artist || track.album || track.desc || "Unknown Artist"
    });
  }, [track]);

  // Fetch songs and albums from backend once on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch songs
        const songsResponse = await fetch(`${API_URL}/api/song/list`);
        const songsData = await songsResponse.json();
        const fetchedSongs = Array.isArray(songsData?.songs) ? songsData.songs : [];
        
        // Fetch albums
        const albumsResponse = await fetch(`${API_URL}/api/album/list`);
        const albumsData = await albumsResponse.json();
        const fetchedAlbums = Array.isArray(albumsData?.albums) ? albumsData.albums : [];
        
        if (fetchedSongs.length > 0) {
          setSongs(fetchedSongs);
          setCurrentIndex(0);
          setTrack(fetchedSongs[0]);
        } else {
          setSongs(fallbackSongs);
          setCurrentIndex(0);
          setTrack(fallbackSongs[0]);
        }
        
        setAlbums(fetchedAlbums);
      } catch (error) {
        // Fallback to local demo data if backend is unavailable
        setSongs(fallbackSongs);
        setCurrentIndex(0);
        setTrack(fallbackSongs[0]);
        setAlbums([]);
      }
    };
    fetchData();
  }, []);
  useEffect(() => {
    const songId = track?._id;
    const fallbackLyrics = track?.lyrics;

    if (!track) {
      setLyrics("");
      setLyricsStatus("idle");
      return;
    }

    fetchLyrics(songId, fallbackLyrics);

    return () => {
      if (lyricsAbortRef.current) {
        lyricsAbortRef.current.abort();
      }
    };
  }, [track, fetchLyrics]);

  // Record plays for leaderboard tracking
  useEffect(() => {
    const songId = track?._id;
    if (!songId) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const controller = new AbortController();
    const recordPlay = async () => {
      try {
        await fetch(`${API_URL}/api/stats/play`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ songId }),
          signal: controller.signal,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.warn('Failed to record play event', error);
        }
      }
    };

    recordPlay();
    return () => controller.abort();
  }, [track?._id]);

  const play = () => {
    if (!audioRef.current) return;
    audioRef.current.play();
    setPlayStatus(true)
  }

  const pause = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setPlayStatus(false);
  }

  const playWithId = async (index) => {
    if (index < 0 || index >= songs.length) return;
    setCurrentIndex(index);
    const nextTrack = songs[index];
    setTrack(nextTrack);
    // Allow state to update then play
    setTimeout(() => {
      audioRef.current?.play();
      setPlayStatus(true);
    }, 0);
  }


  const next = async () => {
    if (songs.length === 0) return;
    
    let newIndex;
    if (isShuffle) {
      // Random song, but not the same as current
      do {
        newIndex = Math.floor(Math.random() * songs.length);
      } while (newIndex === currentIndex && songs.length > 1);
    } else {
      if (currentIndex < songs.length - 1) {
        newIndex = currentIndex + 1;
      } else if (isLoop) {
        // Loop back to start
        newIndex = 0;
      } else {
        return; // End of playlist
      }
    }
    
    setCurrentIndex(newIndex);
    setTrack(songs[newIndex]);
    setTimeout(() => {
      audioRef.current?.play();
      setPlayStatus(true);
    }, 0);
  }
  
  const previous = async () => {
    if (songs.length === 0) return;
    
    let newIndex;
    if (isShuffle) {
      // Random song, but not the same as current
      do {
        newIndex = Math.floor(Math.random() * songs.length);
      } while (newIndex === currentIndex && songs.length > 1);
    } else {
      if (currentIndex > 0) {
        newIndex = currentIndex - 1;
      } else if (isLoop) {
        // Loop to end
        newIndex = songs.length - 1;
      } else {
        return; // Beginning of playlist
      }
    }
    
    setCurrentIndex(newIndex);
    setTrack(songs[newIndex]);
    setTimeout(() => {
      audioRef.current?.play();
      setPlayStatus(true);
    }, 0);
  }

  const seekSong = async (e) => {
    if (!audioRef.current || !seekBg.current) return;
    audioRef.current.currentTime = ((e.nativeEvent.offsetX / seekBg.current.offsetWidth) * audioRef.current.duration)
  }

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume])

  // Handle loop functionality
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLoop;
    }
  }, [isLoop])

  // Handle end of track - auto play next or loop
  useEffect(() => {
    if (!audioRef.current) return;
    
    const handleEnded = () => {
      if (isLoop && !isShuffle) {
        // If loop is on (and not shuffle), restart current song
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      } else if (songs.length > 0) {
        // Otherwise play next (which handles shuffle/loop logic)
        let newIndex;
        if (isShuffle) {
          do {
            newIndex = Math.floor(Math.random() * songs.length);
          } while (newIndex === currentIndex && songs.length > 1);
        } else {
          if (currentIndex < songs.length - 1) {
            newIndex = currentIndex + 1;
          } else if (isLoop) {
            newIndex = 0;
          } else {
            return; // End of playlist
          }
        }
        
        setCurrentIndex(newIndex);
        setTrack(songs[newIndex]);
        setTimeout(() => {
          audioRef.current?.play();
          setPlayStatus(true);
        }, 0);
      }
    };
    
    audioRef.current.addEventListener('ended', handleEnded);
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleEnded);
      }
    };
  }, [isLoop, isShuffle, currentIndex, songs.length, songs])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!audioRef.current) return;
      audioRef.current.ontimeupdate = () => {
        if (!audioRef.current || !audioRef.current.duration) return;

        const current = audioRef.current.currentTime;
        const duration = audioRef.current.duration;
        const progress = Math.floor((current / duration) * 100);

        if (seekBar.current) {
          seekBar.current.style.width = `${progress}%`;
        }

        setTime({
          currentTime: {
            second: Math.floor(current % 60),
            minute: Math.floor(current / 60)
          },
          totalTime: {
            second: Math.floor(duration % 60),
            minute: Math.floor(duration / 60)
          }
        })
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [audioRef])

  const toggleShuffle = () => setIsShuffle(!isShuffle);
  const toggleLoop = () => setIsLoop(!isLoop);
  const seekTo = (percentage) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const clamped = Math.max(0, Math.min(1, percentage));
    audioRef.current.currentTime = clamped * audioRef.current.duration;
  };
  const setVolumeLevel = (level) => {
    const clampedVolume = Math.max(0, Math.min(1, level));
    setVolume(clampedVolume);
  };
  const toggleMute = () => {
    if (volume > 0) {
      setVolume(0);
    } else {
      setVolume(1);
    }
  };
  const toggleQueue = () => setShowQueue(!showQueue);

  const contextValue = {
    audioRef,
    seekBar,
    seekBg,
    track, setTrack,
    playStatus, setPlayStatus,
    time, setTime,
    play, pause,
    playWithId,
    previous, next,
    seekSong,
    songs,
    albums,
    searchQuery,
    setSearchQuery,
    isShuffle,
    isLoop,
    volume,
    showQueue,
    currentIndex,
    isMiniPlayer,
    setIsMiniPlayer,
    toggleShuffle,
    toggleLoop,
    seekTo,
    setVolumeLevel,
    toggleMute,
    toggleQueue,
    lyrics,
    lyricsStatus,
    fetchLyrics,
    showLyricsPane,
    setShowLyricsPane,
    selectedSongDetail,
    setSelectedSongDetail
  }

  return (
    <PlayerContext.Provider value={contextValue}>
      {props.children}
      <audio ref={audioRef} src={track?.file} preload="auto"></audio>
    </PlayerContext.Provider>
  )
}
export default PlayerContextProvider;