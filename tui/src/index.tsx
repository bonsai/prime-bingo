import React, { useEffect, useState, useRef } from "react";
import { render, Box, Text, useApp, useInput } from "ink";
import {
  Grid,
  emptyGrid,
  landingRow,
  applyGravity,
  findBreaks,
  orthoPrimeCount,
  ROWS,
  COLS,
  Break,
} from "./game/grid";
import { isPrime, describeTile } from "./game/rules";
import { levelFor, spawnValue } from "./game/spawn";
import { cascadePoints, PRIME_TRAP_BONUS } from "./game/scoring";

interface Falling {
  value: number;
  col: number;
  row: number;
}

type Mode = "tutorial" | "playing" | "paused" | "gameover";

interface State {
  grid: Grid;
  falling: Falling | null;
  nextValue: number;
  score: number;
  drops: number;
  mode: Mode;
  hint: boolean;
  messages: string[];
  inspect: { r: number; c: number } | null;
}

function pushMsg(msgs: string[], m: string): string[] {
  return [m, ...msgs].slice(0, 3);
}

function initialState(): State {
  const level = levelFor(0);
  const nextValue = spawnValue(level);
  return {
    grid: emptyGrid(),
    falling: null,
    nextValue,
    score: 0,
    drops: 0,
    mode: "tutorial",
    hint: false,
    messages: [],
    inspect: null,
  };
}

function spawnTile(s: State): State {
  const prefer = s.falling?.col ?? 3;
  let col = -1;
  if (landingRow(s.grid, prefer) >= 0) col = prefer;
  if (col < 0) {
    for (let c = 0; c < COLS; c++) {
      if (landingRow(s.grid, c) >= 0) {
        col = c;
        break;
      }
    }
  }
  if (col < 0) {
    return { ...s, falling: null, mode: "gameover" };
  }
  const level = levelFor(s.drops);
  return {
    ...s,
    falling: { value: s.nextValue, col, row: 0 },
    nextValue: spawnValue(level),
  };
}

function runCascade(s: State): State {
  let state = { ...s };
  let chain = 0;
  let gainedTotal = 0;
  for (;;) {
    const breaks = findBreaks(state.grid);
    if (breaks.length === 0) break;
    const gained = cascadePoints(chain, breaks.length);
    gainedTotal += gained;
    const grid = state.grid.map((row) => [...row]);
    let messages = state.messages;
    for (const b of breaks) {
      const v = grid[b.r][b.c]!;
      const q = v / b.by;
      messages = pushMsg(messages, `${v} broke: ${v} is a multiple of ${b.by} (${b.by} × ${q} = ${v}).`);
      if (orthoPrimeCount(grid, b.r, b.c) >= 2) {
        state = { ...state, score: state.score + PRIME_TRAP_BONUS };
        messages = pushMsg(messages, `Trapped harvest! Composite between primes +${PRIME_TRAP_BONUS}.`);
      }
      grid[b.r][b.c] = null;
    }
    applyGravity(grid);
    state = { ...state, grid, messages };
    chain++;
  }
  if (gainedTotal > 0) {
    return {
      ...state,
      score: state.score + gainedTotal,
      messages: pushMsg(state.messages, `Cascade ×${chain}: +${gainedTotal} points.`),
    };
  }
  return state;
}

function lockTile(s: State): State {
  if (!s.falling) return s;
  const grid = s.grid.map((row) => [...row]);
  grid[s.falling.row][s.falling.col] = s.falling.value;
  const dropped: State = { ...s, grid, falling: null, drops: s.drops + 1 };
  return spawnTile(runCascade(dropped));
}

const Cell: React.FC<{
  value: number | null;
  falling: boolean;
  breakable: boolean;
  cursor: boolean;
}> = ({ value, falling, breakable, cursor }) => {
  const label = value === null ? "  · " : ` ${String(value).padStart(2, " ")} `;
  let color: string = "gray";
  if (value !== null) {
    if (falling) color = "magenta";
    else if (isPrime(value)) color = "cyan";
    else if (breakable) color = "yellow";
    else color = "green";
  }
  return (
    <Text
      inverse={cursor || (breakable && !falling)}
      bold={falling || (value !== null && isPrime(value))}
      color={color}
    >
      {label}
    </Text>
  );
};

const App: React.FC = () => {
  const { exit } = useApp();
  const [state, setState] = useState<State>(initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  useInput((input, key) => {
    const s = stateRef.current;
    if (input === "q") return exit();

    if (s.mode === "tutorial") {
      setState({ ...s, mode: "playing", falling: null });
      setState((st) => spawnTile({ ...st, mode: "playing" }));
      return;
    }
    if (s.mode === "gameover") {
      if (input === "r") setState(spawnTile({ ...initialState(), mode: "playing" }));
      return;
    }
    if (s.mode === "paused") {
      if (input === "p") setState({ ...s, mode: "playing" });
      return;
    }

    if (input === "p") return setState({ ...s, mode: "paused" });
    if (input === "h") return setState({ ...s, hint: !s.hint });

    if (input === "f") {
      if (s.inspect) return setState({ ...s, inspect: null });
      for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS; c++)
          if (s.grid[r][c] !== null) return setState({ ...s, inspect: { r, c } });
      return;
    }
    if (s.inspect) {
      const { r, c } = s.inspect;
      if (key.left) return setState({ ...s, inspect: { r, c: Math.max(0, c - 1) } });
      if (key.right) return setState({ ...s, inspect: { r, c: Math.min(COLS - 1, c + 1) } });
      if (key.up) return setState({ ...s, inspect: { r: Math.max(0, r - 1), c } });
      if (key.down) return setState({ ...s, inspect: { r: Math.min(ROWS - 1, r + 1), c } });
      return;
    }

    if (!s.falling) return;

    if (key.left) {
      const col = Math.max(0, s.falling.col - 1);
      if (landingRow(s.grid, col) >= 0) {
        const row = Math.min(s.falling.row, landingRow(s.grid, col));
        return setState({ ...s, falling: { ...s.falling, col, row } });
      }
      return;
    }
    if (key.right) {
      const col = Math.min(COLS - 1, s.falling.col + 1);
      if (landingRow(s.grid, col) >= 0) {
        const row = Math.min(s.falling.row, landingRow(s.grid, col));
        return setState({ ...s, falling: { ...s.falling, col, row } });
      }
      return;
    }
    if (key.down || key.up || input === " ") {
      return setState(lockTile(s));
    }
  });

  const level = levelFor(state.drops);
  const breakSet = new Set<string>();
  if (state.hint) for (const b of findBreaks(state.grid)) breakSet.add(`${b.r},${b.c}`);

  if (state.mode === "tutorial") {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="yellow">
          🍂 PRIME FALL — a prime &amp; multiples puzzle
        </Text>
        <Text> </Text>
        <Text>
          Drop numbered tiles into the <Text bold>7×7</Text> grid.
        </Text>
        <Text>
          <Text bold color="cyan">PRIME</Text> tiles (2, 3, 5, 7, 11…) <Text bold>can never break</Text> — they stay forever and stack up.
        </Text>
        <Text>
          <Text color="green">COMPOSITE</Text> tiles break when orthogonally adjacent to one of their multiples:
        </Text>
        <Text>  12 next to 4 → 12 breaks (4 × 3 = 12)</Text>
        <Text>  10 next to 5 → 10 breaks (5 × 2 = 10)</Text>
        <Text> </Text>
        <Text>Learn to spot primes and multiples — break tiles, chain cascades, don&apos;t top out!</Text>
        <Text> </Text>
        <Text dimColor>← → move · ↓ / space drop · h hints · f inspect tile · p pause · q quit</Text>
        <Text bold color="yellow">Press any key to start.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Box>
        <Text bold color="yellow">🍂 PRIME FALL</Text>
        <Text>  Level {level}  Score {state.score}  </Text>
        <Text color="magenta">Next: {state.nextValue}</Text>
        {state.hint ? <Text color="yellow">  [HINT ON]</Text> : null}
      </Box>
      <Box flexDirection="column">
        <Text color="white">+{"---+".repeat(COLS)}</Text>
        {state.grid.map((row, r) => (
          <Box key={r}>
            <Text color="white">|</Text>
            {row.map((v, c) => {
              const isFalling = !!state.falling && state.falling.row === r && state.falling.col === c;
              const value = isFalling ? state.falling!.value : v;
              return (
                <Cell
                  key={c}
                  value={value}
                  falling={isFalling}
                  breakable={breakSet.has(`${r},${c}`)}
                  cursor={!!state.inspect && state.inspect.r === r && state.inspect.c === c}
                />
              );
            })}
            <Text color="white">|</Text>
          </Box>
        ))}
        <Text color="white">+{"---+".repeat(COLS)}</Text>
      </Box>
      <Box flexDirection="column" marginTop={1}>
        {state.inspect ? (
          <Text color="yellow">
            🔎 {state.grid[state.inspect.r][state.inspect.c] !== null
              ? describeTile(state.grid[state.inspect.r][state.inspect.c]!)
              : "empty cell"}  (arrows move, f closes)
          </Text>
        ) : null}
        {state.messages.map((m, i) => (
          <Text key={i} color="green">{"> "}{m}</Text>
        ))}
        <Text dimColor>← → move · ↓/space drop · h hint · f inspect · p pause · q quit</Text>
        <Text dimColor>prime = breaks never · multiple = breaks when adjacent</Text>
        {state.mode === "paused" ? <Text bold color="yellow">‖ PAUSED — press p to resume</Text> : null}
        {state.mode === "gameover" ? (
          <Text bold color="red">GAME OVER — score {state.score} — press r to restart, q to quit</Text>
        ) : null}
      </Box>
    </Box>
  );
};

render(<App />);
