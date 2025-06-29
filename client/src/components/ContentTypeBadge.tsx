interface Props {
  type:
    | "text"
    | "json"
    | "javascript"
    | "html"
    | "xml"
    | "form-data"
    | "urlencoded"
    | "binary"
    | "graphql"
    | "unknown";
}

export const ContentTypeBadge: React.FC<Props> = ({ type }) => {
  const typeStyles: Record<typeof type, { bg: string; text: string; border: string }> = {
    text: {
      bg: "bg-blue-700/30",
      text: "text-blue-300",
      border: "border-blue-500/30",
    },
    json: {
      bg: "bg-green-700/30",
      text: "text-green-300",
      border: "border-green-500/30",
    },
    javascript: {
      bg: "bg-yellow-700/30",
      text: "text-yellow-300",
      border: "border-yellow-500/30",
    },
    html: {
      bg: "bg-pink-700/30",
      text: "text-pink-300",
      border: "border-pink-500/30",
    },
    xml: {
      bg: "bg-rose-700/30",
      text: "text-rose-300",
      border: "border-rose-500/30",
    },
    "form-data": {
      bg: "bg-orange-700/30",
      text: "text-orange-300",
      border: "border-orange-500/30",
    },
    urlencoded: {
      bg: "bg-purple-700/30",
      text: "text-purple-300",
      border: "border-purple-500/30",
    },
    binary: {
      bg: "bg-slate-700/30",
      text: "text-slate-300",
      border: "border-slate-500/30",
    },
    graphql: {
      bg: "bg-indigo-700/30",
      text: "text-indigo-300",
      border: "border-indigo-500/30",
    },
    unknown: {
      bg: "bg-gray-700/30",
      text: "text-gray-300",
      border: "border-gray-500/30",
    },
  };

  const style = typeStyles[type] || typeStyles.unknown;

  return (
    <span
      className={`inline-block px-3 py-1 text-xs font-medium rounded-full border
        ${style.bg} ${style.text} ${style.border}`}
    >
      &lt;{type} /&gt;
    </span>
  );
};
