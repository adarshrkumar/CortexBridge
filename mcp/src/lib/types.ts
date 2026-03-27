export type CodeStyle = {
    type: 'ts' | 'css' | 'scss' | 'astro' | 'svelte' | 'jsx' | 'tsx' | string;
    rule: string;
};

export type ProjectContext = {
    instructions: string | null;
    codeStyles: CodeStyle[];
    createdAt: string;
    updatedAt: string;
};
