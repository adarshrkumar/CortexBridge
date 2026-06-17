export default {
    meta: {
        type: 'problem',
        docs: {
            description: 'Forbid inline <script> tags longer than 250 chars in .astro files outside @src/scripts/',
            category: 'Best Practices'
        },
        fixable: null,
        schema: []
    },
    create(context) {
        // Only run on .astro files
        if (!context.filename.endsWith('.astro')) return {};
        // Allow scripts in @src/scripts/ directory
        if (context.filename.includes('/src/scripts/')) return {};

        return {
            Program(_node) {
                const code = context.sourceCode.getText();

                // Find all <script> tags
                const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/g;
                let match;

                while ((match = scriptRegex.exec(code)) !== null) {
                    const scriptContent = match[1];

                    // Check if script content exceeds 250 chars
                    if (scriptContent.length > 250) {
                        // Find the line number
                        const codeUpToMatch = code.substring(0, match.index);
                        const lineNumber = codeUpToMatch.split('\n').length;

                        context.report({
                            loc: {
                                line: lineNumber,
                                column: 0
                            },
                            message: `Inline <script> tag exceeds 250 characters (${scriptContent.length} chars). Move this script to @src/scripts/ directory and import it as a component.`
                        });
                    }
                }
            }
        };
    }
};
