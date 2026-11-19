interface BrandLogoProps {
  tone?: 'light' | 'dark';
  className?: string;
  showName?: boolean;
}

/** Original, user-supplied JuaraMetaCorp artwork — never recreated or recolored. */
export default function BrandLogo({ className = '', showName = true }: BrandLogoProps) {
  return (
    <span className={`inline-flex min-w-0 items-center gap-2.5 ${className}`}>
      <img
        src="/images/juarametacorp-logo.png"
        alt="Official JuaraMetaCorp logo"
        width={44}
        height={44}
        className="h-10 w-10 sm:h-11 sm:w-11 shrink-0 object-contain rounded-full drop-shadow-[0_0_13px_rgba(40,143,255,0.38)]"
      />
      {showName && <span className="font-sans text-[15px] sm:text-[17px] text-white font-extrabold tracking-[-0.035em] whitespace-nowrap">Juara<span className="text-sky-400">MetaCorp</span></span>}
    </span>
  );
}
