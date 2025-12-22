import styled from "styled-components/native";

export const BodyText = styled.Text`
    font-family: ${props => props.theme.fonts.body};
    font-size: 16px;
    color: ${props => props.theme.colors.text};
`;

export const Card = styled.View`
  background-color: ${({ theme }) => theme.surface};
  border-radius: 16px;
  padding: 16px;

  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.15;
  shadow-radius: 3px;

  elevation: 3;
  margin-bottom: 16px;
`;

export const Input = styled.TextInput`
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.surface};

  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: 10px;

  padding: 12px;
  font-size: 16px;
`;

export const TextArea = styled(Input)`
  min-height: 80px;
  text-align-vertical: top;
`;
