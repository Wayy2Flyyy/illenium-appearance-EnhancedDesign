import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNuiState } from '../../../hooks/nuiState';
import Button from './Button';
import { Tattoo } from '../interfaces';
import RangeInput from './RangeInput';
import { TattoosSettings } from '../interfaces';

interface SelectTattooProps {
  items: Tattoo[];
  tattoosApplied: Tattoo[] | null;
  handleApplyTattoo: (value: Tattoo, opacity: number) => void;
  handlePreviewTattoo: (value: Tattoo, opacity: number) => void;
  handleDeleteTattoo: (value: Tattoo) => void;
  settings: TattoosSettings;
}

const Container = styled.div`
  min-width: 0;

  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 10px;

  > section {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
`;

const TattooGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  max-height: 220px;
  overflow-y: auto;
  padding-right: 3px;
`;

const TattooTile = styled.button<{ active: boolean; applied: boolean }>`
  min-height: 62px;
  padding: 10px;
  color: ${({ active }) => (active ? '#fff' : 'var(--w2f-muted)')};
  text-align: left;
  border: 1px solid ${({ active, applied }) => (active || applied ? 'rgba(239, 68, 68, 0.72)' : 'var(--w2f-border)')};
  border-radius: 10px;
  background: ${({ active, applied }) =>
    active || applied
      ? 'linear-gradient(135deg, rgba(192, 28, 40, 0.48), rgba(10, 10, 12, 0.84))'
      : 'rgba(255, 255, 255, 0.045)'};
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
  transition: border-color 0.12s, filter 0.12s;

  &:hover {
    color: #fff;
    border-color: rgba(239, 68, 68, 0.82);
    filter: brightness(1.1);
  }

  small {
    display: block;
    margin-top: 5px;
    color: var(--w2f-muted);
    font-size: 9px;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
`;

const SelectTattoo = ({
  items,
  tattoosApplied,
  handleApplyTattoo,
  handlePreviewTattoo,
  handleDeleteTattoo,
  settings
}: SelectTattooProps) => {
  const defaultOpacity = 0.1;
  const [currentTattoo, setCurrentTattoo] = useState<Tattoo>(items[0]);
  const [opacity, setOpacity] = useState<number>(defaultOpacity);
  const { locales } = useNuiState();

  const clientOpacity = useCallback(() => {
    if (!tattoosApplied) return defaultOpacity;
    const { name } = currentTattoo;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < tattoosApplied.length; i++) {
      const { name: nameApplied } = tattoosApplied[i];
      if (nameApplied === name) { 
        return tattoosApplied[i].opacity ?? defaultOpacity;
      }
    }

    return defaultOpacity;
  }, [currentTattoo, tattoosApplied])();

  useEffect(() => {
    setOpacity(clientOpacity);
  }, [clientOpacity]);

  const handleSelectTattoo = (tattoo: Tattoo): void => {
    handlePreviewTattoo(tattoo, opacity);
    setCurrentTattoo(tattoo);
  };

  const handleChangeOpacity = useCallback((value : number) => {    
    setOpacity(value);
    handlePreviewTattoo(currentTattoo, value);
  }, [currentTattoo]);

  const isTattooApplied = useCallback((tattoo = currentTattoo) => {
    if (!tattoosApplied) return false;
    const { name } = tattoo;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < tattoosApplied.length; i++) {
      const { name: nameApplied } = tattoosApplied[i];
      if (nameApplied === name) return true;
    }

    return false;
  }, [tattoosApplied, currentTattoo]);

  if (!locales) {
    return null;
  }

  return (
    <Container>
      <TattooGrid>
        {items.map(tattoo => (
          <TattooTile
            key={tattoo.name}
            active={tattoo.name === currentTattoo.name}
            applied={isTattooApplied(tattoo)}
            onClick={() => handleSelectTattoo(tattoo)}
          >
            {tattoo.label}
            <small>{isTattooApplied(tattoo) ? 'Applied' : 'Preview'}</small>
          </TattooTile>
        ))}
      </TattooGrid>
      <RangeInput
              title={locales.tattoos.opacity}
              min={settings.opacity.min}
              max={settings.opacity.max}
              factor={settings.opacity.factor}
              defaultValue={opacity}
              clientValue={clientOpacity}
              onChange={value => handleChangeOpacity(value)} />
      <section>
        {isTattooApplied() ? (
          <Button onClick={() => handleDeleteTattoo(currentTattoo)}>{locales.tattoos.delete}</Button>
        ) : (
          <Button onClick={() => handleApplyTattoo(currentTattoo, opacity)}>{locales.tattoos.apply}</Button>
        )}
      </section>
    </Container>
  );
};

export default SelectTattoo;
