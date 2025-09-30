const generateUrl = (name) => {
  return name?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')         // Replace spaces with hyphens
    .replace(/-+/g, '-');         // Collapse multiple hyphens
}

module.exports = generateUrl