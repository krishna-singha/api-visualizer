import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { ApiData } from '../lib/parseToApiData';

interface Props {
  response: ApiData['response'];
}

export const ResponseBody: React.FC<Props> = ({ response }) => {
  const renderResponseBody = () => {
    const { body, contentType } = response;

    const isHtml =
      typeof body === 'string' && contentType?.includes('text/html');

    if (isHtml) {
      return (
        <div
          className="bg-black text-white p-3 rounded text-sm font-sans flex items-center justify-center h-40"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      );
    }

    try {
      const parsed = JSON.parse(body);
      return (
        <SyntaxHighlighter language="json" style={vscDarkPlus} wrapLines wrapLongLines>
          {JSON.stringify(parsed, null, 2)}
        </SyntaxHighlighter>
      );
    } catch {
      const raw = typeof body === 'string'
        ? body
        : JSON.stringify(body, null, 2);

      const cleaned = raw
        .replace(/\\r\\n/g, '\n')
        .replace(/\r\n/g, '\n')
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '  ');

      if (cleaned.includes('Content-Disposition')) {
        const lines = cleaned.split('\n');
        const output: string[] = [];
        let currentField: string | null = null;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();

          if (line.toLowerCase().startsWith('content-disposition')) {
            const nameMatch = line.match(/name="([^"]+)"/);
            currentField = nameMatch ? nameMatch[1] : null;
          } else if (line && currentField) {
            output.push(`📌 ${currentField}: ${line}`);
            currentField = null;
          }
        }

        return output.map((line, idx) => <div key={idx}>{line}</div>);
      }

      return cleaned.split('\n').map((line, idx) => <div key={idx}>{line}</div>);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-medium text-gray-300">Response Body</h3>
      <div className="bg-gray-900/50 rounded-lg p-4 font-mono text-sm">
        {renderResponseBody()}
      </div>
    </div>
  );
};
