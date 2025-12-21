import styled from "styled-components/native";

export const BodyText = styled.Text`
    font-family: ${props => props.theme.fonts.body};
    font-size: 16px;
    color: ${props => props.theme.colors.text};
`;

