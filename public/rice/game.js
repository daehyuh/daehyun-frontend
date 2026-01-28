const ROW_SIZE = 6;
const BASE_ROWS = 5;
const STACKED_ROWS = 6;

const palettes = {
  rabbit: {
    name: '토끼',
    open: ['green', 'blue', 'pink'], // □
    close: ['teal'], // ■
  },
  pig: {
    name: '돼지',
    open: ['red', 'yellow', 'orange'], // □
    close: ['purple'], // ■
  },
};

const roundRules = [
  { min: 1, max: 4, label: '1~4라운드 (하급)', types: ['low'], desc: '흰·분홍·쑥 송편' },
  { min: 5, max: 8, label: '5~8라운드 (중급)', types: ['mid'], desc: '자색고구마·감자·칡·모시·도토리·송기 송편' },
  { min: 9, max: 11, label: '9~11라운드 (상급)', types: ['pumpkin', 'fruit', 'flower', 'clam'], desc: '조개·꽃·과일·호박 송편' },
  { min: 12, max: 12, label: '12라운드 (최고급)', types: ['rabbit', 'tiger', 'pig', 'pumpkin', 'fruit', 'flower', 'clam'], desc: '토끼·호랑이·돼지 + 상급 송편' },
];

const typeDefs = {
  low: {
    label: '하급 송편',
    description: '하급(흰·분홍·쑥) 송편이 무작위로 섞여 등장합니다.',
    generator: (palette, limit) => buildRandomStack(palette.open, limit, { min: 1, max: 3 }),
  },
  mid: {
    label: '중급 송편',
    description: '중급(자색·감자·칡·모시·도토리·송기) 송편이 가볍게 섞여 등장합니다.',
    generator: (palette, limit) => buildRandomStack([...palette.open, ...palette.close], limit, { min: 1, max: 4 }),
  },
  pumpkin: {
    label: '호박송편 (상급)',
    description: '패턴: □■□ / 각 뭉텅이는 최대 4개',
    generator: (palette, limit) =>
      generatePattern(['open', 'close', 'open'], palette, limit, ({ remaining }) => rand(1, Math.min(4, remaining))),
  },
  fruit: {
    label: '과일송편 (상급)',
    description: '패턴: □■□■ / 각 뭉텅이는 최대 6개',
    generator: (palette, limit) =>
      generatePattern(['open', 'close', 'open', 'close'], palette, limit, ({ remaining }) => rand(2, Math.min(6, remaining))),
  },
  flower: {
    label: '꽃송편 (상급)',
    description: '패턴: ■□□■ / 중앙이 살짝 두꺼운 4뭉텅이',
    generator: (palette, limit) =>
      generatePattern(['close', 'open', 'open', 'close'], palette, limit, ({ index, remaining }) => {
        const max = Math.min(5, remaining);
        const min = Math.min(2, max);
        if (index === 1 || index === 2) {
          return rand(Math.min(3, max), max);
        }
        return rand(min, max);
      }),
  },
  clam: {
    label: '조개송편 (상급)',
    description: '패턴: □■■□ / 가운데가 두꺼운 조개 형태',
    generator: (palette, limit) =>
      generatePattern(['open', 'close', 'close', 'open'], palette, limit, ({ index, remaining }) => {
        const max = Math.min(5, remaining);
        if (index === 1 || index === 2) {
          return rand(Math.min(3, max), max);
        }
        const edgeMax = Math.min(4, remaining);
        return rand(2, Math.max(2, edgeMax));
      }),
  },
  rabbit: {
    label: '토끼송편 (최고급)',
    description: '패턴: □■□ / 마지막 뭉텅이는 8개 이상이 자주 등장, 가끔 모든 뭉텅이가 6개 이상',
    generator: (palette, limit) => generateRabbitPattern(palette, limit),
  },
  tiger: {
    label: '호랑이송편 (최고급)',
    description: '패턴: □■□■ / 2뭉텅이 이상이 4개 이상인 형태',
    generator: (palette, limit) => generateTigerPattern(palette, limit),
  },
  pig: {
    label: '돼지송편 (최고급)',
    description: '패턴: □■□■□■ / 뭉텅이별 최대 8개, 앞 뭉텅이가 2가 아니면 다음은 2로 고정',
    generator: (palette, limit) => generatePigPattern(palette, limit),
  },
};

export function initRiceGame({ mode }) {
  const palette = palettes[mode];
  if (!palette) return;

  const root = document.querySelector(`.game[data-mode="${mode}"]`) || document.querySelector('.game');
  const lanesEl = root.querySelector('[data-lanes]');
  const roundSelect = root.querySelector('[data-round-select]');
  const stackedToggle = root.querySelector('[data-stacked]');
  const refreshBtn = root.querySelector('[data-refresh]');
  const patternLabelEl = root.querySelector('[data-pattern-label]');
  const patternNoteEl = root.querySelector('[data-pattern-note]');
  const progressEl = root.querySelector('[data-progress]');
  const statusTextEl = root.querySelector('[data-status-text]');
  const colorButtons = Array.from(root.querySelectorAll('[data-color]'));

  const state = {
    sequence: [],
    index: 0,
    round: parseInt(roundSelect?.value || '12', 10),
    patternKey: '',
  };

  function setStatus(message) {
    if (statusTextEl) statusTextEl.textContent = message;
  }

  function updateProgress() {
    if (progressEl) progressEl.textContent = `${state.index} / ${state.sequence.length}`;
  }

  function regenerate() {
    state.round = parseInt(roundSelect?.value || '12', 10);
    const limit = (stackedToggle?.checked ? STACKED_ROWS : BASE_ROWS) * ROW_SIZE;
    const { sequence, patternLabel, note, typeKey } = buildSequence(mode, state.round, limit);
    state.sequence = sequence;
    state.index = 0;
    state.patternKey = typeKey;

    renderLanes(lanesEl, sequence);
    if (patternLabelEl) patternLabelEl.textContent = patternLabel;
    if (patternNoteEl) patternNoteEl.textContent = `${note} · 최대 ${limit}칸`;
    updateProgress();
    setStatus('패턴이 새로 고정됐어요.');
  }

  function handleColorInput(color) {
    if (!state.sequence.length) return;
    const expected = state.sequence[state.index];
    if (expected === color) {
      markBallHit(lanesEl, state.index, color);
      state.index += 1;
      updateProgress();
      if (state.index >= state.sequence.length) {
        setStatus('클리어! 새로운 패턴을 불러옵니다.');
        setTimeout(regenerate, 450);
      }
    } else {
      setStatus('틀렸어요! 패턴을 다시 불러옵니다.');
      setTimeout(regenerate, 250);
    }
  }

  colorButtons.forEach((btn) => {
    btn.addEventListener('click', () => handleColorInput(btn.dataset.color));
  });

  refreshBtn?.addEventListener('click', regenerate);
  roundSelect?.addEventListener('change', regenerate);
  stackedToggle?.addEventListener('change', regenerate);

  regenerate();
}

function buildSequence(mode, round, limit) {
  const palette = palettes[mode];
  const rule = roundRules.find((r) => round >= r.min && round <= r.max) || roundRules[0];
  const typeKey = pick(rule.types);
  const typeDef = typeDefs[typeKey];

  const sequence = typeDef.generator(palette, limit);
  const patternLabel = `${typeDef.label} | ${rule.label} | ${round}라운드`;
  const note = `${rule.desc}. ${typeDef.description}`;

  return { sequence, patternLabel, note, typeKey };
}

function renderLanes(container, sequence) {
  if (!container) return;
  container.innerHTML = '';
  const rowCount = Math.ceil(sequence.length / ROW_SIZE);

  for (let row = 0; row < rowCount; row += 1) {
    const lane = document.createElement('div');
    lane.className = 'lane';
    const slice = sequence.slice(row * ROW_SIZE, (row + 1) * ROW_SIZE);
    slice.forEach((color, index) => {
      const ball = document.createElement('div');
      ball.className = `ball ${color}`;
      ball.dataset.color = color;
      ball.dataset.index = row * ROW_SIZE + index;
      lane.appendChild(ball);
    });
    container.appendChild(lane);
  }
}

function markBallHit(container, index, color) {
  if (!container) return;
  const balls = container.querySelectorAll('.ball');
  const ball = balls[index];
  if (ball) {
    ball.style.backgroundImage = `url('/rice/images/icon/${color}_gray.png')`;
    ball.style.opacity = '0.9';
  }
}

function buildRandomStack(colors, limit, range) {
  const result = [];
  while (result.length < limit) {
    const remaining = limit - result.length;
    const size = rand(range.min, Math.min(range.max, remaining));
    const color = pick(colors);
    for (let i = 0; i < size && result.length < limit; i += 1) {
      result.push(color);
    }
  }
  return result;
}

function generatePattern(order, palette, limit, sizeResolver) {
  const sequence = [];
  while (sequence.length < limit) {
    let prevSize = 0;
    for (let i = 0; i < order.length && sequence.length < limit; i += 1) {
      const remaining = limit - sequence.length;
      let size = sizeResolver({ index: i, previous: prevSize, remaining, order });
      size = clampSize(size, remaining);
      const color = pickColor(order[i], palette);
      for (let n = 0; n < size && sequence.length < limit; n += 1) {
        sequence.push(color);
      }
      prevSize = size;
    }
  }
  return sequence;
}

function generateRabbitPattern(palette, limit) {
  const order = ['open', 'close', 'open'];
  const sequence = [];
  while (sequence.length < limit) {
    const sizes = [];
    const wantsAllLarge = Math.random() < 0.25;
    const wantsHugeTail = Math.random() < 0.72;

    for (let i = 0; i < order.length; i += 1) {
      const consumed = sizes.reduce((acc, cur) => acc + cur, 0);
      const remaining = limit - sequence.length - consumed;
      if (remaining <= 0) break;

      let min = wantsAllLarge ? 6 : 3;
      let max = Math.min(i === 2 ? 10 : 6, remaining);

      if (i === 2) {
        min = wantsHugeTail ? Math.max(8, min) : Math.max(6, min);
      } else if (i === 1) {
        min = Math.min(min, max);
      }

      min = Math.min(min, max);
      const size = rand(min, Math.max(min, max));
      sizes.push(size);
    }

    appendPatternSet(order, sizes, palette, sequence, limit);
  }
  return sequence;
}

function generateTigerPattern(palette, limit) {
  const order = ['open', 'close', 'open', 'close'];
  const sequence = [];

  while (sequence.length < limit) {
    const sizes = order.map(() => rand(2, 4));
    const largeCount = 2 + (Math.random() < 0.35 ? 1 : 0);
    const largeIndexes = pickUniqueIndexes(order.length, largeCount);
    largeIndexes.forEach((idx) => {
      sizes[idx] = Math.max(sizes[idx], rand(4, 6));
    });
    appendPatternSet(order, sizes, palette, sequence, limit);
  }

  return sequence;
}

function generatePigPattern(palette, limit) {
  const order = ['open', 'close', 'open', 'close', 'open', 'close'];
  const sequence = [];

  while (sequence.length < limit) {
    const sizes = [];
    for (let i = 0; i < order.length; i += 1) {
      const consumed = sizes.reduce((acc, cur) => acc + cur, 0);
      const remaining = limit - sequence.length - consumed;
      if (remaining <= 0) break;

      let size;
      if (i > 0 && sizes[i - 1] !== 2) {
        size = 2;
      } else {
        const max = Math.min(8, remaining);
        const biasToTwo = Math.random() < 0.55;
        size = biasToTwo ? 2 : rand(3, max);
      }

      size = Math.min(size, remaining);
      sizes.push(size);
    }

    appendPatternSet(order, sizes, palette, sequence, limit);
  }

  return sequence;
}

function appendPatternSet(order, sizes, palette, sequence, limit) {
  for (let i = 0; i < order.length && sequence.length < limit; i += 1) {
    const color = pickColor(order[i], palette);
    const remaining = limit - sequence.length;
    const size = clampSize(sizes[i] ?? 1, remaining);
    for (let n = 0; n < size && sequence.length < limit; n += 1) {
      sequence.push(color);
    }
  }
}

function pickColor(blockType, palette) {
  const pool = blockType === 'open' ? palette.open : palette.close;
  return pick(pool);
}

function clampSize(size, remaining) {
  const safe = Math.max(1, Math.floor(size || 1));
  return Math.min(safe, remaining);
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min, max) {
  const low = Math.min(min, max);
  const high = Math.max(min, max);
  return Math.floor(Math.random() * (high - low + 1)) + low;
}

function pickUniqueIndexes(length, count) {
  const result = new Set();
  while (result.size < count) {
    result.add(Math.floor(Math.random() * length));
  }
  return Array.from(result);
}
