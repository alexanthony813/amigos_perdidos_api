const express = require("express");

const amigosRoute = express.Router();


const inMemoryAmigos = {
    1:     {
        id: 1,
        species: 'dog',
        last_seen_address: 'Ñuñoa, y visto en Grecia/Quilin',
        name: 'Chester',
        description: 'Mestizo, con collar',
        message: '2,000,000 de recompensa!',
        photo_url: `https://amigosperdidos.s3.sa-east-1.amazonaws.com/chester_perro_2.jpg`,
        owner_id: 1,
        owner_number: '+56965832621',
        stray: false,
        outdoor_pet: false,
        details: {
          additional_photos: [],
        },
      },
      2: {
        id: 2,
        species: 'dog',
        last_seen_address: 'Av. Las Condes con Padre Hurta',
        name: 'Kali',
        description: 'Chihuahua adoptada, esterilizada y con chip',
        message: 'Instagram @buscamosakali',
        photo_url:
          'https://amigosperdidos.s3.sa-east-1.amazonaws.com/kali_perro.jpg',
        owner_id: 2,
        owner_number: '+56961912271',
        stray: false,
        outdoor_pet: false,
        details: {
          additional_photos: [],
        },
      },
      3: {
        id: 3,
        species: 'dog',
        last_seen_address: 'Ñuñoa',
        name: 'Maximo',
        description: 'Perro mediano color dorado y blanco raza mix',
        message: 'Se ofrece recompensa',
        photo_url:
          'https://amigosperdidos.s3.sa-east-1.amazonaws.com/maximo_perro.jpg',
        owner_id: 3,
        owner_number: '+56972739243',
        stray: false,
        outdoor_pet: false,
        details: {
          additional_photos: [],
        },
      },
      4: {
        id: 4,
        species: 'parrot',
        last_seen_address: 'Plaza Egaña',
        name: 'Pingüin',
        description:
          'Cata, color celeste con marca en su nariz, puntos en el cuello',
        message: 'Recompensa! Ayuda para encontrar a nuestra catita australiana',
        photo_url:
          'https://amigosperdidos.s3.sa-east-1.amazonaws.com/pinguin_ave.jpg',
        owner_id: 4,
        owner_number: '+56986967889',
        stray: false,
        outdoor_pet: false,
        details: {
          additional_photos: [],
        },
      },
      5: {
        id: 5,
        species: 'cat',
        last_seen_address: 'Carrera Pinto #1942',
        name: 'Nombre no es disponible',
        description: 'No tiene collar pero si tiene vacunas, es timida y cariñosa',
        message:
          'Necesitamos encontrarla, por favor cualquier noticia que vuela a casa',
        photo_url:
          'https://amigosperdidos.s3.sa-east-1.amazonaws.com/gato_anonimo_1.jpg',
        owner_id: 5,
        owner_number: '+56930945963',
        stray: false,
        outdoor_pet: false,
        details: {
          additional_photos: [],
        },
      },
      6: {
        id: 6,
        species: 'cat',
        last_seen_address: 'Ñuñoa',
        name: 'Nombre no es disponible',
        description: 'Gatita perdida!',
        message: 'Gracias!!',
        photo_url:
          'https://amigosperdidos.s3.sa-east-1.amazonaws.com/gato_anonimo_2.jpg',
        owner_id: 6,
        owner_number: '+56965178500',
        stray: false,
        outdoor_pet: false,
        details: {
          additional_photos: [],
        },
      },
      7: {
        id: 7,
        species: 'parrot',
        last_seen_address: 'Plaza Egaña',
        name: 'Pingüin',
        description:
          'Cata, color celeste con marca en su nariz, puntos en el cuello',
        message: 'Recompensa! Ayuda para encontrar a nuestra catita australiana',
        photo_url:
          'https://amigosperdidos.s3.sa-east-1.amazonaws.com/pinguin_ave.jpg',
        owner_id: 7,
        owner_number: '+56986967889',
        stray: false,
        outdoor_pet: false,
        details: {
          additional_photos: [],
        },
      },
};

amigosRoute.get(`/:id`, (req, res) => {
  if (inMemoryAmigos.hasOwnProperty(req.id)) {
    res.json(amigoInfo);
  } else {
    res.status(404);
  }
});

module.exports = amigosRoute;
