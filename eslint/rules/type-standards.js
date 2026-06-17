function containsUnknown(node) {
    if (!node) return false;
    if (node.type === 'TSUnknownKeyword') return true;
    if (node.type === 'TSTypeParameterInstantiation' && node.params && Array.isArray(node.params)) return node.params.some(param => containsUnknown(param));
    if (node.typeParameters && Array.isArray(node.typeParameters)) return node.typeParameters.some(param => containsUnknown(param));
    if (node.type === 'TSTypeLiteral' && node.members && Array.isArray(node.members)) return node.members.some(member => containsUnknown(member.typeAnnotation));
    if (node.typeAnnotation) return containsUnknown(node.typeAnnotation);
    if (node.type === 'TSIndexSignature' && node.typeAnnotation) return containsUnknown(node.typeAnnotation);
    return false;
}

export default {
    meta: {
        type: 'problem',
        docs: {
            description: 'Type safety: forbid any, all uses of unknown type, casts with unknown, and unsafe Zod operations',
            category: 'Best Practices'
        },
        schema: []
    },
    create(context) {
        return {
            TSAsExpression(node) {
                // Check for any cast with unknown in the type annotation
                if (containsUnknown(node.typeAnnotation)) {
                    context.report({
                        node,
                        message: 'Type cast with "unknown" is not allowed. Use a direct cast to a precise, concrete type instead.'
                    });
                }

                // Check for "as unknown as T" (double cast) - if expression is itself a TSAsExpression with unknown
                if (
                    node.expression?.type === 'TSAsExpression' &&
                    node.expression.typeAnnotation?.type === 'TSUnknownKeyword'
                ) {
                    context.report({
                        node,
                        message: '"as unknown as T" double cast is not allowed. Use a direct cast to the target type instead.'
                    });
                }
            },
            TSUnknownKeyword(node) {
                // Check for standalone unknown type usage (but allow in function parameters for now if needed)
                // Skip if it's part of a union or intersection that might be necessary

                // Allow unknown only in very specific contexts if needed, otherwise flag all uses
                context.report({
                    node,
                    message: 'The "unknown" type is not allowed. Use a concrete, precise type instead.'
                });
            },
            CallExpression(node) {
                if (
                    node.callee.type === 'MemberExpression' &&
                    node.callee.object.type === 'Identifier' &&
                    node.callee.object.name === 'z' &&
                    node.callee.property.type === 'Identifier' &&
                    (node.callee.property.name === 'any' || node.callee.property.name === 'unknown')
                ) {
                    context.report({
                        node,
                        message: `z.${node.callee.property.name}() is not allowed. Use a precise Zod type or z.custom<T>() instead.`
                    });
                }
            }
        };
    }
};
