const axios = require("axios");
// utils/qdrant.js
const { QdrantClient } = require("@qdrant/js-client-rest");

const client = new QdrantClient({ url: "http://localhost:6333" });

const COLLECTION = "face_embeddings";

// Ensure collection exists
async function initQdrant() {
    try {
        const collections = await client.getCollections();
        const exists = collections.collections.some(c => c.name === COLLECTION);

        if (!exists) {
            await client.createCollection(COLLECTION, {
                vectors: {
                    size: 128,       // face-api.js descriptor size
                    distance: "Cosine"
                }
            });
            console.log(`✅ Created Qdrant collection: ${COLLECTION}`);
        } else {
            console.log(`ℹ️ Qdrant collection '${COLLECTION}' already exists`);
        }
    } catch (err) {
        console.error("❌ Failed to init Qdrant:", err);
        throw err;
    }
}


// Insert/Update user embedding
// utils/qdrant.js
async function upsertUserEmbedding(userId, descriptor, payload = {}) {
    if (!Array.isArray(descriptor) || descriptor.length === 0) {
        throw new Error(`Invalid descriptor for user ${userId}: ${JSON.stringify(descriptor)}`);
    }

    console.log("📌 Upserting embedding for user:", userId, "Vector length:", descriptor.length);
    console.log("Payload sent to Qdrant:", JSON.stringify({
        points: [
            {
                id: userId.toString(),
                vector: descriptor,
                payload,
            },
        ],
    }, null, 2));

    const response = await axios.post(
        "http://localhost:6333/collections/face_embeddings/points",
        {
            points: [
                {
                    id: userId.toString(),
                    vector: descriptor,
                    payload
                }
            ]
        }
    );
 
    return response.data;
}



// Search for nearest embedding
async function findUserByEmbedding(descriptor, limit = 1) {
    return client.search({
        collection_name: COLLECTION,
        vector: descriptor,
        limit
    });
}

// Delete user embedding (if user is removed)
async function deleteUserEmbedding(userId) {
    return client.delete({
        collection_name: COLLECTION,
        points: [userId.toString()]
    });
}

async function listAllPoints(limit = 10, offset = null) {
    const response = await axios.post("http://localhost:6333/collections/face_embeddings/points/scroll", {
        limit,
        offset,
        with_payload: true,
        with_vector: false
    });
    return response.data;
}


module.exports = {
    initQdrant,
    upsertUserEmbedding,
    findUserByEmbedding,
    deleteUserEmbedding,
    listAllPoints
};
