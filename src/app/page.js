'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const Fish = ({ id, onCatch }) => {
  const fishRef = useRef(null);
  const [position, setPosition] = useState({
    top: Math.random() * 80,
    left: Math.random() * 80,
  });
  const [velocity, setVelocity] = useState({
    x: (Math.random() - 0.5) * 1,
    y: (Math.random() - 0.5) * 1
  });
  const [facingLeft, setFacingLeft] = useState(false);

  useEffect(() => {
    const move = () => {
      setPosition((prev) => {
        let newTop = prev.top + velocity.y;
        let newLeft = prev.left + velocity.x;
        let newVelocity = { ...velocity };

        if (newTop <= 0 || newTop >= 90) {
          newVelocity.y = -newVelocity.y;
          newTop = Math.max(0, Math.min(90, newTop));
        }
        if (newLeft <= 0 || newLeft >= 90) {
          newVelocity.x = -newVelocity.x;
          newLeft = Math.max(0, Math.min(90, newLeft));
        }

        setVelocity(newVelocity);
        setFacingLeft(newVelocity.x < 0);

        return { top: newTop, left: newLeft };
      });
    };

    const interval = setInterval(move, 30);
    return () => clearInterval(interval);
  }, [velocity]);

  return (
    <div
      ref={fishRef}
      className="absolute transition-none"
      style={{
        top: `${position.top}%`,
        left: `${position.left}%`,
        transition: 'top 0.03s linear, left 0.03s linear',
        cursor: 'url("/net.png") 16 16, auto'
      }}
      onClick={(e) => {
        e.stopPropagation(); // 不觸發背景點擊
        onCatch(id); // 傳遞 fish id 回父層
      }}
    >
      <Image
        src="/fish.png"
        alt={`Fish ${id}`}
        width={50}
        height={50}
        className="transition-transform duration-300 w-15"
      />
    </div>
  );
};

export default function FishPage() {
  const [score, setScore] = useState(0);
  const [count, setCount] = useState(10);
  const [timeLeft, setTimeLeft] = useState(60);
  const [fishes, setFishes] = useState([...Array(10).keys()]); // [0,1,...9]
  const [gameResult, setGameResult] = useState(null); // null | 'success' | 'fail'
  const [netCount, setNetCount] = useState(5);

  // 倒數計時
  useEffect(() => {
    if (gameResult) return; // 結束不再倒數

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameResult('fail');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameResult]);

  // 遊戲結束條件
  useEffect(() => {
    if (gameResult) return;

    if (fishes.length === 0 && timeLeft > 0) {
      setGameResult('success');
    } else if (netCount === 0) {
      setGameResult('fail');
    }
  }, [fishes, count, timeLeft, gameResult]);

  const handleFishCatch = (id) => {
    setFishes((prev) => prev.filter((f) => f !== id));
    setScore((s) => s + 5);
  };

  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="w-screen h-screen flex flex-col gap-5 bg-sky-100 p-4">
      {/* 標題列 */}
      <div className="flex justify-between px-8 pt-4 font-bold text-3xl text-gray-400">
        <div className="mt-2 flex items-center gap-2">
          <span className="mr-2">剩餘網子:</span>
          {Array.from({ length: 5 }).map((_, i) => (
            <Image
              key={i}
              src="/net.png"
              alt="網子"
              width={36}
              height={36}
              style={{ opacity: i < netCount ? 1 : 0.2 }} // 用透明度表示用掉的
            />
          ))}
        </div>
        <div className="mt-2">分數: {score}</div>
        <div className="mt-2">剩餘時間: {formatTime(timeLeft)}</div>
      </div>

      {/* 活動區 */}
      <div
        className="w-full h-full relative rounded-2xl bg-white overflow-hidden p-[20px] pt-[80px]"
        onClick={() => {
          if (gameResult || netCount <= 0) return;
          setNetCount((n) => Math.max(0, n - 1));
        }}
        style={{cursor: 'url("/net.png") 16 16, auto'}} // 16 16 是熱點（hotspot）
      >
        {fishes.map((id) => (
          <Fish key={id} id={id} onCatch={handleFishCatch} />
        ))}

        {/* 遊戲結束畫面 */}
        {gameResult && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
            <div className="text-4xl font-bold text-gray-400 bg-sky-100 px-8 py-4 rounded-2xl shadow-xl">
              {gameResult === 'success' ? '遊戲結束：過關！' : '遊戲結束：失敗'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
