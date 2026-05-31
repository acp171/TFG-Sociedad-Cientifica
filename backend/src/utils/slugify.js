function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD') // Quitar tildes
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .replace(/\s+/g, '-') // Reemplazar espacios por guiones
        .replace(/[^\w-]+/g, '') // Quitar caracteres especiales
        .replace(/--+/g, '-'); // Quitar guiones dobles
}

module.exports = { slugify };
