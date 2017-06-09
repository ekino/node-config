try {
    require('../../index.js')
} catch (e) {
    process.send({ name: e.name, message: e.message })
}
