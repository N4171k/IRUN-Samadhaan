import { useMemo } from 'react';
import { useJeetuInterview } from '../../contexts/JeetuInterviewContext';

const AVATAR_ASSETS = {
  still: '/assets/still.gif',
  thinking: '/assets/thinking.gif',
  speaking: '/assets/speaking.gif'
};

function Avatar() {
  const { avatarState } = useJeetuInterview();

  const { src, label } = useMemo(() => {
    switch (avatarState) {
      case 'thinking':
        return { src: AVATAR_ASSETS.thinking, label: 'Thinking' };
      case 'speaking':
        return { src: AVATAR_ASSETS.speaking, label: 'Speaking' };
      default:
        return { src: AVATAR_ASSETS.still, label: 'Ready' };
    }
  }, [avatarState]);

  return (
    <div className="mock-avatar">
      <div className="mock-avatar-image">
        <img src={src} alt={`${label} avatar`} loading="lazy" />
      </div>
      <span className={`mock-avatar-chip mock-avatar-chip--${avatarState}`}>{label}</span>
    </div>
  );
}

export default Avatar;
