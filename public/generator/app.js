(() => {
  "use strict";

  const root = document.getElementById("ad-app");
  if (!root || root.dataset.booted === "true") return;
  root.dataset.booted = "true";

  const PAPER = "#fdfcf9";
  const INK = "#141414";
  const INK_2 = "#555552";
  const PAPER_MUTED = "#d8d6cf";

  const SUBJECTS = {
    economics: { name: "Economics", color: "#20c4b7" },
    business: { name: "Business", color: "#feae39" },
    english: { name: "English", color: "#fe7bb5" },
    "english-lit": { name: "English Lit", color: "#feb9dc" },
    maths: { name: "Maths", color: "#5b81fe" },
    biology: { name: "Biology", color: "#f4d32c" },
    chemistry: { name: "Chemistry", color: "#b77bfe" },
    physics: { name: "Physics", color: "#47c7f8" },
    "combined-science": { name: "Combined Science", color: "#fee6aa" },
    history: { name: "History", color: "#b9742e" },
    geography: { name: "Geography", color: "#79e5ee" },
    "design-tech": { name: "Design Tech", color: "#fe8c2c" },
    computing: { name: "Computing", color: "#67affd" },
    "religious-studies": { name: "Religious Studies", color: "#e2c5a9" },
    french: { name: "French", color: "#e77cf8" },
    spanish: { name: "Spanish", color: "#de62c2" },
    german: { name: "German", color: "#f5859a" },
    psychology: { name: "Psychology", color: "#b8b9fd" },
    sociology: { name: "Sociology", color: "#e0d2fd" },
    reasoning: { name: "Reasoning", color: "#8fdca0" },
  };

  const SIZES = {
    portrait: { id: "portrait", label: "1080 × 1350", w: 1080, h: 1350 },
    landscape: { id: "landscape", label: "1600 × 900", w: 1600, h: 900 },
  };

  const REAL_QUESTION = {
    source: "AQA GCSE Economics · Paper 1",
    stem: "Which of the following is an example of a factor market?",
    options: [
      "A supermarket selling groceries to households",
      "A car showroom selling vehicles to customers",
      "A website selling second-hand phones",
      "A market where firms hire workers",
    ],
    answer: 3,
    marks: "1 mark",
  };

  const REAL_SCHEME = {
    source: "AQA GCSE Economics · Paper 1",
    stem: "Analyse how the market for festival tickets is likely to change if the price is set at £30.",
    answer:
      "At £30 consumers want 750 tickets but only 450 are supplied, so there is excess demand of 300.\nSellers raise the price. Quantity demanded contracts, quantity supplied extends, and the market moves back towards equilibrium.",
    pointOne: "Excess demand identified at set price",
    pointTwo: "Explains movement along curves to equilibrium",
    examiner: "Quantity demanded contracts, quantity supplied extends until equilibrium at £40 and 600 tickets.",
    score: "4 of 6",
  };

  const LAYOUTS = [
    {
      id: "statement",
      name: "Statement",
      use: "One sentence, one colour, nothing competing with it.",
      subject: "economics",
      caption:
        "Marking is the part of revision that usually happens too late. ambitious marks every answer point by point, while the question is still in front of you.",
      fields: [{ key: "headline", label: "Statement", multiline: true }],
    },
    {
      id: "question",
      name: "Question",
      use: "A real multiple-choice question, shown as practice.",
      subject: "economics",
      caption:
        "This is the product: a real exam question, four options, and the correct answer visible against the mark scheme. Practice should look like the exam and teach like a tutor.",
      fields: [
        { key: "stem", label: "Question stem", multiline: true },
        { key: "optionA", label: "Option A" },
        { key: "optionB", label: "Option B" },
        { key: "optionC", label: "Option C" },
        { key: "optionD", label: "Option D" },
        { key: "tariff", label: "Mark tariff" },
      ],
    },
    {
      id: "markscheme",
      name: "Mark scheme",
      use: "A written answer with the marks made visible.",
      subject: "maths",
      caption:
        "A model answer is useful. Seeing which sentence earns which mark is the part that changes the next answer.",
      fields: [
        { key: "stem", label: "Question stem", multiline: true },
        { key: "answer", label: "Written answer", multiline: true },
        { key: "pointOne", label: "First ticked point" },
        { key: "pointTwo", label: "Second ticked point" },
        { key: "examiner", label: "Examiner’s words", multiline: true },
        { key: "score", label: "Score" },
      ],
    },
    {
      id: "number",
      name: "Number",
      use: "One true figure, set as large as it can go.",
      subject: "biology",
      caption:
        "There are 2,361 questions in the ambitious library today, each with a mark scheme. The number matters because the feedback is attached to the question, not generated in a vacuum.",
      fields: [
        { key: "figure", label: "Figure" },
        { key: "line", label: "Line underneath", multiline: true },
      ],
    },
    {
      id: "quote",
      name: "Quote",
      use: "A real student quote, when one is supplied.",
      subject: "english",
      caption:
        "The quote slot stays empty until a real student’s words are supplied. The alternative is an invented testimonial, which is not worth posting.",
      fields: [
        { key: "quote", label: "Quote", multiline: true },
        { key: "name", label: "Name" },
        { key: "subjectLine", label: "Subject" },
      ],
    },
    {
      id: "comparison",
      name: "Comparison",
      use: "A tutor beside ambitious, three honest lines each.",
      subject: "physics",
      caption:
        "A tutor and ambitious are not the same shape. One is a person with an hour. The other is practice and marking whenever the question is there.",
      fields: [
        { key: "tutorOne", label: "A tutor, line one" },
        { key: "tutorTwo", label: "A tutor, line two" },
        { key: "tutorThree", label: "A tutor, line three" },
        { key: "ambitiousOne", label: "ambitious, line one" },
        { key: "ambitiousTwo", label: "ambitious, line two" },
        { key: "ambitiousThree", label: "ambitious, line three" },
      ],
    },
    {
      id: "brand",
      name: "Brand board",
      use: "The logotype, colours, type and tagline in one place.",
      subject: "economics",
      caption:
        "The ambitious brand board: one wordmark, Geist in two weights, the subject colours, and one plain tagline.",
      fields: [
        { key: "tagline", label: "Tagline", multiline: true },
        { key: "specimen", label: "Type specimen", multiline: true },
      ],
    },
    {
      id: "crop",
      name: "Crop",
      use: "A photograph with a question card laid over it.",
      subject: "geography",
      caption:
        "A question card belongs in the world where revision actually happens. Drop in a photograph and export the crop.",
      fields: [
        { key: "stem", label: "Question stem", multiline: true },
        { key: "answer", label: "Correct answer", multiline: true },
      ],
    },
  ];

  const DEFAULT_FIELDS = {
    statement: {
      headline: "Every answer is marked against the scheme, point by point.",
    },
    question: {
      stem: REAL_QUESTION.stem,
      optionA: REAL_QUESTION.options[0],
      optionB: REAL_QUESTION.options[1],
      optionC: REAL_QUESTION.options[2],
      optionD: REAL_QUESTION.options[3],
      tariff: REAL_QUESTION.marks,
    },
    markscheme: {
      stem: REAL_SCHEME.stem,
      answer: REAL_SCHEME.answer,
      pointOne: REAL_SCHEME.pointOne,
      pointTwo: REAL_SCHEME.pointTwo,
      examiner: REAL_SCHEME.examiner,
      score: REAL_SCHEME.score,
    },
    number: {
      figure: "2,361",
      line: "questions written with mark schemes.",
    },
    quote: {
      quote: "",
      name: "",
      subjectLine: "",
    },
    comparison: {
      tutorOne: "One hour at a time",
      tutorTwo: "One subject at a time",
      tutorThree: "Feedback after the lesson",
      ambitiousOne: "Practice whenever the question is there",
      ambitiousTwo: "16 GCSE subjects in one place",
      ambitiousThree: "Marking point by point, while you answer",
    },
    brand: {
      tagline: "Learn ambitious things in the fastest time.",
      specimen: "Exam practice, marked point by point.",
    },
    crop: {
      stem: REAL_QUESTION.stem,
      answer: REAL_QUESTION.options[REAL_QUESTION.answer],
    },
  };

  const layoutsById = new Map(LAYOUTS.map((layout) => [layout.id, layout]));
  const layoutStates = new Map();
  const previewObservers = new Map();
  let current = stateFor("statement");
  let toastTimer = 0;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function stateFor(layoutId) {
    if (!layoutStates.has(layoutId)) {
      const layout = layoutsById.get(layoutId);
      layoutStates.set(layoutId, {
        layout: layoutId,
        size: "portrait",
        subject: layout.subject,
        invert: false,
        align: "left",
        fields: clone(DEFAULT_FIELDS[layoutId]),
        image: "",
      });
    }
    return layoutStates.get(layoutId);
  }

  function freshState(layoutId) {
    const layout = layoutsById.get(layoutId);
    return {
      layout: layoutId,
      size: "portrait",
      subject: layout.subject,
      invert: false,
      align: "left",
      fields: clone(DEFAULT_FIELDS[layoutId]),
      image: "",
    };
  }

  function hexToRgb(hex) {
    const clean = hex.replace("#", "");
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16),
    };
  }

  function rgbToHex({ r, g, b }) {
    return `#${[r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("")}`;
  }

  function mix(a, b, amount) {
    const ca = hexToRgb(a);
    const cb = hexToRgb(b);
    return rgbToHex({
      r: ca.r * amount + cb.r * (1 - amount),
      g: ca.g * amount + cb.g * (1 - amount),
      b: ca.b * amount + cb.b * (1 - amount),
    });
  }

  function subjectColor(state) {
    return (SUBJECTS[state.subject] || SUBJECTS.economics).color;
  }

  function palette(state) {
    const subject = subjectColor(state);
    const invert = state.invert;
    return {
      subject,
      bg: invert ? INK : PAPER,
      fg: invert ? PAPER : INK,
      muted: invert ? PAPER_MUTED : INK_2,
      hairline: invert ? "rgba(253,252,249,0.28)" : "rgba(20,20,20,0.18)",
      strongline: invert ? "rgba(253,252,249,0.52)" : "rgba(20,20,20,0.36)",
      correct: invert ? subject : mix(subject, PAPER, 0.18),
      correctInk: INK,
      wash: mix(subject, PAPER, 0.28),
    };
  }

  function addRect(scene, x, y, w, h, fill, extra = {}) {
    scene.push({ type: "rect", x, y, w, h, fill, ...extra });
  }

  function addLine(scene, x1, y1, x2, y2, color, width = 1) {
    scene.push({ type: "line", x1, y1, x2, y2, color, width });
  }

  function addText(scene, text, x, y, w, options = {}) {
    scene.push({
      type: "text",
      text,
      x,
      y,
      w,
      size: options.size || 24,
      weight: options.weight || 400,
      leading: options.leading || 1.2,
      color: options.color || INK,
      align: options.align || "left",
      tracking: options.tracking ?? -0.01,
      key: options.key || "",
      editorOnly: !!options.editorOnly,
    });
  }

  function addWordmark(scene, x, y, h, color, accent, mark = false) {
    scene.push({ type: "wordmark", x, y, h, color, accent, mark });
  }

  function addTick(scene, x, y, size, color) {
    scene.push({ type: "tick", x, y, size, color });
  }

  function addImage(scene, src, x, y, w, h) {
    scene.push({ type: "image", src, x, y, w, h });
  }

  function addEditorNote(scene, text, x, y) {
    scene.push({ type: "note", text, x, y });
  }

  function footer(scene, state, p, mark = false) {
    const size = SIZES[state.size];
    const m = size.id === "portrait" ? 88 : 96;
    addWordmark(scene, m, size.h - m - 34, 32, p.fg, p.subject, mark);
  }

  function layoutScene(state) {
    const scene = [];
    const size = SIZES[state.size];
    const p = palette(state);
    const portrait = size.id === "portrait";
    const m = portrait ? 88 : 96;
    const cw = size.w - m * 2;
    const f = state.fields;
    addRect(scene, 0, 0, size.w, size.h, p.bg);

    if (state.layout === "statement") {
      addRect(scene, m, m, 10, portrait ? 156 : 120, p.subject);
      addText(scene, f.headline, m + (portrait ? 56 : 72), portrait ? 252 : 204, portrait ? 780 : 1210, {
        key: "headline",
        size: portrait ? 104 : 112,
        weight: 600,
        leading: 0.97,
        color: p.fg,
        align: state.align,
        tracking: -0.034,
      });
      footer(scene, state, p);
    }

    if (state.layout === "question") {
      addText(scene, REAL_QUESTION.source, m, m - 18, cw - 160, { size: 20, weight: 600, color: p.muted, tracking: -0.008 });
      addText(scene, f.tariff, m, m - 18, cw, { key: "tariff", size: 20, weight: 600, color: p.fg, align: "right", tracking: -0.008 });
      addLine(scene, m, m + 38, size.w - m, m + 38, p.hairline, 1);
      addText(scene, f.stem, m, portrait ? 168 : 152, cw, {
        key: "stem",
        size: portrait ? 48 : 50,
        weight: 600,
        leading: 1.08,
        color: p.fg,
        tracking: -0.022,
      });
      const start = portrait ? 420 : 342;
      const rowH = portrait ? 112 : 102;
      const options = [f.optionA, f.optionB, f.optionC, f.optionD];
      const letters = ["A", "B", "C", "D"];
      options.forEach((option, i) => {
        const y = start + i * rowH;
        const correct = i === REAL_QUESTION.answer;
        if (correct) addRect(scene, m, y - 10, cw, rowH - 12, p.correct);
        addText(scene, letters[i], m + (correct ? 26 : 0), y + 18, 42, { size: 24, weight: 600, color: correct ? p.correctInk : p.muted, tracking: 0 });
        addText(scene, option, m + (correct ? 92 : 66), y + 12, cw - (correct ? 124 : 66), {
          key: ["optionA", "optionB", "optionC", "optionD"][i],
          size: portrait ? 30 : 31,
          weight: correct ? 600 : 400,
          leading: 1.2,
          color: correct ? p.correctInk : p.fg,
          tracking: -0.012,
        });
        if (!correct) addLine(scene, m, y + rowH - 14, size.w - m, y + rowH - 14, p.hairline, 1);
      });
      footer(scene, state, p);
    }

    if (state.layout === "markscheme") {
      if (portrait) {
        addText(scene, REAL_SCHEME.source, m, m - 20, cw - 140, { size: 20, weight: 600, color: p.muted });
        addText(scene, f.score, m, m - 20, cw, { key: "score", size: 20, weight: 600, color: p.fg, align: "right" });
        addLine(scene, m, m + 34, size.w - m, m + 34, p.hairline, 1);
        addText(scene, f.stem, m, 150, cw, { key: "stem", size: 29, weight: 600, leading: 1.18, color: p.fg, tracking: -0.015 });
        addText(scene, f.answer, m + 58, 306, cw - 58, {
          key: "answer",
          size: 38,
          weight: 400,
          leading: 1.28,
          color: p.fg,
          tracking: -0.018,
        });
        addTick(scene, m, 316, 34, p.subject);
        addTick(scene, m, 468, 34, p.subject);
        addLine(scene, m, 744, size.w - m, 744, p.hairline, 1);
        markPoint(scene, f.pointOne, "pointOne", m, 792, cw, "+2", p);
        markPoint(scene, f.pointTwo, "pointTwo", m, 894, cw, "+2", p);
        addText(scene, `Examiner’s words: ${f.examiner}`, m, 1046, cw, {
          key: "examiner",
          size: 24,
          weight: 400,
          leading: 1.3,
          color: p.muted,
          tracking: -0.008,
        });
      } else {
        addText(scene, REAL_SCHEME.source, m, m - 20, 760, { size: 20, weight: 600, color: p.muted });
        addText(scene, f.score, size.w - m - 520, m - 20, 520, { key: "score", size: 20, weight: 600, color: p.fg, align: "right" });
        addLine(scene, m, m + 34, size.w - m, m + 34, p.hairline, 1);
        addText(scene, f.stem, m, 148, 800, { key: "stem", size: 28, weight: 600, leading: 1.18, color: p.fg, tracking: -0.015 });
        addText(scene, f.answer, m + 54, 288, 760, {
          key: "answer",
          size: 34,
          weight: 400,
          leading: 1.28,
          color: p.fg,
          tracking: -0.016,
        });
        addTick(scene, m, 298, 32, p.subject);
        addTick(scene, m, 430, 32, p.subject);
        addLine(scene, 1000, 150, 1000, size.h - m - 72, p.hairline, 1);
        markPoint(scene, f.pointOne, "pointOne", 1052, 220, 452, "+2", p);
        markPoint(scene, f.pointTwo, "pointTwo", 1052, 372, 452, "+2", p);
        addText(scene, `Examiner’s words: ${f.examiner}`, 1052, 566, 452, {
          key: "examiner",
          size: 23,
          weight: 400,
          leading: 1.3,
          color: p.muted,
          tracking: -0.008,
        });
      }
      footer(scene, state, p);
    }

    if (state.layout === "number") {
      const align = state.align;
      const fx = align === "center" ? m : align === "right" ? m : m;
      addText(scene, f.figure, fx, portrait ? 286 : 190, cw, {
        key: "figure",
        size: portrait ? 268 : 292,
        weight: 600,
        leading: 0.9,
        color: p.fg,
        align,
        tracking: -0.052,
      });
      const lineY = portrait ? 598 : 510;
      addRect(scene, align === "right" ? size.w - m - 220 : align === "center" ? size.w / 2 - 110 : m, lineY - 34, 220, 10, p.subject);
      addText(scene, f.line, m, lineY + 22, cw, {
        key: "line",
        size: portrait ? 42 : 46,
        weight: 400,
        leading: 1.12,
        color: p.fg,
        align,
        tracking: -0.02,
      });
      footer(scene, state, p);
    }

    if (state.layout === "quote") {
      const hasQuote = f.quote.trim().length > 0;
      addRect(scene, m, m, portrait ? 168 : 220, 10, p.subject);
      addText(scene, hasQuote ? `“${f.quote}”` : "Student quote not supplied.", m, portrait ? 242 : 180, portrait ? 850 : 1240, {
        key: "quote",
        size: portrait ? 68 : 76,
        weight: 400,
        leading: 1.08,
        color: hasQuote ? p.fg : p.muted,
        align: state.align,
        tracking: -0.027,
      });
      if (!hasQuote) {
        addText(scene, "The slot stays empty until the owner supplies a real student’s words.", m, portrait ? 438 : 386, portrait ? 760 : 1120, {
          size: portrait ? 28 : 30,
          weight: 400,
          leading: 1.24,
          color: p.muted,
          align: state.align,
          tracking: -0.01,
        });
      }
      addLine(scene, m, portrait ? 806 : 604, m + (portrait ? 220 : 260), portrait ? 806 : 604, p.strongline, 2);
      addText(scene, f.name || "Name appears with the quote", m, portrait ? 850 : 648, cw, { key: "name", size: 28, weight: 600, color: hasQuote ? p.fg : p.muted, align: state.align, tracking: -0.012 });
      addText(scene, f.subjectLine || "Subject appears with the quote", m, portrait ? 894 : 694, cw, { key: "subjectLine", size: 24, weight: 400, color: p.muted, align: state.align, tracking: -0.008 });
      footer(scene, state, p);
    }

    if (state.layout === "comparison") {
      const gutter = portrait ? 56 : 88;
      const colW = (cw - gutter) / 2;
      const rightX = m + colW + gutter;
      addText(scene, "A tutor", m, portrait ? 132 : 116, colW, { size: 34, weight: 600, color: p.fg, tracking: -0.018 });
      addText(scene, "ambitious", rightX, portrait ? 132 : 116, colW, { size: 34, weight: 600, color: p.fg, tracking: -0.018 });
      addRect(scene, rightX, portrait ? 184 : 168, 128, 8, p.subject);
      addLine(scene, m + colW + gutter / 2, portrait ? 132 : 116, m + colW + gutter / 2, size.h - m - 90, p.hairline, 1);
      const left = [f.tutorOne, f.tutorTwo, f.tutorThree];
      const right = [f.ambitiousOne, f.ambitiousTwo, f.ambitiousThree];
      const keysL = ["tutorOne", "tutorTwo", "tutorThree"];
      const keysR = ["ambitiousOne", "ambitiousTwo", "ambitiousThree"];
      const rowStart = portrait ? 270 : 238;
      const rowGap = portrait ? 178 : 142;
      left.forEach((text, i) => comparisonLine(scene, text, keysL[i], m, rowStart + i * rowGap, colW, p, false, portrait));
      right.forEach((text, i) => comparisonLine(scene, text, keysR[i], rightX, rowStart + i * rowGap, colW, p, true, portrait));
      footer(scene, state, p);
    }

    if (state.layout === "brand") {
      addWordmark(scene, m, m, portrait ? 64 : 58, p.fg, p.subject, true);
      addText(scene, f.tagline, m, portrait ? 204 : 174, cw, {
        key: "tagline",
        size: portrait ? 34 : 36,
        weight: 400,
        color: p.fg,
        tracking: -0.016,
      });
      addLine(scene, m, portrait ? 310 : 270, size.w - m, portrait ? 310 : 270, p.hairline, 1);
      addText(scene, f.specimen, m, portrait ? 366 : 320, cw, {
        key: "specimen",
        size: portrait ? 54 : 58,
        weight: 600,
        leading: 1.02,
        color: p.fg,
        tracking: -0.026,
      });
      const entries = Object.entries(SUBJECTS);
      const cols = portrait ? 4 : 5;
      const gap = portrait ? 18 : 20;
      const sw = (cw - gap * (cols - 1)) / cols;
      const startY = portrait ? 570 : 472;
      const rowH = portrait ? 112 : 88;
      entries.forEach(([id, subject], i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = m + col * (sw + gap);
        const y = startY + row * rowH;
        addRect(scene, x, y, sw, portrait ? 58 : 46, subject.color, { swatch: id });
        addText(scene, `${subject.name}  ${subject.color}`, x, y + (portrait ? 68 : 54), sw, {
          size: portrait ? 17 : 16,
          weight: 400,
          color: p.muted,
          tracking: -0.004,
        });
      });
    }

    if (state.layout === "crop") {
      if (state.image) addImage(scene, state.image, 0, 0, size.w, size.h);
      else addRect(scene, 0, 0, size.w, size.h, state.invert ? mix(p.subject, INK, 0.34) : p.wash);
      const cardX = portrait ? m : 96;
      const cardY = portrait ? 206 : 142;
      const cardW = portrait ? cw : 760;
      const cardH = portrait ? 760 : 610;
      addRect(scene, cardX, cardY, cardW, cardH, PAPER, { stroke: state.image ? "rgba(20,20,20,0.38)" : "rgba(20,20,20,0.24)", lineWidth: 1 });
      addText(scene, REAL_QUESTION.source, cardX + 44, cardY + 44, cardW - 88, { size: 19, weight: 600, color: INK_2, tracking: -0.006 });
      addLine(scene, cardX + 44, cardY + 92, cardX + cardW - 44, cardY + 92, "rgba(20,20,20,0.16)", 1);
      addText(scene, f.stem, cardX + 44, cardY + 140, cardW - 88, {
        key: "stem",
        size: portrait ? 43 : 42,
        weight: 600,
        leading: 1.1,
        color: INK,
        tracking: -0.022,
      });
      addRect(scene, cardX + 44, cardY + (portrait ? 384 : 330), cardW - 88, portrait ? 118 : 108, mix(p.subject, PAPER, 0.2));
      addText(scene, f.answer, cardX + 76, cardY + (portrait ? 416 : 358), cardW - 152, {
        key: "answer",
        size: portrait ? 31 : 30,
        weight: 600,
        leading: 1.2,
        color: INK,
        tracking: -0.012,
      });
      addWordmark(scene, cardX + 44, cardY + cardH - 76, 28, INK, p.subject, false);
      if (!state.image) addEditorNote(scene, "Drop a photograph on the canvas", portrait ? size.w - 340 : size.w - 390, 44);
    }

    return scene;
  }

  function markPoint(scene, text, key, x, y, w, marks, p) {
    addTick(scene, x, y + 4, 30, p.subject);
    addText(scene, text, x + 48, y, w - 130, { key, size: 29, weight: 600, leading: 1.18, color: p.fg, tracking: -0.014 });
    addText(scene, marks, x, y + 4, w, { size: 24, weight: 600, color: p.muted, align: "right", tracking: -0.008 });
  }

  function comparisonLine(scene, text, key, x, y, w, p, ambitious, portrait) {
    addText(scene, text, x, y, w, {
      key,
      size: portrait ? 34 : 36,
      weight: ambitious ? 600 : 400,
      leading: 1.18,
      color: p.fg,
      tracking: -0.018,
    });
    addLine(scene, x, y + (portrait ? 104 : 92), x + w, y + (portrait ? 104 : 92), ambitious ? p.strongline : p.hairline, 1);
  }

  function wordmarkSvg(color, accent, mark = false) {
    const data = window.AD_WORDMARK || { mark: "", word: "", accent: "" };
    const viewBox = mark ? "0 -883 5446 895" : "0 -883 4603 895";
    const markPart = mark ? `<path fill="${color}" transform="translate(0 -720) scale(1.16129)" d="${data.mark}"/>` : "";
    const shift = mark ? ` translate(843 0)` : "";
    return `<svg viewBox="${viewBox}" role="img" aria-label="ambitious">${markPart}<g transform="${shift}"><path fill="${color}" d="${data.word}"/><path fill="${accent}" d="${data.accent}"/></g></svg>`;
  }

  function makePath(path) { return new Path2D(path); }
  let wordPath, markPath, accentPath;
  function ensurePaths() {
    const data = window.AD_WORDMARK || { mark: "", word: "", accent: "" };
    if (!wordPath) { wordPath = makePath(data.word); markPath = makePath(data.mark); accentPath = makePath(data.accent); }
  }
  function drawWordmark(ctx, el) {
    ensurePaths();
    const s = el.h / 895;
    ctx.save(); ctx.translate(el.x, el.y + 883 * s); ctx.scale(s, s);
    if (el.mark) { ctx.save(); ctx.translate(0, -720); ctx.scale(1.16129, 1.16129); ctx.fillStyle = el.color; ctx.fill(markPath); ctx.restore(); ctx.translate(843, 0); }
    ctx.fillStyle = el.color; ctx.fill(wordPath); ctx.fillStyle = el.accent; ctx.fill(accentPath); ctx.restore();
  }
  function drawTick(ctx, el) {
    ctx.save(); ctx.strokeStyle = el.color; ctx.lineWidth = el.w / 8; ctx.lineCap = "square"; ctx.beginPath();
    ctx.moveTo(el.x + el.w * .16, el.y + el.h * .55); ctx.lineTo(el.x + el.w * .38, el.y + el.h * .76); ctx.lineTo(el.x + el.w * .86, el.y + el.h * .22); ctx.stroke(); ctx.restore();
  }
  function fontFor(el) { return `${el.weight || 400} ${el.size || 24}px Geist, ui-sans-serif, system-ui, sans-serif`; }
  function wrapLines(ctx, text, maxWidth) {
    const out = [];
    for (const paragraph of String(text || "").split(/\n/)) {
      const words = paragraph.split(/\s+/).filter(Boolean), lines = [];
      let line = "";
      for (const word of words) {
        const trial = line ? `${line} ${word}` : word;
        if (ctx.measureText(trial).width <= maxWidth || !line) line = trial;
        else { lines.push(line); line = word; }
      }
      lines.push(line); out.push(...lines);
    }
    return out;
  }
  function drawText(ctx, el) {
    ctx.save(); ctx.font = fontFor(el); ctx.fillStyle = el.color || INK; ctx.textBaseline = "top"; ctx.textAlign = el.align || "left";
    if ("letterSpacing" in ctx) ctx.letterSpacing = `${(el.tracking || 0) * (el.size || 24)}px`;
    const x = el.align === "center" ? el.x + el.w / 2 : el.align === "right" ? el.x + el.w : el.x;
    wrapLines(ctx, el.text, el.w).forEach((line, i) => ctx.fillText(line, x, el.y + i * el.size * (el.leading || 1.2)));
    ctx.restore();
  }
  function loadImage(src) { return new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = src; }); }
  async function drawImageCover(ctx, el) {
    const img = await loadImage(el.src);
    const scale = Math.max(el.w / img.naturalWidth, el.h / img.naturalHeight);
    const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
    ctx.save(); ctx.beginPath(); ctx.rect(el.x, el.y, el.w, el.h); ctx.clip(); ctx.drawImage(img, el.x + (el.w - w) / 2, el.y + (el.h - h) / 2, w, h); ctx.restore();
  }
  async function drawScene(ctx, scene) {
    for (const el of scene) {
      if (el.type === "note" || el.hidden) continue;
      ctx.save(); ctx.globalAlpha = el.opacity ?? 1;
      if (el.type === "rect") {
        ctx.fillStyle = el.fill || "transparent";
        if (el.radius) { ctx.beginPath(); ctx.roundRect(el.x, el.y, el.w, el.h, Math.min(el.radius, el.w / 2, el.h / 2)); ctx.fill(); }
        else ctx.fillRect(el.x, el.y, el.w, el.h);
        if (el.stroke) { ctx.strokeStyle = el.stroke; ctx.lineWidth = el.lineWidth || 1; ctx.strokeRect(el.x, el.y, el.w, el.h); }
      } else if (el.type === "line") {
        ctx.strokeStyle = el.color || INK; ctx.lineWidth = el.lineWidth || el.width || 1; ctx.beginPath(); ctx.moveTo(el.x1, el.y1); ctx.lineTo(el.x2, el.y2); ctx.stroke();
      } else if (el.type === "text") drawText(ctx, el);
      else if (el.type === "wordmark") drawWordmark(ctx, el);
      else if (el.type === "tick") drawTick(ctx, el);
      else if (el.type === "image") await drawImageCover(ctx, el);
      ctx.restore();
    }
  }
  async function renderPng(frame) {
    await document.fonts.ready; await Promise.all([document.fonts.load("400 32px Geist"), document.fonts.load("600 32px Geist")]);
    const canvas = document.createElement("canvas"); canvas.width = frame.w; canvas.height = frame.h;
    await drawScene(canvas.getContext("2d"), frame.scene);
    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  }

  const STORAGE = "jawad-ad-canvas-v4";
  let idCounter = 1;
  const uid = (prefix = "node") => `${prefix}-${Date.now().toString(36)}-${idCounter++}`;
  function textHeight(node) {
    const c = document.createElement("canvas").getContext("2d"); c.font = fontFor(node);
    if ("letterSpacing" in c) c.letterSpacing = `${(node.tracking || 0) * node.size}px`;
    return Math.max(1, wrapLines(c, node.text, node.w).length * node.size * (node.leading || 1.2));
  }
  function normalise(el) {
    const node = { id: uid(), name: "", locked: false, hidden: false, opacity: 1, ...el, };
    if (node.type === "text") node.h = textHeight(node);
    if (node.type === "wordmark") node.w = ((node.mark ? 5446 : 4603) / 895) * node.h;
    if (node.type === "tick") { node.w = node.size; node.h = node.size; }
    if (node.type === "line") {
      node.x = Math.min(node.x1, node.x2); node.y = Math.min(node.y1, node.y2);
      node.w = Math.max(1, Math.abs(node.x2 - node.x1)); node.h = Math.max(1, Math.abs(node.y2 - node.y1));
      node.vertical = Math.abs(node.x2 - node.x1) < 1;
    }
    node.name = node.name || node.text?.slice(0, 36) || node.key || node.type;
    return node;
  }
  function makeFrame(layoutId, x = 0, y = 0) {
    const layout = layoutsById.get(layoutId) || LAYOUTS[0];
    const state = { ...freshState(layout.id), size: "portrait" };
    return {
      id: uid("frame"), name: layout.name, preset: layout.id, x, y, w: 1080, h: 1350,
      caption: layout.caption, scene: layoutScene(state).map(normalise),
    };
  }
  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE));
      if (data?.frames?.length) return data;
    } catch {}
    return { frames: [makeFrame("statement"), makeFrame("question", 1224)], selected: null, active: null, zoom: .38, panX: 72, panY: 66 };
  }
  let board = load();
  let active = board.frames.find(f => f.id === board.active) || board.frames[0];
  let selected = Array.isArray(board.selected) ? board.selected : [];
  let zoom = Number(board.zoom) || .38, panX = Number(board.panX) || 72, panY = Number(board.panY) || 66;
  let history = [], future =[], editing = null, gesture = null, saveTimer, fitPadding = 54;
  const snapshot = () => JSON.stringify({ frames: board.frames });
  function commit(before) { if (!before || before === snapshot()) return; history.push(before); if (history.length > 200) history.shift(); future = []; save(); }
  function undo() {
    if (editing || !history.length) return;
    future.push(snapshot()); board.frames = JSON.parse(history.pop()).frames; restoreSelection(); refresh(); save();
  }
  function redo() {
    if (editing || !future.length) return;
    history.push(snapshot()); board.frames = JSON.parse(future.pop()).frames; restoreSelection(); refresh(); save();
  }
  function restoreSelection() {
    active = board.frames.find(f => f.id === active?.id) || board.frames[0];
    selected = selected.filter(id => active.scene.some(n => n.id === id));
  }
  function save() {
    clearTimeout(saveTimer); saveTimer = setTimeout(() => {
      try { localStorage.setItem(STORAGE, JSON.stringify({ frames: board.frames, selected, active: active?.id, zoom, panX, panY })); setText("save-status", "Saved locally"); }
      catch { setText("save-status", "Image too large to save"); }
    }, 180);
  }
  function setText(sel, text) { const n = root.querySelector(`[data-${sel}]`); if (n) n.textContent = text; }
  function toast(message) {
    const n = root.querySelector(".ad-toast"); n.textContent = message; n.dataset.show = "true";
    clearTimeout(toastTimer); toastTimer = setTimeout(() => n.dataset.show = "false", 2400);
  }
  function esc(text) { const d = document.createElement("div"); d.textContent = String(text); return d.innerHTML; }
  function nodeElement(node) {
    let el;
    if (node.type === "image") { el = document.createElement("img"); el.src = node.src; el.alt = node.name; }
    else { el = document.createElement("div"); if (node.type === "text") el.textContent = node.text; }
    el.className = `scene-node scene-${node.type}`; el.dataset.node = node.id;
    Object.assign(el.style, { left: `${node.x}px`, top: `${node.y}px`, width: `${node.w}px`, height: `${node.h}px`, opacity: node.opacity, });
    if (node.type === "text") Object.assign(el.style, { fontSize: `${node.size}px`, lineHeight: node.leading, fontWeight: node.weight, color: node.color, textAlign: node.align, letterSpacing: `${node.tracking}em`, });
    if (node.type === "rect") Object.assign(el.style, { background: node.fill, borderRadius: `${node.radius || 0}px`, boxShadow: node.stroke ? `inset 0 0 0 ${node.lineWidth || 1}px ${node.stroke}` : "none" });
    if (node.type === "line") Object.assign(el.style, { background: node.color, width: node.vertical ? `${node.width || 1}px` : `${node.w}px`, height: node.vertical ? `${node.h}px` : `${node.width || 1}px`, });
    if (node.type === "wordmark") el.innerHTML = wordmarkSvg(node.color, node.accent, node.mark);
    if (node.type === "tick") { el.innerHTML = `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 17.5 12 24 27 7" fill="none" stroke="${node.color}" stroke-width="4" stroke-linecap="square"/></svg>`; }
    if (node.type === "image") el.draggable = false;
    if (node.hidden) el.style.display = "none";
    el.setAttribute("aria-label", `${node.type}: ${node.name}`);
    if (node.locked) el.dataset.locked = "true";
    return el;
  }
  function renderCanvas() {
    const world = root.querySelector("[data-world]");
    world.innerHTML = "";
    for (const frame of board.frames) {
      const f = document.createElement("section"); f.className = "artboard"; f.dataset.frame = frame.id;
      f.innerHTML = `<h2 class="frame-title">${esc(frame.name)}<span>${frame.w} × ${frame.h}</span></h2>`;
      const scene = document.createElement("div"); scene.className = "scene"; scene.dataset.scene = frame.id;
      Object.assign(f.style, { left: `${frame.x}px`, top: `${frame.y}px`, width: `${frame.w}px`, height: `${frame.h}px` });
      for (const node of frame.scene) scene.appendChild(nodeElement(node));
      f.appendChild(scene); world.appendChild(f);
    }
    world.style.transform = `translate(${panX}px,${panY}px) scale(${zoom})`;
    for (const shape of root.querySelectorAll(".marquee,.guide")) shape.remove();
    drawSelection();
    root.querySelector("[data-workspace]").classList.toggle("is-panning", !!gesture?.space);
    setText("zoom-label", `${Math.round(zoom * 100)}%`);
    setText("canvas-count", `${board.frames.length} frames`);
  }
  function currentSelection() { return active.scene.filter(n => selected.includes(n.id)); }
  function positionOverlay(overlay, bounds, title) {
    Object.assign(overlay.style, { left: `${panX + (active.x + bounds.x) * zoom}px`, top: `${panY + (active.y + bounds.y) * zoom}px`, width: `${bounds.w * zoom}px`, height: `${bounds.h * zoom}px` });
    overlay.querySelector(".selection-name").textContent = title;
  }
  function drawSelection() {
    for (const e of root.querySelectorAll(".selection-overlay")) e.remove();
    if (editing || !selected.length) return;
    let lastSelection = null;
    for (const id of selected) {
      const node = active.scene.find(n => n.id === id); if (!node || node.hidden) continue;
      const e = document.createElement("div"); e.className = `selection-overlay${selected.length > 1 ? " multi" : ""}`; e.innerHTML=`<span class="selection-name"></span>`; positionOverlay(e, node, node.name);
      root.querySelector("[data-overlay]").appendChild(e); lastSelection = e;
    }
    if (selected.length === 1 && lastSelection && !active.scene.find(n => n.id === selected[0])?.locked) {
      const bounds = currentSelection()[0];
      const handles = document.createElement("div"); handles.className = "resize-handles";
      handles.dataset.node = bounds.id;
      for (const pos of ["nw","n","ne","e","se","s","sw","w"]) {
        const h = document.createElement("span"); h.className = "resize-handle"; h.dataset.resize = pos;
        const [px,py] = { nw:[0,0],n:[50,0],ne:[100,0,"end"],e:[100,50,"mid"],se:[100,100],s:[50,100],sw:[0,100],w:[0,50,"mid"] }[pos];
        h.style.left = `${px}%`; h.style.top = `${py}%`; handles.appendChild(h);
      }
      lastSelection.appendChild(handles);
    }
  }
  function renderFrames() {
    const list = root.querySelector("[data-frame-list]"); list.innerHTML = "";
    board.frames.forEach((f, index) => {
      const card = document.createElement("div"); card.className = "frame-card"; card.dataset.active = String(f.id === active.id); card.dataset.frameCard = f.id;
      const label = document.createElement("button"); label.className = "frame-card-label"; label.dataset.selectFrame = f.id;
      label.innerHTML = `<span class="frame-number">${String(index + 1).padStart(2,"0")}</span><span>${esc(f.name)}<small>${f.scene.length} elements</small></span>`;
      const mini = document.createElement("button"); mini.className = "frame-mini"; mini.dataset.selectFrame = f.id; mini.setAttribute("aria-label", `Edit ${f.name}`);
      mini.innerHTML = `<canvas width="216" height="270" data-mini="${f.id}"></canvas>`;
      card.append(mini,label); list.appendChild(card);
      drawScene(mini.querySelector("canvas").getContext("2d").scale ? (() => { const ctx = mini.querySelector("canvas").getContext("2d"); ctx.scale(.2,.2); return ctx; })() : null, f.scene);
    });
  }
  function inspectorField(label, prop, value, options = {}) {
    return `<label class="inspector-field ${options.wide ? "wide" : ""}"><span>${label}</span><input data-prop="${prop}" type="${options.type || "number"}" value="${esc(value)}" ${options.min !== undefined ? `min="${options.min}"` : ""} ${options.max !== undefined ? `max="${options.max}"` : ""} ${options.step ? `step="${options.step}"` : ""}></label>`;
  }
  function inspector() {
    const panel = root.querySelector("[data-inspector]");
    const nodes = currentSelection();
    if (!nodes.length) {
      panel.innerHTML = `<div class="no-selection"><span class="no-selection-icon">↖</span><h3>Make it yours.</h3><p>Select anything on the canvas.<br>Double-click text to rewrite it.</p></div>
      <section class="inspector-section eyebrow-section"><div class="section-heading">Frame</div>${inspectorField("Name","frameName",active.name,{type:"text",wide:true})}<div class="inspector-grid">${inspectorField("Width","frameW",active.w)}${inspectorField("Height","frameH",active.h)}</div><p class="tiny-note">Presets detach when added. Your edits stay yours.</p></section>
      <section class="inspector-section"><div class="section-heading">Scene JSON <button class="text-link" data-action="copy-json">Copy</button></div><textarea class="json-view" data-json aria-label="Scene JSON" spellcheck="false">${esc(JSON.stringify({ id: active.id, name: active.name, width: active.w, height: active.h, nodes: active.scene }, null, 2))}</textarea><button class="button secondary full" data-action="apply-json">Apply scene JSON</button></section>`;
    } else {
      const n = nodes[0], many = nodes.length > 1;
      const common = nodes.every(t=>t.type===n.type);
      let html = `<div class="selected-heading"><span class="node-type-icon">${n.type === "text" ? "T" : n.type === "rect" ? "□" : n.type === "image" ? "▧" : "◇"}</span><div><strong>${many ? `${nodes.length} elements` : esc(n.name)}</strong><small>${many ? "Multiple selection" : n.type}</small></div><span class="live-dot"></span></div>`;
      html += `<section class="inspector-section"><div class="section-heading">Position & size</div><div class="inspector-grid">${inspectorField("X","x",Math.round(n.x*10)/10)}${inspectorField("Y","y",Math.round(n.y*10)/10)}${inspectorField("W","w",Math.round(n.w*10)/10,{min:1})}${inspectorField("H","h",Math.round(n.h*10)/10,{min:1})}</div></section>`;
      if (!many && n.type === "text") html += `<section class="inspector-section"><div class="section-heading">Text</div><textarea class="text-input" data-prop="text">${esc(n.text)}</textarea><div class="inspector-grid">${inspectorField("Size","size",n.size)}${inspectorField("Line height","leading",n.leading,{step:.01})}${inspectorField("Tracking","tracking",n.tracking,{step:.005})}${inspectorField("Weight","weight",n.weight,{type:"number"})}</div><div class="section-heading small">Alignment</div><div class="segmented">${["left","center","right"].map(a=>`<button data-style="align" data-value="${a}" aria-pressed="${n.align===a}">${{left:"Left",center:"Centre",right:"Right"}[a]}</button>`).join("")}</div>${inspectorField("Colour","color",n.color,{type:"text",wide:true})}</section>`;
      if (!many && ["rect","line","image","wordmark"].includes(n.type)) html += `<section class="inspector-section"><div class="section-heading">Appearance</div>${n.type === "rect" ? `${inspectorField("Fill","fill",n.fill,{type:"text",wide:true})}<div class="inspector-grid">${inspectorField("Stroke","stroke",n.stroke || "",{type:"text"})}${inspectorField("Radius","radius",n.radius || 0)}</div>` : ""}${n.type === "line" ? inspectorField("Colour","color",n.color,{type:"text",wide:true}) : ""}</section>`;
      html += `<section class="inspector-section"><div class="section-heading">Arrange</div><div class="button-row"><button class="button secondary" data-action="backward">Back</button><button class="button secondary" data-action="forward">Forward</button><button class="icon-button" title="Lock" aria-label="${n.locked?"Unlock":"Lock"}" data-action="lock">${n.locked?"🔒":"⌑"}</button><button class="icon-button" title="Hide" aria-label="${n.hidden?"Show":"Hide"}" data-action="hide">${n.hidden?"◉":"◌"}</button><button class="icon-button danger" aria-label="Delete" data-action="delete">⌫</button></div><label class="range-label"><span>Opacity</span><output>${Math.round(n.opacity * 100)}%</output><input type="range" min="0" max="1" step="0.05" data-prop="opacity" value="${n.opacity}"></label></section>`;
      if (!many && n.type === "text") html += `<button class="hint-action" data-action="edit-text">Double-click on canvas to edit in place ↗</button>`;
      else if (many) html += `<p class="tiny-note">Move, nudge or reorder the selection together.</p>`;
      panel.innerHTML = html;
    }
    root.querySelector("[data-undo]").disabled = !history.length; root.querySelector("[data-redo]").disabled = !future.length;
    setText("inspector-context", `${active.name} / ${selected.length ? `${selected.length} selected` : "Scene"}`);
  }
  function refresh() { renderCanvas(); renderFrames(); inspector(); }
  function worldPoint(event) {
    const r = root.querySelector("[data-workspace]").getBoundingClientRect();
    return { x: (event.clientX - r.left - panX) / zoom, y: (event.clientY - r.top - panY) / zoom };
  }
  function hitFrame(point, slop = 0) {
    return [...board.frames].find(f => point.x >= f.x - slop && point.x <= f.x + f.w + slop && point.y >= f.y - slop && point.y <= f.y + f.h + slop);
  }
  function hitNode(frame, point) {
    return [...frame.scene].reverse().find(n => !n.hidden && (point.x - frame.x >= n.x - 2/zoom) && (point.x-frame.x <= n.x+n.w+2/zoom) && (point.y-frame.y >= n.y-2/zoom) && (point.y-frame.y <= n.y+n.h+2/zoom));
  }
  function selectFrame(id, activate = true) { const f = board.frames.find(f=>f.id===id); if (!f) return; active = f; if (activate) selected = []; refresh(); }
  function selectNode(id, add = false) { if (add) { if (!selected.includes(id)) selected.push(id); } else selected = [id]; renderCanvas(); inspector(); }
  function snap(value, targets) { let best=value,guide=null,distance=8/zoom;for(const target of targets){const d=Math.abs(target-value);if(d<distance){best=target;guide=target;distance=d;}}return {value:best,guide}; }
  function dragSelection(dx, dy) {
    const nodes = currentSelection(); if (!nodes.length) return;
    const first = nodes[0], tx = first.x + dx, ty = first.y + dy;
    const sx = snap(tx, [0,active.w/2-first.w/2,active.w-first.w,...active.scene.filter(n=>!selected.includes(n.id)).flatMap(n=>[n.x,n.x+n.w/2,n.x+n.w-first.w/2])]);
    const sy = snap(ty, [0,active.h/2-first.h/2,active.h-first.h,...active.scene.filter(n=>!selected.includes(n.id)).flatMap(n=>[n.y,n.y+n.h/2,n.y+n.h-first.h/2])]);
    dx += sx.value - tx; dy += sy.value - ty;
    nodes.forEach(n => { if (!n.locked) { n.x = gesture.starts[n.id].x+dx; n.y=gesture.starts[n.id].y+dy; } });
    showGuide(sx.guide,sy.guide); updateCanvasNodes();
  }
  function updateCanvasNodes() {
    for (const n of active.scene) {
      const el = root.querySelector(`[data-scene="${active.id}"] [data-node="${n.id}"]`); if (!el) continue;
      el.style.left = `${n.x}px`; el.style.top = `${n.y}px`; el.style.width = `${n.type === "line" && n.vertical ? n.width : n.w}px`; el.style.height = `${n.type === "line" && !n.vertical ? n.width : n.h}px`;
    }
    drawSelection();
  }
  function showGuide(x,y) {
    for (const g of root.querySelectorAll(".guide")) g.remove();
    if (x!==null) { const g = document.createElement("div"); g.className="guide guide-x"; g.style.left=`${active.x+x}px`; root.querySelector("[data-world]").appendChild(g); }
    if (y!==null) { const g = document.createElement("div"); g.className="guide guide-y"; g.style.top=`${active.y+y}px`; root.querySelector("[data-world]").appendChild(g); }
  }
  function beginEdit(id) {
    const n = active.scene.find(n=>n.id===id); if (!n || n.type!=="text" || n.locked) return;
    editing = { id, before: snapshot(), original: n.text };
    renderCanvas(); const el = root.querySelector(`[data-node="${id}"]`);
    el.contentEditable = "plaintext-only"; el.classList.add("editing-text"); el.focus();
    const range = document.createRange(); range.selectNodeContents(el); const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range); sel.collapseToEnd();
    setText("edit-hint","Editing text · Esc to cancel"); inspector();
  }
  function endEdit(cancel=false) {
    if (!editing) return;
    const n = active.scene.find(n=>n.id===editing.id); if (cancel && n) n.text = editing.original;
    if (n) { n.h = textHeight(n); n.name = n.text.slice(0,36) || "Text"; }
    commit(editing.before); editing = null; setText("edit-hint","Double-click text to edit"); refresh();
  }
  function addImageFile(file, point) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader(); reader.onload=()=>{
      const img = new Image(); img.onload=()=>{
        const before=snapshot(); const target=point ? hitFrame(point) || active : active; active=target;
        const w=Math.min(target.w*.65,700), h=w*img.naturalHeight/img.naturalWidth;
        const x=point ? Math.max(0,Math.min(target.w-w,point.x-target.x-w/2)) : (target.w-w)/2;
        const y=point ? Math.max(0,Math.min(target.h-h,point.y-target.y-h/2)) : (target.h-h)/2;
        const n=normalise({type:"image",src:reader.result,x,y,w,h,name:file.name});target.scene.push(n); selected=[n.id];commit(before);refresh();toast("Image added to your scene");
      }; img.src=reader.result;
    }; reader.readAsDataURL(file);
  }
  function exportJson() {
    const data={version:1,frames:board.frames};
    const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));
    download(url,"ad-canvas.json"); setTimeout(()=>URL.revokeObjectURL(url),1000);toast("Board JSON exported");
  }
  function download(url,name) { const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove(); }
  async function exportPng() {
    const btn=root.querySelector("[data-action=export-png]");btn.disabled=true;btn.textContent="Rendering…";
    try { const blob=await renderPng(active);if (!blob)throw Error();const url=URL.createObjectURL(blob);download(url,`${active.name.toLowerCase().replace(/\W+/g,"-")}-${active.w}x${active.h}.png`);setTimeout(()=>URL.revokeObjectURL(url),1000);toast(`PNG exported at ${active.w} × ${active.h}`); }
    catch {toast("Could not export this frame");} finally {btn.disabled=false;btn.textContent="Export PNG ↗";}
  }
  async function copyCaption() {
    try{await navigator.clipboard.writeText(active.caption||"");toast("Caption copied");}catch{toast("Clipboard unavailable");}
  }
  function fit() {
    const ws=root.querySelector("[data-workspace]"),minX=Math.min(...board.frames.map(f=>f.x)),maxX=Math.max(...board.frames.map(f=>f.x+f.w)),minY=Math.min(...board.frames.map(f=>f.y)),maxY=Math.max(...board.frames.map(f=>f.y+f.h));
    zoom=Math.min(2,(ws.clientWidth-fitPadding*2)/(maxX-minX),(ws.clientHeight-fitPadding*2)/(maxY-minY));
    panX=(ws.clientWidth-(maxX-minX)*zoom)/2-minX*zoom;panY=(ws.clientHeight-(maxY-minY)*zoom)/2-minY*zoom;renderCanvas();save();
  }
  function zoomAt(newZoom,clientX,clientY) {
    const ws=root.querySelector("[data-workspace]"),r=ws.getBoundingClientRect();const x=clientX===undefined?ws.clientWidth/2:clientX-r.left,y=clientY===undefined?ws.clientHeight/2:clientY-r.top;
    const worldX=(x-panX)/zoom,worldY=(y-panY)/zoom;zoom=Math.max(.06,Math.min(4,newZoom));panX=x-worldX*zoom;panY=y-worldY*zoom;renderCanvas();save();
  }
  function shell() {
    root.innerHTML=`<header class="ad-topbar"><a class="wordmark" href="#statement"><span class="brand-mark">a</span>ad canvas <span class="byline">by jawad</span></a><div class="topbar-center"><span class="status-dot"></span><span data-save-status>Saved locally</span></div><div class="topbar-actions"><button class="button ghost" data-action="import">Import</button><button class="button ghost" data-action="export-json">Export board</button><button class="button primary" data-action="export-png">Export PNG ↗</button></div></header>
    <main class="ad-studio"><aside class="left-rail"><div class="rail-top"><div class="rail-caption">YOUR CANVAS</div><div class="rail-title">Frames <button class="icon-button" data-action="fit" title="Fit all frames">⛶</button></div><div class="frame-list" data-frame-list></div><button class="add-frame" data-action="duplicate">＋ Duplicate frame</button></div><section class="presets"><div class="rail-caption">START WITH AN IDEA</div><p>A starting point, not a cage.<br>Everything is editable.</p><div class="preset-grid">${LAYOUTS.map((l,i)=>`<button class="preset" data-preset="${l.id}"><span class="preset-art preset-art-${i}"><i></i><b></b><em></em></span><span>${l.name}</span><span class="preset-plus">＋</span></button>`).join("")}</div><button class="preset supermemory-preset" data-preset="supermemory"><span class="preset-art supermemory-art">s<span>↗</span></span><span>Supermemory</span><span class="preset-plus">＋</span></button></section><div class="rail-foot"><span class="keycap">⌘</span><span class="keycap">Z</span> undo <span class="spacer"></span><span data-canvas-count>2 frames</span></div></aside>
    <section class="canvas-shell"><div class="canvas-toolbar"><div class="tool-group"><button class="tool active" title="Select (V)" data-action="select">↖ <span>Select</span></button><button class="tool" title="Pan (Space)" data-action="pan">✋ <span>Pan</span></button></div><span class="toolbar-divider"></span><button class="tool" data-action="add-text"><span class="tool-t">T</span> Text</button><label class="tool image-tool">▧ Image<input type="file" accept="image/*" data-image-input hidden></label><span class="toolbar-spacer"></span><button class="icon-button" data-action="undo" data-undo title="Undo (⌘Z)">↶</button><button class="icon-button" data-action="redo" data-redo title="Redo (⇧⌘Z)">↷</button></div><div class="workspace" data-workspace tabindex="0" aria-label="Design canvas: drag elements to move, space-drag to pan"><div class="world" data-world></div><div class="selection-layer" data-overlay></div><div class="canvas-empty-hint" data-edit-hint>Double-click text to edit</div></div><div class="zoom-toolbar"><button data-action="zoom-out" aria-label="Zoom out">−</button><button data-action="zoom-reset" data-zoom-label>38%</button><button data-action="zoom-in" aria-label="Zoom in">+</button><span></span><button data-action="fit">Fit to screen <kbd>⇧1</kbd></button><button data-action="zoom-hundred" title="Actual pixels">1:1</button></div><div class="canvas-bottom"><span><kbd>Space</kbd> drag to pan <b>·</b> <kbd>⌘</kbd> scroll to zoom</span><span data-frame-meta></span></div></section>
    <aside class="right-rail"><div class="inspector-top"><span>Inspector</span><span data-inspector-context></span></div><div class="inspector-scroll" data-inspector></div><div class="inspect-footer"><button class="button secondary full" data-action="copy-caption">Copy post caption</button><span>Designed in the browser. Kept in your browser.</span></div></aside></main><div class="ad-toast" role="status"></div><input type="file" accept="application/json" data-json-input hidden>`;
    root.addEventListener("click", async e => {
      const b=e.target.closest("button");if (!b)return;
      const action=b.dataset.action;
      if (b.dataset.preset) {const before=snapshot();const last=board.frames[board.frames.length-1];const f=b.dataset.preset==="supermemory"?supermemoryFrame(last.x+last.w+144,last.y):makeFrame(b.dataset.preset,last.x+last.w+144,last.y);board.frames.push(f);active=f;selected=[];commit(before);refresh();save();}
      if(b.dataset.selectFrame){active=board.frames.find(f=>f.id===b.dataset.selectFrame);selected=[];refresh();}
      if(action==="export-png")await exportPng();if(action==="export-json")exportJson();if(action==="import")root.querySelector("[data-json-input]").click();
      if(action==="fit")fit();if(action==="zoom-in")zoomAt(zoom*1.15);if(action==="zoom-out")zoomAt(zoom/1.15);if(action==="zoom-hundred")zoomAt(1);if(action==="zoom-reset")zoomAt(1);
      if(action==="undo")undo();if(action==="redo")redo();if(action==="pan"){const ws=root.querySelector("[data-workspace]");ws.dataset.pan=String(ws.dataset.pan!=="true");b.classList.toggle("active",ws.dataset.pan==="true");toast(ws.dataset.pan==="true"?"Drag the canvas to pan":"Select anything on the canvas");}
      if(action==="duplicate"){const before=snapshot();const f=clone(active);f.id=uid("frame");f.name+=" copy";f.x=active.x+active.w+144;f.scene=f.scene.map(n=>({...n,id:uid()}));board.frames.push(f);active=f;selected=[];commit(before);refresh();}
      if(action==="add-text"){const before=snapshot();const n=normalise({type:"text",text:"Say one true thing.",x:88,y:180,w:720,size:88,weight:600,leading:1.0,color:INK,tracking:-.035,align:"left"});active.scene.push(n);selected=[n.id];commit(before);refresh();}
      if(action==="delete"){const before=snapshot();active.scene=active.scene.filter(n=>!selected.includes(n.id));selected=[];commit(before);refresh();}
      if(["forward","backward"].includes(action)){const before=snapshot();for(const n of currentSelection()){const i=active.scene.indexOf(n),next=action==="forward"?Math.min(i+1,active.scene.length-1):Math.max(i-1,0);active.scene.splice(i,1);active.scene.splice(next,0,n);}commit(before);refresh();}
      if(["lock","hide"].includes(action)){const before=snapshot();currentSelection().forEach(n=>action==="lock"?n.locked=!n.locked:n.hidden=!n.hidden);commit(before);refresh();}
      if(action==="edit-text"&&selected.length===1)beginEdit(selected[0]);if(action==="copy-caption")await copyCaption();
      if(action==="copy-json"){await navigator.clipboard.writeText(root.querySelector("[data-json]").value);toast("Scene JSON copied");}
      if(action==="apply-json")applySceneJson();
      if(b.dataset.style){const before=snapshot();currentSelection().filter(n=>n.type==="text").forEach(n=>n[b.dataset.style]=b.dataset.value);commit(before);refresh();}
    });
    changeAndInput(); pointerEvents(); dragEvents(); keyboardEvents();
  }
  function applySceneJson() {
    try {const data=JSON.parse(root.querySelector("[data-json]").value);if(!Array.isArray(data.nodes))throw Error();const before=snapshot();
      active.scene=data.nodes.map(n=>normalise({...n,id:n.id||uid()}));if(Number(data.width))active.w=Number(data.width);if(Number(data.height))active.h=Number(data.height);if(data.name)active.name=data.name;selected=[];commit(before);refresh();toast("Scene updated from JSON");
    }catch{toast("Scene JSON needs a nodes array");}
  }
  function changeAndInput() {
    root.addEventListener("input",e=>{
      const p=e.target.dataset.prop;if(!p)return;
      if(!gesture?.inspectorBefore)gesture={inspectorBefore:snapshot()};
      if(p==="frameName")active.name=e.target.value;if(p==="frameW")active.w=Math.max(1,Number(e.target.value));if(p==="frameH")active.h=Math.max(1,Number(e.target.value));
      if(!["frameName","frameW","frameH"].includes(p)){for(const n of currentSelection()){n[p]=["text","color","fill","stroke"].includes(p)?e.target.value:Number(e.target.value);if((n.type==="text" && ["size","leading","tracking","w"].includes(p)))n.h=textHeight(n);}}
      updateCanvasNodes();
      if(p==="opacity"||p==="text"||p==="fill"||p==="stroke"||p==="color"){for(const n of currentSelection()){const dom=root.querySelector(`[data-node="${n.id}"]`);if(dom){n.type==="text"?dom.textContent=n.text:null;dom.style.opacity=n.opacity;if(n.type==="text")dom.style.color=n.color;if(n.type==="rect")dom.style.background=n.fill;}}}
    });
    root.addEventListener("change",e=>{
      if(e.target.matches("[data-image-input]")){addImageFile(e.target.files[0]);e.target.value="";}
      if(e.target.matches("[data-json-input]")){const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const d=JSON.parse(reader.result);if(!Array.isArray(d.frames)||!d.frames.length)throw Error();const before=snapshot();board.frames=d.frames.map(f=>({...f,scene:f.scene.map(n=>normalise(n))}));active=board.frames[0];selected=[];commit(before);refresh();fit();toast("Board imported");}catch{toast("Could not read this board JSON");}};reader.readAsText(file);}
      if(e.target.dataset.prop){commit(gesture?.inspectorBefore||snapshot());gesture=null;inspector();}
    });
  }
  function pointerEvents() {
    const ws=root.querySelector("[data-workspace]");
    let pinchStart=null;
    ws.addEventListener("gesturestart",e=>{e.preventDefault();pinchStart={zoom,scale:e.scale};});
    ws.addEventListener("gesturechange",e=>{e.preventDefault();if(pinchStart)zoomAt(pinchStart.zoom*e.scale/pinchStart.scale,e.clientX,e.clientY);});
    ws.addEventListener("gestureend",()=>{pinchStart=null;});
    ws.addEventListener("wheel",e=>{e.preventDefault();if(e.ctrlKey||e.metaKey){zoomAt(zoom*Math.exp(-e.deltaY*.006),e.clientX,e.clientY);}else{panX-=e.deltaX;panY-=e.deltaY;renderCanvas();save();}},{passive:false});
    ws.addEventListener("pointerdown",e=>{
      if(editing||e.button>1)return;
      const rp=e.target.closest("[data-resize]"),p=worldPoint(e),frame=hitFrame(p),node=frame&&hitNode(frame,p);
      if(e.button===1||gesture?.space||e.shiftKey&&e.button===1||ws.dataset.pan==="true"){
        gesture={type:"pan",x:e.clientX,y:e.clientY,panX,panY};ws.setPointerCapture(e.pointerId);return;
      }
      if(e.button!==0)return;
      if(rp&&selected.length===1){const n=active.scene.find(n=>n.id===selected[0]);gesture={type:"resize",handle:rp.dataset.resize,start:p,startNode:clone(n),before:snapshot(),starts:{}};ws.setPointerCapture(e.pointerId);return;}
      if(node&&!(node.locked&&!e.altKey)){
        if(frame!==active)active=frame;
        if(e.shiftKey){if(selected.includes(node.id))selected=selected.filter(id=>id!==node.id);else selected.push(node.id);}
        else if(!selected.includes(node.id))selected=[node.id];
        const starts={};for(const n of active.scene)starts[n.id]={x:n.x,y:n.y};
        gesture={type:"move",start:p,starts,before:snapshot(),moved:false};ws.setPointerCapture(e.pointerId);renderCanvas();inspector();return;
      }
      if(frame){active=frame;if(!e.shiftKey)selected=[];gesture={type:"marquee",start:p,current:p};ws.setPointerCapture(e.pointerId);}
      else {gesture={type:"pan",x:e.clientX,y:e.clientY,panX,panY};if(!e.shiftKey)selected=[];ws.setPointerCapture(e.pointerId);}
      renderCanvas();inspector();
    });
    ws.addEventListener("pointermove",e=>{
      if(!gesture)return;
      if(gesture.type==="pan"){panX=gesture.panX+e.clientX-gesture.x;panY=gesture.panY+e.clientY-gesture.y;renderCanvas();}
      if(gesture.type==="move"){const p=worldPoint(e),dx=p.x-gesture.start.x,dy=p.y-gesture.start.y;gesture.moved=true;dragSelection(dx,dy);}
      if(gesture.type==="resize"){const p=worldPoint(e),n=active.scene.find(n=>n.id===selected[0]),s=gesture.startNode,dx=p.x-gesture.start.x,dy=p.y-gesture.start.y,h=gesture.handle;
        if(h.includes("e"))n.w=Math.max(4,s.w+dx);if(h.includes("s"))n.h=Math.max(4,s.h+dy);if(n.type==="text"&&h.includes("e"))n.h=textHeight(n);if(h.includes("w")){n.w=Math.max(4,s.w-dx);n.x=s.x+s.w-n.w;}if(h.includes("n")){n.h=Math.max(4,s.h-dy);n.y=s.y+s.h-n.h;}if(n.type==="text"&&h.includes("w"))n.h=textHeight(n);if(e.shiftKey&&n.type==="image"){const ratio=s.w/s.h;if(["e","w"].includes(h))n.h=n.w/ratio;else n.w=n.h*ratio;}updateCanvasNodes();
      }
      if(gesture.type==="marquee"){gesture.current=worldPoint(e);let m=root.querySelector(".marquee");if(!m){m=document.createElement("div");m.className="marquee";root.querySelector("[data-overlay]").appendChild(m);}const a=gesture.start,b=gesture.current;m.style.cssText=`left:${panX+(active.x+Math.min(a.x,b.x))*zoom}px;top:${panY+(active.y+Math.min(a.y,b.y))*zoom}px;width:${Math.abs(b.x-a.x)*zoom}px;height:${Math.abs(b.y-a.y)*zoom}px`;
        selected=active.scene.filter(n=>!n.hidden && n.x+n.w>=Math.min(a.x,b.x)).filter(n=>n.x<=Math.max(a.x,b.x)&&n.y+n.h>=Math.min(a.y,b.y)&&n.y<=Math.max(a.y,b.y)).map(n=>n.id);
      }
    });
    const end=e=>{if(!gesture)return;const g=gesture;gesture=null;if(g.type==="move"||g.type==="resize")commit(g.before);if(g.type==="pan")save();if(g.type!=="marquee")refresh();else{for(const n of root.querySelectorAll(".marquee"))n.remove();drawSelection();inspector();}};
    let lastCanvasClick={id:"",time:0};
    ws.addEventListener("pointerup",e=>{const g=gesture,shouldEdit=g?.type==="move"&&!g.moved&&selected.length===1&&lastCanvasClick.id===selected[0]&&(performance.now()-lastCanvasClick.time)<400;end(e);if(shouldEdit){lastCanvasClick={id:"",time:0};beginEdit(selected[0]);return;}if(g?.type==="move"&&!g.moved&&selected.length===1)lastCanvasClick={id:selected[0],time:performance.now()};else if(g?.type!=="move")lastCanvasClick={id:"",time:0};});ws.addEventListener("pointercancel",end);
    ws.addEventListener("focusout",e=>{if(editing&&e.target?.dataset.node===editing.id&&!e.target.contains(e.relatedTarget))endEdit();});
    ws.addEventListener("dblclick",e=>{const p=worldPoint(e),f=hitFrame(p),n=f&&hitNode(f,p);if(n&&n.type!=="text"){active=f;selectNode(n.id);}});
    ws.addEventListener("input",e=>{if(editing&&e.target.dataset.node===editing.id){e.stopPropagation();const n=active.scene.find(n=>n.id===editing.id);n.text=e.target.innerText;save();}});
  }
  function dragEvents() {
    const ws=root.querySelector("[data-workspace]");
    for(const type of ["dragenter","dragover"])ws.addEventListener(type,e=>{e.preventDefault();ws.classList.add("drop-active");});
    for(const type of ["dragleave","drop"])ws.addEventListener(type,e=>{e.preventDefault();ws.classList.remove("drop-active");});
    ws.addEventListener("drop",e=>addImageFile(e.dataTransfer.files[0],worldPoint(e)));
  }
  function keyboardEvents() {
    document.addEventListener("keydown",e=>{
      const inside=/INPUT|TEXTAREA/.test(document.activeElement.tagName);
      if(editing){if(e.key==="Escape")endEdit(true);return;}
      if(e.key===" "&&!inside){e.preventDefault();if(!gesture)gesture={space:true};root.querySelector("[data-workspace]").classList.add("is-panning");}
      const mod=e.metaKey||e.ctrlKey;
      if(mod&&e.key.toLowerCase()==="z"&&!inside){e.preventDefault();e.shiftKey?redo():undo();return;}
      if(mod&&e.key.toLowerCase()==="y"&&!inside){e.preventDefault();redo();return;}
      if(inside)return;
      if((e.key==="Backspace"||e.key==="Delete")&&selected.length){e.preventDefault();const before=snapshot();active.scene=active.scene.filter(n=>!selected.includes(n.id));selected=[];commit(before);refresh();}
      if(e.key.startsWith("Arrow")&&selected.length){e.preventDefault();const before=snapshot(),dist=e.shiftKey?10:1;for(const n of currentSelection())if(!n.locked){n.x+=e.key==="ArrowLeft"?-dist:e.key==="ArrowRight"?dist:0;n.y+=e.key==="ArrowUp"?-dist:e.key==="ArrowDown"?dist:0;}commit(before);refresh();}
      if(e.key==="Escape"){selected=[];refresh();}
    });
    document.addEventListener("keyup",e=>{if(e.key===" "&&gesture?.space){gesture=null;root.querySelector("[data-workspace]").classList.remove("is-panning");}});
    window.addEventListener("resize",()=>{renderCanvas();});window.addEventListener("blur",()=>{if(editing)endEdit();});
  }
  function supermemoryFrame(x=0,y=0) {
    const scene=[];
    addRect(scene,0,0,1080,1350,"#f7f8fc");
    addRect(scene,88,100,48,48,"#6656e8",{radius:10});
    addText(scene,"supermemory",152,110,600,{size:31,weight:600,leading:1,color:"#191a26",tracking:-.03});
    addText(scene,"Your AI should\nremember this.",88,314,870,{size:108,weight:600,leading:.99,color:"#191a26",tracking:-.055});
    addRect(scene,230,714,514,320,"#d7dbd9",{radius:8});
    addRect(scene,211,691,514,320,"#e6e8df",{radius:8});
    addRect(scene,186,666,514,320,"#fffdf1",{radius:8});
    addText(scene,"Remember the\nimportant things.",
      236,728,420,{size:46,weight:400,leading:1.18,color:"#292b36",tracking:-.04});
    addRect(scene,200,658,93,26,"#dedeca",{opacity:.85});
    addRect(scene,88,1142,34,34,"#6656e8",{radius:17});
    addText(scene,"supermemory.ai",140,1144,400,{size:24,weight:600,color:"#323440",tracking:-.02});
    return {id:uid("frame"),name:"Supermemory",preset:"supermemory",x,y,w:1080,h:1350,caption:"supermemory — a memory layer for AI. A brand concept, not commissioned work.",scene:scene.map(normalise)};
  }
  shell();refresh();
  const initialHash=location.hash.slice(1);if(layoutsById.has(initialHash)||initialHash==="supermemory"){
    let f=board.frames.find(f=>f.preset===initialHash);if(!f){const before=snapshot();const last=board.frames.at(-1);f=initialHash==="supermemory"?supermemoryFrame(last.x+last.w+144,last.y):makeFrame(initialHash,last.x+last.w+144,last.y);board.frames.push(f);commit(before);}selectFrame(f.id);
  }
  requestAnimationFrame(fit);
  window.adCanvas={renderPng:async()=>renderPng(active),downloadState:exportPng,exportJson,fit,
    state:()=>({...clone(active),selected,zoom,panX,panY}),frames:()=>clone(board.frames),scene:()=>clone(active.scene),
    selectFrame,openEditor:id=>{const last=board.frames.at(-1),f=makeFrame(id,last.x+last.w+144,last.y);board.frames.push(f);active=f;selected=[];refresh();},
    layouts:LAYOUTS.map(l=>l.id),layoutData:LAYOUTS,sizes:SIZES,
    undo,redo,reset:()=>{localStorage.removeItem(STORAGE);location.reload();},
  };
})();
