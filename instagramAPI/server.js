import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import cors from 'cors';

// Carrega les variables d'entorn
dotenv.config();
const USER_ID = process.env.USER_ID;
const app = express();
const PORT = process.env.PORT || 3000;
const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const ACCESS_TOKEN_POST =process.env.INSTAGRAM_ACCESS_POST;

console.log('User ID:', USER_ID);
// Middleware
app.use(cors());
app.use(express.static('public')); // Serveix fitxers estàtics des de la carpeta 'public'
app.use(express.json());

// Ruta para subir contenido (imagen, video o carrusel)
app.post('/api/instagram/upload', async (req, res) => {
  const { mediaType, mediaUrl, caption, carouselUrls } = req.body;

  if (!mediaType || (!mediaUrl && !carouselUrls)) {
    return res.status(400).json({ error: 'Faltan datos necesarios para realizar la subida.' });
  }

  try {
    let creationId;

    if (mediaType === 'carousel' && Array.isArray(carouselUrls)) {
      const childrenIds = [];

      for (const url of carouselUrls) {
        const childBody = {
          image_url: url,
          access_token: ACCESS_TOKEN_POST,
        };

        const childResponse = await fetch(`https://graph.facebook.com/v21.0/${USER_ID}/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(childBody),
        });

        const childData = await childResponse.json();

        if (childData.error) {
          return res.status(400).json({ error: `Error subiendo imagen del carrusel: ${childData.error.message}` });
        }

        childrenIds.push(childData.id);
      }

      const body = {
        media_type: 'CAROUSEL',
        children: childrenIds.join(','),
        caption,
        access_token: ACCESS_TOKEN_POST,
      };

      const response = await fetch(`https://graph.facebook.com/v21.0/${USER_ID}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.error) {
        return res.status(400).json({ error: data.error.message });
      }

      creationId = data.id;
    } else {
      const body = {
        access_token: ACCESS_TOKEN_POST,
        caption,
        ...(mediaType === 'image' && { image_url: mediaUrl }),
        ...(mediaType === 'video' && { video_url: mediaUrl }),
      };

      const response = await fetch(`https://graph.facebook.com/v21.0/${USER_ID}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.error) {
        return res.status(400).json({ error: data.error.message });
      }

      creationId = data.id;
    }

    res.json({ id: creationId });
  } catch (error) {
    console.error('Error al subir contenido:', error);
    res.status(500).json({ error: 'Error al subir el contenido a Instagram.' });
  }
});

// Ruta para publicar contenido
app.post('/api/instagram/publish', async (req, res) => {
  const { creationId } = req.body;

  if (!creationId) {
    return res.status(400).json({ error: 'Falta creationId en el cuerpo de la solicitud.' });
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v21.0/${USER_ID}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: ACCESS_TOKEN_POST,
        creation_id: creationId,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Error al publicar contenido:', error);
    res.status(500).json({ error: 'Error al publicar el contenido en Instagram.' });
  }
});
// Ruta per obtenir les dades de l'usuari
app.get('/api/instagram/user', async (req, res) => {
  const url = `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${ACCESS_TOKEN}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al connectar amb l\'API d\'Instagram.' });
  }
});

// Ruta per obtenir els mitjans del compte
app.get('/api/instagram/media', async (req, res) => {
  const fields = 'id,media_type,media_url,caption,permalink,timestamp,username';
  const url = `https://graph.instagram.com/me/media?fields=${fields}&access_token=${ACCESS_TOKEN}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al connectar amb l\'API d\'Instagram.' });
  }
});

// Ruta per obtenir els comentaris d'una publicació
app.get('/api/instagram/media/:id/comments', async (req, res) => {
  const mediaId = req.params.id;
  const url = `https://graph.instagram.com/${mediaId}/comments?fields=id,text,username,timestamp&access_token=${ACCESS_TOKEN}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al connectar amb l\'API d\'Instagram.' });
  }
});

// Ruta per obtenir els insights d'una publicació
app.get('/api/instagram/media/:id/insights', async (req, res) => {
  const mediaId = req.params.id;
  const metrics = 'impressions,reach,engagement,saved';
  const url = `https://graph.instagram.com/${mediaId}/insights?metric=${metrics}&access_token=${ACCESS_TOKEN}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al connectar amb l\'API d\'Instagram.' });
  }
});

// Ruta per buscar un hashtag (requereix permisos especials)
app.get('/api/instagram/hashtag/:hashtag', async (req, res) => {
  const hashtag = req.params.hashtag;
  const url = `https://graph.facebook.com/v15.0/ig_hashtag_search?user_id=YOUR_USER_ID&q=${hashtag}&access_token=${ACCESS_TOKEN}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al connectar amb l\'API d\'Instagram.' });
  }
});

// Ruta per obtenir mitjans relacionats amb un hashtag (requereix permisos especials)
app.get('/api/instagram/hashtag/:hashtag/media', async (req, res) => {
  const hashtagId = req.params.hashtag; // Substitueix pel ID del hashtag
  const url = `https://graph.facebook.com/v15.0/${hashtagId}/recent_media?user_id=YOUR_USER_ID&fields=id,media_type,media_url,caption,permalink,timestamp&access_token=${ACCESS_TOKEN}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al connectar amb l\'API d\'Instagram.' });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escoltant al port ${PORT}`);
});
