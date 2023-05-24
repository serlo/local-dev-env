import jwt from 'jsonwebtoken'

import { GraphQLClient } from 'graphql-request'
import type { NextApiRequest, NextApiResponse } from 'next'

import { endpoint } from '@/api/endpoint'
import { ParsedArgs } from '@/api/graphql-fetch'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { query, variables } = req.body as ParsedArgs

  if (!req.headers.cookie)
    res.status(403).json({ message: 'No auth cookie provided!' })

  const serviceToken = jwt.sign({}, 'serlo.org-secret', {
    audience: 'api.serlo.org',
    issuer: 'serlo.org',
  })

  function executeQuery() {
    const client = new GraphQLClient(endpoint, {
      credentials: 'include',
      headers: {
        Cookie: req.headers.cookie!,
        Authorization: `Serlo Service=${serviceToken}`,
      },
    })
    return client.request(query, variables)
  }

  res.json(await executeQuery())
}

export const config = {
  api: {
    externalResolver: true,
  },
}
