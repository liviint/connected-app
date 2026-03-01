import { useMemo } from "react";
import { useWindowDimensions, Text } from "react-native";
import RenderHtml from "react-native-render-html";
import { useThemeStyles } from "../../../src/hooks/useThemeStyles";

function HtmlPreview({ html, maxLength }) {
  const { width } = useWindowDimensions();
  const { colors } = useThemeStyles();

  const previewText = useMemo(() => {
    if (!html) return "";

    const plain = html.replace(/<[^>]+>/g, "");

    if (maxLength && plain.length > maxLength) {
      return plain.slice(0, maxLength) + "...";
    }

    return plain;
  }, [html, maxLength]);

  const formattedHtml = useMemo(() => {
    if (!html) return "";

    return `<div>${html}</div>`;
  }, [html]);

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
      div: { marginBottom: 8 },
      p: { marginBottom: 8 },
      b: { fontWeight: "bold" },
      i: { fontStyle: "italic" },
      u: { textDecorationLine: "underline" },
    }),
    []
  );

  if (maxLength) {
    return (
      <Text
        style={{
          color: colors.text,
          fontSize: 14,
          lineHeight: 20,
        }}
        numberOfLines={3}
      >
        {previewText}
      </Text>
    );
  }

  return (
    <RenderHtml
      contentWidth={width}
      source={{ html: formattedHtml }}
      baseStyle={baseStyle}
      tagsStyles={tagsStyles}
    />
  );
}

export default HtmlPreview;