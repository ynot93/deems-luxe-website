const Mark = ({ height }: { height: number }) => (
  <svg viewBox="0 0 1043 875" height={height} aria-hidden="true" focusable="false">
    <path fill="#3F07C3" fillRule="evenodd" d="M0 215 529 0v875H79V241ZM227 257v467l155-55V197Z" />
    <path fill="#FFC900" d="M565 0l166 95v622h312v158H565Z" />
  </svg>
)

export const AdminIcon = () => <Mark height={22} />

export const AdminLogo = () => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
    <Mark height={44} />
    <span style={{ fontSize: 20, fontWeight: 600 }}>Deems Luxe Homes</span>
  </span>
)
