import path from 'path'
import Bili from '../src'

function fixture(name) {
  return path.join(__dirname, 'fixtures', name)
}

process.env.BILI_TEST = true

function snapshot({ title, input, ...args }) {
  test(title, async () => {
    const { bundles } = await Bili.generate({
      input: fixture(input),
      ...args
    })
    expect(Object.keys(bundles).map(filepath => [
      bundles[filepath].relative,
      bundles[filepath].code
    ])).toMatchSnapshot()
  })
}

snapshot({
  title: 'defaults',
  input: 'defaults/index.js'
})

snapshot({
  title: 'buble:async',
  input: 'buble/async.js'
})

snapshot({
  title: 'buble:async-and-object-rest-spread',
  input: 'buble/async-dot-dot-dot.js'
})

snapshot({
  title: 'buble:react-jsx',
  input: 'buble/react-jsx.js'
})

snapshot({
  title: 'buble:vue-jsx',
  input: 'buble/vue-jsx.js',
  jsx: 'vue'
})

// Disable this test for now
// Since `version` is read from bili's package.json
// So it will always change
// snapshot({
//   title: 'banner:true',
//   input: 'default.js',
//   banner: true
// })

snapshot({
  title: 'banner:object',
  input: 'default.js',
  banner: {
    year: '2018',
    author: 'author',
    license: 'GPL',
    name: 'name',
    version: '1.2.3'
  }
})

snapshot({
  title: 'banner:string',
  input: 'default.js',
  banner: 'woot'
})

snapshot({
  title: 'exclude file',
  input: 'exclude-file/index.js',
  external: ['./test/fixtures/exclude-file/foo.js']
})

describe('multi formats without suffix error', () => {
  test('it throws', async () => {
    expect.assertions(1)
    try {
      await Bili.generate({
        input: fixture('defaults/index.js'),
        format: ['cjs', 'umd'],
        filename: '[name].js'
      })
    } catch (err) {
      expect(err.message).toMatch(/Multiple files are emitting to the same path/)
    }
  })

  test('it does not throw', async () => {
    await Bili.generate({
      input: fixture('defaults/index.js'),
      format: ['umd-min', 'umd'],
      filename: '[name].js'
    })
  })
})
