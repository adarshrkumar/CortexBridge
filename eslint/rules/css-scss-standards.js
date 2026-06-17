function findAllLayers(code) {
    const layers = [];
    const layerRegex = /@layer\s+([\w-]+)\s*\{/g;
    let match;

    while ((match = layerRegex.exec(code)) !== null) {
        const layerStart = match.index + match[0].length;
        let braceCount = 1;
        let pos = layerStart;

        while (pos < code.length && braceCount > 0) {
            if (code[pos] === '{') braceCount++;
            else if (code[pos] === '}') braceCount--;
            pos++;
        }

        layers.push({
            name: match[1],
            start: layerStart,
            end: pos - 1,
            content: code.substring(layerStart, pos - 1),
        });
    }

    return layers;
}

function checkTailwindConventions(code, context) {
    // Remove comments from code for cleaner checking
    const codeWithoutComments = code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

    // Check for Tailwind-style SCSS variables: $m-4, $p-8, $gap-3, etc.
    const tailwindVarRegex = /\$(?:[mp][trblxys]?|gap|w|h|text|bg|border|rounded|shadow|opacity)-[\w-]+/g;
    let match;

    while ((match = tailwindVarRegex.exec(codeWithoutComments)) !== null) {
        const codeUpToMatch = codeWithoutComments.substring(0, match.index);
        const lineNumber = codeUpToMatch.split(/\r?\n/).length;

        context.report({
            loc: {
                line: lineNumber,
                column: 0
            },
            message: `Tailwind-style variable name '${match[0]}' detected. Use semantic naming like '$spacing', '$spacing-lg', '$color-primary', etc. instead.`,
        });
    }

    // Check for Tailwind-style CSS custom properties: --m-4, --p-8, etc.
    const tailwindCssVarRegex = /--(?:[mp][trblxys]?|gap|w|h|text|bg|border|rounded|shadow|opacity)-[\w-]+/g;

    while ((match = tailwindCssVarRegex.exec(codeWithoutComments)) !== null) {
        const codeUpToMatch = codeWithoutComments.substring(0, match.index);
        const lineNumber = codeUpToMatch.split(/\r?\n/).length;

        context.report({
            loc: {
                line: lineNumber,
                column: 0
            },
            message: `Tailwind-style CSS custom property '${match[0]}' detected. Use semantic naming like '--spacing', '--spacing-lg', '--color-primary', etc. instead.`,
        });
    }

    // Check for Tailwind-style spacing utilities: m-*, p-*, gap-*
    const spacingRegex = /\b(?:[mp][trblxys]?|gap)-[\d.]+\b/g;

    while ((match = spacingRegex.exec(codeWithoutComments)) !== null) {
        const fullClass = codeWithoutComments.substring(Math.max(0, match.index - 1), match.index + match[0].length + 1);

        // Only flag if it's a class selector (preceded by .) and not part of BEM naming
        if (codeWithoutComments[match.index - 1] === '.' && !fullClass.includes('__') && !fullClass.includes('--')) {
            const codeUpToMatch = codeWithoutComments.substring(0, match.index);
            const lineNumber = codeUpToMatch.split(/\r?\n/).length;

            context.report({
                loc: {
                    line: lineNumber,
                    column: 0
                },
                message: `Tailwind utility class '.${match[0]}' detected. Use BEM naming conventions (e.g., '.block__element') instead of utility classes in style files.`,
            });
        }
    }

    // Check for Tailwind color utilities: text-*, bg-*, border-* with color names and numbers
    const colorRegex = /\b(?:text|bg|border|outline)-[a-z]+-\d+\b/g;

    while ((match = colorRegex.exec(codeWithoutComments)) !== null) {
        if (codeWithoutComments[match.index - 1] === '.') {
            const codeUpToMatch = codeWithoutComments.substring(0, match.index);
            const lineNumber = codeUpToMatch.split(/\r?\n/).length;

            context.report({
                loc: {
                    line: lineNumber,
                    column: 0
                },
                message: `Tailwind utility class '.${match[0]}' detected. Use BEM naming conventions (e.g., '.block__element') instead of utility classes in style files.`,
            });
        }
    }

    // Check for Tailwind sizing utilities: w-*, h-*, max-w-*, min-h-*
    const sizingRegex = /\b(?:max-)?[wh](?:max)?-[\w]+\b/g;

    while ((match = sizingRegex.exec(codeWithoutComments)) !== null) {
        if (codeWithoutComments[match.index - 1] === '.' && (match[0].includes('-') || /\d/.test(match[0]))) {
            const codeUpToMatch = codeWithoutComments.substring(0, match.index);
            const lineNumber = codeUpToMatch.split(/\r?\n/).length;

            context.report({
                loc: {
                    line: lineNumber,
                    column: 0
                },
                message: `Tailwind utility class '.${match[0]}' detected. Use BEM naming conventions (e.g., '.block__element') instead of utility classes in style files.`,
            });
        }
    }

    // Check for Tailwind rounded, shadow, and opacity utilities
    const utilityRegex = /\b(?:rounded|shadow|opacity)-[\w]+\b/g;

    while ((match = utilityRegex.exec(codeWithoutComments)) !== null) {
        if (codeWithoutComments[match.index - 1] === '.') {
            const codeUpToMatch = codeWithoutComments.substring(0, match.index);
            const lineNumber = codeUpToMatch.split(/\r?\n/).length;

            context.report({
                loc: {
                    line: lineNumber,
                    column: 0
                },
                message: `Tailwind utility class '.${match[0]}' detected. Use BEM naming conventions (e.g., '.block__element') instead of utility classes in style files.`,
            });
        }
    }
}

function checkBemModifiers(code, context) {
    const bemModifierRegex = /(?:\.[\w-]+|&)--[\w-]+/g;
    let match;

    while ((match = bemModifierRegex.exec(code)) !== null) {
        const codeUpToMatch = code.substring(0, match.index);
        const lineNumber = codeUpToMatch.split(/\r?\n/).length;

        context.report({
            loc: {
                line: lineNumber,
                column: 0
            },
            message: `BEM modifier '${match[0]}' detected. Use semantic attributes (disabled, active, aria-*, etc.) or data-attributes instead of modifier classes`,
        });
    }
}

function checkDuplicateSelectorsWithNesting(scopeContent, code, scopeStartOffset, scopeName, context) {
    const lines = scopeContent.split(/\r?\n/);
    const seenTopLevelSelectors = new Map();
    let nestingDepth = 0;

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const line = lines[lineIdx];
        const trimmed = line.trim();

        for (let i = 0; i < line.length; i++) {
            if (line[i] === '{') nestingDepth++;
            else if (line[i] === '}') nestingDepth--;
        }

        if (nestingDepth === 0 && trimmed && !trimmed.startsWith('@') && trimmed.includes('{')) {
            const selectorMatch = /^([^{}@\n]+?)\s*\{/.exec(trimmed);
            if (selectorMatch) {
                const selector = selectorMatch[1].trim();

                if (!selector.startsWith('@') && !selector.startsWith('<') && selector) {
                    if (seenTopLevelSelectors.has(selector)) {
                        const firstOccurrence = seenTopLevelSelectors.get(selector);
                        context.report({
                            loc: {
                                line: lineIdx + 1,
                                column: 0
                            },
                            message: `Duplicate top-level selector '${selector}' in ${scopeName}. Previously declared on line ${firstOccurrence}.`,
                        });
                    }
                    else {
                        seenTopLevelSelectors.set(selector, lineIdx + 1);
                    }
                }
            }
        }
    }
}

export default {
    meta: {
        type: 'problem',
        docs: {
            description: 'CSS/SCSS best practices: forbid BEM modifiers and duplicate selectors',
            category: 'Best Practices'
        },
        fixable: null,
        schema: []
    },
    create(context) {
        return {
            Program(_node) {
                const code = context.sourceCode.getText();

                // Handle Astro files - check script tags
                if (context.filename.endsWith('.astro')) {
                    // Extract script tags content
                    const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/g;
                    let match;

                    while ((match = scriptRegex.exec(code)) !== null) {
                        const scriptContent = match[1];
                        const scriptStartIndex = match.index + match[0].indexOf('>') + 1;

                        // Check Tailwind naming conventions in scripts
                        checkTailwindConventions(scriptContent, {
                            report: report => {
                                // Adjust line number to account for script tag position
                                const codeUpToScript = code.substring(0, scriptStartIndex);
                                const scriptLineOffset = codeUpToScript.split(/\r?\n/).length - 1;
                                const adjustedReport = {
                                    ...report,
                                    loc: {
                                        ...report.loc,
                                        line: report.loc.line + scriptLineOffset
                                    }
                                };
                                context.report(adjustedReport);
                            }
                        });
                    }
                    return;
                }

                if (!context.filename.endsWith('.css') && !context.filename.endsWith('.scss')) {
                    return;
                }

                // Check for Tailwind naming conventions
                checkTailwindConventions(code, context);

                // Check for BEM modifiers
                checkBemModifiers(code, context);

                // Check for &- nesting syntax (should use &__)
                // checkNestingDashSyntax(code, context);

                // Check for class and id selectors with dashes (should use underscores)
                // checkClassAndIdSelectors(code, context);

                // Check for duplicate selectors
                const layers = findAllLayers(code);
                const scopes = [];

                scopes.push({
                    name: 'global',
                    content: code,
                    startOffset: 0,
                });

                for (const layer of layers) {
                    scopes.push({
                        name: `layer(${layer.name})`,
                        content: layer.content,
                        startOffset: layer.start,
                    });
                }

                for (const scope of scopes) {
                    checkDuplicateSelectorsWithNesting(scope.content, code, scope.startOffset, scope.name, context);
                }
            }
        };
    }
};
