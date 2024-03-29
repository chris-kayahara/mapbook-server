const knex = require('knex')(require('../knexfile'));

// const upload = multer({ dest: 'images/' })

const jwt = require('jsonwebtoken');


const secretKey = "58yuht4jrgkv9sdf8uht";
const API_BASE_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:8080';

// const storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null, 'images/');
//     },
   
//     filename: function(req, file, cb) {
//         cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//     }
// });

module.exports = {
    getByDocument: async (req, res) => {
        try {
            const { sort_by = 'updated_at', order_by = 'dec' } = req.query;
            const images = await knex('images')
                .leftJoin('documents', 'images.document_id', 'documents.id')
                .select(
                    'images.id',
                    'images.document_id',
                    'documents.title as document_title',
                    'images.image_url',
                    'images.image_order',
                    'images.image_title',
                    'images.image_description',
                    'images.image_lat',
                    'images.image_long',
                    'images.image_date',
                ).where({ document_id: req.params.documentId }).orderBy(sort_by, order_by);
                if (!images) {
                    res.status(404).json({ error: 'Images not found' });
                } else {
                    res.status(200).json(images);
                }
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Unable to get Images" });
        }
    },

    getByUser: async (req, res) => {

        // If authorization header does not exist...
        if (!req.headers.authorization) {
            res.status(401);
            res.json({
                error: "Login required"
            });
        }

        // Get token portion of header
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];

        try {
            // Try verifying & decoding JWT
            const decoded = jwt.verify(token, secretKey);

            const images = await knex('images')
                .leftJoin('documents', 'images.document_id', 'documents.id')
                .leftJoin('users', 'documents.user_id', 'users.id')
                .select(
                    'images.id',
                    'users.id as user_id',
                    'users.email as user_email',
                    'documents.id as document_id',
                    'documents.title as document_title',
                    'documents.description as document_description',
                    'documents.updated_at as document_updated_at',
                    'images.image_url',
                    'images.image_order',
                ).where({ email: decoded.email })
                if (!images) {
                    res.status(404).json({ error: 'Images not found' });
                } else {
                    res.status(200).json({ images, decoded });
                }
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Unable to get Images" });
        }
    },

    getById: async (req, res) => {
        try {
            const image = await knex('images')
                .select(
                    'id',
                    'document_id',
                    'image_url',
                    'image_order',
                    'image_title',
                    'image_description',
                    'image_lat',
                    'image_long',
                    'image_date',
                ).where({ id: req.params.id }).first();
                if (!image) {
                    res.status(404).json({ error: 'Image not found' });
                } else {
                    res.status(200).json(image);
                }
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Unable to get image" });
        }
    },

    // create: (req, res) => {
    //     console.log(req.body)
    //     const document_id = req.body.document_id;
    //     const images = req.body.images;


    //     // if (!document_id || !image_url || !image_order || !image_title || !image_description || !image_lat || !image_long || !image_date) {
    //     //     return res.status(400).send('Please make sure to fill out all fields in the request');
    //     // }

    //     for (let i = 0; i < images.length; i++) {
    //         const id = images[i].image_id;
    //         const image_url = `${API_BASE_URL}/images/${id}.${images[i].image_extension}`;
    //         const image_order = images[i].image_order;
    //         const image_title = images[i].image_title;
    //         const image_description = images[i].image_description;
    //         const image_lat = images[i].image_lat;
    //         const image_long = images[i].image_long;
    //         const image_date = images[i].image_date;

    //         knex('images')
    //             .insert({ id, document_id, image_url, image_order, image_title, image_description, image_lat, image_long, image_date })
    //             .then((data) => {
    //                 const newImageURL = `/image/${data[0]}`;
    //                 res.status(201);
    //         })
    //         .catch((err) => res.status(400).send(`Error creating Image: ${err}`));
    //     }
    // },

    // upload: async (req, res) => {
    //     try {
    //         upload.any('images');
    //         console.log(req);
    //     } catch (err) {
    //         console.log(err);
    //     }
    // },

    update: async (req, res) => {
        const { id } = req.params;
        const document_id = req.body.documentId;
        const image_url = req.body.image_url;
        const image_order = req.body.image_order;
        const image_title = req.body.image_title;
        const image_description = req.body.image_description;
        const image_lat = req.body.image_lat;
        const image_long = req.body.image_long;
        const image_date = req.body.image_date;

        try {
            const image = await knex('images').where({ id }).first();
            if (!image) {
                res.status(404).json({ error: 'Image not found' });
            } else {
                await knex('images').where({ id }).update({ document_id, image_url, image_order, image_title, image_description, image_lat, image_long, image_date });
                res.status(200).json({ id, document_id, image_url, image_order, image_title, image_description, image_lat, image_long, image_date });
            }
        } catch (err) {
                console.error(err);
                res.status(500).json({ error: 'Unable to update image' });
        }
    },
    
    delete: async (req, res) => {
        const { id } = req.params;
        try {
          const image = await knex('images').where({ id }).first();
          if (!image) {
            res.status(404).json({ error: 'Image not found' });
          } else {
            await knex('images').where({ id }).del();
            res.status(204).send();
          }
        } catch (err) {
          console.error(err);
          res.status(500).json({ error: 'Unable to delete image' });
        }
    },
}