import { useState, useEffect, useRef } from 'react';
import { Heart, BedDouble } from 'lucide-react';
import { api } from '../api';
import './RoomCard.css';

export default function RoomCard({ room, onOrder }) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [likes, setLikes] = useState(room.likes_count || 0);
  const [liked, setLiked] = useState(false);
  const intervalRef = useRef(null);

  const photos = room.photo_urls && room.photo_urls.length > 0 ? room.photo_urls : [];

  // Auto-changing photos, per the brief
  useEffect(() => {
    if (photos.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setPhotoIndex((i) => (i + 1) % photos.length);
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, [photos.length]);

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    setLikes((l) => l + 1);
    try {
      await api.likeRoom(room.id);
    } catch {
      // optimistic UI; silently keep the local increment
    }
  };

  const isFree = room.status === 'free';
  const statusLabel = room.status === 'paid' ? 'Paid' : room.status === 'ordered' ? 'Ordered' : null;

  return (
    <article className="room-card reveal">
      <div className="room-card-media">
        {photos.length > 0 ? (
          photos.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`Room ${room.room_number}`}
              className="room-card-photo"
              style={{ opacity: i === photoIndex ? 1 : 0 }}
            />
          ))
        ) : (
          <div className="room-card-placeholder">
            <BedDouble size={36} strokeWidth={1.5} />
          </div>
        )}

        {statusLabel && <span className={`room-status-badge room-status-${room.status}`}>{statusLabel}</span>}

        <div className="room-card-pricetag">TZS {Number(room.price).toLocaleString()} / night</div>
      </div>

      <div className="room-card-body">
        <div className="room-card-heading">
          <h3>Room No. {room.room_number}</h3>
          <button
            className={`like-btn ${liked ? 'is-liked' : ''}`}
            onClick={handleLike}
            aria-label="Like this room"
          >
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
            <span>{likes}</span>
          </button>
        </div>

        {room.description && <p className="room-card-desc">{room.description}</p>}

        <button
          className={`btn ${isFree ? 'btn-primary' : 'btn-secondary'} room-card-cta`}
          onClick={() => onOrder(room)}
        >
          {isFree ? 'Order Now' : 'Pre-order'}
        </button>
      </div>
    </article>
  );
}
