import Mailjet from 'node-mailjet'

export const getMailjet = () => {
  const key = process.env.MJ_APIKEY_PUBLIC
  const secret = process.env.MJ_APIKEY_PRIVATE

  if (!key || !secret) {
    throw new Error('Mailjet API keys missing')
  }

  return Mailjet.apiConnect(key, secret)
}
