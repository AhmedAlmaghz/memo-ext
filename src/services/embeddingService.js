import { pipeline } from '@xenova/transformers';

let embeddingModel = null;

const initEmbeddingModel = async () => {
  if (!embeddingModel) {
    embeddingModel = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embeddingModel;
};

export const getEmbedding = async (text) => {
  const model = await initEmbeddingModel();
  const output = await model(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
};