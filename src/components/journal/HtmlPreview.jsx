
import { useMemo } from "react";
import { useWindowDimensions, Text } from "react-native";
import RenderHtml from "@native-html/native";
import { useThemeStyles } from "../../../src/hooks/useThemeStyles";

function HtmlPreview({ html, maxLength }) {
  const { width } = useWindowDimensions();
  const { colors } = useThemeStyles();

  const formattedHtml = useMemo(() => {
    if (!html) return "";
    return `<div>${html}</div>`;
  }, [html]);

  const previewText = useMemo(() => {
    if (!html) return "";

    const plain = html
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<\/(p|div|li|h[1-6])>/gi, " ")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;|&apos;/gi, "'")
      .replace(/\s+/g, " ")
      .trim();

    return maxLength && plain.length > maxLength
      ? `${plain.slice(0, maxLength).trimEnd()}...`
      : plain;
  }, [html, maxLength]);

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
      strong: { fontWeight: "bold" },
      i: { fontStyle: "italic" },
      em: { fontStyle: "italic" },
      u: { textDecorationLine: "underline" },
    }),
    []
  );

  if (maxLength) {
    return (
      <Text style={baseStyle} numberOfLines={3}>
        {previewText}
      </Text>
    );
  }

  if (!formattedHtml) return null;

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
