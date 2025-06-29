import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { ApiData } from '../lib/parseToApiData';
import { ContentTypeBadge } from './ContentTypeBadge';

interface Props {
  response: ApiData['response'];
}

export const ResponseBody: React.FC<Props> = ({ response }) => {
  const { body, contentType } = response;

  if (!body) {
    return (
      <div className="bg-gray-900/50 rounded-lg p-4 font-mono text-sm">
        <p className="text-gray-400 text-sm text-center">
          No response body available.
        </p>
      </div>
    );
  }

  const getFormattedCode = (): { code: string; language: string; renderHtml?: boolean } => {
    if (typeof body === 'string' && body.includes('<!DOCTYPE html')) {
      const isError =
        /<title>.*(404|500|error|not found).*<\/title>/i.test(body) ||
        /cannot\s/i.test(body) ||
        /error/i.test(body);
      return { code: body, language: 'html', renderHtml: isError };
    }

    if (contentType === 'json') {
      try {
        const parsed = typeof body === 'string' ? JSON.parse(body) : body;
        return {
          code: JSON.stringify(parsed, null, 2),
          language: 'json',
        };
      } catch {
        return { code: '[Invalid JSON]', language: 'text' };
      }
    }

    return {
      code: typeof body === 'string' ? body : JSON.stringify(body, null, 2),
      language: 'text',
    };
  };

  const { code, language, renderHtml } = getFormattedCode();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="text-xl font-medium text-gray-300">Response Body</h3>
        <ContentTypeBadge type={contentType} />
      </div>

      <div className="bg-gray-900/50 rounded-lg p-4 font-mono text-sm">
        {renderHtml ? (
          <div
            className="prose prose-invert max-w-none text-white text-sm"
            dangerouslySetInnerHTML={{ __html: code }}
          />
        ) : (
          <SyntaxHighlighter
            language={language}
            style={vscDarkPlus}
            wrapLines
            wrapLongLines
            customStyle={{
              borderRadius: '0.5rem',
              padding: '1rem',
              backgroundColor: 'transparent',
              fontSize: '0.875rem',
              lineHeight: '1.5',
            }}
          >
            {code}
          </SyntaxHighlighter>
        )}
      </div>
    </div>
  )
}