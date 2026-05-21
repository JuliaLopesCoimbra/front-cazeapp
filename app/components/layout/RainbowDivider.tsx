/**
 * RainbowDivider — separador decorativo 2px com gradiente arco-íris.
 * Usado entre posts do feed, entre tabs e seções secundárias.
 */
export default function RainbowDivider() {
  return (
    <div
      aria-hidden="true"
      className="h-0.5 w-full"
      style={{
        backgroundImage:
          'linear-gradient(90deg, #E52554 24.519%, #F7B521 38.462%, #31E46A 58.173%, #29BAEB 62.981%, #432B9D 76.923%)',
      }}
    />
  );
}
