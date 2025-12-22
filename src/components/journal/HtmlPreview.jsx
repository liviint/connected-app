import { useMemo } from "react";
import {
    useWindowDimensions,
} from "react-native";
import RenderHtml from "react-native-render-html";
import { useThemeStyles } from "../../../src/hooks/useThemeStyles";

function HtmlPreview({ html, maxLength}) {
  const { width } = useWindowDimensions();
  const { colors } = useThemeStyles();

  let text = html?.replace(/<[^>]*>/g, "");

  if (maxLength && text.length > maxLength) {
    text = text.slice(0, maxLength) + "...";
  }

  const truncatedHtml = `<p>${text}</p>`;

  const baseStyle = useMemo(
    () => ({
      color: colors.text,
      fontSize: 14,
      lineHeight: 20,
    }),
    [colors.text]
  );

  const tagsStyles = useMemo(
    () => ({
      p: {
        marginTop: 0,
        marginBottom: 8,
        color: colors.text,
      },
    }),
    [colors.text]
  );

  return (
    <RenderHtml
      contentWidth={width}
      source={{ html: truncatedHtml }}
      baseStyle={baseStyle}
      tagsStyles={tagsStyles}
    />
  );
}

export default HtmlPreview