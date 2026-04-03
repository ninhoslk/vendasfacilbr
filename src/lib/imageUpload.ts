const IMGBB_API_KEY = "7e3141033542d63256e1fed59c8ef1ca"; // COLE SUA CHAVE AQUI

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (data.success) {
      return data.data.url; // Retorna o link direto da imagem
    } else {
      throw new Error("Erro no upload");
    }
  } catch (error) {
    console.error("Erro ao subir imagem:", error);
    return "";
  }
};
