const fs = require('fs');
const path = require('path');

function eliminarArchivoPDF(rutaRelativa) {
  try {
    const rutaAbsoluta = path.join(__dirname, '../public', rutaRelativa);

    if (fs.existsSync(rutaAbsoluta)) {
      fs.unlinkSync(rutaAbsoluta);
      console.log('Archivo PDF eliminado:', rutaAbsoluta);
    } else {
      console.warn('El archivo no existe:', rutaAbsoluta);
    }
  } catch (error) {
    console.error('Error al eliminar el archivo PDF:', error.message);
  }
}

module.exports = eliminarArchivoPDF;