import React, { useState, useEffect, useRef } from 'react';
import { vibrate } from '../utils/helpers';

export default function RestTimer({ onComplete, defaultTime = 60, onDismiss }) {
  const [remaining, setRemaining] = useState(defaultTime);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [customTime, setCustomTime] = useState(defaultTime);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          vibrate([200, 100, 200, 100, 400]);
          onComplete && onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [customTime]);

  const progress = remaining / customTime;
  const circumference = 2 * Math.PI * 54;
  const strokeDash = circumference * progress;

  const addTime = (secs) => {
    setRemaining(prev => Math.max(0, prev + secs));
    setCustomTime(prev => Math.max(0, prev + secs));
  };

  const skip = () => {
    clearInterval(intervalRef.current);
    onComplete && onComplete();
  };

  const content = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      padding: isFullscreen ? '40px 20px' : '20px',
      background: isFullscreen ? 'var(--bg-primary)' : 'transparent',
      minHeight: isFullscreen ? '100vh' : 'auto',
      justifyContent: isFullscreen ? 'center' : 'flex-start',
    }}>
      {isFullscreen && (
        <p style={{ color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.1em', fontSize: '13px', textTransform: 'uppercase' }}>
          ⏸ Descanso
        </p>
      )}
      
      <div style={{ position: 'relative', width: 120, height: 120 }}>
        <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border)" strokeWidth="6" />
          <circle
            cx="60" cy="60" r="54" fill="none"
            stroke={remaining <= 10 ? 'var(--orange)' : 'var(--blue)'}
            strokeWidth="6"
            strokeDasharray={`${strokeDash} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s linear, stroke 0.3s' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontSize: isFullscreen ? '36px' : '28px',
            fontFamily: 'var(--font-display)',
            color: remaining <= 10 ? 'var(--orange)' : 'var(--text-primary)',
            lineHeight: 1,
          }}>
            {remaining}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>seg</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: '13px', minHeight: 'auto' }} onClick={() => addTime(-15)}>-15s</button>
        <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: '13px', minHeight: 'auto' }} onClick={() => addTime(15)}>+15s</button>
        <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: '13px', minHeight: 'auto' }} onClick={() => addTime(30)}>+30s</button>
      </div>

      <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
        <button className="btn btn-danger" style={{ flex: 1 }} onClick={skip}>Pular ▶</button>
        <button
          className="btn btn-ghost"
          style={{ width: 52 }}
          onClick={() => setIsFullscreen(f => !f)}
        >
          {isFullscreen ? '⤵' : '⛶'}
        </button>
      </div>

      {onDismiss && !isFullscreen && (
        <button className="btn btn-ghost" style={{ width: '100%', fontSize: '13px', minHeight: 40 }} onClick={onDismiss}>
          Fechar timer
        </button>
      )}
    </div>
  );

  if (isFullscreen) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 999,
        background: 'var(--bg-primary)',
      }}>
        {content}
      </div>
    );
  }

  return content;
}
