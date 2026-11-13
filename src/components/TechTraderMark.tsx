/* eslint-disable @next/next/no-img-element */

/**
 * The Tech-Trader logo, used inline wherever the brand appears
 * (e.g. "Powered by <logo>"). The wordmark is dark navy, so on the
 * app's dark chrome it sits on a small light chip to stay legible.
 *
 * To update the logo, replace /public/brand/tech-trader-logo.png
 * (keep the same path and filename) and it updates everywhere.
 */
export default function TechTraderMark({
  className = "h-4 w-auto",
  chip = true,
}: {
  className?: string;
  /** Wrap in a light chip (for dark backgrounds). Set false on light surfaces. */
  chip?: boolean;
}) {
  const img = (
    <img
      src="/brand/tech-trader-logo.png"
      alt="Tech-Trader"
      className={`inline-block align-middle ${className}`}
    />
  );
  if (!chip) return img;
  return (
    <span className="inline-flex items-center rounded bg-white px-1.5 py-0.5">
      {img}
    </span>
  );
}
