import React, { useState, useCallback, useMemo } from "react";

/**
 * 素数が隠れテーマのビンゴ風ゲーム
 * 7×7グリッド (1〜49)
 * 選んだ数の倍数を消す → 残った素数を集める
 * エラトステネスの篩を遊び感覚で体験するUI
 */

const SIZE = 7;
const MAX = SIZE * SIZE; // 49

type CellState = "active" | "cleared" | "prime" | "selected";

interface Cell {
  n: number;
  state: CellState;
}

function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

function createInitialGrid(): Cell[] {
  return Array.from({ length: MAX }, (_, i) => ({
    n: i + 1,
    state: "active" as CellState,
  }));
}

export default function PrimeBingo() {
  const [grid, setGrid] = useState<Cell[]>(createInitialGrid);
  const [selected, setSelected] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("数字を選んで、その倍数を消そう");

  const primesCollected = useMemo(
    () => grid.filter((c) => c.state === "prime").map((c) => c.n),
    [grid]
  );

  const remainingActive = useMemo(
    () => grid.filter((c) => c.state === "active").length,
    [grid]
  );

  const handleSelect = useCallback(
    (n: number) => {
      if (grid[n - 1].state !== "active") return;

      setSelected(n);
      setHistory((h) => [...h, n]);

      setGrid((prev) => {
        const next = prev.map((c) => ({ ...c }));

        // 選んだ数の倍数を消す（自分自身は残す）
        for (let i = 0; i < MAX; i++) {
          const cell = next[i];
          if (cell.state !== "active") continue;
          if (cell.n !== n && cell.n % n === 0) {
            cell.state = "cleared";
          }
        }

        // 選んだ数が素数なら「素数確定」
        if (isPrime(n)) {
          next[n - 1].state = "prime";
          setScore((s) => s + n);
          setMessage(`✨ ${n} は素数！ +${n}点`);
        } else {
          // 合成数を選んだ場合は自分も消える
          next[n - 1].state = "cleared";
          setMessage(`${n} の倍数を消しました（合成数）`);
        }

        return next;
      });
    },
    [grid]
  );

  const reset = () => {
    setGrid(createInitialGrid());
    setSelected(null);
    setHistory([]);
    setScore(0);
    setMessage("数字を選んで、その倍数を消そう");
  };

  // ゲーム終了判定（もう選べる数が残っていない）
  const isFinished = remainingActive === 0;

  return (
    <div className="prime-bingo">
      <style>{`
        .prime-bingo {
          font-family: "Hiragino Sans", "Noto Sans JP", system-ui, sans-serif;
          max-width: 480px;
          margin: 0 auto;
          padding: 16px;
          background: #0f0f13;
          color: #e8e8f0;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .header {
          text-align: center;
          margin-bottom: 12px;
        }
        .header h1 {
          font-size: 1.35rem;
          margin: 0 0 4px;
          letter-spacing: 0.05em;
          background: linear-gradient(90deg, #a78bfa, #38bdf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .subtitle {
          font-size: 0.8rem;
          color: #8888a0;
          margin: 0;
        }
        .status {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #1a1a24;
          border-radius: 10px;
          padding: 10px 14px;
          margin-bottom: 12px;
          font-size: 0.9rem;
        }
        .score {
          font-weight: 700;
          color: #fbbf24;
        }
        .message {
          text-align: center;
          font-size: 0.85rem;
          color: #a0a0b8;
          min-height: 1.4em;
          margin-bottom: 10px;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
          margin-bottom: 14px;
        }
        .cell {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
          user-select: none;
          border: 2px solid transparent;
        }
        .cell.active {
          background: #252536;
          color: #e0e0f0;
        }
        .cell.active:hover {
          background: #35354a;
          transform: scale(1.06);
          border-color: #6366f1;
        }
        .cell.cleared {
          background: #15151c;
          color: #3a3a4a;
          cursor: default;
          text-decoration: line-through;
        }
        .cell.prime {
          background: linear-gradient(135deg, #4c1d95, #1e3a8a);
          color: #e0e7ff;
          border-color: #a78bfa;
          cursor: default;
          box-shadow: 0 0 12px rgba(167, 139, 250, 0.4);
        }
        .cell.selected {
          border-color: #fbbf24;
        }
        .primes-list {
          background: #1a1a24;
          border-radius: 10px;
          padding: 10px 14px;
          margin-bottom: 12px;
          font-size: 0.85rem;
        }
        .primes-list strong {
          color: #a78bfa;
        }
        .primes-list span {
          display: inline-block;
          background: #2e1065;
          color: #c4b5fd;
          border-radius: 4px;
          padding: 2px 6px;
          margin: 2px;
          font-size: 0.8rem;
        }
        .actions {
          display: flex;
          gap: 8px;
          justify-content: center;
        }
        button {
          background: #312e81;
          color: #e0e7ff;
          border: none;
          border-radius: 8px;
          padding: 8px 18px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: background 0.15s;
        }
        button:hover {
          background: #4338ca;
        }
        .finished {
          text-align: center;
          padding: 12px;
          background: linear-gradient(135deg, #1e1b4b, #0f172a);
          border-radius: 10px;
          margin-bottom: 12px;
          border: 1px solid #6366f1;
        }
        .finished h2 {
          margin: 0 0 6px;
          font-size: 1.1rem;
          color: #a78bfa;
        }
        .hint {
          font-size: 0.75rem;
          color: #666680;
          text-align: center;
          margin-top: 8px;
        }
      `}</style>

      <div className="header">
        <h1>素数ビンゴ</h1>
        <p className="subtitle">選んだ数の倍数を消して、素数を集めよう</p>
      </div>

      <div className="status">
        <span>
          残り <strong>{remainingActive}</strong>
        </span>
        <span className="score">スコア {score}</span>
      </div>

      <div className="message">{message}</div>

      {isFinished && (
        <div className="finished">
          <h2>完了！</h2>
          <p>
            集めた素数 {primesCollected.length} 個 / スコア {score}
          </p>
        </div>
      )}

      <div className="grid">
        {grid.map((cell) => (
          <div
            key={cell.n}
            className={`cell ${cell.state} ${
              selected === cell.n ? "selected" : ""
            }`}
            onClick={() => handleSelect(cell.n)}
          >
            {cell.n}
          </div>
        ))}
      </div>

      <div className="primes-list">
        <strong>集めた素数：</strong>
        {primesCollected.length === 0 ? (
          <span style={{ color: "#555", background: "transparent" }}>なし</span>
        ) : (
          primesCollected.map((p) => <span key={p}>{p}</span>)
        )}
      </div>

      <div className="actions">
        <button onClick={reset}>リセット</button>
      </div>

      <p className="hint">
        ヒント：小さい素数から選ぶと効率よく消せるよ（エラトステネスの篩）
      </p>
    </div>
  );
}
