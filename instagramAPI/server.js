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

const checkContainerStatus = async (containerId) => {
  const url = `https://graph.facebook.com/v21.0/${containerId}?fields=status_code&access_token=${ACCESS_TOKEN_POST}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.status_code;
};

const waitForContainerReady = async (containerId, retries = 5, delay = 5000) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    const status = await checkContainerStatus(containerId);
    if (status === 'FINISHED') {
      return true;
    }
    console.log(`Contenedor no listo (estado: ${status}). Reintentando en ${delay / 1000} segundos...`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  return false;
};

// Ruta para eliminar un comentario específico
app.delete('/api/instagram/comment/:commentId', async (req, res) => {
  const commentId = req.params.commentId; // ID del comentario que queremos eliminar

  try {
    const response = await fetch(`https://graph.facebook.com/v21.0/${commentId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: ACCESS_TOKEN_POST,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    res.json({ message: 'Comentario eliminado con éxito.', data });
  } catch (error) {
    console.error('Error al eliminar el comentario:', error);
    res.status(500).json({ error: 'Error al eliminar el comentario.' });
  }
});

// Ruta para responder a un comentario específico
app.post('/api/instagram/comment/:commentId/reply', async (req, res) => {
  const commentId = req.params.commentId; // ID del comentario al que queremos responder
  const { text } = req.body; // Texto de la respuesta

  if (!text) {
    return res.status(400).json({ error: 'Falta texto para la respuesta.' });
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v21.0/${commentId}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        access_token: ACCESS_TOKEN_POST,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    res.json({ message: 'Respuesta publicada con éxito.', data });
  } catch (error) {
    console.error('Error al responder al comentario:', error);
    res.status(500).json({ error: 'Error al responder al comentario.' });
  }
});
// Ruta para responder a un comentario
app.post('/api/instagram/media/:id/comments', async (req, res) => {
  const mediaId = req.params.id;
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Falta texto para la respuesta.' });
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v21.0/${mediaId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        access_token: ACCESS_TOKEN_POST,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    res.json({ message: 'Respuesta publicada con éxito.', data });
  } catch (error) {
    console.error('Error al responder al comentario:', error);
    res.status(500).json({ error: 'Error al responder al comentario.' });
  }
});
// Ruta para subir contenido (imagen, video o carrusel)
app.post('/api/instagram/upload', async (req, res) => {
  const { mediaType, mediaUrl, caption, carouselUrls } = req.body;
  console.log({ mediaType, mediaUrl, caption, carouselUrls });

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
      // Manejar reels igual que videos
      const body = {
        access_token: ACCESS_TOKEN_POST,
        caption,
        ...(mediaType === 'image' && { image_url: mediaUrl }),
        ...(mediaType === 'video' || mediaType === 'reel' && { video_url: mediaUrl }), // Soporte para video y reels
        ...(mediaType === 'reel' && { media_type: 'REELS' }), 
      };
    
      console.log(JSON.stringify(body));
      const response = await fetch(`https://graph.facebook.com/v21.0/${USER_ID}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log("Respuesta de creación de contenedor:", JSON.stringify(data, null, 2));
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
    // Esperar hasta que el contenedor esté listo
    const isReady = await waitForContainerReady(creationId);
    if (!isReady) {
      return res.status(400).json({ error: 'El contenedor no está listo para publicar después de varios intentos.' });
    }

    // Publicar el contenido
    const publishUrl = `https://graph.facebook.com/v21.0/${USER_ID}/media_publish`;
    const response = await fetch(publishUrl, {
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

    res.json({ message: 'Contenido publicado con éxito.', id: data.id });
  } catch (error) {
    console.error('Error al publicar el contenido:', error);
    res.status(500).json({ error: 'Error al publicar el contenido en Instagram.' });
  }
});
// Ruta per obtenir les dades de l'usuari
app.get('/api/instagram/user', async (req, res) => {
  const fields = 'id,username,account_type,media_count,profile_picture_url,followers_count,follows_count';
  const url = `https://graph.instagram.com/me?fields=${fields}&access_token=${ACCESS_TOKEN}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    res.json({
      id: data.id,
      username: data.username,
      account_type: data.account_type,
      media_count: data.media_count,
      profile_picture_url: data.profile_picture_url || null,
      followers_count: data.followers_count || 0,
      follows_count: data.follows_count || 0,
    });
  } catch (error) {
    console.error('Error al obtener los datos del perfil:', error);
    res.status(500).json({ error: 'Error al conectar con la API de Instagram.' });
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
  const url = `https://graph.facebook.com/${mediaId}/comments?fields=id,text,username,timestamp&access_token=${ACCESS_TOKEN_POST}`;

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

app.get('/api/instagram/media/:id/insights', async (req, res) => {
  const mediaId = req.params.id;

  // Define un mapa de métricas según el tipo de contenido
  const metricsByType = {
    image: ['impressions', 'reach', 'likes', 'comments', 'saved'],
    video: ['impressions', 'reach', 'likes', 'comments', 'saved', 'plays', 'video_views'],
    reel: ['impressions', 'reach', 'likes', 'comments', 'saved', 'ig_reels_video_view_total_time', 'ig_reels_avg_watch_time', 'ig_reels_aggregated_all_plays_count'],
    carousel_album: ['impressions', 'reach', 'likes', 'comments', 'saved'],
  };

  // Consulta el tipo de media primero
  const mediaUrl = `https://graph.instagram.com/${mediaId}?fields=media_type&access_token=${ACCESS_TOKEN}`;
  try {
    const mediaResponse = await fetch(mediaUrl);
    const mediaData = await mediaResponse.json();

    if (mediaData.error) {
      return res.status(400).json({ error: mediaData.error.message });
    }

    const mediaType = mediaData.media_type.toLowerCase();

    // Selecciona métricas basadas en el tipo de media
    const metrics = metricsByType[mediaType] || [];

    if (metrics.length === 0) {
      return res.status(400).json({ error: 'No se encontraron métricas aplicables para este tipo de contenido.' });
    }

    const insightsUrl = `https://graph.facebook.com/${mediaId}/insights?metric=${metrics.join(',')}&access_token=${ACCESS_TOKEN_POST}`;
    const insightsResponse = await fetch(insightsUrl);
    const insightsData = await insightsResponse.json();

    if (insightsData.error) {
      return res.status(400).json({ error: insightsData.error.message });
    }

    res.json(insightsData);
  } catch (error) {
    console.error('Error al obtener insights:', error);
    res.status(500).json({ error: 'Error al conectar con la API de Instagram.' });
  }
});


// Ruta per buscar un hashtag (requereix permisos especials)
app.get('/api/instagram/hashtag/:hashtag', async (req, res) => {
  const hashtag = req.params.hashtag;
  const url = `https://graph.facebook.com/v15.0/ig_hashtag_search?user_id=${USER_ID}&q=${hashtag}&access_token=${ACCESS_TOKEN_POST}`;

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
  const url = `https://graph.facebook.com/v15.0/${hashtagId}/recent_media?user_id=${USER_ID}&fields=id,media_type,media_url,caption,permalink,timestamp&access_token=${ACCESS_TOKEN_POST}`;

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



app.get('/api/instagram/media/top', async (req, res) => {
  const fields = 'id,media_type,media_url,like_count,comments_count,impressions';
  const url = `https://graph.instagram.com/me/media?fields=${fields}&access_token=${ACCESS_TOKEN}`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const text = await response.text(); // Obtener el mensaje crudo de error
      console.error("Error en la respuesta de la API:", text);
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
    
    if (data.error) {
      console.error("Error de la API de Instagram:", data.error.message);
      return res.status(400).json({ error: data.error.message });
    }
    
    const topPost = data.data.reduce((top, post) => {
      const totalEngagement = (post.like_count || 0) + (post.comments_count || 0);
      return totalEngagement > top.engagement ? { ...post, engagement: totalEngagement } : top;
    }, { engagement: 0 });
    
    res.json(topPost);
  } catch (error) {
    console.error('Error obteniendo la publicación más popular:', error.message);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});



app.get('/api/instagram/media/trend', async (req, res) => {
  const fields = 'id,timestamp';
  const url = `https://graph.instagram.com/me/media?fields=${fields}&access_token=${ACCESS_TOKEN}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    // Agrupar publicaciones por mes/año
    const trends = data.data.reduce((acc, post) => {
      const date = new Date(post.timestamp);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    res.json(trends);
  } catch (error) {
    console.error('Error obteniendo la tendencia de publicaciones:', error);
    res.status(500).json({ error: 'Error al obtener la tendencia de publicaciones.' });
  }
});





// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escoltant al port ${PORT}`);
});

