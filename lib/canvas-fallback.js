export async function importCanvas() {
  try {
    const canvas = await import('@napi-rs/canvas')
    return canvas.default || canvas
  } catch (error) {
    const canvas = await import('canvas')
    return canvas.default || canvas
  }
}