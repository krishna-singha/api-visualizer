import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { ApiData } from '../lib/parseToApiData';
import { ContentTypeBadge } from './ContentTypeBadge';

interface Props {
    request: ApiData['request'];
}

export const RequestBody: React.FC<Props> = ({ request }) => {
    const { body, contentType } = request;

    if (!body) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-xl font-medium text-gray-300">Request Body</h3>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 font-mono text-sm">
                    <p className="text-gray-400 text-sm text-center">
                        No Request body available.
                    </p>
                </div>
            </div>

        );
    }

    const getFormattedCode = (): { code: string; language: string } => {

        if (contentType === 'json' && typeof body === 'object') {
            try {
                return {
                    code: JSON.stringify(body, null, 2),
                    language: 'json',
                };
            } catch {
                return { code: '[Invalid JSON]', language: 'text' };
            }
        }

        if (contentType === 'urlencoded' && typeof body === 'object') {
            const lines = Object.entries(body).map(([k, v]) => `${k} : ${v}`);
            return { code: lines.join('\n'), language: 'yaml' };
        }

        if (contentType === 'form-data' && typeof body === 'object') {
            const lines: string[] = [];

            if (body.fields && typeof body.fields === 'object') {
                for (const [key, value] of Object.entries(body.fields)) {
                    lines.push(`${key} : ${value}`);
                }
            }

            const validFiles = Array.isArray(body.files)
                ? body.files.filter((file: any) => file?.name && file?.type)
                : [];

            if (validFiles.length > 0) {
                if (lines.length > 0) lines.push('');
                lines.push('# Uploaded Files');
                for (const file of validFiles) {
                    lines.push(`- ${file.name} (${file.type})`);
                }
            }

            return { code: lines.join('\n'), language: 'yaml' };
        }

        if (['html', 'xml'].includes(contentType)) {
            return { code: body, language: 'html' };
        }

        if (contentType === 'javascript') {
            return { code: body, language: 'javascript' };
        }

        if (typeof body === 'string') {
            return { code: body, language: 'text' };
        }

        return {
            code: typeof body === 'object' ? JSON.stringify(body, null, 2) : String(body),
            language: 'text',
        };
    };

    const { code, language } = getFormattedCode();

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <h3 className="text-xl font-medium text-gray-300">Request Body</h3>
                <ContentTypeBadge type={contentType} />
            </div>


            <div className="bg-gray-900/50 rounded-lg p-4 font-mono text-sm">
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
            </div>
        </div>
    );
};
