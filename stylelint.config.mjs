/** @type {import('stylelint').Config} */
export default {
    extends: ['stylelint-config-standard'],
    rules: {
        'property-no-vendor-prefix': [
            true,
            { ignoreProperties: ['-webkit-user-select', '-webkit-backdrop-filter'] },
        ],
        'font-family-name-quotes': null,
    },
    overrides: [
        {
            files: ['mcp/public/**/*.css'],
            rules: {},
        },
    ],
};
