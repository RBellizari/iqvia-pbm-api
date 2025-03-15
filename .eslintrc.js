module.exports = {
    extends: [
      'next/core-web-vitals',
      'plugin:@typescript-eslint/recommended'
    ],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    rules: {
      // Desativar a regra de variáveis não utilizadas do TypeScript
      '@typescript-eslint/no-unused-vars': 'off',
      
      // Usar a regra personalizada que ignora variáveis específicas
      'no-unused-vars': ['warn', { 
        'varsIgnorePattern': '^(NextResponse|jwtVerify|_)',
        'argsIgnorePattern': '^_',
        'caughtErrorsIgnorePattern': '^_',
        'destructuredArrayIgnorePattern': '^_',
        'ignoreRestSiblings': true
      }]
    }
  };