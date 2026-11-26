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

  function renderSceneDOM(stage, scene, state, editable) {
    stage.innerHTML = "";
    const size = SIZES[state.size];
    stage.style.width = `${size.w}px`;
    stage.style.height = `${size.h}px`;
    stage.style.background = palette(state).bg;
    for (const el of scene) {
      if (el.type === "rect") {
        const node = document.createElement("div");
        node.className = "ad-stage-el";
        node.style.cssText = `left:${el.x}px;top:${el.y}px;width:${el.w}px;height:${el.h}px;background:${el.fill};${el.stroke ? `box-shadow:inset 0 0 0 ${el.lineWidth || 1}px ${el.stroke};` : ""}`;
        stage.appendChild(node);
      }
      if (el.type === "line") {
        const node = document.createElement("div");
        node.className = "ad-stage-el";
        const horizontal = el.y1 === el.y2;
        const x = Math.min(el.x1, el.x2);
        const y = Math.min(el.y1, el.y2);
        node.style.cssText = horizontal
          ? `left:${x}px;top:${y - el.width / 2}px;width:${Math.abs(el.x2 - el.x1)}px;height:${el.width}px;background:${el.color};`
          : `left:${x - el.width / 2}px;top:${y}px;width:${el.width}px;height:${Math.abs(el.y2 - el.y1)}px;background:${el.color};`;
        stage.appendChild(node);
      }
      if (el.type === "text") {
        const node = document.createElement("div");
        node.className = "ad-stage-el";
        node.textContent = el.text;
        node.style.left = `${el.x}px`;
        node.style.top = `${el.y}px`;
        node.style.width = `${el.w}px`;
        node.style.fontSize = `${el.size}px`;
        node.style.lineHeight = String(el.leading);
        node.style.fontWeight = String(el.weight);
        node.style.color = el.color;
        node.style.textAlign = el.align;
        node.style.letterSpacing = `${el.tracking}em`;
        if (editable && el.key) {
          node.dataset.field = el.key;
          node.dataset.editable = "true";
          node.contentEditable = "plaintext-only";
          node.spellcheck = false;
          node.setAttribute("role", "textbox");
          node.setAttribute("aria-label", fieldLabel(state.layout, el.key));
          node.addEventListener("input", () => {
            current.fields[el.key] = node.innerText;
            const side = root.querySelector(`[data-side-field="${CSS.escape(el.key)}"]`);
            if (side && side.value !== node.innerText) side.value = node.innerText;
          });
        }
        stage.appendChild(node);
      }
      if (el.type === "wordmark") {
        const node = document.createElement("div");
        const width = ((el.mark ? 5446 : 4603) / 895) * el.h;
        node.className = "ad-stage-el ad-stage-wordmark";
        node.style.cssText = `left:${el.x}px;top:${el.y}px;height:${el.h}px;width:${width}px;color:${el.color};`;
        node.innerHTML = wordmarkSvg(el.color, el.accent, el.mark);
        stage.appendChild(node);
      }
      if (el.type === "tick") {
        const node = document.createElement("div");
        node.className = "ad-stage-el";
        node.style.cssText = `left:${el.x}px;top:${el.y}px;width:${el.size}px;height:${el.size}px;`;
        node.innerHTML = `<svg viewBox="0 0 32 32" width="${el.size}" height="${el.size}" aria-hidden="true"><path d="M5 17.5 12 24 27 7" fill="none" stroke="${el.color}" stroke-width="4" stroke-linecap="square"/></svg>`;
        stage.appendChild(node);
      }
      if (el.type === "image") {
        const node = document.createElement("img");
        node.className = "ad-stage-image";
        node.alt = "";
        node.src = el.src;
        node.style.cssText = `left:${el.x}px;top:${el.y}px;width:${el.w}px;height:${el.h}px;`;
        stage.appendChild(node);
      }
      if (el.type === "note" && editable) {
        const node = document.createElement("div");
        node.className = "ad-editor-note";
        node.textContent = el.text;
        node.style.left = `${el.x}px`;
        node.style.top = `${el.y}px`;
        stage.appendChild(node);
      }
    }
  }

  function fieldLabel(layoutId, key) {
    const layout = layoutsById.get(layoutId);
    return layout.fields.find((field) => field.key === key)?.label || key;
  }

  function makePath(path) {
    return new Path2D(path);
  }

  let wordPath;
  let markPath;
  let accentPath;

  function ensurePaths() {
    const data = window.AD_WORDMARK || { mark: "", word: "", accent: "" };
    if (!wordPath) {
      wordPath = makePath(data.word);
      markPath = makePath(data.mark);
      accentPath = makePath(data.accent);
    }
  }

  function drawWordmark(ctx, el) {
    ensurePaths();
    const s = el.h / 895;
    ctx.save();
    ctx.translate(el.x, el.y + 883 * s);
    ctx.scale(s, s);
    if (el.mark) {
      ctx.save();
      ctx.translate(0, -720);
      ctx.scale(1.16129, 1.16129);
      ctx.fillStyle = el.color;
      ctx.fill(markPath);
      ctx.restore();
      ctx.translate(843, 0);
    }
    ctx.fillStyle = el.color;
    ctx.fill(wordPath);
    ctx.fillStyle = el.accent;
    ctx.fill(accentPath);
    ctx.restore();
  }

  function drawTick(ctx, el) {
    ctx.save();
    ctx.strokeStyle = el.color;
    ctx.lineWidth = el.size / 8;
    ctx.lineCap = "square";
    ctx.beginPath();
    ctx.moveTo(el.x + el.size * 0.16, el.y + el.size * 0.55);
    ctx.lineTo(el.x + el.size * 0.38, el.y + el.size * 0.76);
    ctx.lineTo(el.x + el.size * 0.86, el.y + el.size * 0.22);
    ctx.stroke();
    ctx.restore();
  }

  function fontFor(el) {
    return `${el.weight} ${el.size}px Geist, ui-sans-serif, system-ui, sans-serif`;
  }

  function wrapLines(ctx, text, maxWidth) {
    const out = [];
    const paragraphs = String(text || "").split(/\n/);
    for (const paragraph of paragraphs) {
      const words = paragraph.split(/\s+/).filter(Boolean);
      if (!words.length) {
        out.push("");
        continue;
      }
      let line = "";
      for (const word of words) {
        const trial = line ? `${line} ${word}` : word;
        if (ctx.measureText(trial).width <= maxWidth || !line) line = trial;
        else {
          out.push(line);
          line = word;
        }
      }
      if (line) out.push(line);
    }
    return out;
  }

  function drawText(ctx, el) {
    ctx.save();
    ctx.font = fontFor(el);
    ctx.fillStyle = el.color;
    ctx.textBaseline = "top";
    ctx.textAlign = el.align;
    if ("letterSpacing" in ctx) ctx.letterSpacing = `${el.tracking}em`;
    const x = el.align === "center" ? el.x + el.w / 2 : el.align === "right" ? el.x + el.w : el.x;
    const lines = wrapLines(ctx, el.text, el.w);
    const step = el.size * el.leading;
    lines.forEach((line, i) => ctx.fillText(line, x, el.y + i * step));
    ctx.restore();
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  async function drawImageCover(ctx, el) {
    const img = await loadImage(el.src);
    const scale = Math.max(el.w / img.naturalWidth, el.h / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    const x = el.x + (el.w - w) / 2;
    const y = el.y + (el.h - h) / 2;
    ctx.save();
    ctx.beginPath();
    ctx.rect(el.x, el.y, el.w, el.h);
    ctx.clip();
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
  }

  async function drawScene(ctx, scene) {
    for (const el of scene) {
      if (el.type === "note") continue;
      if (el.type === "rect") {
        ctx.fillStyle = el.fill;
        ctx.fillRect(el.x, el.y, el.w, el.h);
        if (el.stroke) {
          ctx.strokeStyle = el.stroke;
          ctx.lineWidth = el.lineWidth || 1;
          ctx.strokeRect(el.x, el.y, el.w, el.h);
        }
      } else if (el.type === "line") {
        ctx.strokeStyle = el.color;
        ctx.lineWidth = el.width;
        ctx.beginPath();
        ctx.moveTo(el.x1, el.y1);
        ctx.lineTo(el.x2, el.y2);
        ctx.stroke();
      } else if (el.type === "text") {
        drawText(ctx, el);
      } else if (el.type === "wordmark") {
        drawWordmark(ctx, el);
      } else if (el.type === "tick") {
        drawTick(ctx, el);
      } else if (el.type === "image") {
        await drawImageCover(ctx, el);
      }
    }
  }

  async function renderPng(state) {
    await document.fonts.ready;
    await Promise.all([document.fonts.load("400 32px Geist"), document.fonts.load("600 32px Geist")]);
    const size = SIZES[state.size];
    const hi = document.createElement("canvas");
    hi.width = size.w * 2;
    hi.height = size.h * 2;
    const hctx = hi.getContext("2d");
    hctx.scale(2, 2);
    await drawScene(hctx, layoutScene(state));

    const out = document.createElement("canvas");
    out.width = size.w;
    out.height = size.h;
    const octx = out.getContext("2d");
    octx.imageSmoothingEnabled = true;
    octx.imageSmoothingQuality = "high";
    octx.drawImage(hi, 0, 0, size.w, size.h);
    return new Promise((resolve) => out.toBlob(resolve, "image/png"));
  }

  function filenameFor(state) {
    const size = SIZES[state.size];
    return `ambitious-${state.layout}-${size.w}x${size.h}.png`;
  }

  async function downloadState(state) {
    const blob = await renderPng(state);
    if (!blob) throw new Error("The browser could not encode the PNG.");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filenameFor(state);
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast(`Downloaded ${a.download}`);
    return blob;
  }

  async function copyCaption(layout) {
    const text = layout.caption;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    toast(`Copied the ${layout.name.toLowerCase()} caption`);
  }

  function toast(message) {
    const node = root.querySelector(".ad-toast");
    if (!node) return;
    node.textContent = message;
    node.dataset.show = "true";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      node.dataset.show = "false";
    }, 2400);
  }

  function shell() {
    root.innerHTML = `
      <header class="ad-topbar">
        <a class="ad-topbar__brand" href="#gallery" aria-label="ambitious ad canvas">${wordmarkSvg(INK, SUBJECTS.economics.color, false)}</a>
        <nav class="ad-topbar__nav" aria-label="Ad canvas">
          <a class="ad-textbutton" href="#gallery" data-nav="gallery">Gallery</a>
          <button class="ad-button ad-button--quiet" type="button" data-action="open-current">Make an ad</button>
        </nav>
      </header>
      <main>
        <section class="ad-gallery" data-view="gallery" aria-labelledby="gallery-title">
          <div class="ad-gallery__head">
            <div>
              <h1 id="gallery-title">Finished ads, ready to post.</h1>
              <p class="ad-gallery__intro">Pick a layout, change the words, colour and size, then download a PNG rendered at exact pixels. The question, mark scheme and numbers come from the app’s real course data; empty slots say what they need.</p>
            </div>
            <button class="ad-button" type="button" data-action="open-current">Start with Statement</button>
          </div>
          <div class="ad-gallery__grid" data-gallery-grid></div>
        </section>
        <section class="ad-editor" data-view="editor" aria-label="Ad editor" hidden>
          <aside class="ad-controls" aria-label="Ad controls">
            <div class="ad-control-group">
              <label class="ad-control-label" for="layout-select">Layout</label>
              <select class="ad-select" id="layout-select" data-control="layout"></select>
            </div>
            <div class="ad-control-group">
              <span class="ad-control-label">Size</span>
              <div class="ad-segmented" role="group" aria-label="Canvas size" data-control="size">
                <button type="button" data-value="portrait">1080 × 1350</button>
                <button type="button" data-value="landscape">1600 × 900</button>
              </div>
            </div>
            <div class="ad-control-group">
              <label class="ad-control-label" for="subject-select">Subject colour</label>
              <select class="ad-select" id="subject-select" data-control="subject"></select>
            </div>
            <div class="ad-control-group">
              <span class="ad-control-label">Ground</span>
              <div class="ad-segmented" role="group" aria-label="Paper or ink ground" data-control="invert">
                <button type="button" data-value="paper">Paper</button>
                <button type="button" data-value="ink">Ink</button>
              </div>
            </div>
            <div class="ad-control-group">
              <span class="ad-control-label">Alignment</span>
              <div class="ad-segmented" role="group" aria-label="Text alignment" data-control="align">
                <button type="button" data-value="left">Left</button>
                <button type="button" data-value="center">Centre</button>
                <button type="button" data-value="right">Right</button>
              </div>
            </div>
            <div class="ad-control-group" data-control="image" hidden>
              <span class="ad-control-label">Photograph</span>
              <button class="ad-drop" type="button" data-action="choose-image">Choose or drop a photograph</button>
              <input class="ad-sr" type="file" accept="image/*" data-image-input>
            </div>
            <div class="ad-fieldlist" data-field-list></div>
            <div class="ad-controls__footer">
              <button class="ad-button" type="button" data-action="download">Download PNG</button>
              <button class="ad-button ad-button--quiet" type="button" data-action="copy-caption">Copy caption</button>
              <a class="ad-textbutton" href="#gallery">Back to gallery</a>
            </div>
          </aside>
          <div class="ad-workspace" data-workspace>
            <div class="ad-statusline"><span data-stage-meta></span><span>Exact-pixel PNG. Editing is local to this browser.</span></div>
            <div class="ad-stage-wrap" data-stage-wrap><div class="ad-stage" data-stage></div></div>
          </div>
        </section>
      </main>
      <div class="ad-toast" role="status" aria-live="polite"></div>
    `;

    const layoutSelect = root.querySelector('[data-control="layout"]');
    layoutSelect.innerHTML = LAYOUTS.map((layout) => `<option value="${layout.id}">${layout.name}</option>`).join("");
    const subjectSelect = root.querySelector('[data-control="subject"]');
    subjectSelect.innerHTML = Object.entries(SUBJECTS)
      .map(([id, subject]) => `<option value="${id}">${subject.name}</option>`)
      .join("");

    root.addEventListener("click", async (event) => {
      const action = event.target.closest("[data-action]");
      if (!action) return;
      const name = action.dataset.action;
      if (name === "open-current") openEditor("statement");
      if (name === "download") await downloadState(current);
      if (name === "copy-caption") await copyCaption(layoutsById.get(current.layout));
      if (name === "choose-image") root.querySelector("[data-image-input]")?.click();
    });

    root.addEventListener("change", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.matches('[data-control="layout"]')) openEditor(target.value);
      if (target.matches('[data-control="subject"]')) {
        current.subject = target.value;
        renderEditor();
      }
      if (target.matches("[data-image-input]")) readImageFile(target.files?.[0]);
    });

    root.addEventListener("input", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
      const key = target.dataset.sideField;
      if (!key) return;
      current.fields[key] = target.value;
      const stageField = root.querySelector(`[data-field="${CSS.escape(key)}"]`);
      if (stageField) stageField.textContent = target.value;
    });

    for (const group of root.querySelectorAll(".ad-segmented")) {
      group.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-value]");
        if (!button) return;
        const control = group.dataset.control;
        if (control === "size") current.size = button.dataset.value;
        if (control === "invert") current.invert = button.dataset.value === "ink";
        if (control === "align") current.align = button.dataset.value;
        renderEditor();
      });
    }

    const stageWrap = root.querySelector("[data-stage-wrap]");
    for (const type of ["dragenter", "dragover"]) {
      stageWrap.addEventListener(type, (event) => {
        event.preventDefault();
        stageWrap.dataset.active = "true";
      });
    }
    for (const type of ["dragleave", "drop"]) {
      stageWrap.addEventListener(type, (event) => {
        event.preventDefault();
        stageWrap.dataset.active = "false";
      });
    }
    stageWrap.addEventListener("drop", (event) => {
      const file = event.dataTransfer?.files?.[0];
      readImageFile(file);
    });

    window.addEventListener("resize", () => {
      if (!root.querySelector('[data-view="editor"]').hidden) renderStage();
    });
  }

  function readImageFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      current.image = String(reader.result || "");
      renderEditor();
      toast("Photograph added to the crop layout");
    };
    reader.readAsDataURL(file);
  }

  function renderGallery() {
    const grid = root.querySelector("[data-gallery-grid]");
    grid.innerHTML = "";
    for (const observer of previewObservers.values()) observer.disconnect();
    previewObservers.clear();

    for (const layout of LAYOUTS) {
      const card = document.createElement("article");
      card.className = "ad-card";
      card.innerHTML = `
        <button class="ad-card__preview" type="button" data-open-layout="${layout.id}" aria-label="Open the ${layout.name} layout">
          <span class="ad-card__frame" data-preview-frame></span>
        </button>
        <div class="ad-card__meta">
          <h2 class="ad-card__name">${layout.name}</h2>
          <p class="ad-card__use">${layout.use}</p>
        </div>
        <div class="ad-card__actions">
          <button class="ad-button ad-button--quiet" type="button" data-download-layout="${layout.id}">Download PNG</button>
          <button class="ad-textbutton" type="button" data-copy-layout="${layout.id}">Copy caption</button>
        </div>
      `;
      grid.appendChild(card);
      mountPreview(card.querySelector("[data-preview-frame]"), freshState(layout.id));
    }

    grid.onclick = async (event) => {
      const open = event.target.closest("[data-open-layout]");
      const download = event.target.closest("[data-download-layout]");
      const copy = event.target.closest("[data-copy-layout]");
      if (open) openEditor(open.dataset.openLayout);
      if (download) await downloadState(freshState(download.dataset.downloadLayout));
      if (copy) await copyCaption(layoutsById.get(copy.dataset.copyLayout));
    };
  }

  function mountPreview(frame, state) {
    const stage = document.createElement("div");
    stage.className = "ad-stage";
    frame.appendChild(stage);
    const paint = () => {
      const rect = frame.getBoundingClientRect();
      const scale = rect.width / SIZES[state.size].w;
      stage.style.transform = `scale(${scale})`;
      renderSceneDOM(stage, layoutScene(state), state, false);
    };
    paint();
    const observer = new ResizeObserver(paint);
    observer.observe(frame);
    previewObservers.set(frame, observer);
  }

  function openEditor(layoutId) {
    current = stateFor(layoutId);
    location.hash = `make-${layoutId}`;
    showView("editor");
    renderEditor();
  }

  function showView(view) {
    root.querySelector('[data-view="gallery"]').hidden = view !== "gallery";
    root.querySelector('[data-view="editor"]').hidden = view !== "editor";
    root.querySelectorAll("[data-nav]").forEach((nav) => {
      if (nav.dataset.nav === view) nav.setAttribute("aria-current", "page");
      else nav.removeAttribute("aria-current");
    });
  }

  function renderEditor() {
    const layout = layoutsById.get(current.layout);
    root.querySelector('[data-control="layout"]').value = current.layout;
    root.querySelector('[data-control="subject"]').value = current.subject;
    root.querySelector('[data-control="image"]').hidden = current.layout !== "crop";
    for (const group of root.querySelectorAll(".ad-segmented")) {
      const control = group.dataset.control;
      for (const button of group.querySelectorAll("button[data-value]")) {
        const active =
          (control === "size" && button.dataset.value === current.size) ||
          (control === "invert" && button.dataset.value === (current.invert ? "ink" : "paper")) ||
          (control === "align" && button.dataset.value === current.align);
        button.setAttribute("aria-pressed", String(active));
      }
    }

    const list = root.querySelector("[data-field-list]");
    list.innerHTML = "";
    for (const field of layout.fields) {
      const wrap = document.createElement("label");
      wrap.className = "ad-field";
      const input = field.multiline ? document.createElement("textarea") : document.createElement("input");
      input.className = field.multiline ? "ad-textarea" : "ad-input";
      input.value = current.fields[field.key] || "";
      input.dataset.sideField = field.key;
      input.setAttribute("aria-label", field.label);
      wrap.innerHTML = `<span>${field.label}</span>`;
      wrap.appendChild(input);
      list.appendChild(wrap);
    }
    renderStage();
  }

  function renderStage() {
    const stage = root.querySelector("[data-stage]");
    const wrap = root.querySelector("[data-stage-wrap]");
    const workspace = root.querySelector("[data-workspace]");
    const size = SIZES[current.size];
    const available = Math.max(240, workspace.clientWidth - 8);
    const scale = Math.min(0.5, available / size.w);
    wrap.style.width = `${size.w * scale}px`;
    wrap.style.height = `${size.h * scale}px`;
    stage.style.transform = `scale(${scale})`;
    renderSceneDOM(stage, layoutScene(current), current, true);
    root.querySelector("[data-stage-meta]").textContent = `${layoutsById.get(current.layout).name} · ${size.label} · ${SUBJECTS[current.subject].name}`;
  }

  function route() {
    const match = /^#make-([a-z]+)$/.exec(location.hash);
    if (match && layoutsById.has(match[1])) {
      current = stateFor(match[1]);
      showView("editor");
      renderEditor();
    } else {
      showView("gallery");
      renderGallery();
    }
  }

  shell();
  renderGallery();
  route();
  window.addEventListener("hashchange", route);

  window.adCanvas = {
    openEditor,
    renderPng,
    downloadState,
    freshState,
    layoutScene,
    state: () => current,
    layouts: LAYOUTS.map((layout) => layout.id),
    layoutData: LAYOUTS,
    subjects: SUBJECTS,
    sizes: SIZES,
  };
})();
