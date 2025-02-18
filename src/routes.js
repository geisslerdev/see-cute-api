const express = require("express");
const multer = require("multer");
const { supabase, bucketName } = require("./supabase");

const router = express.Router();

// Configuração do Multer (armazenamento na memória)
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * POST /upload - Faz o upload da imagem e retorna a URL pública.
 */
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Nenhuma imagem enviada" });

    const fileName = `${Date.now()}-${req.file.originalname}`;
    const { data, error } = await supabase.storage.from(bucketName).upload(fileName, req.file.buffer, {
      contentType: req.file.mimetype,
    });

    if (error) return res.status(500).json({ error: error.message });

    // Obter URL pública da imagem
    const { data: publicUrl } = supabase.storage.from(bucketName).getPublicUrl(fileName);

    res.json({ imageUrl: publicUrl.publicUrl });
  } catch (error) {
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

/**
 * GET /images - Retorna a lista de todas as imagens enviadas.
 */
router.get("/images", async (req, res) => {
  try {
    const { data, error } = await supabase.storage.from(bucketName).list("", {
      limit: 100, // Limite de imagens retornadas
    });

    if (error) return res.status(500).json({ error: error.message });

    // Construindo a URL de cada imagem
    const images = data.map((img) => ({
      name: img.name,
      url: `${process.env.SUPABASE_URL}/storage/v1/object/public/${bucketName}/${img.name}`,
    }));

    res.json(images);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar imagens" });
  }
});

module.exports = router;
