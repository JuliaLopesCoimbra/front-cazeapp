/**
 * BrazilDivider — linha divisória 4px com gradiente verde Brasil → amarelo.
 * Usado entre seções principais (TopBar → conteúdo, banner → tabs, etc.).
 */
export default function BrazilDivider() {
  return (
    <div
      aria-hidden="true"
      className="h-1 w-full"
      style={{
        backgroundImage: 'linear-gradient(90deg, #009440 0%, #FFCB00 76.923%)',
      }}
    />
  );
}
