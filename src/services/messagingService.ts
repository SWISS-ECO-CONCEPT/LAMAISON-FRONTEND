const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
      body: JSON.stringify({
        recipientClerkId: params.recipientClerkId,
        rdvId: params.rdvId,
        initialMessage: params.initialMessage,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Erreur lors de l'initiation de la messagerie (${response.status})`);
    }

    return await response.json();
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
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération de la conversation (${response.status})`);
    }

    return await response.json();
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
  });

  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération du profil (${response.status})`);
  }

  return await response.json();
};

export type MessageDto = {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt?: string;
};

export const getConversationMessages = async (userId1: number, userId2: number): Promise<MessageDto[]> => {
  const response = await fetch(`${API_BASE}/messages/${userId1}/${userId2}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération de la conversation (${response.status})`);
  }

  return await response.json();
};

export const sendMessage = async (senderId: number, receiverId: number, content: string): Promise<MessageDto> => {
  const response = await fetch(`${API_BASE}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ senderId, receiverId, content }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Erreur lors de l'envoi du message (${response.status})`);
  }

  return await response.json();
};
