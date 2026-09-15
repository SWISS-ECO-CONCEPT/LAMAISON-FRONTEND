import { API_BASE } from '../config/api';
export type DbUser = {
  id: number;
  clerkId: string;
  firstname: string;
  role: string;
};

export interface CreateMessageParams {
  recipientClerkId: string;
  rdvId: number;
  initialMessage: string;
}

/**
 * Crée automatiquement une messagerie entre l'agent et le prospect
 * lors d'une acceptation/refus de RDV
 */
export const initiateMessaging = async (
  params: CreateMessageParams,
  token: string
) => {
  try {
    const response = await fetch(`${API_BASE}/messages/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({
        recipientClerkId: params.recipientClerkId,
        rdvId: params.rdvId,
        initialMessage: params.initialMessage,
      }),
    });

    if (!response.ok) {
      let errorMsg = `Erreur lors de l'initiation de la messagerie (${response.status})`;
      try {
        const errJson = await response.json();
        errorMsg = errJson?.error?.message ?? errJson?.message ?? errorMsg;
      } catch { /* fallback texte brut ci-dessous */ }
      if (errorMsg === `Erreur lors de l'initiation de la messagerie (${response.status})`) {
        const text = await response.text();
        if (text) errorMsg = text;
      }
      throw new Error(errorMsg);
    }

    const json = await response.json();
    const data = json?.data ?? json;
    return {
      ...data,
      data,
      success: json?.success ?? true,
    };
  } catch (error) {
    console.error('Erreur initiateMessaging:', error);
    throw error;
  }
};

/**
 * Obtient ou crée une conversation entre deux utilisateurs
 */
export const getOrCreateConversation = async (
  prospectClerkId: string,
  agentClerkId: string,
  rdvId?: number,
  token?: string
) => {
  try {
    const params = new URLSearchParams({
      prospectClerkId,
      agentClerkId,
      ...(rdvId && { rdvId: rdvId.toString() }),
    });

    const response = await fetch(`${API_BASE}/messages/conversation?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      let errorMsg = `Erreur lors de la récupération de la conversation (${response.status})`;
      try {
        const errJson = await response.json();
        errorMsg = errJson?.error?.message ?? errJson?.message ?? errorMsg;
      } catch { /* fallback */ }
      throw new Error(errorMsg);
    }

    const json = await response.json();
    return json?.data ?? json;
  } catch (error) {
    console.error('Erreur getOrCreateConversation:', error);
    throw error;
  }
};

export const getMe = async (token: string): Promise<DbUser> => {
  const response = await fetch(`${API_BASE}/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    let errorMsg = `Erreur lors de la récupération du profil (${response.status})`;
    try {
      const errJson = await response.json();
      errorMsg = errJson?.error?.message ?? errJson?.message ?? errorMsg;
    } catch { /* fallback */ }
    throw new Error(errorMsg);
  }

  const json = await response.json();
  const data = json?.data ?? json;
  return data as DbUser;
};

export type MessageDto = {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt?: string;
};

export const getConversationMessages = async (userId1: number, userId2: number, token: string): Promise<MessageDto[]> => {
  const response = await fetch(`${API_BASE}/messages/${userId1}/${userId2}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    let errorMsg = `Erreur lors de la récupération de la conversation (${response.status})`;
    try {
      const errJson = await response.json();
      errorMsg = errJson?.error?.message ?? errJson?.message ?? errorMsg;
    } catch { /* fallback */ }
    throw new Error(errorMsg);
  }

  const json = await response.json();
  const data = json?.data ?? json;
  return Array.isArray(data) ? data : [];
};

export const sendMessage = async (senderId: number, receiverId: number, content: string, token: string): Promise<MessageDto> => {
  const response = await fetch(`${API_BASE}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify({ senderId, receiverId, content }),
  });

  if (!response.ok) {
    let errorMsg = `Erreur lors de l'envoi du message (${response.status})`;
    try {
      const errJson = await response.json();
      errorMsg = errJson?.error?.message ?? errJson?.message ?? errorMsg;
    } catch { /* fallback texte brut ci-dessous */ }
    if (errorMsg === `Erreur lors de l'envoi du message (${response.status})`) {
      const text = await response.text();
      if (text) errorMsg = text;
    }
    throw new Error(errorMsg);
  }

  const json = await response.json();
  return json?.data ?? json;
};

export const getUserConversations = async (token: string) => {
  const response = await fetch(`${API_BASE}/messages`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    let errorMsg = `Erreur lors de la récupération des conversations (${response.status})`;
    try {
      const errJson = await response.json();
      errorMsg = errJson?.error?.message ?? errJson?.message ?? errorMsg;
    } catch { /* fallback */ }
    throw new Error(errorMsg);
  }

  const json = await response.json();
  const data = json?.data ?? json;
  return Array.isArray(data) ? data : [];
};

export const getUserById = async (id: number, token: string): Promise<DbUser> => {
  const response = await fetch(`${API_BASE}/auth/user/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    let errorMsg = `Erreur lors de la récupération de l'utilisateur (${response.status})`;
    try {
      const errJson = await response.json();
      errorMsg = errJson?.error?.message ?? errJson?.message ?? errorMsg;
    } catch { /* fallback */ }
    throw new Error(errorMsg);
  }

  const json = await response.json();
  const data = json?.data ?? json;
  return data as DbUser;
};
