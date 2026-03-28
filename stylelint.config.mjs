import propertyOrder from './styles/property-order.json' with { type: 'json' };

/** @type {import('stylelint').Config} */
export default {
    extends: ['stylelint-config-standard-scss'],
    plugins: ['stylelint-order'],
    rules: {
        'property-no-vendor-prefix': [
            true,
            {
                ignoreProperties: [
                    '-webkit-user-select',
                    '-webkit-backdrop-filter',
                    '-webkit-mask',
                    '-webkit-mask-image',
                    '-webkit-mask-size',
                    '-webkit-mask-position',
                    '-webkit-mask-repeat',
                    '-webkit-mask-clip',
                    '-webkit-mask-origin',
                    '-webkit-mask-composite',
                ],
            },
        ],
        'font-family-name-quotes': null,
        'declaration-property-value-disallowed-list': {
            flex: ['row', 'column', 'row-reverse', 'column-reverse'],
        },
        'order/properties-order': Object.values(propertyOrder).flat().filter(p => !p.startsWith('//')),
    },
    overrides: [
        {
            files: ['mcp/public/**/*.css'],
            extends: ['stylelint-config-standard'],
        },
    ],
};
