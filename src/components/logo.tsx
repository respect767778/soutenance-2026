export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <div className="group flex items-center gap-3 select-none">
      {/* Sceau / Emblème de marque */}
      <div className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-800 to-brand-950 p-[1px] shadow-lg shadow-brand-950/20 transition-transform duration-300 group-hover:scale-105">
        {/* Lueur dorée interne */}
        <div className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-gold-400/40 blur-sm" />
        <div className="relative flex h-full w-full items-center justify-center rounded-[15px] bg-gradient-to-br from-brand-700/90 to-brand-950/90 backdrop-blur-sm">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 fill-current text-gold-300 transition-transform duration-300 group-hover:rotate-6"
            aria-hidden="true"
          >
            <path
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              className="opacity-20"
            />
            <text
              x="12"
              y="17"
              textAnchor="middle"
              fontFamily="Georgia, 'Times New Roman', serif"
              fontStyle="italic"
              fontWeight="800"
              fontSize="16"
              fill="url(#goldGradient)"
            >
              S
            </text>
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fdf5e2" />
                <stop offset="50%" stopColor="#dfb95e" />
                <stop offset="100%" stopColor="#cfa035" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Typographie de marque */}
      <div className="flex flex-col">
        <span
          className={`font-display text-xl font-bold tracking-tight transition-colors ${
            dark ? "text-white" : "text-ink"
          }`}
        >
          SUNU
          <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent ml-1 font-extrabold">
            CONTENU
          </span>
        </span>
        <span
          className={`text-[9px] font-bold uppercase tracking-[0.22em] ${
            dark ? "text-gold-300/70" : "text-gold-700/80"
          }`}
        >
          Édition Numérique 🇸🇳
        </span>
      </div>
    </div>
  );
}
