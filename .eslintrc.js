/* eslint-disable quote-props */
module.exports = {
    'extends': 'airbnb-base',
    'plugins': [
        'import'
    ],
    'env': {
        'browser': true,
        'mocha': true
    },
    'globals': {
        'assert': true,
        'expect': true,
        'sinon': true
    },
    'rules': {
        'no-use-before-define': ['error', 'nofunc'],
        'comma-dangle': ['error', 'never'],
        'no-param-reassign': ['error', {'props': false}],
        'no-restricted-syntax': ['error', 'LabeledStatement', 'WithStatement'],
        'object-curly-spacing': ['error', 'always'],
        'no-underscore-dangle': ['off'],
        'no-unused-vars': ['error', {'argsIgnorePattern': '^_'}],
        'import/no-named-as-default': ['off'],
        'import/no-named-as-default-member': ['off'],
        'curly': ['error', 'all'],
        'no-alert': [0]
    }
};

