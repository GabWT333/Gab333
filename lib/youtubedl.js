export const ogmp3 = {
  download: async (url, quality, type) => {
    // Simula una risposta di download
    return {
      result: {
        download: `https://example.com/download?url=${url}&quality=${quality}&type=${type}`
      }
    };
  }
};
