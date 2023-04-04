const knex = require('knex')(require('../knexfile'));
const { v4: uuid } = require('uuid');

module.exports = {
    getByUser: async (req, res) => {
        try {
            const { sort_by = 'updated_at', order_by = 'dec' } = req.query;
            const documents = await knex('documents')
                .leftJoin('users', 'documents.user_id', 'users.id')
                .select(
                    'documents.id',
                    'documents.user_id',
                    'users.first_name as first_name',
                    'documents.title',
                    'documents.description',
                    'documents.updated_at',
                ).where({ user_id: req.params.userId }).orderBy(sort_by, order_by);
                if (!documents) {
                    res.status(404).json({ error: 'Documents not found' });
                } else {
                    res.status(200).json(documents);
                }
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Unable to get documents" });
        }
    },

    getById: async (req, res) => {
        try {
            const document = await knex('documents')
                .select(
                    'id',
                    'user_id',
                    'title',
                    'description',
                    'updated_at',
                ).where({ id: req.params.id }).first();
                if (!document) {
                    res.status(404).json({ error: 'Document not found' });
                } else {
                    res.status(200).json(document);
                }
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Unable to get document" });
        }
    },

    create: (req, res) => {
        const user_id = req.body.userId;
        const title = req.body.title;
        const description = req.body.description;

        if (!user_id || !title || !description) {
            return res.status(400).send('Please make sure to fill out all fields in the request');
        }
        const id = uuid();
        knex('documents')
            .insert({ id, user_id, title, description })
            .then((data) => {
                const newDocumentURL = `/document/${data[0]}`;
                res.status(201).location(newDocumentURL).send(newDocumentURL);
        })
        .catch((err) => res.status(400).send(`Error creating Document: ${err}`));
    },

    update: async (req, res) => {
        const { id } = req.params;
        const title = req.body.title;
        const description = req.body.description;

        try {
          const document = await knex('documents').where({ id }).first();
          if (!document) {
            res.status(404).json({ error: 'Document not found' });
          } else {
            await knex('documents').where({ id }).update({ title, description });
            res.status(200).json({ id, title, description });
          }
        } catch (err) {
          console.error(err);
          res.status(500).json({ error: 'Unable to update document' });
        }
    },
    
    delete: async (req, res) => {
        const { id } = req.params;
        try {
          const document = await knex('documents').where({ id }).first();
          if (!document) {
            res.status(404).json({ error: 'Document not found' });
          } else {
            await knex('documents').where({ id }).del();
            res.status(204).send();
          }
        } catch (err) {
          console.error(err);
          res.status(500).json({ error: 'Unable to delete document' });
        }
    },
}