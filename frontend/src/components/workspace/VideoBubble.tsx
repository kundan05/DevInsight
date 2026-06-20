import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useCollaboration } from '../../contexts/CollaborationProvider';

interface VideoTrack {
  userId: string;
  username: string;
  stream: MediaStream;
}

const VideoBubble: React.FC = () => {
  const {
    users,
    sendWebRtcSignal,
    joinVoiceVideo,
    leaveVoiceVideo,
  } = useCollaboration();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [remoteTracks, setRemoteTracks] = useState<VideoTrack[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [minimized, setMinimized] = useState(false);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());

  const createPeerConnection = useCallback(
    (targetUserId: string) => {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          {
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject',
          },
        ],
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendWebRtcSignal(
            { type: 'ice-candidate', candidate: event.candidate },
            targetUserId,
          );
        }
      };

      pc.ontrack = (event) => {
        setRemoteTracks((prev) => {
          const existing = prev.find((t) => t.userId === targetUserId);
          if (existing) {
            existing.stream = event.streams[0];
            return [...prev];
          }
          return [
            ...prev,
            {
              userId: targetUserId,
              username:
                users.find((u) => u.userId === targetUserId)?.username ||
                'Remote',
              stream: event.streams[0],
            },
          ];
        });
      };

      pc.onconnectionstatechange = () => {
        if (
          pc.connectionState === 'disconnected' ||
          pc.connectionState === 'failed'
        ) {
          setRemoteTracks((prev) =>
            prev.filter((t) => t.userId !== targetUserId),
          );
          peerConnectionsRef.current.delete(targetUserId);
        }
      };

      if (localStreamRef.current) {
        for (const track of localStreamRef.current.getTracks()) {
          pc.addTrack(track, localStreamRef.current);
        }
      }

      peerConnectionsRef.current.set(targetUserId, pc);
      return pc;
    },
    [sendWebRtcSignal, users],
  );

  const startLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 },
          frameRate: { ideal: 15 },
        },
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      joinVoiceVideo();
    } catch (error) {
      console.error('Failed to get local media stream:', error);
    }
  }, [joinVoiceVideo]);

  useEffect(() => {
    startLocalStream();
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      peerConnectionsRef.current.forEach((pc) => pc.close());
      leaveVoiceVideo();
    };
  }, []);

  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  }, []);

  if (minimized) {
    return (
      <div
        onClick={() => setMinimized(false)}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-deep-elevated border border-border flex items-center justify-center cursor-pointer shadow-lg hover:bg-deep-surface transition-colors z-40"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#abb2bf"
          strokeWidth="2"
        >
          <path d="M23 7l-7 5 7 5V7z" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
        {remoteTracks.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-status-success text-[9px] flex items-center justify-center font-bold text-deep-base">
            {remoteTracks.length}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2">
      <div className="flex items-center justify-between px-3 py-2 bg-deep-elevated border border-border rounded-t-lg">
        <span className="text-xs text-text-primary font-mono">
          Video Chat
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleAudio}
            className={`p-1 rounded ${
              audioEnabled
                ? 'text-text-muted hover:text-text-primary'
                : 'text-status-danger'
            }`}
          >
            {audioEnabled ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            )}
          </button>
          <button
            onClick={toggleVideo}
            className={`p-1 rounded ${
              videoEnabled
                ? 'text-text-muted hover:text-text-primary'
                : 'text-status-danger'
            }`}
          >
            {videoEnabled ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 7l-7 5 7 5V7z" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => setMinimized(true)}
            className="p-1 text-text-muted hover:text-text-primary rounded"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex gap-2 bg-deep-elevated border-x border-b border-border rounded-b-lg p-2">
        <div className="relative">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-32 h-24 rounded-md object-cover bg-deep-base"
          />
          <span className="absolute bottom-1 left-1 text-[9px] text-white bg-black/60 px-1 rounded font-mono">
            You
          </span>
        </div>

        {remoteTracks.map((track) => (
          <div key={track.userId} className="relative">
            <video
              autoPlay
              playsInline
              className="w-32 h-24 rounded-md object-cover bg-deep-base"
              ref={(el) => {
                if (el) el.srcObject = track.stream;
              }}
            />
            <span className="absolute bottom-1 left-1 text-[9px] text-white bg-black/60 px-1 rounded font-mono">
              {track.username}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoBubble;
