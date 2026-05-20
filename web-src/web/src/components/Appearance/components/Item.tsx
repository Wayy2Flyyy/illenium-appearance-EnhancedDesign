import styled from 'styled-components';
import { ReactNode } from 'react';

interface ItemProps {
  title?: string;
  children?: ReactNode;
}

const Container = styled.div`
  margin-top: 0.5rem;

  display: flex;
  flex-direction: column;

  padding: 12px;
  border-radius: ${props => props.theme.borderRadius || '10px'};

  border: 1px solid rgba(255, 255, 255, 0.07);
  background: transparent;
  backdrop-filter: none;

  span {
    color: rgba(${props => props.theme.fontColor || '255, 255, 255'}, 1);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
  }
`;

const Inputs = styled.div`
  width: 100%;
  display: inline-flex;
  flex-wrap: wrap;

  margin-top: 10px;

  > div {
    & + div {
      margin-top: 10px;
    }
  }
`;

const Item: React.FC<ItemProps> = ({ children, title }) => {
  return (
    <Container>
      {title && <span>{title}</span>}
      <Inputs>{children}</Inputs>
    </Container>
  );
};

export default Item;
