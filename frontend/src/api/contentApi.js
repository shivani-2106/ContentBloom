import axios from 'axios'

/**
 * Centralized API client for ContentBloom AI.
 *
 * Requests use the relative /api path so Vite can proxy them
 * to the FastAPI backend.
 *
 * Never put the Gemini API key in frontend code.
 */

const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120_000,
})

function getErrorMessage(err) {
  if (err.response) {
    const detail = err.response.data?.detail

    if (typeof detail === 'string' && detail.trim()) {
      return detail
    }

    return `Server error (${err.response.status}). Please try again.`
  }

  if (err.code === 'ECONNABORTED') {
    return 'The request timed out. Please try again.'
  }

  if (err.code === 'ERR_NETWORK' || !err.response) {
    return 'Could not reach the server. Check that the backend is running.'
  }

  return 'Something went wrong. Please try again.'
}

export async function generateContent(payload) {
  try {
    const response = await api.post('/api/generate', payload)
    return response.data
  } catch (err) {
    throw new Error(getErrorMessage(err))
  }
}

export async function improveContent(payload) {
  try {
    const response = await api.post('/api/improve', payload)
    return response.data
  } catch (err) {
    throw new Error(getErrorMessage(err))
  }
}

export async function generateAllFormats(payload) {
  try {
    const response = await api.post('/api/generate-all', payload)
    return response.data
  } catch (err) {
    throw new Error(getErrorMessage(err))
  }
}

export async function improveAllFormats(payload) {
  try {
    const response = await api.post('/api/improve-all', payload)
    return response.data
  } catch (err) {
    throw new Error(getErrorMessage(err))
  }
}

export const improveAllFomats = improveAllFormats

export async function generateImagePrompt(payload) {
  try {
    const response = await api.post('/api/generate-image-prompt', payload)
    return response.data
  } catch (err) {
    throw new Error(getErrorMessage(err))
  }
}


export async function generateVideoPlan(payload) {
  try {
    const response = await api.post('/api/generate-video-plan', payload)
    return response.data
  } catch (err) {
    throw new Error(getErrorMessage(err))
  }
}
