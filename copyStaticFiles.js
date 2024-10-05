const fs = require('fs')
const path = require('path')

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }

  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

function copyStaticFiles() {
  const fontsSrc = path.resolve(__dirname, 'src/fonts')
  const fontsDest = path.resolve(__dirname, 'out/fonts')
  const templatesSrc = path.resolve(__dirname, 'src/templates')
  const templatesDest = path.resolve(__dirname, 'out/templates')

  console.log('Copying fonts and templates to out folder...')
  copyDirectory(fontsSrc, fontsDest)
  copyDirectory(templatesSrc, templatesDest)
}

copyStaticFiles()
