function hasAwaitOrAsync(node) {
    if (!node) return false;
    if (node.type === 'AwaitExpression') return true;
    if (node.type === 'ArrowFunctionExpression' || node.type === 'FunctionExpression') return node.async || hasAwaitOrAsync(node.body);
    if (node.type === 'CallExpression') return hasAwaitOrAsync(node.callee);
    if (node.type === 'MemberExpression') return hasAwaitOrAsync(node.object) || hasAwaitOrAsync(node.property);
    if (node.type === 'BinaryExpression' || node.type === 'LogicalExpression') return hasAwaitOrAsync(node.left) || hasAwaitOrAsync(node.right);
    if (node.type === 'UnaryExpression') return hasAwaitOrAsync(node.argument);
    if (node.type === 'ConditionalExpression') return hasAwaitOrAsync(node.test) || hasAwaitOrAsync(node.consequent) || hasAwaitOrAsync(node.alternate);
    if (node.type === 'SequenceExpression') return node.expressions.some(expr => hasAwaitOrAsync(expr));
    return false;
}

function isComplexExpression(node) {
    if (!node) return false;
    // Identifiers, literals, and simple member expressions don't need parens
    if (node.type === 'Identifier' || node.type === 'Literal' || node.type === 'TemplateLiteral') return false;
    if (node.type === 'MemberExpression') return false;
    // LogicalExpressions and other operators might benefit from parens for clarity
    if (node.type === 'LogicalExpression' || node.type === 'BinaryExpression') return true;
    // Conditional expressions inside conditionals might benefit from parens
    if (node.type === 'ConditionalExpression') return true;
    return true;
}

function isAllowedAsFunctionArgument(node) {
    if (!node.parent) return false;
    return (
        (node.parent.type === 'CallExpression' || node.parent.type === 'NewExpression')
        && Array.isArray(node.parent.arguments)
        && node.parent.arguments.includes(node)
    );
}

function isAllowedIife(node) {
    if (!node.parent) return false;
    return node.parent.type === 'CallExpression' && node.parent.callee === node;
}

function getArrowFunctionName(node) {
    if (!node.parent) return 'anonymous';
    if (node.parent.type === 'VariableDeclarator' && node.parent.id.type === 'Identifier') return node.parent.id.name;
    if (node.parent.type === 'AssignmentExpression' && node.parent.left.type === 'Identifier') return node.parent.left.name;
    if (node.parent.type === 'Property' && node.parent.key.type === 'Identifier') return node.parent.key.name;
    return 'anonymous';
}

function isAllowedApiHandler(node, isApiRoute) {
    if (!isApiRoute) return false;
    if (!node.parent || node.parent.type !== 'VariableDeclarator' || node.parent.id.type !== 'Identifier') return false;
    const apiHandlers = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
    return apiHandlers.includes(node.parent.id.name);
}

function isAllowedExecuteProperty(node) {
    if (!node.parent || node.parent.type !== 'Property') return false;
    if (node.parent.key.type !== 'Identifier') return false;
    return node.parent.key.name === 'execute';
}

function isAllowedObjectProperty(node) {
    if (!node.parent || node.parent.type !== 'Property') return false;
    // Allow arrow functions as object property values (callbacks, transforms, renderers, etc.)
    return true;
}

function checkSingleDeclarationBlock(node, blockNode, context) {
    if (!blockNode || blockNode.type !== 'BlockStatement' || blockNode.body.length !== 1) {
        return;
    }

    const statementStartLine = blockNode.body[0].loc?.start?.line;
    const statementEndLine = blockNode.body[0].loc?.end?.line;

    // Only enforce if the statement itself is single-line
    if (!statementStartLine || !statementEndLine || statementStartLine !== statementEndLine) {
        return;
    }

    // Only enforce if the parent conditional is also single-line
    const parentStartLine = node.loc?.start?.line;
    const parentEndLine = blockNode.loc?.start?.line;
    if (!parentStartLine || !parentEndLine || parentStartLine !== parentEndLine) {
        return;
    }

    // Only enforce if the condensed line (condition + statement on one line) would be less than 100 characters
    const parentCode = context.sourceCode.getText(node).trim();
    const statementCode = context.sourceCode.getText(blockNode.body[0]).trim();
    // Simulate the condensed one-line version: "if (...) statement"
    const condensedLine = `${parentCode} ${statementCode}`;
    if (condensedLine.length >= 100) return;

    const reportObj = {
        node,
        message: 'Single statement in block should be on one line'
    };

    if (!context.filename.endsWith('.astro')) {
        reportObj.fix = function(fixer) {
            const openBraceToken = context.sourceCode.getFirstToken(blockNode);
            const closeBraceToken = context.sourceCode.getLastToken(blockNode);
            // Check if there's already a space before the opening brace
            const beforeBrace = context.sourceCode.text[openBraceToken.range[0] - 1];
            const needsSpace = beforeBrace !== ' ' && beforeBrace !== '\t' && beforeBrace !== '\n';
            const spacing = needsSpace ? ' ' : '';
            return fixer.replaceTextRange(
                [openBraceToken.range[0], closeBraceToken.range[1]],
                `${spacing}${statementCode}`
            );
        };
    }

    context.report(reportObj);
}

export default {
    meta: {
        type: 'problem',
        docs: {
            description: 'Code style standards: enforce arrow function declarations, arrow function parameter parentheses, if/else/try/catch/finally brace placement, whitespace rules, multi-line comments, duplicate consecutive comments, and 4-space indentation',
            category: 'Stylistic Issues'
        },
        fixable: 'code',
        schema: []
    },
    create(context) {
        return {
            Program(node) {
                const code = context.sourceCode.getText();

                // For Astro files, extract script tags and check them separately
                if (context.filename.endsWith('.astro')) {
                    const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/g;
                    let match;

                    while ((match = scriptRegex.exec(code)) !== null) {
                        const scriptContent = match[1];
                        const scriptStartIndex = match.index + match[0].indexOf('>') + 1;
                        const scriptLineOffset = code.substring(0, scriptStartIndex).split(/\r?\n/).length - 1;

                        // Check 6 (Astro script): Arrow function definitions
                        const arrowFunctionRegex = /(?:const|let|var|async)\s+(\w+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|\w+)\s*=>/g;
                        let arrowMatch;
                        while ((arrowMatch = arrowFunctionRegex.exec(scriptContent)) !== null) {
                            const functionName = arrowMatch[1];
                            const arrowStartIndex = scriptStartIndex + arrowMatch.index;
                            const arrowLineOffset = code.substring(0, arrowStartIndex).split(/\r?\n/).length - 1;
                            context.report({
                                loc: {
                                    line: arrowLineOffset,
                                    column: 1
                                },
                                message: `Arrow function definition '${functionName}' is not allowed. Use a regular function declaration instead.`
                            });
                        }

                        // Check indentation and trailing whitespace in script
                        const scriptLines = scriptContent.split(/\r?\n/);
                        scriptLines.forEach((line, index) => {
                            const globalLineNumber = scriptLineOffset + index + 1;

                            // Check for 4-space indentation
                            if (line && line.match(/^\s/)) {
                                const indentMatch = line.match(/^(\s+)/);
                                if (indentMatch) {
                                    const leadingWhitespace = indentMatch[1];

                                    if (leadingWhitespace.includes('\t')) {
                                        context.report({
                                            loc: {
                                                line: globalLineNumber,
                                                column: 1
                                            },
                                            message: 'Indentation must use 4 spaces, not tabs'
                                        });
                                    }

                                    const spaceCount = leadingWhitespace.length;
                                    const isTwoSpaceIndent = spaceCount % 4 !== 0 && spaceCount % 2 === 0;

                                    if (isTwoSpaceIndent) {
                                        context.report({
                                            loc: {
                                                line: globalLineNumber,
                                                column: 1
                                            },
                                            message: `Indentation must use 4-space increments, not 2-space. Found ${spaceCount} spaces.`
                                        });
                                    }
                                }
                            }

                            // Check for trailing whitespace
                            if (/[ \t]+$/.test(line)) {
                                const column = line.length - line.trimEnd().length + 1;
                                context.report({
                                    loc: {
                                        line: globalLineNumber,
                                        column: column
                                    },
                                    message: 'Found trailing whitespace. Remove spaces or tabs at the end of lines.'
                                });
                            }

                            // Check for if/else brace placement: } else should be on separate lines
                            if (/}\s*else\s/.test(line)) {
                                const column = line.indexOf('}') + 1;
                                context.report({
                                    loc: {
                                        line: globalLineNumber,
                                        column: column
                                    },
                                    message: 'Closing curly brace appears on the same line as the subsequent block. Use a new line before else/else if.'
                                });
                            }
                        });
                    }
                }

                // Check 0a: Multi-line block comments (disallow unless they contain JSDoc tags or multiple lines of content)
                const comments = context.sourceCode.getAllComments?.() || context.sourceCode.getComments?.() || [];
                const jsDocTags = /@(param|returns?|example|deprecated|throws?|see|author|version|since|async|yields?|access|readonly|private|protected|static|abstract|type|enum|callback|template|typedef|implements|interface|extends|class|function|const|var|let|ignore|preserve|preserve-indent|pre|code|literal|external|link)/;

                comments.forEach(comment => {
                    // Only check block comments (/* */ and /** */)
                    if (comment.type !== 'Block') return;

                    // Check if comment spans multiple lines
                    const startLine = comment.loc.start.line;
                    const endLine = comment.loc.end.line;

                    if (startLine === endLine) {
                        // Single line block comment like /* foo */ - allow
                        return;
                    }

                    // Allow JSDoc comments with @param, @returns, @example, @deprecated, etc.
                    const commentText = comment.value;
                    if (jsDocTags.test(commentText)) return;

                    // Parse multi-line comment to extract actual content
                    const lines = commentText.split('\n').map(line => line.trim());

                    // Remove leading and trailing empty lines
                    while (lines.length > 0 && lines[0] === '') {
                        lines.shift();
                    }
                    while (lines.length > 0 && lines[lines.length - 1] === '') {
                        lines.pop();
                    }

                    // Remove leading * from each line (common in JSDoc style comments)
                    const cleanedLines = lines.map(line => {
                        // Remove leading * and optional space
                        return line.replace(/^\*\s?/, '').trim();
                    });

                    // Filter out empty lines to count actual content lines
                    const contentLines = cleanedLines.filter(line => line.length > 0);

                    // Allow multi-line comments with multiple lines of content
                    if (contentLines.length > 1) return;

                    // Join into single line for single-line content
                    const singleLineContent = cleanedLines.join(' ').trim();

                    context.report({
                        node: node,
                        loc: comment.loc,
                        message: 'Multi-line block comments should use single-line comment syntax (//) instead',
                        fix(fixer) {
                            const singleLineComment = `// ${singleLineContent}`;
                            return fixer.replaceText(comment, singleLineComment);
                        }
                    });
                });

                // Check 0c: Duplicate consecutive comments
                for (let i = 0; i < comments.length - 1; i++) {
                    const currentComment = comments[i];
                    const nextComment = comments[i + 1];

                    // Check if there's no code between the comments (only whitespace/blank lines)
                    const textBetween = code.substring(currentComment.range[1], nextComment.range[0]).trim();
                    if (textBetween === '') {
                        // Use the full comment text (preserving indentation)
                        if (currentComment.value === nextComment.value) {
                            context.report({
                                node: node,
                                loc: nextComment.loc,
                                message: 'Duplicate consecutive comment. Remove the redundant comment.',
                            });
                        }
                    }
                }

                // Check 1 & 0b: Trailing whitespace and 4-space indentation
                const lines = code.split(/\r?\n/);

                lines.forEach((line, index) => {
                    // Check 0b: 4-space indentation (disallow tabs and 2-space indents)
                    if (line && line.match(/^\s/)) {
                        const match = line.match(/^(\s+)/);
                        if (match) {
                            const leadingWhitespace = match[1];

                            // Check for tabs
                            if (leadingWhitespace.includes('\t')) {
                                const lineNumber = index + 1;

                                context.report({
                                    loc: {
                                        line: lineNumber,
                                        column: 1
                                    },
                                    message: 'Indentation must use 4 spaces, not tabs'
                                });
                                return;
                            }

                            // Check for 2-space indentation (multiple of 2 but not 4)
                            const spaceCount = leadingWhitespace.length;
                            const isTwoSpaceIndent = spaceCount % 4 !== 0 && spaceCount % 2 === 0;

                            if (isTwoSpaceIndent) {
                                const lineNumber = index + 1;

                                context.report({
                                    loc: {
                                        line: lineNumber,
                                        column: 1
                                    },
                                    message: `Indentation must use 4-space increments, not 2-space. Found ${spaceCount} spaces.`
                                });
                                return;
                            }
                        }
                    }
                    if (/[ \t]+$/.test(line)) {
                        const lineNumber = index + 1;
                        const column = line.length - line.trimEnd().length + 1;

                        context.report({
                            loc: {
                                line: lineNumber,
                                column: column
                            },
                            message: 'Found trailing whitespace. Remove spaces or tabs at the end of lines.',
                            fix(fixer) {
                                const fixedCode = code.replace(/[ \t]+$/gm, '');
                                return fixer.replaceText(node, fixedCode);
                            }
                        });
                    }
                });

                // Check 2: Excessive newlines (3 or more consecutive, ignoring first skipLines lines of Astro frontmatter)
                const skipLines = 3; // Number of lines to skip for Astro frontmatter
                const codeWithoutTrailing = code.replace(/(?:\r\n|\r|\n)+$/, '');
                const codeLines = codeWithoutTrailing.split(/\r\n|\r|\n/);
                const codeAfterFrontmatter = codeLines.slice(skipLines).join('\n');
                const excessiveNewlinesRegex = /(?:\n){3,}/g;

                if (excessiveNewlinesRegex.test(codeAfterFrontmatter)) {
                    const codeUpToFirstMatch = codeAfterFrontmatter.substring(0, codeAfterFrontmatter.search(/(?:\n){3,}/));
                    const lineNumber = skipLines + codeUpToFirstMatch.split('\n').length;

                    context.report({
                        loc: {
                            line: lineNumber,
                            column: 0
                        },
                        message: 'Found 3+ consecutive newlines. Use at most 1 blank line (2 consecutive newlines).',
                        fix(fixer) {
                            const fixedCode = code.replace(/(?:\r\n|\r|\n){3,}/g, '\n\n');
                            return fixer.replaceText(node, fixedCode);
                        }
                    });
                }
            },
            IfStatement(node) {
                // Check 3: If/else brace placement
                if (node.alternate) {
                    const consequentClosingBrace = context.sourceCode.getLastToken(node.consequent);
                    const elseToken = context.sourceCode.getTokenAfter(consequentClosingBrace);

                    if (elseToken && elseToken.value === 'else' && consequentClosingBrace.loc.end.line === elseToken.loc.start.line) {
                        context.report({
                            node: elseToken,
                            message: 'Closing curly brace appears on the same line as the subsequent block',
                            fix(fixer) {
                                return fixer.replaceTextRange(
                                    [consequentClosingBrace.range[1], elseToken.range[0]],
                                    '\n'
                                );
                            }
                        });
                    }
                }

                // Check 5: Single statement in if/else should be on one line
                checkSingleDeclarationBlock(node, node.consequent, context);
                if (node.alternate && node.alternate.type !== 'IfStatement') {
                    checkSingleDeclarationBlock(node.alternate, node.alternate, context);
                }
            },
            TryStatement(node) {
                // Check 4: Try/catch/finally must stay on same line
                const tryBlockClosingBrace = context.sourceCode.getLastToken(node.block);

                if (node.handler) {
                    const catchToken = context.sourceCode.getTokenAfter(tryBlockClosingBrace);

                    if (catchToken && catchToken.value === 'catch' && tryBlockClosingBrace.loc.end.line !== catchToken.loc.start.line) {
                        context.report({
                            node: catchToken,
                            message: 'catch block must be on the same line as closing brace: } catch',
                            fix(fixer) {
                                return fixer.replaceTextRange(
                                    [tryBlockClosingBrace.range[1], catchToken.range[0]],
                                    ' '
                                );
                            }
                        });
                    }

                    if (node.finalizer) {
                        const catchBlockClosingBrace = context.sourceCode.getLastToken(node.handler.body);
                        const finallyToken = context.sourceCode.getTokenAfter(catchBlockClosingBrace);

                        if (finallyToken && finallyToken.value === 'finally' && catchBlockClosingBrace.loc.end.line !== finallyToken.loc.start.line) {
                            context.report({
                                node: finallyToken,
                                message: 'finally block must be on the same line as closing brace: } finally',
                                fix(fixer) {
                                    return fixer.replaceTextRange(
                                        [catchBlockClosingBrace.range[1], finallyToken.range[0]],
                                        ' '
                                    );
                                }
                            });
                        }
                    }
                }
                else if (node.finalizer) {
                    const finallyToken = context.sourceCode.getTokenAfter(tryBlockClosingBrace);

                    if (finallyToken && finallyToken.value === 'finally' && tryBlockClosingBrace.loc.end.line !== finallyToken.loc.start.line) {
                        context.report({
                            node: finallyToken,
                            message: 'finally block must be on the same line as closing brace: } finally',
                            fix(fixer) {
                                return fixer.replaceTextRange(
                                    [tryBlockClosingBrace.range[1], finallyToken.range[0]],
                                    ' '
                                );
                            }
                        });
                    }
                }
            },
            ForStatement(node) {
                // Check 5b: Single statement in for should be on one line
                checkSingleDeclarationBlock(node, node.body, context);
            },
            WhileStatement(node) {
                // Check 5c: Single statement in while should be on one line
                checkSingleDeclarationBlock(node, node.body, context);
            },
            ArrowFunctionExpression(node) {
                // Check 6: Arrow function definitions
                if (!isAllowedAsFunctionArgument(node) && !isAllowedIife(node) && !isAllowedApiHandler(node, context.filename.includes('/pages/api/')) && !isAllowedExecuteProperty(node) && !isAllowedObjectProperty(node)) {
                    const functionName = getArrowFunctionName(node);
                    context.report({
                        node,
                        message: `Arrow function definition '${functionName}' is not allowed. Use a regular function declaration instead.`,
                    });
                }

                // Check 7: Arrow function parameter parentheses (as-needed)
                const firstParam = node.params[0];
                if (!firstParam || node.params.length !== 1) return;
                if (firstParam.type === 'RestElement') return;
                if (node.returnType?.typeAnnotation?.type === 'TSTypePredicate') return;

                const isSimpleIdentifier = firstParam.type === 'Identifier' && !firstParam.typeAnnotation;
                if (!isSimpleIdentifier) return;

                const hasReturnType = node.returnType && node.returnType.typeAnnotation;
                if (hasReturnType) return;

                const openParen = context.sourceCode.getTokenBefore(firstParam);
                const closeParen = context.sourceCode.getTokenAfter(firstParam);
                const hasParens = openParen && closeParen && openParen.value === '(' && closeParen.value === ')';
                if (!hasParens) return;

                context.report({
                    node,
                    message: 'Unexpected parentheses around single arrow function parameter',
                    fix(fixer) {
                        return fixer.replaceTextRange(
                            [openParen.range[0], closeParen.range[1]],
                            firstParam.name
                        );
                    }
                });
            },
            ConditionalExpression(node) {
                // Check 8: Unnecessary parentheses around ternary condition test for simple identifiers/properties
                const test = node.test;

                if (!test) return;

                // Get the first token before the test and the last token after it
                const tokenBeforeTest = context.sourceCode.getTokenBefore(test);
                const tokenAfterTest = context.sourceCode.getTokenAfter(test);

                // Check if the test is wrapped in unnecessary parentheses
                if (
                    tokenBeforeTest
                    && tokenAfterTest
                    && tokenBeforeTest.value === '('
                    && tokenAfterTest.value === ')'
                    && tokenBeforeTest.range[1] === test.range[0]
                    && tokenAfterTest.range[0] === test.range[1]
                ) {
                    // Only report if it's a simple expression without await/async or complex operators
                    if (!hasAwaitOrAsync(test) && !isComplexExpression(test)) {
                        context.report({
                            node,
                            message: 'Unnecessary parentheses around simple ternary condition',
                            fix(fixer) {
                                return fixer.replaceTextRange(
                                    [tokenBeforeTest.range[0], tokenAfterTest.range[1]],
                                    context.sourceCode.getText(test)
                                );
                            }
                        });
                    }
                }
            }
        };
    }
};
