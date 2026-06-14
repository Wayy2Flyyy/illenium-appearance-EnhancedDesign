import styled from 'styled-components';

export interface AccentSwatch {
  id: string;
  label: string;
  /** RGB triple consumed as rgba(var(--w2f-accent), <alpha>). */
  rgb: string;
}

/** Five fixed accent choices. First entry is the default W2F red. */
export const ACCENT_SWATCHES: AccentSwatch[] = [
  { id: 'red', label: 'Red', rgb: '239, 68, 68' },
  { id: 'blue', label: 'Blue', rgb: '59, 130, 246' },
  { id: 'green', label: 'Green', rgb: '34, 197, 94' },
  { id: 'purple', label: 'Purple', rgb: '168, 85, 247' },
  { id: 'amber', label: 'Amber', rgb: '245, 158, 11' },
];

interface AccentControlProps {
  value: string;
  onChange: (rgb: string) => void;
}

const Panel = styled.div`
  position: fixed;
  top: 60px;
  right: 22px;
  z-index: 25;
  pointer-events: auto;

  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;

  /* Omit backdrop-filter: FiveM DUI often composites it as a solid dark tile. */
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: transparent;
  box-shadow: none;

  user-select: none;
`;

const Label = styled.span`
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(240, 242, 248, 0.78);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
  white-space: nowrap;
`;

const Swatch = styled.button<{ $rgb: string; $active: boolean }>`
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  border-radius: 999px;
  cursor: pointer;
  padding: 0;

  background: rgb(${({ $rgb }) => $rgb});
  border: 2px solid ${({ $active }) => ($active ? '#fff' : 'rgba(255, 255, 255, 0.25)')};
  box-shadow: ${({ $active, $rgb }) =>
    $active ? `0 0 12px rgba(${$rgb}, 0.85)` : 'none'};
  transform: ${({ $active }) => ($active ? 'scale(1.12)' : 'scale(1)')};
  transition:
    transform 0.12s,
    border-color 0.12s,
    box-shadow 0.12s;

  &:hover {
    border-color: rgba(255, 255, 255, 0.7);
  }
`;

/**
 * Floating accent-colour picker (sits just below the opacity control). Sets the
 * global --w2f-accent CSS variable so every rgba(var(--w2f-accent), …) accent
 * across the menu recolours instantly.
 */
const AccentControl = ({ value, onChange }: AccentControlProps) => (
  <Panel role="group" aria-label="Menu accent colour">
    <Label>Accent</Label>
    {ACCENT_SWATCHES.map(swatch => (
      <Swatch
        key={swatch.id}
        type="button"
        title={swatch.label}
        aria-label={swatch.label}
        aria-pressed={value === swatch.rgb}
        $rgb={swatch.rgb}
        $active={value === swatch.rgb}
        onClick={() => onChange(swatch.rgb)}
      />
    ))}
  </Panel>
);

export default AccentControl;
