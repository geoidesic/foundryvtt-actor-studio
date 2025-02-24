module.exports = {
  // Svelte preprocessing requirements
  svelte: {
    template: {
      language: 'pug',
      requirements: [
        'Use +if for conditionals',
        'Use +each for loops',
        'Use attribute=(value) syntax',
        'Use .className for classes'
      ]
    },
    style: {
      language: 'sass'
    }
  }
} 