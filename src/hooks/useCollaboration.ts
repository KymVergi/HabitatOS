import { useEffect, useRef, useCallback, useState } from 'react';
import { useHabitatStore, Agent } from '@/stores/habitatStore';

interface CollaborationEvent {
  type: 'agent_move' | 'agent_status' | 'message' | 'transaction' | 'service_call' | 'sync';
  payload: Record<string, unknown>;
  timestamp: number;
  fromAgentId?: string;
}

interface UseCollaborationOptions {
  serverUrl?: string;
  enabled?: boolean;
}

export const useCollaboration = (options: UseCollaborationOptions = {}) => {
  const { serverUrl = 'ws://localhost:3001', enabled = true } = options;
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { 
    updateAgent, 
    moveAgent, 
    createTransaction,
    addMemoryEvent,
    agents 
  } = useHabitatStore();

  const handleEvent = useCallback((event: CollaborationEvent) => {
    switch (event.type) {
      case 'agent_move':
        if (event.fromAgentId && event.payload.position) {
          moveAgent(event.fromAgentId, event.payload.position as { x: number; y: number });
        }
        break;
      
      case 'agent_status':
        if (event.fromAgentId && event.payload.status) {
          updateAgent(event.fromAgentId, { status: event.payload.status as Agent['status'] });
        }
        break;
      
      case 'transaction':
        if (event.fromAgentId) {
          createTransaction({
            fromAgentId: event.fromAgentId,
            toAgentId: event.payload.toAgentId as string,
            serviceId: event.payload.serviceId as string,
            amount: event.payload.amount as number,
          });
        }
        break;
      
      case 'service_call':
        if (event.payload.toAgentId && event.fromAgentId) {
          addMemoryEvent(event.payload.toAgentId as string, {
            type: 'collab',
            content: `${agents[event.fromAgentId]?.name || 'Unknown'} called your service`,
            relatedAgentId: event.fromAgentId,
          });
        }
        break;

      case 'sync':
        // Full world state sync from server
        if (event.payload.agents) {
          const agentsData = event.payload.agents as Record<string, Partial<Agent>>;
          Object.entries(agentsData).forEach(([id, agentData]) => {
            updateAgent(id, agentData);
          });
        }
        break;
    }
  }, [moveAgent, updateAgent, createTransaction, addMemoryEvent, agents]);

  const connect = useCallback(() => {
    if (!enabled || wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(serverUrl);
      
      ws.onopen = () => {
        console.log('[Collaboration] Connected to server');
        setIsConnected(true);
      };

      ws.onclose = () => {
        console.log('[Collaboration] Disconnected');
        setIsConnected(false);
        
        // Reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error('[Collaboration] Error:', error);
      };

      ws.onmessage = (message) => {
        try {
          const event = JSON.parse(message.data) as CollaborationEvent;
          handleEvent(event);
        } catch (e) {
          console.error('[Collaboration] Failed to parse message:', e);
        }
      };

      wsRef.current = ws;
    } catch (e) {
      console.error('[Collaboration] Failed to connect:', e);
    }
  }, [serverUrl, enabled, handleEvent]);

  useEffect(() => {
    connect();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close();
    };
  }, [connect]);

  const emit = useCallback((event: Omit<CollaborationEvent, 'timestamp'>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        ...event,
        timestamp: Date.now(),
      }));
    }
  }, []);

  const broadcastMove = useCallback((agentId: string, position: { x: number; y: number }) => {
    emit({
      type: 'agent_move',
      fromAgentId: agentId,
      payload: { position },
    });
  }, [emit]);

  const broadcastStatus = useCallback((agentId: string, status: Agent['status']) => {
    emit({
      type: 'agent_status',
      fromAgentId: agentId,
      payload: { status },
    });
  }, [emit]);

  const broadcastMessage = useCallback((fromAgentId: string, toAgentId: string, content: string) => {
    emit({
      type: 'message',
      fromAgentId,
      payload: { toAgentId, content },
    });
  }, [emit]);

  const broadcastServiceCall = useCallback((
    fromAgentId: string, 
    toAgentId: string, 
    serviceId: string,
    amount: number
  ) => {
    emit({
      type: 'service_call',
      fromAgentId,
      payload: { toAgentId, serviceId, amount },
    });

    emit({
      type: 'transaction',
      fromAgentId,
      payload: { toAgentId, serviceId, amount },
    });
  }, [emit]);

  return {
    isConnected,
    broadcastMove,
    broadcastStatus,
    broadcastMessage,
    broadcastServiceCall,
  };
};

export default useCollaboration;
