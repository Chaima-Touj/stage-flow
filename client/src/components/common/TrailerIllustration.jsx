// Inline SVG illustration per formation — rendered behind the ▶ play button.
// Scale 1.3× centred at (400, 225); parent div overflow:hidden clips the edges.
export default function TrailerIllustration({ slug, color: c }) {
  const base = {
    viewBox: "0 0 800 450",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    style: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      overflow: "visible",
    },
    "aria-hidden": "true",
  };

  // Stroke shorthand: opacity + strokeWidth
  const s = (op, w = 1.5) => ({ stroke: c, strokeWidth: w, opacity: op });

  // 1.3× scale centred on (400, 225) — edges bleed into parent overflow:hidden
  const T = "translate(400 225) scale(1.3) translate(-400 -225)";

  // Unique gradient ID prefix (avoids DOM collisions if both pages render)
  const g = `ti${(slug || "x").replace(/[^a-z0-9]/g, "")}`;

  switch (slug) {
    // ─────────────────────────────────────────────────────────────── AI ──────
    case "ai": {
      const cols = [80, 220, 360, 500, 640];
      const layers = [
        [58, 148, 238, 328, 418],
        [42, 135, 228, 321, 414],
        [72, 177, 282, 387],
        [110, 225, 340],
        [162, 290],
      ];
      return (
        <svg {...base}>
          <defs>
            <radialGradient id={`${g}a`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={c} stopOpacity={0.24} />
              <stop offset="100%" stopColor={c} stopOpacity={0} />
            </radialGradient>
            <radialGradient id={`${g}b`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={c} stopOpacity={0.13} />
              <stop offset="100%" stopColor={c} stopOpacity={0} />
            </radialGradient>
          </defs>
          <g transform={T} strokeLinecap="round" strokeLinejoin="round">
            {/* background halos */}
            <ellipse cx={638} cy={96}  rx={220} ry={200} fill={`url(#${g}a)`} />
            <ellipse cx={110} cy={374} rx={190} ry={170} fill={`url(#${g}b)`} />
            {/* faint rings at centre (behind play btn) */}
            <circle cx={400} cy={225} r={72}  {...s(0.07, 1)} strokeDasharray="4 9" />
            <circle cx={400} cy={225} r={120} {...s(0.04, 1)} strokeDasharray="3 12" />
            {/* connection lines */}
            {cols.slice(0, -1).flatMap((x1, ci) =>
              layers[ci].flatMap((y1, ri) =>
                layers[ci + 1].map((y2, rj) => (
                  <line
                    key={`c${ci}${ri}${rj}`}
                    x1={x1 + 9} y1={y1}
                    x2={cols[ci + 1] - 9} y2={y2}
                    {...s(0.08, 0.6)}
                  />
                ))
              )
            )}
            {/* highlighted connections crossing centre */}
            <line x1={229} y1={228} x2={351} y2={282} {...s(0.20, 1.2)} />
            <line x1={229} y1={135} x2={351} y2={177} {...s(0.20, 1.2)} />
            <line x1={509} y1={225} x2={631} y2={162} {...s(0.20, 1.2)} />
            <line x1={369} y1={225} x2={491} y2={225} {...s(0.15, 1)} />
            {/* nodes */}
            {cols.map((x, ci) =>
              layers[ci].map((y, ri) => (
                <circle
                  key={`n${ci}${ri}`}
                  cx={x} cy={y}
                  r={ci === 4 ? 12 : ci === 0 ? 8 : 9}
                  {...s(ci === 4 ? 0.36 : 0.22)}
                />
              ))
            )}
            {/* output glow fills */}
            <circle cx={640} cy={162} r={5}  fill={c} opacity={0.30} stroke="none" />
            <circle cx={640} cy={290} r={5}  fill={c} opacity={0.30} stroke="none" />
            {/* glow ring behind output column */}
            <circle cx={640} cy={226} r={44} {...s(0.10, 1)} />
            <circle cx={640} cy={226} r={74} {...s(0.05, 1)} />
            {/* brain outline — top right */}
            <path
              d="M706 28 C730 4 772 12 776 46 C798 40 806 70 784 84 C800 106 778 130 756 122 C748 144 722 146 712 130 C696 142 676 126 678 104 C658 90 660 56 682 50 C675 26 698 14 706 28Z"
              {...s(0.24, 2)} />
            <path d="M730 46 Q734 82 730 112" {...s(0.13, 1)} />
            <path d="M710 64 Q734 72 754 64"  {...s(0.13, 1)} />
            <circle cx={744} cy={50} r={3.5} fill={c} opacity={0.22} stroke="none" />
            {/* circuit trace bottom */}
            <path d="M0 432 H156 V414 H328 V432 H498 V412 H660 V428 H800"
              {...s(0.08, 1)} strokeDasharray="3 6" />
          </g>
        </svg>
      );
    }

    // ──────────────────────────────────────────────────────── MERN Stack ──────
    case "mern-stack": {
      const codeW = [122, 78, 148, 56, 104, 90, 134, 68, 118, 82];
      return (
        <svg {...base}>
          <defs>
            <radialGradient id={`${g}a`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={c} stopOpacity={0.24} />
              <stop offset="100%" stopColor={c} stopOpacity={0} />
            </radialGradient>
            <radialGradient id={`${g}b`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={c} stopOpacity={0.11} />
              <stop offset="100%" stopColor={c} stopOpacity={0} />
            </radialGradient>
          </defs>
          <g transform={T} strokeLinecap="round" strokeLinejoin="round">
            {/* background halos */}
            <ellipse cx={575} cy={222} rx={190} ry={185} fill={`url(#${g}a)`} />
            <ellipse cx={165} cy={282} rx={170} ry={155} fill={`url(#${g}b)`} />
            {/* main React atom — right */}
            <ellipse cx={575} cy={222} rx={122} ry={42} {...s(0.22, 1.5)} />
            <ellipse cx={575} cy={222} rx={122} ry={42} {...s(0.22, 1.5)} transform="rotate(60 575 222)" />
            <ellipse cx={575} cy={222} rx={122} ry={42} {...s(0.22, 1.5)} transform="rotate(120 575 222)" />
            <circle cx={575} cy={222} r={15}  {...s(0.34, 2)} />
            <circle cx={575} cy={222} r={6}   fill={c} opacity={0.28} stroke="none" />
            {/* orbit electron dots */}
            {[0, 1, 2].map(i => {
              const a = (i / 3) * Math.PI * 2 - Math.PI / 6;
              return (
                <circle key={i}
                  cx={575 + 122 * Math.cos(a)} cy={222 + 42 * Math.sin(a)}
                  r={4.5} fill={c} opacity={0.24} stroke="none" />
              );
            })}
            {/* small second atom — centre area */}
            <ellipse cx={340} cy={175} rx={64} ry={22} {...s(0.12, 1)} />
            <ellipse cx={340} cy={175} rx={64} ry={22} {...s(0.12, 1)} transform="rotate(60 340 175)" />
            <circle cx={340} cy={175} r={8} {...s(0.16, 1.5)} />
            {/* code lines — left */}
            {[68, 102, 136, 170, 204, 238, 272, 306, 340, 374].map((y, i) => (
              <line key={y} x1={32} y1={y} x2={32 + codeW[i]} y2={y} {...s(0.10 + (i % 3) * 0.04, 1.5)} />
            ))}
            <line x1={52} y1={136} x2={128} y2={136} {...s(0.15, 1.5)} />
            <line x1={52} y1={170} x2={104} y2={170} {...s(0.15, 1.5)} />
            {/* terminal box */}
            <rect x={40} y={388} width={204} height={52} rx={5} {...s(0.18, 1.5)} />
            <line x1={58} y1={406} x2={196} y2={406} {...s(0.10, 1)} />
            <line x1={58} y1={420} x2={154} y2={420} {...s(0.10, 1)} />
            <line x1={58} y1={406} x2={64} y2={406} {...s(0.30, 3)} />
            {/* module boxes */}
            <rect x={236} y={52} width={88}  height={34} rx={4} {...s(0.15, 1.5)} />
            <line x1={254} y1={69} x2={308} y2={69} {...s(0.10, 1)} />
            <rect x={236} y={276} width={72} height={28} rx={4} {...s(0.12, 1.5)} />
            {/* JSON bracket hint near centre */}
            <path d="M390 205 Q376 205 376 225 Q376 245 390 245" {...s(0.13, 1.5)} />
            <path d="M450 205 Q464 205 464 225 Q464 245 450 245" {...s(0.13, 1.5)} />
            {/* particles */}
            {[
              [196, 62], [364, 28], [454, 136], [168, 340],
              [432, 378], [510, 46], [400, 225], [382, 320], [266, 430],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={3.5} fill={c} opacity={0.14} stroke="none" />
            ))}
          </g>
        </svg>
      );
    }

    // ───────────────────────────────────────── Fullstack Spring / Angular ──
    case "fullstack-spring-angular": {
      return (
        <svg {...base}>
          <defs>
            <radialGradient id={`${g}a`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={c} stopOpacity={0.22} />
              <stop offset="100%" stopColor={c} stopOpacity={0} />
            </radialGradient>
            <radialGradient id={`${g}b`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={c} stopOpacity={0.13} />
              <stop offset="100%" stopColor={c} stopOpacity={0} />
            </radialGradient>
          </defs>
          <g transform={T} strokeLinecap="round" strokeLinejoin="round">
            {/* background halos */}
            <ellipse cx={178} cy={218} rx={210} ry={190} fill={`url(#${g}a)`} />
            <ellipse cx={638} cy={198} rx={210} ry={190} fill={`url(#${g}b)`} />
            {/* big angle brackets */}
            <path d="M62 78 L10 225 L62 372"  {...s(0.30, 3.5)} />
            <path d="M738 78 L790 225 L738 372" {...s(0.30, 3.5)} />
            {/* left code block */}
            {[140, 192, 248, 304].map((y, i) => (
              <rect key={`cl${i}`} x={130} y={y} width={[196, 122, 214, 98][i]} height={18} rx={3} {...s(0.14, 1.5)} />
            ))}
            {/* right code block */}
            {[140, 192, 248, 304].map((y, i) => (
              <rect key={`cr${i}`} x={374} y={y} width={[164, 112, 184, 82][i]} height={18} rx={3} {...s(0.12, 1)} />
            ))}
            {/* API arrows through centre */}
            <path d="M410 198 H480 M472 189 L482 198 L472 207" {...s(0.26, 2.5)} />
            <path d="M410 248 H480 M472 239 L482 248 L472 257" {...s(0.26, 2.5)} />
            <path d="M410 298 H480 M472 289 L482 298 L472 307" {...s(0.18, 1.5)} />
            <circle cx={410} cy={198} r={5} {...s(0.28, 2)} />
            <circle cx={410} cy={248} r={5} {...s(0.28, 2)} />
            <circle cx={480} cy={198} r={5} {...s(0.28, 2)} />
            <circle cx={480} cy={248} r={5} {...s(0.28, 2)} />
            {/* centre connection node */}
            <circle cx={400} cy={225} r={9}  {...s(0.22, 2)} />
            <circle cx={400} cy={225} r={20} {...s(0.09, 1)} strokeDasharray="3 6" />
            {/* right component boxes */}
            <rect x={490} y={163} width={108} height={70} rx={6} {...s(0.24, 1.5)} />
            <rect x={490} y={250} width={108} height={70} rx={6} {...s(0.24, 1.5)} />
            <line x1={506} y1={179} x2={578} y2={179} {...s(0.10, 1)} />
            <line x1={506} y1={266} x2={578} y2={266} {...s(0.10, 1)} />
            {/* Angular diamond */}
            <path d="M682 48 L728 86 L682 124 L636 86 Z" {...s(0.24, 2)} />
            <path d="M682 62 L716 86 L682 110 L648 86 Z" {...s(0.12, 1)} />
            {/* Spring circles */}
            <circle cx={702} cy={344} r={44} {...s(0.20, 2)} />
            <circle cx={702} cy={344} r={28} {...s(0.12, 1)} />
            <path d="M702 314 Q726 344 702 374" {...s(0.15, 1.5)} />
            {/* grid dots bottom */}
            {Array.from({ length: 3 }, (_, row) =>
              Array.from({ length: 7 }, (_, col) => (
                <circle
                  key={`d${row}${col}`}
                  cx={130 + col * 32} cy={388 + row * 20}
                  r={2} fill={c} opacity={0.13} stroke="none" />
              ))
            )}
          </g>
        </svg>
      );
    }

    // ──────────────────────────────────────────────────── Mobile / Flutter ──
    case "mobile-flutter": {
      return (
        <svg {...base}>
          <defs>
            <radialGradient id={`${g}a`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={c} stopOpacity={0.26} />
              <stop offset="100%" stopColor={c} stopOpacity={0} />
            </radialGradient>
            <radialGradient id={`${g}b`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={c} stopOpacity={0.13} />
              <stop offset="100%" stopColor={c} stopOpacity={0} />
            </radialGradient>
          </defs>
          <g transform={T} strokeLinecap="round" strokeLinejoin="round">
            {/* background halos */}
            <ellipse cx={558} cy={200} rx={205} ry={205} fill={`url(#${g}a)`} />
            <ellipse cx={270} cy={255} rx={205} ry={200} fill={`url(#${g}b)`} />
            {/* phone frame */}
            <rect x={522} y={46} width={162} height={300} rx={22} {...s(0.28, 2.5)} />
            <rect x={537} y={62} width={132} height={256} rx={13} {...s(0.14, 1)} />
            <line x1={572} y1={52} x2={634} y2={52} {...s(0.26, 3.5)} strokeLinecap="round" />
            <circle cx={603} cy={344} r={10} {...s(0.20, 1.5)} />
            <line x1={546} y1={79} x2={660} y2={79} {...s(0.08, 1)} />
            {/* app UI mockup inside phone */}
            <rect x={553} y={93} width={100} height={9}  rx={4} {...s(0.11, 1)} />
            <rect x={553} y={110} width={62}  height={7}  rx={3} {...s(0.09, 1)} />
            {[132, 152, 172, 192, 212].map(y => (
              <line key={y} x1={553} y1={y} x2={653} y2={y} {...s(0.06, 1)} />
            ))}
            {/* Flutter diamonds — foreground */}
            <path d="M140 84 L186 130 L140 176 L94 130 Z"  {...s(0.26, 2.5)} />
            <path d="M140 176 L186 222 L140 268 L94 222 Z" {...s(0.20, 2)} />
            {/* Flutter diamonds — midground */}
            <path d="M218 130 L264 176 L218 222 L172 176 Z" {...s(0.14, 1.5)} />
            <path d="M68 130 L114 176 L68 222 L22 176 Z"   {...s(0.11, 1)} />
            <path d="M298 198 L330 230 L298 262 L266 230 Z" {...s(0.14, 1.5)} />
            {/* concentric wave arcs centred at (400,225) */}
            {[54, 92, 130, 170, 212].map((r, i) => (
              <path key={r}
                d={`M ${400 - r} 225 A ${r} ${r} 0 0 0 ${400 + r} 225`}
                {...s(0.06 + i * 0.026, 1.3)} />
            ))}
            {/* wave source dot */}
            <circle cx={400} cy={225} r={7} fill={c} opacity={0.24} stroke="none" />
            {/* particles */}
            {[
              [76, 330], [344, 72], [456, 376], [480, 144],
              [386, 315], [412, 136], [312, 312], [196, 418],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={3.5} fill={c} opacity={0.14} stroke="none" />
            ))}
          </g>
        </svg>
      );
    }

    // ────────────────────────────────────────────────────────────────── BI ──
    case "bi": {
      const bh = [58, 96, 72, 162, 120, 192, 104, 174, 80, 144];
      return (
        <svg {...base}>
          <defs>
            <radialGradient id={`${g}a`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={c} stopOpacity={0.22} />
              <stop offset="100%" stopColor={c} stopOpacity={0} />
            </radialGradient>
            <radialGradient id={`${g}b`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={c} stopOpacity={0.11} />
              <stop offset="100%" stopColor={c} stopOpacity={0} />
            </radialGradient>
          </defs>
          <g transform={T} strokeLinecap="round" strokeLinejoin="round">
            {/* background halos */}
            <ellipse cx={398} cy={196} rx={260} ry={186} fill={`url(#${g}a)`} />
            <ellipse cx={706} cy={218} rx={166} ry={164} fill={`url(#${g}b)`} />
            {/* subtle area fill under trend */}
            <path
              d="M96 268 L156 204 L216 228 L276 154 L336 174 L396 114 L456 134 L516 98 L576 114 L636 74 L636 302 L96 302 Z"
              fill={c} opacity={0.04} stroke="none" />
            {/* horizontal grid */}
            {[94, 144, 194, 248].map(y => (
              <line key={y} x1={56} y1={y} x2={658} y2={y} {...s(0.06, 1)} strokeDasharray="4 9" />
            ))}
            {/* axes */}
            <line x1={56}  y1={302} x2={664} y2={302} {...s(0.26, 2.5)} />
            <line x1={56}  y1={80}  x2={56}  y2={302} {...s(0.26, 2.5)} />
            {/* bars */}
            {bh.map((h, i) => (
              <rect key={i} x={72 + i * 57} y={302 - h} width={40} height={h} rx={3}
                {...s(0.14 + (bh[i] > 150 ? 0.08 : 0), 1.5)} />
            ))}
            {/* trend line */}
            <path d="M91 268 L147 204 L203 228 L259 154 L315 174 L371 114 L427 134 L483 98 L539 114 L595 74"
              {...s(0.28, 2.5)} />
            {/* data points */}
            {[[91, 268], [203, 228], [315, 174], [427, 134], [539, 114]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={6.5} {...s(0.34, 2.5)} />
            ))}
            {/* centre highlight ring */}
            <circle cx={315} cy={174} r={11} {...s(0.18, 1.5)} />
            {/* donut chart — right */}
            <path d="M726 218 L726 90 A90 90 0 1 1 660 316 Z" {...s(0.20, 2)} />
            <path d="M726 218 L812 218 A90 90 0 0 1 726 90 Z" {...s(0.13, 1.5)} />
            <circle cx={726} cy={218} r={38} {...s(0.08, 1)} />
            {/* tick marks on axes */}
            {[96, 144, 194, 248].map(y => (
              <line key={y} x1={48} y1={y} x2={56} y2={y} {...s(0.16, 1.5)} />
            ))}
          </g>
        </svg>
      );
    }

    // ─────────────────────────────────────────────────────────── DevOps ──────
    case "devops": {
      return (
        <svg {...base}>
          <defs>
            <radialGradient id={`${g}a`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={c} stopOpacity={0.24} />
              <stop offset="100%" stopColor={c} stopOpacity={0} />
            </radialGradient>
            <radialGradient id={`${g}b`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={c} stopOpacity={0.12} />
              <stop offset="100%" stopColor={c} stopOpacity={0} />
            </radialGradient>
          </defs>
          <g transform={T} strokeLinecap="round" strokeLinejoin="round">
            {/* background halos */}
            <ellipse cx={376} cy={178} rx={228} ry={186} fill={`url(#${g}a)`} />
            <ellipse cx={680} cy={116} rx={166} ry={166} fill={`url(#${g}b)`} />
            {/* pipeline stages */}
            {[0, 1, 2, 3].map(i => (
              <g key={i}>
                <rect x={42 + i * 176} y={172} width={136} height={70} rx={9} {...s(0.24, 2)} />
                <line x1={58 + i * 176} y1={190} x2={162 + i * 176} y2={190} {...s(0.10, 1)} />
                <line x1={58 + i * 176} y1={204} x2={130 + i * 176} y2={204} {...s(0.08, 1)} />
                {i < 3 && (
                  <path
                    d={`M${178 + i * 176} 207 H${210 + i * 176} M${202 + i * 176} 198 L${214 + i * 176} 207 L${202 + i * 176} 216`}
                    {...s(0.22, 2)} />
                )}
              </g>
            ))}
            {/* stage dots */}
            {[110, 286, 462, 638].map((x, i) => (
              <circle key={i} cx={x} cy={358} r={5} fill={c} opacity={0.20} stroke="none" />
            ))}
            {/* infinity loop — centre bottom */}
            <path
              d="M248 358 C248 314 314 314 358 358 C402 402 468 402 468 358 C468 314 402 314 358 358 C314 402 248 402 248 358Z"
              {...s(0.24, 2.5)} />
            <circle cx={358} cy={358} r={13} {...s(0.26, 2.5)} />
            <circle cx={358} cy={358} r={6}  fill={c} opacity={0.24} stroke="none" />
            {/* container stack */}
            {[0, 1, 2, 3].map(i => (
              <rect key={i} x={646 + i * 5} y={54 + i * 14} width={118} height={58} rx={5} {...s(0.10 + i * 0.05, 2)} />
            ))}
            <line x1={662} y1={73} x2={754} y2={73} {...s(0.08, 1)} />
            {/* hexagon grid — top left */}
            {[[42, 34], [84, 34], [63, 66], [105, 66], [42, 98], [84, 98], [63, 130], [105, 130]].map(([x, y], i) => (
              <polygon key={i}
                points={`${x},${y + 23} ${x + 21},${y + 11.5} ${x + 21},${y - 11.5} ${x},${y - 23} ${x - 21},${y - 11.5} ${x - 21},${y + 11.5}`}
                {...s(0.10, 1)} />
            ))}
            {/* grid dots */}
            {Array.from({ length: 3 }, (_, r) =>
              Array.from({ length: 4 }, (_, col) => (
                <circle key={`gd${r}${col}`} cx={42 + col * 24} cy={160 + r * 20} r={2}
                  fill={c} opacity={0.12} stroke="none" />
              ))
            )}
          </g>
        </svg>
      );
    }

    // ──────────────────────────────────────────────────────────────── IoT ──
    case "iot": {
      const devices = [
        [456, 68], [600, 128], [552, 308], [420, 368],
        [682, 268], [700, 76], [380, 198],
      ];
      return (
        <svg {...base}>
          <defs>
            <radialGradient id={`${g}a`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={c} stopOpacity={0.28} />
              <stop offset="100%" stopColor={c} stopOpacity={0} />
            </radialGradient>
            <radialGradient id={`${g}b`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={c} stopOpacity={0.12} />
              <stop offset="100%" stopColor={c} stopOpacity={0} />
            </radialGradient>
          </defs>
          <g transform={T} strokeLinecap="round" strokeLinejoin="round">
            {/* background halos */}
            <ellipse cx={400} cy={225} rx={210} ry={210} fill={`url(#${g}a)`} />
            <ellipse cx={650} cy={198} rx={184} ry={162} fill={`url(#${g}b)`} />
            {/* radio wave arcs centred at (400,230) */}
            {[52, 90, 128, 170, 212].map((r, i) => (
              <path key={r}
                d={`M ${400 - r} ${230 - r * 0.28} A ${r} ${r} 0 0 0 ${400 + r} ${230 - r * 0.28}`}
                {...s(0.08 + i * 0.042, 1.5)} />
            ))}
            {/* central hub */}
            <circle cx={400} cy={230} r={18} {...s(0.32, 2.5)} />
            <circle cx={400} cy={230} r={9}  fill={c} opacity={0.28} stroke="none" />
            {/* device nodes + dashed connection lines */}
            {devices.map(([x, y], i) => (
              <g key={i}>
                <line x1={400} y1={230} x2={x} y2={y} {...s(0.06, 1)} strokeDasharray="4 7" />
                <rect x={x - 16} y={y - 11} width={32} height={22} rx={3} {...s(0.22, 1.5)} />
                <circle cx={x} cy={y} r={3.5} fill={c} opacity={0.22} stroke="none" />
              </g>
            ))}
            {/* circuit traces */}
            <path d="M0 382 H106 V360 H212 V382 H362 V354 H458 V372 H558 V344 H660 V362 H800"
              {...s(0.11, 1)} />
            <path d="M0 412 H80 V428 H182 V412 H284 V422 H386"
              {...s(0.08, 1)} />
            {/* vias */}
            {[[106, 371], [212, 371], [362, 363], [458, 363], [558, 353]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={5} {...s(0.24, 2)} />
            ))}
          </g>
        </svg>
      );
    }

    // ─────────────────────────────────────────────────── Cyber Security ──────
    case "cyber-security": {
      const mL = [[72, 36], [156, 26], [76, 112], [158, 112], [240, 62], [240, 112]];
      const mR = [[558, 46], [636, 36], [718, 66], [558, 128], [636, 128], [718, 128]];
      const eL = [[0, 1], [0, 2], [1, 3], [2, 3], [1, 4], [3, 5], [4, 5]];
      const eR = [[0, 1], [1, 2], [0, 3], [1, 4], [2, 5], [3, 4], [4, 5]];
      return (
        <svg {...base}>
          <defs>
            <radialGradient id={`${g}a`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={c} stopOpacity={0.26} />
              <stop offset="100%" stopColor={c} stopOpacity={0} />
            </radialGradient>
            <radialGradient id={`${g}b`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={c} stopOpacity={0.11} />
              <stop offset="100%" stopColor={c} stopOpacity={0} />
            </radialGradient>
          </defs>
          <g transform={T} strokeLinecap="round" strokeLinejoin="round">
            {/* centred glow halos behind shield */}
            <ellipse cx={400} cy={220} rx={250} ry={248} fill={`url(#${g}a)`} />
            <ellipse cx={400} cy={220} rx={350} ry={310} fill={`url(#${g}b)`} />
            {/* large shield */}
            <path d="M400 26 L548 80 L548 228 C548 320 400 380 400 380 C400 380 252 320 252 228 L252 80 Z"
              {...s(0.24, 2.5)} />
            {/* inner shield */}
            <path d="M400 66 L518 112 L518 222 C518 294 400 344 400 344 C400 344 282 294 282 222 L282 112 Z"
              {...s(0.12, 1.5)} />
            {/* keyhole — centre */}
            <circle cx={400} cy={192} r={30} {...s(0.28, 2.5)} />
            <path d="M386 222 H414 L410 258 H390 Z" {...s(0.28, 2.5)} />
            <circle cx={400} cy={192} r={12} fill={c} opacity={0.14} stroke="none" />
            {/* horizontal scan line through shield */}
            <line x1={252} y1={200} x2={548} y2={200} {...s(0.15, 1.5)} strokeDasharray="10 5" />
            {/* network mesh left */}
            {mL.map(([x, y], i)  => <circle key={`ml${i}`} cx={x} cy={y} r={5.5} {...s(0.26, 2)} />)}
            {eL.map(([a, b], i)  => <line key={`el${i}`} x1={mL[a][0]} y1={mL[a][1]} x2={mL[b][0]} y2={mL[b][1]} {...s(0.11, 1)} />)}
            {/* network mesh right */}
            {mR.map(([x, y], i)  => <circle key={`mr${i}`} cx={x} cy={y} r={5.5} {...s(0.26, 2)} />)}
            {eR.map(([a, b], i)  => <line key={`er${i}`} x1={mR[a][0]} y1={mR[a][1]} x2={mR[b][0]} y2={mR[b][1]} {...s(0.11, 1)} />)}
            {/* bottom scatter nodes */}
            {[[108, 342], [198, 382], [298, 352], [498, 382], [598, 347], [698, 372]].map(([x, y], i) => (
              <circle key={`mb${i}`} cx={x} cy={y} r={3.5} fill={c} opacity={0.14} stroke="none" />
            ))}
            {/* outer dashed ring */}
            <circle cx={400} cy={220} r={174} {...s(0.07, 1)} strokeDasharray="3 13" />
            <path d="M26 422 H774" {...s(0.07, 1)} strokeDasharray="2 9" />
          </g>
        </svg>
      );
    }

    // ──────────────────────────────────────────────── Digital Marketing ──────
    case "digital-marketing": {
      const barH = [58, 90, 74, 130, 110, 162];
      const curve = [[76, 354], [196, 316], [354, 248], [504, 154], [652, 94]];
      return (
        <svg {...base}>
          <defs>
            <radialGradient id={`${g}a`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={c} stopOpacity={0.22} />
              <stop offset="100%" stopColor={c} stopOpacity={0} />
            </radialGradient>
            <radialGradient id={`${g}b`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={c} stopOpacity={0.11} />
              <stop offset="100%" stopColor={c} stopOpacity={0} />
            </radialGradient>
          </defs>
          <g transform={T} strokeLinecap="round" strokeLinejoin="round">
            {/* background halos */}
            <ellipse cx={418} cy={198} rx={268} ry={202} fill={`url(#${g}a)`} />
            <ellipse cx={640} cy={178} rx={184} ry={164} fill={`url(#${g}b)`} />
            {/* subtle area fill under growth curve */}
            <path d="M76 354 C200 324 356 250 506 154 S654 88 754 68 L754 422 L76 422 Z"
              fill={c} opacity={0.04} stroke="none" />
            {/* bar chart + axes */}
            <line x1={52}  y1={314} x2={266} y2={314} {...s(0.24, 2.5)} />
            <line x1={52}  y1={118} x2={52}  y2={314} {...s(0.24, 2.5)} />
            {barH.map((h, i) => (
              <rect key={i} x={64 + i * 34} y={314 - h} width={24} height={h} rx={2.5}
                {...s(0.12 + i * 0.018, 2)} />
            ))}
            {/* growth curve */}
            <path d="M76 354 C200 324 356 250 506 154 S654 88 754 68" {...s(0.26, 2.5)} />
            {/* data points on curve */}
            {curve.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={7} {...s(0.32, 2.5)} />
            ))}
            {/* centre highlight */}
            <circle cx={354} cy={248} r={12} {...s(0.18, 1.5)} />
            {/* megaphone */}
            <path d="M580 158 L642 104 L642 272 L580 230 Z" {...s(0.22, 2)} />
            <rect x={542} y={181} width={40} height={50} rx={3} {...s(0.26, 2.5)} />
            <path d="M642 136 Q676 136 680 188 Q676 240 642 240" {...s(0.16, 1.5)} />
            <path d="M642 154 Q666 154 670 188 Q666 222 642 222" {...s(0.11, 1)} />
            <circle cx={642} cy={188} r={32} {...s(0.07, 1)} strokeDasharray="3 7" />
            {/* vertical growth arrow */}
            <path d="M748 402 L748 72 M726 92 L748 72 L770 92" {...s(0.20, 2.5)} />
            {/* small stat bars — centre top */}
            {[[304, 54, 54], [390, 96, 76], [468, 76, 48]].map(([x, y, w], i) => (
              <rect key={i} x={x} y={y} width={w} height={14} rx={2} {...s(0.09, 1)} />
            ))}
          </g>
        </svg>
      );
    }

    // ─────────────────────────────────────────────────────────── default ──────
    default: {
      return (
        <svg {...base}>
          <defs>
            <radialGradient id={`${g}a`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={c} stopOpacity={0.24} />
              <stop offset="100%" stopColor={c} stopOpacity={0} />
            </radialGradient>
          </defs>
          <g transform={T} strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx={400} cy={225} rx={290} ry={248} fill={`url(#${g}a)`} />
            {Array.from({ length: 4 }, (_, row) =>
              Array.from({ length: 7 }, (_, col) => {
                const x = 96 + col * 100 + (row % 2) * 50;
                const y = 66 + row * 92;
                return (
                  <polygon key={`${row}-${col}`}
                    points={`${x},${y + 30} ${x + 26},${y + 15} ${x + 26},${y - 15} ${x},${y - 30} ${x - 26},${y - 15} ${x - 26},${y + 15}`}
                    {...s(0.10, 1)} />
                );
              })
            )}
            <circle cx={400} cy={225} r={92}  {...s(0.20, 2)} />
            <circle cx={400} cy={225} r={62}  {...s(0.14, 1.5)} />
            <circle cx={400} cy={225} r={144} {...s(0.09, 1)} />
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i / 8) * Math.PI * 2;
              return (
                <circle key={i}
                  cx={400 + 92 * Math.cos(a)} cy={225 + 92 * Math.sin(a)}
                  r={6.5} {...s(0.26, 2)} />
              );
            })}
          </g>
        </svg>
      );
    }
  }
}
