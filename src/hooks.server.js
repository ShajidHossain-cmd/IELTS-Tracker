import { User, Session } from "@prisma/client";

import { prisma } from "./db.js";

import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";

import { sha256 } from "@oslojs/crypto/sha2";

export function generateSessionToken() {
  // this creates random strings for the session token
  const token = crypto.randomUUID();
  return token;
}
export async function createSession(token, userId) {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token))); // hashes the token

  const session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // count till 30 days
  };
  await prisma.session.create({
    // stores the session to the db .

    data: session,
  });
  return session;
}

export async function validateSessionToken(token) {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token))); // hashes the token
  const result = await prisma.session.findUnique({
    where: {
      id: sessionId,
    },
    include: {
      user: true,
    },
  });
  if ((result = null)) {
    return { session: null, user: null };
  }
  const { user, ...session } = result;
  if (Date.now() >= session.expiresAt.getTime()) {
    await prisma.session.delete({ where: { id: sessionId } });
    return { session: null, user: null };
  }
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        expiresAt: session.expiresAt,
      },
    });
  }
  return { session, user };
}
export async function invalidateSession(sessionId) {
  await prisma.session.delete({ where: { id: sessionId } });
}
export async function invalidateAllSessions(userId) {
  await prisma.session.deleteMany({
    where: {
      userId: userId,
    },
  });
}

function getSessionValidationResult(session, user) {
  if (session && user) {
    return { session, user };
  } else {
    return { session: null, user: null };
  }
}
const gittt = anoying;
