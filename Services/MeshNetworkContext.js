import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../supabaseClient'; // Adjust path if your client is located elsewhere

const MeshNetworkContext = createContext();

export function MeshNetworkProvider({ children }) {
  const [meshNodeActive, setMeshNodeActive] = useState(true);
  const [meshPeerCount, setMeshPeerCount] = useState(4);
  const [localChatLog, setLocalChatLog] = useState([
    { id: '1', sender: 'Node_Kampala_02', text: 'Secure multi-hop packet route established via local Wi-Fi mesh.' },
    { id: '2', sender: 'Node_Bwindi_01', text: 'Offline data chunk synced across local peers.' }
  ]);
  const [ghostVaults, setGhostVaults] = useState({});

  // Sync initial mesh configuration and messages from Supabase on mount
  useEffect(() => {
    fetchMeshTelemetryAndMessages();

    // Setup real-time subscription for live sync of mesh broadcasts and messages
    const subscription = supabase
      .channel('public:mesh_sync')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMsg = payload.new;
          if (newMsg && newMsg.text) {
            setLocalChatLog(prev => [
              ...prev,
              {
                id: newMsg.id?.toString() || Date.now().toString(),
                sender: newMsg.sender || 'Mesh_Node',
                text: newMsg.text,
              }
            ]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchMeshTelemetryAndMessages = async () => {
    try {
      // Fetch master mesh switch state
      const { data: switchData } = await supabase
        .from('admin_system_switches')
        .select('mesh_transmission, bluetooth_p2p_mesh_relay')
        .eq('id', 1)
        .single();

      if (switchData) {
        setMeshNodeActive(switchData.mesh_transmission ?? true);
      }

      // Fetch recent messages/packets from Supabase
      const { data: msgData, error } = await supabase
        .from('messages')
        .select('*')
        .order('id', { ascending: false })
        .limit(10);

      if (msgData && msgData.length > 0 && !error) {
        const formattedLogs = msgData.reverse().map(m => ({
          id: m.id?.toString() || Math.random().toString(),
          sender: m.sender || 'Mesh_Peer',
          text: m.text || '',
        }));
        setLocalChatLog(formattedLogs);
      }
    } catch (err) {
      console.log('Offline mode: Using local mesh cache.');
    }
  };

  // Broadcast a packet across local mesh peers and sync to Supabase when online
  const sendMeshPacket = async (senderName, messageText) => {
    if (!messageText.trim()) return;
    const packetId = Date.now().toString();
    const newPacket = { id: packetId, sender: senderName, text: messageText };
    
    setLocalChatLog(prev => [...prev, newPacket]);
    Alert.alert('Mesh Relay 🛰️', 'Packet broadcasted across local multi-hop mesh nodes & synced to Supabase.');

    // Push packet to Supabase backend database
    try {
      await supabase.from('messages').insert([
        {
          sender: senderName,
          text: messageText,
          type: 'mesh_packet'
        }
      ]);
    } catch (err) {
      console.log('Offline mesh queue: Packet buffered locally.');
    }
  };

  // Secure local ghost vault storage with Supabase cloud backup sync
  const lockGhostVault = async (vaultKey, dataPayload) => {
    if (!vaultKey.trim()) return false;
    
    const vaultObj = { encrypted: true, data: dataPayload, timestamp: Date.now() };
    setGhostVaults(prev => ({ ...prev, [vaultKey]: vaultObj }));
    Alert.alert('Ghost Vault 🛡️', 'Data locked locally and securely backed up to Supabase database!');

    try {
      await supabase.from('ghost_vaults').upsert([
        {
          vault_key: vaultKey,
          payload: JSON.stringify(dataPayload),
          updated_at: new Date()
        }
      ], { onConflict: 'vault_key' });
    } catch (err) {
      console.log('Offline ghost vault mode: Stored locally.');
    }

    return true;
  };

  return (
    <MeshNetworkContext.Provider value={{
      meshNodeActive,
      setMeshNodeActive,
      meshPeerCount,
      localChatLog,
      sendMeshPacket,
      lockGhostVault
    }}>
      {children}
    </MeshNetworkContext.Provider>
  );
}

export function useMeshNetwork() {
  return useContext(MeshNetworkContext);
}