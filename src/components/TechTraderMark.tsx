/* eslint-disable @next/next/no-img-element */

/**
 * The Tech-Trader logo, used inline wherever the brand appears
 * (e.g. "Powered by <logo>"). Swap /public/brand/tech-trader-logo.svg
 * for the real logo file — keep the same path and filename and this
 * renders it everywhere automatically. Provide a PNG by changing `src`
 * to /brand/tech-trader-logo.png.
 */
export default function TechTraderMark({
  className = "h-4 w-auto",
}: {
  className?: string;
}) {
  return (
    <img
      src="/brand/tech-trader-logo.svg"
      alt="Tech-Trader"
      className={`inline-block align-middle ${className}`}
    />
  );
}
