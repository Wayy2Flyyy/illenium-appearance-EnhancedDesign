import { useState, useEffect, useRef, ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useSpring, animated } from 'react-spring';

interface SectionProps {
  title: string;
  deps?: any[];
  children?: ReactNode;
}

interface HeaderProps {
  active: boolean;
}

const Container = styled.div`
  width: 100%;

  display: flex;
  flex-direction: column;

  color: rgba(${props => props.theme.fontColor || '255, 255, 255'}, 1);

  user-select: none;

  & + div {
    margin-top: 10px;
  }
`;

const Header = styled.div<HeaderProps>`
  width: 100%;
  min-height: 44px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 14px;
  border-radius: ${props => props.theme.borderRadius || '4px'};

  z-index: 2;

  border: 1px solid rgba(255, 255, 255, ${({ active }) => (active ? '0.28' : '0.14')});
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;

  transition: border-color 0.12s, color 0.12s;

  &:hover {
    background: transparent;
    border-color: rgba(var(--w2f-accent), 0.55);
    cursor: pointer;
  }

  ${({ active }) =>
    active &&
    css`
      background: transparent;
      border-color: rgba(var(--w2f-accent), 0.55);
      &:hover {
        background: transparent;
        border-color: rgba(var(--w2f-accent), 0.75);
      }
    `}

  span {
    font-size: 12px;
    font-weight: ${props => props.theme.sectionFontWeight || 'normal'};
    letter-spacing: 0.12em;
    text-transform: uppercase;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.75);
  }
`;

const Items = styled.div`
  padding: 0 2px 5px 2px;

  overflow: hidden;
`;

const Section: React.FC<SectionProps> = ({ children, title, deps = [] }) => {
  const [active, setActive] = useState(false);

  const [height, setHeight] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const props = useSpring({
    height: active ? height : 0,
    opacity: active ? 1 : 0,
  });

  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.offsetHeight);
    }
  }, [ref, setHeight]);

  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.offsetHeight);
    }
  }, [ref, setHeight, deps]);

  return (
    <Container>
      <Header active={active} onClick={() => setActive(state => !state)}>
        <span>{title}</span>
        {active ? <FiChevronUp size={30} /> : <FiChevronDown size={30} />}
      </Header>

      <animated.div style={{ ...props, overflow: 'hidden' }}>
        <Items ref={ref}>{children}</Items>
      </animated.div>
    </Container>
  );
};

export default Section;
